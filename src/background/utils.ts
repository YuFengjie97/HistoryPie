export * from './index'

export type HostLifeStorage = {
  hostname: string
  lastTime: number
  totalSeconds: number
}

export type HostLifeStorageMap = {
  [hostname in string]: HostLifeStorage
}

export class HostLife {
  hostname: string
  // 在一次访问中(处于当前正在活跃的标签页时)的起始时间和结束时间
  enterTime: number
  leaveTime: number = 0
  // 上次最后一次访问
  lastTime: number = 0

  constructor(hostname: string) {
    const now = new Date().getTime()
    this.hostname = hostname
    this.enterTime = now
  }

  async handleEnter() {
    const now = new Date().getTime()
    this.enterTime = now
    this.lastTime = this.enterTime
  }

  async handleLeave() {
    const now = new Date().getTime()
    this.leaveTime = now
    this.lastTime = now
    const milliseconds = this.leaveTime - this.enterTime
    const seconds = millisecondsToSeconds(milliseconds)
    await this.updateStorage(seconds)
  }

  async getStorageTotalSeconds(): Promise<number> {
    const HostLife = await getStorageByKey<HostLifeStorage>(this.hostname)
    if (HostLife === null) {
      return 0
    }
    const { totalSeconds } = HostLife
    return totalSeconds
  }

  async updateStorage(seconds: number) {
    const secondsSave = await this.getStorageTotalSeconds()
    const secondsUpdate = secondsSave + seconds

    storageSet<HostLifeStorage>(this.hostname, {
      hostname: this.hostname,
      lastTime: this.lastTime,
      totalSeconds: secondsUpdate
    })
  }
}

async function storageSet<T>(key: string, val: T) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [key]: val });
  })
}

export function getStorageByKey<T>(key: string): Promise<T | null> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, (res) => {
      if (Object.keys(res).length === 0) {
        resolve(null)
      } else {
        resolve(res[key])
      }
    });
  })
}

export function getAllStorage(): Promise<HostLifeStorageMap> {
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