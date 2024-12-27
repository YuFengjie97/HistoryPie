<script lang="ts" setup>
import { ref, onMounted} from 'vue';
import * as echarts from 'echarts';
import { getStorage } from '../api';
import { HostLifeStorage } from '../background/utils';
import { i18n } from '../utils/locales';


console.log('-------------------------------------');
console.log('---------this is chart---------------');
console.log('-------------------------------------');

const chart = ref<HTMLElement>()
console.log(chart.value);



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

onMounted(async() => {
  const res = await getStorage()
  const data = (Object.entries(res.data) as [string, HostLifeStorage][]).map(([hostname, info]) => {
    return { name: hostname, value: info.totalSeconds }
  }).sort((a, b) => {
    return b.value - a.value
  }).slice(0, 10)
  console.log(data);

  const myChart = echarts.init(chart.value);
  myChart.setOption({
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
        data,
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
})
</script>

<template>
  <main>
    <div class="chart" ref="chart"></div>
  </main>

</template>

<style lang='less' scoped>
.chart{
  height: 400px;
}
</style>