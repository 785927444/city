  import * as echarts from 'echarts'
  import * as echarts from 'echarts'
  import dictStore from '@/stores/dictStore'
  import { isNull, newSize } from "@/utils/common"
  /* 
  参数
  id      dom节点
  data    数据
  attr    空
  params  属性
          颜色列表: colorList: []             （空：默认）
          图例列表：legendArr: []             （空：默认）
          名称：    name: '统计'              （空：默认）
          内外圈：  radius: ['30%', '38%'],   （空：默认）   
          位置：    center: [ '50%', '50%'],  （空：默认）
          点值显隐：labelShow: false          （空：隐藏）
  */
  const colorLists = dictStore().colorLists
  const setOption = {
    Laser(attr:any, data:any, pramas:any) {
      let colorList = !isNull(pramas.colorList)? pramas.colorList : colorLists
      let indicator = []
      for (var i = 0; i <= attr.legendArr.length-1; i++) {
        indicator.push({ name: attr.legendArr[i], max: attr.max })
      }
      let radar = {
        indicator: indicator,
        center: ['50%', '50%'], radius: '70%', splitNumber: 5,
        name: { fontSize: newSize(12), color: '#2C5493', borderRadius: 3, padding: [-6, -6] },
        axisLine: { lineStyle: { color: '#2C5493', type: 'solid' }},
        splitLine: { lineStyle: { color: '#2C5493' }},
        splitArea: { show: true, areaStyle: {color: [ "rgba(0, 0, 0, 0)", "rgba(5, 32, 74, 0.9)"]}},
      }
      let series = [{
        name: pramas.name?pramas.name:'统计',
        type: 'radar',
        symbolSize: 2,
        symbolColor: "#4ebfdb",
        areaStyle: {                    
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {offset: 0, color: 'rgba(0,181,120,.3)'}, 
            {offset: 1, color: 'rgba(71,237,252,.8)'}
          ]), 
        }, 
        lineStyle: { color: "#4ebfdb"},
        label: { show: !isNull(attr.labelShow)? attr.labelShow : false, fontSize: newSize(10),color: '#60E7FF'},
        data: data,
      }]
      const option = {
        animation: false,
        radar: radar,
        series: series
      };
      return option
    }
  }
  export default setOption

