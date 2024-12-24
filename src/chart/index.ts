import * as echarts from 'echarts';
import { get_storage } from '../api';
import { TabLifeStorage } from '../background/utils';
// import { PieChart } from 'echarts/charts';
// import { TooltipComponent } from 'echarts/components';
// import { CanvasRenderer } from 'echarts/renderers';
// echarts.use([PieChart, TooltipComponent, CanvasRenderer])

function time_format(secs: number) {
  // 小于一分钟
  if (secs < 60) return `${secs.toFixed(0)} seconds`
  // 小于一小时
  if (secs < 60 * 60) return `${(secs / 60).toFixed(1)} minutes`
  // 小于一天
  if (secs < 60 * 60 * 24) return `${(secs / 60 / 60).toFixed(1)} hours`
  // 大于一天
  return `${(secs / 60 / 60 / 24).toFixed(1)} days`
}


(async () => {

  const res = await get_storage()
  const data = (Object.entries(res.data) as [string, TabLifeStorage][]).map(([hostname, info]) => {
    return { name: hostname, value: info.total_seconds }
  }).sort((a, b) => {
    return b.value - a.value
  }).slice(0, 10)
  console.log(data);

  const myChart = echarts.init(document.getElementById('chart1'));
  myChart.setOption({
    title: {
      text: 'Browse Time',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: function (params: { name: string, value: number }) {
        return `${params.name}</br>${time_format(params.value)}`;
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

})()
