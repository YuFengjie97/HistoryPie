import { clear_storage, get_storage_all, get_url_info, TabLife } from "./utils";
import { type Message } from '../api/index'


type HostName = string
type TabId = number

// tabId --> hostname --> TabLife
const tab_map: {
  [tabId in number]: HostName
} = {}

const host_map: {
  [hostname in HostName]: TabLife
} = {}

let tab_active = 0

/**
 * 标签页激活
 * 触发条件:
 * 1. 新建空白页
 * 2. 从历史记录/url直接打开 https://www.bilibili.com
 */
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  console.log('tab Active  ');
  const now = new Date().getTime()
  const { hostname } = await get_url_info()

  // 更新旧标签
  host_map[tab_map[tab_active]]?.update_last_time(now)
  
  // 特殊网站不用记录
  if(hostname === null) return
  if (!tab_map[tabId]) {
    // 新开标签页
    tab_map[tabId] = hostname
    host_map[hostname] = new TabLife(tabId, hostname, now)
  }else{
    // 已有标签页更新
    tab_active = tabId
    host_map[tab_map[tabId]]?.update_last_time(now)
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

  const hostname = tab_map[tabId]
  if(!hostname) return

  const now = new Date().getTime()

  host_map[hostname]?.update_last_time(now)

  delete tab_map[tabId]
});

/**
 * 更新:
 * 触发条件:
 * 通过修改地址栏,触发的在本标签页的跳转
 */
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    console.log('tab Update  ');

    const { hostname } = await get_url_info()
    const now = new Date().getTime()
    if (hostname === null || hostname === 'newtab') return

    if (!host_map[hostname]) {
      host_map[hostname] = new TabLife(tabId, hostname, now)
    } else {
      host_map[hostname].update_last_time(now)
    }
  }
});


// 通信
/**
 * sendResponse ts 参数bug  https://github.com/GoogleChrome/chrome-types/issues/50
 */
chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
  if (message.type === 'get_host_map') {
    sendResponse({ data: host_map })
  }

  if (message.type === "get_storage") {
    get_storage_all().then(res => {
      sendResponse({ data: res })
    })
  }

  if (message.type === "clear_storage") {
    clear_storage().then(res => {
      sendResponse({ data: "success" })
    })
  }

  return true
});