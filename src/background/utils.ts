export interface HostLifeStorage {
  hostname: string
  lastTime: number
  totalSeconds: number
}

export class HostLife {
  hostname: string
  lastTime: number

  constructor(hostname: string, lastTime: number) {
    this.hostname = hostname
    this.lastTime = lastTime
  }

  async updateLastTime(time: number) {
    const milliseconds = time - this.lastTime
    this.lastTime = time
    const seconds = millisecondsToSeconds(milliseconds)
    await this.updateStorage(seconds)
  }

  async getStorageTotalSeconds(): Promise<number> {
    const tabLife = await storageGet<HostLifeStorage>(this.hostname)
    if (tabLife === null) {
      return 0
    }
    const { totalSeconds } = tabLife
    return totalSeconds
  }

  async updateStorage(seconds: number) {
    const secondsExits = await this.getStorageTotalSeconds()
    const secondsUpdate = secondsExits + seconds
    console.log([secondsExits, seconds]);
    
    storageSet<HostLifeStorage>(this.hostname, {
      hostname: this.hostname,
      lastTime: this.lastTime,
      totalSeconds: secondsUpdate
    })
  }
}

async function storageSet<T>(key: string, val: T) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [key]: val }, () => resolve('success'));
  })
}

/**
 * 获取storage的内容
 * @param key 未传入,undefined: 返回所有storage
 * @param key string: 返回指定hostname的storage,如果没有,返回null
 */
function storageGet<T>(): Promise<{ [k in string]: HostLife }>
function storageGet<T>(key: string): Promise<T | null>
async function storageGet<T>(key?: string): Promise<T | null | { [k in string]: T }> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key ?? null, (res) => {
      // 空对象判断
      if (Object.keys(res).length === 0) {
        resolve(null)
      } else {
        if (key) {
          resolve(res[key])
        } else {
          resolve(res)
        }
      }
    });
  })
}

export function getStorageAll() {
  return storageGet()
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