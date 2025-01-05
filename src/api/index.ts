import { Message } from "~/background/event";
import { type HostMap } from "~/background/tab";

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

export async function getHostMap(): Promise<HostMap> {
  const { data } = await sendMessage<HostMap>({ type: 'getHostMap' })
  return data ?? {}
}

export async function clearStorage() {
  return await sendMessage({ type: 'clearStorage' })
}

export async function getStorageAll() {
  const { data } = await sendMessage<any>({ type: "getStorageAll" })
  return data
}