import { HostMap, StorageKey } from './tab'

export * from './index'

export type PublicProperties<T> = {
  [k in keyof T as T[k] extends Function ? never : k]: T[k]
}

export type TabLifePP = PublicProperties<TabLife>


type UrlInfo = { protocol: string, hostname: string }

export class TabLife {
  protocol: string = ''
  hostname: string | null = null
  // 在一次访问中(处于当前正在活跃的标签页时)的起始时间和结束时间
  enterTime: number = 0
  leaveTime: number = 0
  seconds: number = 0

  constructor(obj?: TabLifePP) {
    if (obj) {
      this.protocol = obj.protocol
      this.hostname = obj.hostname
      this.enterTime = obj.enterTime
      this.leaveTime = obj.leaveTime
      this.seconds = obj.seconds
    }
  }

  async onTabRemove() {
    const now = new Date().getTime()
    this.leaveTime = now

    await this.updateStorage()
  }

  async onTabUpdate() {
    // old
    const now = new Date().getTime()
    if (this.hostname) {
      this.leaveTime = now
      await this.updateStorage()
    }

    // new
    const urlInfo = await getUrlInfo()
    if (!urlInfo) return

    const { protocol, hostname } = urlInfo
    this.protocol = protocol
    this.hostname = hostname
    this.enterTime = now
  }

  async onFocus() {
    const hostInfo = await getUrlInfo()
    if (!hostInfo) return
    const { protocol, hostname } = hostInfo
    this.protocol = protocol
    this.hostname = hostname

    const now = new Date().getTime()
    this.enterTime = now
  }

  async onBlur() {
    this.leaveTime = new Date().getTime()
    await this.updateStorage()
  }

  calSeconds() {
    this.seconds = millisecondsToSeconds(this.leaveTime - this.enterTime)
  }

  async updateStorage() {
    this.calSeconds()
    const list = await this.getStorageListByHostname()
    console.log(this.hostname, this.seconds);

    list.push({
      protocol: this.protocol,
      hostname: this.hostname,
      enterTime: this.enterTime,
      leaveTime: this.leaveTime,
      seconds: this.seconds
    })
    await this.setStorageListByHostname(list)
  }

  async getStorageListByHostname(): Promise<TabLifePP[]> {
    if (this.hostname) {
      const data = await getStorageByKey<HostMap>('hostMap')

      if (!data) return []

      return data[this.hostname] ?? []
    }
    else {
      return []
    }
  }

  async setStorageListByHostname(TabLifeList: TabLifePP[]) {
    if (this.hostname) {
      const data = await getStorageByKey<HostMap>('hostMap') ?? {}
      data[this.hostname] = TabLifeList

      await setStorageByKey('hostMap', data)
    }
  }
}

export function setStorageByKey<T>(key: StorageKey, val: T): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [key]: val });
    resolve()
  })
}

export function getStorageByKey<T>(key: StorageKey): Promise<T | null> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, (res) => {
      if (res[key] !== undefined) {
        resolve(res[key])
      } else {
        resolve(null)
      }
    });
  })
}

export function getStorageAll(): Promise<{ [k in string]: any }> {
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
  return Math.round(milliseconds / 1000);
}

export function parseUrl(url: string): UrlInfo | null {
  try {
    const { protocol, hostname } = new URL(url)
    return {
      protocol,
      hostname
    }
  } catch (e) {
    return null
  }
}

export function getUrlInfo(): Promise<UrlInfo | null> {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      let url = (tabs[0] && tabs[0].url) ?? ''
      const urlInfo = parseUrl(url)

      resolve(urlInfo)
    });
  })
}
