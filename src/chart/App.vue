<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import * as echarts from 'echarts';
import { getTabLifeStorage, clearStorage } from '../api';
import { i18n } from '../utils/locales';
import { type TabLifePP } from '../background/utils'
import { flatArray } from '../utils';
import dayjs from 'dayjs'
import { hostname } from 'os';


type ChartItemData = {
  hostname: string
  seconds: number
  lastTime: number
}

type DataItem = ChartItemData & {
  list: TabLifePP[]
}

const chartDom = ref<HTMLElement>()
const now = new Date()
const lastMonth = dayjs(now).subtract(1, 'month').toDate()
const dateRange = ref([
  lastMonth,
  now
])
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


let initChart = function (data: ChartItemData[]) {
  console.log(data);
  

  let echartIns = echarts.init(chartDom.value)

  function _update(data: ChartItemData[]) {
    const seriesData = data.map(item => ({
      name: item.hostname,
      value: item.seconds,
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

async function refresh() {
  let data = await getData()

  data = filterDataByRange(data)
  data = sortDataBySeconds(data)

  if (!isCheckAll.value) {
    data = filterDataByTop10(data)
  }

  initChart(data)
}


async function getData(): Promise<DataItem[]> {
  const res = await getTabLifeStorage()

  return Object.keys(res).map(k => ({
    hostname: k,
    seconds: 0,
    lastTime: 0,
    list: res[k],
  }))
}


function filterDataByRange(data: DataItem[]): DataItem[] {
  const [s, e] = dateRange.value
  return data.map((item) => {
    const { list } = item
    let lastTime = 0
    const filterList = list.filter(tab => {
      const { enterTime, leaveTime } = tab

      if (enterTime >= s.getTime() && leaveTime <= e.getTime()) {
        if (leaveTime > lastTime) {
          lastTime = leaveTime
        }
        return true
      }

      return false
    })
    
    return {
      ...item,
      lastTime,
      list: filterList
    }
  })
}


function sortDataBySeconds(data: DataItem[]) {
  return data.map(item => {
    const { list } = item
    const seconds = list.reduce((acc, cur) => {
      return acc + cur.seconds
    }, 0)
    return {
      ...item,
      seconds
    }
  }).sort((a, b) => b.seconds - a.seconds)
}

function filterDataByTop10(data: DataItem[]) {
  return data.slice(0, 10)
}


function datePickerChange() {
  refresh()
}

function checkAll() {
  refresh()
}

onMounted(async () => {
  refresh()
})

async function handleLogStorage() {
  const data = await getData()
  console.log(data);
}

async function handleClearStorage() {
  await clearStorage()
  await getData()
}
</script>

<template>
  <main>
    <div class="bt-group">
      <button @click="getData">refresh</button>
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