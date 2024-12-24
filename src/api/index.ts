import { HostLife } from "../background/utils";

export interface Message {
  type: string,
  preload?: any
}

export function sendMessage(message: Message): Promise<{ data: HostLife }> {
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


export function getHostMap() {
  return sendMessage({ type: 'getHostMap' })
}

export function getStorage()  {
  return sendMessage({ type: 'getStorage' })
}

export function clearStorage() {
  return sendMessage({ type: 'clearStorage' })
}