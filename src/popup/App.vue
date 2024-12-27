<script lang="ts" setup>
import { ref } from 'vue';
import { getHostMap, getStorage, clearStorage } from '../api/index'

const msg = ref('dddhello')

console.log('-------------------------------------');
console.log('---------this is popup---------------');
console.log('-------------------------------------');


function handleGoChart() {
  const url = chrome.runtime.getURL(`dist/chart/index.html`);
  chrome.tabs.create({ url }, (tab) => {
    console.log("New tab opened:", tab);
  });
}
async function handleLogHost() {
  const res = await getHostMap()
  console.log('hostMap', res);
}

async function handleLogStorage() {
  const res = await getStorage()
  console.log('log_storage', res,);
}

async function handleClearStorage() {
  const res = await clearStorage()
  console.log('clearStorage', res);
}
</script>

<template>
  <main>
    {{ msg }}
    <div class="button-group">

    <button @click="handleGoChart">go chart page</button>
    <button @click="handleLogHost">log host map</button>
    <button @click="handleLogStorage">log storage</button>
    <button @click="handleClearStorage">clear storage</button>
  </div>
  </main>
</template>

<style lang='less' scoped>
main {
  width: 400px;
}
.button-group{
  display: flex;
  flex-flow: column nowrap;
}
</style>