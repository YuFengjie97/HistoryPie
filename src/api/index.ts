import { type HostLifeStorage, type HostLife, type HostLifeMap, type HostLifeStorageMap } from "../background/utils";

export interface Message {
  type: string,
  preload?: any
}

export function sendMessage<T>(message: Message): Promise<{ data: T }> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (res: any) => {
      if (chrome.runtime.lastError) {
        console.error(`EORROR  ${message.type}`, chrome.runtime.lastError.message);
        reject(new Error(chrome.runtime.lastError.message));
      }
      else {
        resolve(res);
      }
    });
  })
}


export async function getHostMap(): Promise<HostLifeMap> {
  const { data } = await sendMessage<HostLifeMap>({ type: 'getHostMap' })
  return data
}

export async function getStorage(): Promise<HostLifeStorage[]> {
  const { data } = await sendMessage<HostLifeStorageMap>({ type: 'getStorage' })
  return Object.values(data)
}

export async function clearStorage() {
  return await sendMessage({ type: 'clearStorage' })
}