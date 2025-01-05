import { type TabLifePP } from "../background/utils";

export interface Message {
  type: string,
  preload?: any
}

export type TabLifeStorage = { [k in string]: TabLifePP[] }

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

export async function getTabLifeStorage() {
  const { data } = await sendMessage<TabLifeStorage>({ type: 'getStorage' })
  return data
}

export async function clearStorage() {
  return await sendMessage({ type: 'clearStorage' })
}


export async function backgroundLog() {
  return await sendMessage({ type: 'backgroundLog' })
}