import { clearStorage, getStorageAll, getUrlInfo, TabLife } from "./utils";
import { type Message } from '../api/index'

export type TabLifeMap = {
  [hostname in string]: TabLife
}


let tabLifeActive: TabLife | null = null

/**
 * 在激活/更新tab,时,在当前tab/新tab跳转页面(跳转相同hostname/不同)
 */
async function updateTabLife() {
  // 旧地址更新
  await tabLifeActive?.handleLeave()

  // 新地址更新 / 创建
  const urlInfo = await getUrlInfo()
  if (urlInfo) {
    const { protocol, hostname } = urlInfo
    if (['http:', 'https:'].includes(protocol)) {
      tabLifeActive = new TabLife(hostname)
    }
    else {
      tabLifeActive = null
    }
  }

}

/**
 * 标签页激活
 * 触发条件:
 * 1. 新建空白页
 * 2. 从历史记录/url直接打开
 */
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  console.log('tab Active   ');
  await updateTabLife()
});


/**
 * 标签页移除
 * 触发条件:
 * 1. 使用关闭按钮关闭
 * 2. 关闭整个窗口
 */
chrome.tabs.onRemoved.addListener(async (tabId) => {
  console.log('tab Remove  ');
  tabLifeActive?.handleLeave()
});

/**
 * 更新:
 * 触发条件:
 * 通过修改地址栏,触发的在本标签页的跳转
 */
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    console.log('tab Update  ');

    await updateTabLife()
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
  }

  return true
});

chrome.action.onClicked.addListener(() => {
  const url = chrome.runtime.getURL(`dist/chart/index.html`);
  chrome.tabs.create({ url }, (tab) => { });
})