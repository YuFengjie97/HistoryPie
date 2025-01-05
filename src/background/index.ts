import { registerCustomEvent } from "./event";
import { registerTabEvent } from "./tab";


registerCustomEvent()
registerTabEvent()


chrome.action.onClicked.addListener(() => {
  const url = chrome.runtime.getURL(`dist/chart/index.html`);
  chrome.tabs.create({ url }, (tab) => { });
})
