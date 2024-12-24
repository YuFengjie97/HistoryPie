import * as echarts from 'echarts';
import { get_storage } from '../api';
import { TabLifeStorage } from '../background/utils';

(async () => {

  const res = await get_storage()
  const data = (Object.entries(res.data) as [string, TabLifeStorage][]).map(([hostname, info]) => {
    return { name: hostname, value: parseFloat(info.total_seconds.toFixed(2)) }
  })
  console.log(data);

  const myChart = echarts.init(document.getElementById('chart1'));
  myChart.setOption({
    title: {
      text: 'Browse Time',
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
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
