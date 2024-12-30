<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';
import { getStorage, getHostMap, clearStorage } from '../api';
import { type HostLifeStorage } from '../background/utils';
import { i18n } from '../utils/locales';
import * as dayjs from 'dayjs'

type SeriesData = Array<{
  name: string
  value: number
}>

const chartDom = ref<HTMLElement>()


function timeFormat(secs: number) {
  // 小于一分钟
  if (secs < 60) return `${secs.toFixed(1)} seconds`
  // 小于一小时
  if (secs < 60 * 60) return `${(secs / 60).toFixed(1)} minutes`
  // 小于一天
  if (secs < 60 * 60 * 24) return `${(secs / 60 / 60).toFixed(1)} hours`
  // 大于一天
  return `${(secs / 60 / 60 / 24).toFixed(1)} days`
}

let initChart = function (el: HTMLElement, seriesData: SeriesData) {

  let echartIns = echarts.init(el)

  function _update(el: HTMLElement, seriesData: SeriesData) {
    echartIns.setOption({
      title: {
        text: i18n('app_name'),
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: function (params: { name: string, value: number }) {
          return `${params.name}</br>${timeFormat(params.value)}`;
        }
      },
      legend: {
        orient: 'vertical',
        left: 'top'
      },
      series: [
        {
          type: 'pie',
          radius: '50%',
          data: seriesData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    });
  }

  _update(el, seriesData)
  initChart = _update
}

async function getStorageData(): Promise<SeriesData> {
  const res = await getStorage()
  if (res.data === null) return []

  const data = (Object.entries(res.data) as [string, HostLifeStorage][]).map(([hostname, info]) => {
    return { name: hostname, value: info.totalSeconds }
  }).sort((a, b) => {
    return b.value - a.value
  }).slice(0, 10)

  return data
}

async function handleRefresh() {
  const data = await getStorageData()
  initChart(chartDom.value as HTMLElement, data)
}

async function handleLogHostMap() {
  const hostMap = await getHostMap()
  console.log(hostMap);
}

async function handleLogStorage() {
  const storage = await getStorage()
  console.log(storage);
}

async function handleClearStorage() {
  await clearStorage()
  await handleRefresh()
}

onMounted(async () => {
  await handleRefresh()
})
</script>

<template>
  <main>
    <div class="bt-group">
      <button @click="handleRefresh">refresh</button>
      <button @click="handleLogHostMap">host map</button>
      <button @click="handleLogStorage">storage</button>
      <button @click="handleClearStorage">clear storage</button>
    </div>
    <div class="chart" ref="chartDom"></div>
  </main>

</template>

<style lang='less' scoped>
.chart {
  height: 400px;
}
</style>