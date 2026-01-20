  import * as echarts from 'echarts'
  import dictStore from '@/stores/dictStore'
  import { isNull, newSize, isArray } from "@/utils/common"
  /* 
  参数
  id      dom节点
  data    数据
  attr    空
  params  属性
          开始角度: startAngle: 220           （空：默认）
          结束角度：endAngle: 320             （空：默认）
          圆圈大小：radius: '95%'             （空：默认）
          最小值：  min: 0,                   （空：默认）   
          最大值：  max: 100,                 （空：默认）
          刻度密度：splitNumber: 4            （空：隐藏）
          刻度长度：length: newSize(12)       （空：隐藏）
          刻度粗度：width: newSize(3)         （空：隐藏）
          刻度颜色：colors: []&string         （空：隐藏）
          标题位置：offsetTitle: []           （空：隐藏）
          标题位置：offsetDetail: []          （空：隐藏）
          文字颜色：color: '#FFFFFF'          （空：隐藏）
  */
  const colorLists = dictStore().colorLists
  const setOption = {
    Gauge(attr:any, data:any, pramas:any){
      let colorList = !isNull(pramas.colorList)? pramas.colorList : colorLists
      let colors = pramas.colors?isArray(pramas.colors)?pramas.colors:[pramas.colors, pramas.colors]: [colorList[0].color, colorList[0].color]
      let series = [{
          name: '', type: 'gauge', startAngle: pramas.startAngle?pramas.startAngle:220, endAngle: pramas.endAngle?pramas.endAngle:320, center: ['50%', '50%'], radius: pramas.radius?pramas.radius:'100%', min: pramas.min?pramas.min:0, max: pramas.max?pramas.max:20, splitNumber: pramas.splitNumber?pramas.splitNumber:4,
          pointer: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          axisTick: { show: true, length: newSize(pramas.length?pramas.length:12), lineStyle: { color: 'auto', width: newSize(pramas.width?pramas.width:3) }},
          axisLine: { show: false, lineStyle: { width: 0, color: attr.data == 0? [[1, '#263765']]:[[attr.data, new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: colors[0] },{ offset: 1, color: colors[1] }])], [1, '#263765']]}},
          title: { fontSize: newSize(12), offsetCenter: pramas.offsetTitle?pramas.offsetTitle:[0, '80%'], color: pramas.color?pramas.color:'#B1C9F1' },
          detail: { fontSize: newSize(20), offsetCenter: pramas.offsetDetail?pramas.offsetDetail:[0, '0%'], color: pramas.color?pramas.color:'#FFFFFF', valueAnimation: true, fontWeight: 'normal' },
          data: data
      }]
      const option = {
        animation: false,
        series: series
      };
      return option
    },
  }
  export default setOption

