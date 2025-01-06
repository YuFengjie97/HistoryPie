import { Message } from "~/background/event";
import { type HostMap } from "~/background/tab";
import browser from "webextension-polyfill";

export async function sendMessage<T>(message: Message): Promise<T> {
  const res = await browser.runtime.sendMessage<Message, T>(message);
  return res
}

export async function getHostMap(): Promise<HostMap> {
  const data = await sendMessage<HostMap>({ type: 'getHostMap' })
  return data ?? {}
}

export async function clearStorage() {
  return await sendMessage({ type: 'clearStorage' })
}

export async function getStorageAll() {
  const data  = await sendMessage<any>({ type: "getStorageAll" })
  return data
}