import { registerCustomEvent } from "./event";
import { registerTabEvent } from "./tab";
import browser from "webextension-polyfill";


registerCustomEvent()
registerTabEvent()


browser.action.onClicked.addListener(() => {
  const url = browser.runtime.getURL(`dist/chart/index.html`);
  browser.tabs.create({ url });
})

