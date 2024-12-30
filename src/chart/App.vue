<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import * as echarts from 'echarts';
import { getStorage, getHostMap, clearStorage } from '../api';
import { type HostLifeStorage } from '../background/utils';
import { i18n } from '../utils/locales';
import dayjs from 'dayjs'


const chartDom = ref<HTMLElement>()
const dateRange = ref()
const isCheckAll = ref(false)


function timeFormat(secs: number) {
  // 小于一分钟
  if (secs < 60) return `${secs.toFixed(1)} ${i18n('second')}`
  // 小于一小时
  if (secs < 60 * 60) return `${(secs / 60).toFixed(1)} ${i18n('minute')}`
  // 小于一天
  if (secs < 60 * 60 * 24) return `${(secs / 60 / 60).toFixed(1)} ${i18n('hour')}`
  // 大于一天
  return `${(secs / 60 / 60 / 24).toFixed(1)} ${i18n('day')}`
}


let initChart = function (data: HostLifeStorage[]) {

  let echartIns = echarts.init(chartDom.value)

  function _update(data: HostLifeStorage[]) {
    const seriesData = data.map(item => ({
      name: item.hostname,
      value: item.totalSeconds,
      lastTime: item.lastTime
    }))

    echartIns.setOption({
      title: {
        text: i18n('app_name'),
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: function (params: { name: string, value: number, data: typeof seriesData[0] }) {
          return `
          <div class="custom-tooltip">
            <div class="name">${params.name}</div>
            <div class="value">${i18n('browseTime')}: <span class="second">${timeFormat(params.value)}</span></div>
            <div class="lasttime">${i18n('lastVisit')}: ${dayjs(params.data.lastTime).format('YYYY-MM-DD HH:mm:ss')}</div>
          </div>
            `;
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

  _update(data)
  initChart = _update
}


async function getData() {
  let data = await getStorage()
  data = filterData(data)
  initChart(data)
}

async function handleLogHostMap() {
  const hostMap = await getHostMap()
  console.log(hostMap);
}

async function handleLogStorage() {
  const data = await getStorage()
  console.log(data);
}

async function handleClearStorage() {
  await clearStorage()
  await getData()
}

function filterByRange(data: HostLifeStorage[]) {
  return data.filter(item => {
    const [s, e] = dateRange.value
    const start = dayjs(s).valueOf()
    const end = dayjs(e).valueOf()
    return item.lastTime >= start && item.lastTime <= end
  })
}

function filterDataBySort(data: HostLifeStorage[]) {
  return data.sort((a, b) => b.totalSeconds - a.totalSeconds)
}

function filterByTop10(data: HostLifeStorage[]) {
  return data.slice(0, 10)
}

function filterData(data: HostLifeStorage[]) {
  if (dateRange.value) {
    data = filterByRange(data)
  }
  data = filterDataBySort(data)
  if (!isCheckAll.value) {
    data = filterByTop10(data)
  }
  return data
}


function datePickerChange() {
  getData()
}

function checkAll() {
  getData()
}

onMounted(async () => {
  getData()
})

</script>

<template>
  <main>
    <div class="bt-group">
      <button @click="getData">refresh</button>
      <button @click="handleLogHostMap">host map</button>
      <button @click="handleLogStorage">storage</button>
      <button @click="handleClearStorage">clear storage</button>
      <br />
      <el-date-picker v-model="dateRange" type="datetimerange" start-placeholder="Start date" end-placeholder="End date"
        format="YYYY-MM-DD HH:mm:ss" date-format="YYYY/MM/DD ddd" time-format="A hh:mm:ss" @change="datePickerChange" />
      <el-checkbox v-model="isCheckAll" label="查看全部" size="large" @change="checkAll" />
    </div>
    <div class="chart" ref="chartDom"></div>
  </main>

</template>

<style lang='less' scoped>
.chart {
  height: 400px;

  ::v-deep(.custom-tooltip) {
    .name {
      font-weight: 600
    }

    .value {
      .second {
        color: black;
        font-weight: 900
      }
    }
  }
}
</style>