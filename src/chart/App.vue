<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { getStorageAll, clearStorage, getHostMap } from '~/api'
import { i18n } from '~/utils/locales'
import { type TabLifePP } from '~/background/utils'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import iconGithub from '~/assets/icon-github.svg'

type ChartItemData = {
  protocol: string
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
const totalTime = ref('')
const showProtocol = ref<'all' | 'onlyHttp'>('onlyHttp')

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
  let echartIns = echarts.init(chartDom.value)

  function _update(data: ChartItemData[]) {
    const seriesData = data.map((item) => ({
      name: item.hostname,
      value: item.seconds,
      lastTime: item.lastTime,
    }))

    echartIns.setOption({
      title: {
        text: `${i18n('app_name')}`,
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
  const data = await getData()
  initChart(data)

  const totalSeconds = getTotalSecons(data)
  totalTime.value = `${i18n('browseTotalTime')}: ${convertSeconds(
    totalSeconds
  )}`
}

function getTotalSecons(data: DataItem[]): number {
  return data.reduce(
    (acc, cur) => {
      return { seconds: acc.seconds + cur.seconds }
    },
    { seconds: 0 }
  ).seconds
}

function convertSeconds(seconds: number) {
  const day = Math.floor(seconds / 86400)
  const hour = Math.floor((seconds % 86400) / 3600)
  const min = Math.floor((seconds % 3600) / 60)
  const sec = Math.floor(seconds % 60)
  const dayStr = day > 0 ? `${day} ${i18n('day')} ` : ''
  const hourStr = hour > 0 ? `${hour} ${i18n('hour')} ` : ''
  const minStr = min > 0 ? `${min} ${i18n('minute')} ` : ''
  const secStr = sec > 0 ? `${sec} ${i18n('second')} ` : ''
  return `${dayStr}${hourStr}${minStr}${secStr}`
}

async function getData() {
  let data = await getStorageData()

  data = filterDataByRange(data)
  data = sortDataBySeconds(data)

  if (showNum.value === 'top10') {
    data = filterDataByTop10(data)
  }
  if (showProtocol.value === 'onlyHttp') {
    data = filterDataByProtocol(data)
  }
  return data
}

async function getStorageData(): Promise<DataItem[]> {
  const res = await getHostMap()

  return Object.keys(res).map((k) => ({
    hostname: k,
    protocol: res[k][0].protocol,
    seconds: 0,
    lastTime: 0,
    list: res[k],
  }))
}

function filterDataByRange(data: DataItem[]): DataItem[] {
  const [s, e] = dateRange.value.map((item) => item.getTime())

  return data.map((item) => {
    const { list } = item
    const filterList = list.filter((tab) => {
      const { enterTime, leaveTime } = tab

      /**
       * enterTime <= 筛选起始 && leaveTime <= 筛选结束
       * enterTime >= 筛选起始 && leaveTime <= 筛选结束
       * enterTime >= 筛选起始 && leaveTime >= 筛选结束
       * enterTime <= 筛选起始 && leaveTime >= 筛选结束
       */
      if (enterTime <= e && leaveTime >= s) {
        return true
      }

      return false
    })

    return {
      ...item,
      list: filterList,
    }
  })
}

function filterDataByProtocol(data: DataItem[]): DataItem[] {
  return data.filter((item) => ['http:', 'https:'].includes(item.protocol))
}

function sortDataBySeconds(data: DataItem[]): DataItem[] {
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

function filterDataByTop10(data: DataItem[]): DataItem[] {
  if (data.length > 10) {
    return data.slice(0, 10)
  }
  return data
}

function handleClearStorage() {
  ElMessageBox.confirm(i18n('delateAllData'), 'Warning', {
    confirmButtonText: i18n('confirm'),
    cancelButtonText: i18n('cancel'),
    type: 'warning',
  }).then(async () => {
    await clearStorage()
    refresh()

    ElMessage({
      type: 'success',
      message: i18n('deleteSuccess'),
    })
  })
}

onMounted(async () => {
  refresh()
})

async function handleLogBackgroundStorage() {
  await getStorageAll()
}

function handleRangeRadioChange() {
  refresh()
}

function handleProtocolRadioChange() {
  refresh()
}

function handleResetTimeRange() {
  const now = new Date()
  const lastMonth = dayjs(now).subtract(1, 'month').toDate()
  dateRange.value = [lastMonth, now]
  refresh()
}

function goGithub() {
  window.open('https://github.com/YuFengjie97/HistoryPie', '_blank')
}
</script>

<template>
  <main class="p-y-10px p-x-40px relative">
    <div
      class="absolute top-0 right-0 m-b-20px cursor-pointer"
      @click="goGithub"
    >
      <img class="w-32px h-32px" :src="iconGithub" alt="" />
    </div>
    <el-card>
      <el-form label-width="auto" :inline="true">
        <el-form-item :label="i18n('timeRange')">
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
        </el-form-item>

        <el-form-item :label="i18n('top10')">
          <el-radio-group @change="handleRangeRadioChange" v-model="showNum">
            <el-radio value="all">{{ i18n('showAll') }}</el-radio>
            <el-radio value="top10">{{ i18n('top10') }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item :label="i18n('protocol')">
          <el-radio-group
            @change="handleProtocolRadioChange"
            v-model="showProtocol"
          >
            <el-radio value="all">{{ i18n('showAll') }}</el-radio>
            <el-radio value="onlyHttp">{{ i18n('onlyHttp') }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item>
          <el-button
            class="m-r-10px"
            type="primary"
            @click="handleResetTimeRange"
            >{{ i18n('refresh') }}</el-button
          >
          <el-button type="primary" @click="handleLogBackgroundStorage"
            >log background storage</el-button
          >
          <el-button type="warning" @click="handleClearStorage">{{
            i18n('clearHistory')
          }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <h1>{{ totalTime }}</h1>
    <el-card>
      <div class="chart" ref="chartDom"></div>
    </el-card>
  </main>
</template>

<style lang="less" scoped>
.chart {
  height: 500px;
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
