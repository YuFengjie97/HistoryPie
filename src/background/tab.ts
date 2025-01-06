import { getStorageByKey, setStorageByKey, TabLife, TabLifePP } from "./utils"

export type TabActive = number | null

export type TabLifeMap = {
  [tabId in string]: TabLife
}

export type HostMap = {
  [hostname in string]: TabLifePP[]
}

export type Storage = {
  tabLifeMap: TabLifeMap
  tabActive: TabActive
  hostMap: HostMap
}

export type StorageKey = keyof Storage


async function getTabLifeMap(): Promise<TabLifeMap> {
  /**
   * 为什么要用proxy存储tabLife?
   * 因为: Storage将类的实例对象存储后,会抹除对象上的方法,
   * 通过proxy的get来重新构建类对象,这种方式比手动调用构造函数构建要方便
   */
  const tabLifeMap = await getStorageByKey<TabLifeMap>('tabLifeMap') ?? {}

  const handle: ProxyHandler<{ [key in string]: TabLife }> = {
    get(obj, prop: string) {
      const tabLifePP = obj[prop]
      if (tabLifePP) {
        const tabLife = new TabLife(tabLifePP)
        tabLifeMap[prop] = tabLife
        return tabLife
      } else {
        return undefined
      }
    },
    set(obj, prop: string, val) {
      obj[prop] = val
      return true
    }
  }

  const proxy = new Proxy(tabLifeMap, handle)

  return proxy
}

async function getTabActive(): Promise<TabActive> {
  const tabActive = await getStorageByKey<TabActive>('tabActive')

  return tabActive
}

async function setTabLifeMap(val: TabLifeMap) {
  await setStorageByKey('tabLifeMap', val)
}

async function setTabActive(val: TabActive) {
  await setStorageByKey('tabActive', val)
}

export function registerTabEvent() {
  chrome.tabs.onActivated.addListener(async ({ tabId }) => {
    console.log('tab Active   ');

    let tabLifeMap = await getTabLifeMap()
    let tabActive = await getTabActive()


    // old
    if (tabActive && tabLifeMap[tabActive]) {
      const tabLife = tabLifeMap[tabActive]
      await tabLife.onBlur()
    }

    // new
    await setTabActive(tabId)

    if (!tabLifeMap[tabId]) {
      tabLifeMap[tabId] = new TabLife()
    }
    await tabLifeMap[tabId].onFocus()

    await setTabLifeMap(tabLifeMap)
  });


  chrome.tabs.onRemoved.addListener(async (tabId) => {
    console.log('tab Remove  ');

    let tabLifeMap = await getTabLifeMap()
    let tabActive = await getTabActive()


    /**
     * 非当前标签关闭,无需操作,因为在切到当前标签时通过active事件已经更新过了
     */
    if (tabId !== tabActive) return
    const tabLife = tabLifeMap[tabId]

    await setTabActive(null)

    if (tabLife) {
      await tabLife.onTabRemove()
      delete tabLifeMap[tabId]
    }

    await setTabLifeMap(tabLifeMap)
  });


  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
      console.log('tab Update  ');

      let tabLifeMap = await getTabLifeMap()

      if (tabLifeMap[tabId]) {
        const tabLife = tabLifeMap[tabId]
        await tabLife.onTabUpdate()
      }

      await setTabLifeMap(tabLifeMap)
    }
  });

  // 在开启浏览器时,重置全局变量
  chrome.runtime.onStartup.addListener(() => {
    setTabActive(null)
    setTabLifeMap({})
  })
}
