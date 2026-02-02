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
    Radar(attr:any, data:any, pramas:any) {
      let colorList = !isNull(pramas.colorList)? pramas.colorList : colorLists
      // let legend = {
      //   data: pramas.legend, x:'center', bottom: newSize(12), icon: "circle", itemGap: newSize(18), itemWidth: newSize(12), itemHeight: newSize(12),
      //   textStyle: {color: '#fff', fontSize: newSize(10), padding:[4,0,0,0],rich:{a:{verticalAlign: 'middle',color: '#1BFFDF',fontSize: newSize(10)}}}
      // }
      let radar = {
        indicator: pramas.indicator, center: ['50%', '44%'], radius: '52%', splitNumber: 3, min: 0,  max: 100, axisName: {fontSize: newSize(10), color: '#fff',borderRadius: 3, padding: [-5, -5]},
        axisLine: {lineStyle: {color: '#fff', type: 'solid'}}, splitLine: {lineStyle: {color: '#fff'}}, splitArea: {show: false, areaStyle: {color: "rgba(255,0,0,0)"}},
      }
      let series = [{
        name: 'Budget vs spending', type: 'radar', symbolSize: 2, symbolColor: "#00B578", lineStyle: { color: "#00B578"},
        areaStyle: {color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0, color: 'rgba(0,181,120,.3)'}, {offset: 1, color: 'rgba(71,237,252,.8)'}])}, 
        data: data
      }]
      const option = {
        // legend: legend,
        radar: radar,
        series: series
      }
      return option
    }
  }
  export default setOption

