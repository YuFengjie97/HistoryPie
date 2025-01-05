import { clearStorage, getStorageAll, TabLife } from "./utils";
import { type Message } from '~/api/index'


let tabLifeMap: {
  [tabId in number]: TabLife
} = {}


let tabActive: number | null = null

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  console.log('tab Active   ');

  if (tabActive && tabLifeMap[tabActive]) {
    await tabLifeMap[tabActive].onBlur()
  }

  tabActive = tabId

  if (!tabLifeMap[tabId]) {
    tabLifeMap[tabId] = new TabLife()
  }
  await tabLifeMap[tabId].onFocus()

});


chrome.tabs.onRemoved.addListener(async (tabId) => {
  console.log('tab Remove  ');

  if (tabId !== tabActive) return
  const tabLife = tabLifeMap[tabId]
  tabActive = null
  await tabLife.onTabRemove()
  if (tabLifeMap[tabId]) {
    delete tabLifeMap[tabId]
  }
});


chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    console.log('tab Update  ');

    if (tabLifeMap[tabId]) {
      await tabLifeMap[tabId].onTabUpdate()
    }

  }
});


// 通信
chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {

  if (message.type === "getStorage") {
    getStorageAll().then(res => {
      sendResponse({ data: res })
    })
  }

  if (message.type === "clearStorage") {
    clearStorage().then(res => {
      sendResponse({ data: "success" })
    })
    tabLifeMap = {}
    tabActive = null
  }

  if (message.type === "backgroundLog") {
    sendResponse({
      data: {
        tabActive,
        tabLifeMap
      }
    })
  }

  return true
});

chrome.action.onClicked.addListener(() => {
  const url = chrome.runtime.getURL(`dist/chart/index.html`);
  chrome.tabs.create({ url }, (tab) => { });
})