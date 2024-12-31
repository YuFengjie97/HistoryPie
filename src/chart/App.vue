<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'
import { getTabLifeStorage, clearStorage } from '../api'
import { i18n } from '../utils/locales'
import { type TabLifePP } from '../background/utils'
import dayjs from 'dayjs'

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
const dateRange = ref([lastMonth, now])
const showNum = ref<'all' | 'top10'>('top10')

function timeFormat(secs: number) {
  // 小于一分钟
  if (secs < 60) return `${secs.toFixed(1)} ${i18n('second')}`
  // 小于一小时
  if (secs < 60 * 60) return `${(secs / 60).toFixed(1)} ${i18n('minute')}`
  // 小于一天
  if (secs < 60 * 60 * 24)
    return `${(secs / 60 / 60).toFixed(1)} ${i18n('hour')}`
  // 大于一天
  return `${(secs / 60 / 60 / 24).toFixed(1)} ${i18n('day')}`
}

let initChart = function (data: ChartItemData[]) {
  console.log(data)

  let echartIns = echarts.init(chartDom.value)

  function _update(data: ChartItemData[]) {
    const seriesData = data.map((item) => ({
      name: item.hostname,
      value: item.seconds,
      lastTime: item.lastTime,
    }))

    echartIns.setOption({
      title: {
        text: i18n('app_name'),
        left: 'center',
      },
      tooltip: {
        trigger: 'item',
        formatter: function (params: {
          name: string
          value: number
          data: (typeof seriesData)[0]
        }) {
          return `
          <div class="custom-tooltip">
            <div class="name">${params.name}</div>
            <div class="value">${i18n(
              'browseTime'
            )}: <span class="second">${timeFormat(params.value)}</span></div>
            <div class="lasttime">${i18n('lastVisit')}: ${dayjs(
            params.data.lastTime
          ).format('YYYY-MM-DD HH:mm:ss')}</div>
          </div>
            `
        },
      },
      legend: {
        orient: 'vertical',
        left: 'top',
        type: 'scroll',
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
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    })
  }

  _update(data)
  initChart = _update
}

async function refresh() {
  let data = await getData()

  data = filterDataByRange(data)
  data = sortDataBySeconds(data)

  if ((showNum.value === 'top10')) {
    data = filterDataByTop10(data)
  }

  initChart(data)
}

async function getData(): Promise<DataItem[]> {
  const res = await getTabLifeStorage()

  return Object.keys(res).map((k) => ({
    hostname: k,
    seconds: 0,
    lastTime: 0,
    list: res[k],
  }))
}

function filterDataByRange(data: DataItem[]): DataItem[] {
  const [s, e] = dateRange.value !== null ? dateRange.value : [lastMonth, now]

  return data.map((item) => {
    const { list } = item
    let lastTime = 0
    const filterList = list.filter((tab) => {
      const { leaveTime } = tab

      if (leaveTime >= s.getTime() && leaveTime <= e.getTime()) {
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
      list: filterList,
    }
  })
}

function sortDataBySeconds(data: DataItem[]) {
  return data
    .map((item) => {
      const { list } = item
      const seconds = list.reduce((acc, cur) => {
        return acc + cur.seconds
      }, 0)
      return {
        ...item,
        seconds,
      }
    })
    .filter((item) => item.seconds > 0)
    .sort((a, b) => b.seconds - a.seconds)
}

function filterDataByTop10(data: DataItem[]) {
  if (data.length > 10) {
    return data.slice(0, 10)
  }
  return data
}

onMounted(async () => {
  refresh()
})

async function handleLogStorage() {
  const data = await getData()
  console.log(data)
}

async function handleClearStorage() {
  await clearStorage()
  await getData()
}
function handleRadioChange() {
  refresh()
}
</script>

<template>
  <main>
    <div class="bt-group">
      <button @click="refresh">refresh</button>
      <button @click="handleLogStorage">storage</button>
      <button @click="handleClearStorage">clear storage</button>
      <br />
      <el-radio-group @change="handleRadioChange" v-model="showNum">
        <el-radio value="all" size="large">展示全部</el-radio>
        <el-radio value="top10" size="large">只看前十</el-radio>
      </el-radio-group>
      <el-date-picker
        v-model="dateRange"
        type="datetimerange"
        start-placeholder="Start date"
        end-placeholder="End date"
        format="YYYY-MM-DD HH:mm:ss"
        date-format="YYYY/MM/DD ddd"
        time-format="A hh:mm:ss"
        @change="refresh"
      />
    </div>
    <div class="chart" ref="chartDom"></div>
  </main>
</template>

<style lang="less" scoped>
.chart {
  height: 400px;

  ::v-deep(.custom-tooltip) {
    .name {
      font-weight: 600;
    }

    .value {
      .second {
        color: black;
        font-weight: 900;
      }
    }
  }
}
</style>
