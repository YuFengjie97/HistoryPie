import { getHostMap, getStorage, clearStorage } from '../api/index'

const btGoChart = document.querySelector('#go_chart')
btGoChart?.addEventListener('click', () => {
  const url = chrome.runtime.getURL(`/html/chart.html`);
  chrome.tabs.create({ url }, (tab) => {
    console.log("New tab opened:", tab);
  });
})

const btLogHostMap = document.querySelector('#log_host_map')
btLogHostMap?.addEventListener('click', async () => {
  const res = await getHostMap()
  console.log('host_map', res);
})


const btLogStorage = document.querySelector('#log_storage')
btLogStorage?.addEventListener('click', async () => {
  const res = await getStorage()
  console.log('log_storage', res,);
})


const btClearStorage = document.querySelector('#clearStorage')
btClearStorage?.addEventListener('click', async () => {
  const res = await clearStorage()
  console.log('clearStorage', res);
})