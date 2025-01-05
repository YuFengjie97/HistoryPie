import { clearStorage, getStorageAll, getStorageByKey } from "./utils";
import { type HostMap } from "./tab";

export type Message = {
  type: "getHostMap" | "clearStorage" | "getStorageAll"
  preload?: any
}

export function registerCustomEvent() {
  chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
    if (message.type === "getHostMap") {
      getStorageByKey<HostMap>('hostMap').then(res => {
        console.log('getHostMap', res);
        
        sendResponse({ data: res })
      })
    }

    if (message.type === "clearStorage") {
      clearStorage().then(res => {
        console.log('clear success');
        
        sendResponse({ data: "success" })
      })
    }

    if (message.type === "getStorageAll") {
      getStorageAll().then(res => {
        console.log('getStorageAll', res);
        
        sendResponse({ data: res })
      })
    }

    return true
  });


}

