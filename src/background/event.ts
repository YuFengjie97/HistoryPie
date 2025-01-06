import { clearStorage, getStorageAll, getStorageByKey } from "./utils";
import { type HostMap } from "./tab";
import browser from 'webextension-polyfill'

export type Message = {
  type: "getHostMap" | "clearStorage" | "getStorageAll"
  preload?: any
}

export function registerCustomEvent() {
  browser.runtime.onMessage.addListener(async (message) => {
    
    const msg = message as Message

    if (msg.type === "getHostMap") {
      const res = await getStorageByKey<HostMap>('hostMap')
      console.log('getHostMap', res);
      return res
    }

    if (msg.type === "clearStorage") {
      await clearStorage()
      return 'success'
    }

    if (msg.type === "getStorageAll") {
      const res = await getStorageAll()
      return res
    }
  });

}

