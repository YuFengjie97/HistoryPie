import browser from "webextension-polyfill"


export function i18n(key: string) {
  return browser.i18n.getMessage(key)
}