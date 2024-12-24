import { clearStorage, getStorageAll, getUrlInfo, HostLife } from "./utils";
import { type Message } from '../api/index'


type HostName = string

const host_map: {
  [hostname in HostName]: HostLife
} = {}

let host_active = 0

/**
 * 标签页激活
 * 触发条件:
 * 1. 新建空白页
 * 2. 从历史记录/url直接打开
 */
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  console.log('tab Active  ');
  const now = new Date().getTime()
  const { hostname } = await getUrlInfo()

  // 更新旧标签
  host_map[tabMap[tabActive]]?.updateLastTime(now)
  
  // 特殊网站不用记录
  if(hostname === null) return
  if (!tabMap[tabId]) {
    // 新开标签页
    tabMap[tabId] = hostname
    host_map[hostname] = new HostLife(tabId, hostname, now)
  }else{
    // 已有标签页更新
    tabActive = tabId
    host_map[tabMap[tabId]]?.updateLastTime(now)
  }
});


/**
 * 标签页移除
 * 触发条件:
 * 1. 使用关闭按钮关闭
 * 2. 关闭整个窗口
 */
chrome.tabs.onRemoved.addListener(async (tabId) => {
  console.log('tab Remove  ');

  const hostname = tabMap[tabId]
  if(!hostname) return

  const now = new Date().getTime()

  host_map[hostname]?.updateLastTime(now)

  delete tabMap[tabId]
});

/**
 * 更新:
 * 触发条件:
 * 通过修改地址栏,触发的在本标签页的跳转
 */
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    console.log('tab Update  ');

    const { hostname } = await getUrlInfo()
    const now = new Date().getTime()
    if (hostname === null || hostname === 'newtab') return

    if (!host_map[hostname]) {
      host_map[hostname] = new HostLife(tabId, hostname, now)
    } else {
      host_map[hostname].updateLastTime(now)
    }
  }
});


// 通信
/**
 * sendResponse ts 参数bug  https://github.com/GoogleChrome/chrome-types/issues/50
 */
chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
  if (message.type === 'getHostMap') {
    sendResponse({ data: host_map })
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