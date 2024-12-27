import { clearStorage, getStorageAll, getUrlInfo, HostLife } from "./utils";
import { type Message } from '../api/index'

console.log('-------------------------------------');
console.log('---------this is background----------');
console.log('-------------------------------------');


type HostName = string

const hostMap: {
  [hostname in HostName]: HostLife
} = {}

let hostCurrent: HostName | null = null

/**
 * 在激活/更新tab,时,在当前tab/新tab跳转页面(跳转相同hostname/不同)
 */
async function updateHostLife() {
  // 旧地址更新
  hostCurrent && hostMap[hostCurrent]?.handleLeave()

  // 新地址更新 / 创建
  const { hostname } = await getUrlInfo()
  if (hostname !== null) {
    if (!hostMap[hostname]) {
      hostMap[hostname] = new HostLife(hostname)
    } else {
      hostMap[hostname].handleEnter()
    }
  }

  // 特殊网站也要记录
  hostCurrent = hostname
}

/**
 * 标签页激活
 * 触发条件:
 * 1. 新建空白页
 * 2. 从历史记录/url直接打开
 */
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  console.log('tab Active   ');
  await updateHostLife()
});


/**
 * 标签页移除
 * 触发条件:
 * 1. 使用关闭按钮关闭
 * 2. 关闭整个窗口
 */
chrome.tabs.onRemoved.addListener(async (tabId) => {
  console.log('tab Remove  ');

  const { hostname } = await getUrlInfo()
  hostname && hostMap[hostname]?.handleLeave()
});

/**
 * 更新:
 * 触发条件:
 * 通过修改地址栏,触发的在本标签页的跳转
 */
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    console.log('tab Update  ');

    await updateHostLife()
  }
});


// 通信
chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
  if (message.type === 'getHostMap') {
    sendResponse({ data: hostMap })
  }

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