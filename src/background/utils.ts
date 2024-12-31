export * from './index'

export type PublicProperties<T> = {
  [k in keyof T as T[k] extends Function ? never : k]: T[k]
}

export type TabLifePP = PublicProperties<TabLife>


export type TabLifeMap = {
  [hostname in string]: TabLife[]
}


export class TabLife {
  hostname: string
  // 在一次访问中(处于当前正在活跃的标签页时)的起始时间和结束时间
  enterTime: number
  leaveTime: number = 0
  seconds: number = 0

  constructor(hostname: string) {
    const now = new Date().getTime()
    this.hostname = hostname
    this.enterTime = now
  }

  async handleLeave() {
    const now = new Date().getTime()
    this.leaveTime = now
    const milliseconds = this.leaveTime - this.enterTime
    this.seconds = millisecondsToSeconds(milliseconds)

    await this.updateStorage()
  }

  async updateStorage() {
    const list = await this.getStorageByHostname()
    list.push({
      hostname: this.hostname,
      enterTime: this.enterTime,
      leaveTime: this.leaveTime,
      seconds: this.seconds
    })
    await this.setStorageByHostname(list)
  }

  async getStorageByHostname(): Promise<TabLifePP[]> {
    const list = await getStorageByKey<TabLifePP[]>(this.hostname)
    return list === null ? [] : list
  }

  async setStorageByHostname(TabLifeList: TabLifePP[]) {
    await setStorageByKey(this.hostname, TabLifeList)
  }
}

async function setStorageByKey<T>(key: string, val: T) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [key]: val });
  })
}

export function getStorageByKey<T>(key: string): Promise<T | null> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, (res) => {
      if(res[key] !== undefined) {
        resolve(res[key])
      }
    });
  })
}

export function getStorageAll() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(null, (res) => {
      resolve(res)
    })
  })
}

export function clearStorage() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.clear(() => {
      resolve('clear success')
    });
  })
}

export function millisecondsToSeconds(milliseconds: number) {
  return milliseconds / 1000;
}


export function parseHostname(url: string): string | null {
  try {
    const { protocol, hostname } = new URL(url)

    // 只收集http协议的网站
    if (!['https:', 'http'].includes(protocol)) return null

    return hostname
  } catch (e) {
    return null
  }
}

export function getUrlInfo(): Promise<{
  hostname: string | null
  url: string,
}> {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      let url = (tabs[0] && tabs[0].url) ?? ''
      const hostname = parseHostname(url)
      resolve({ hostname, url })
    });
  })
}