  import * as echarts from 'echarts'
  import dictStore from '@/stores/dictStore'
  import { isNull, newSize } from "@/utils/common"
  /* 
  参数
  id      dom节点
  data    数据
  params  可选参数
  attr    属性  
          最大值：  max: 0,           （空：取最大值）   
          最小值：  min: 0,           （空：取最大值负值）
          幅度值：  extent: 4         （空：默认4 min、max空有效）
          颜色列表: colorList: []     （空：默认）
          图例列表：legendArr: []     （空：默认）
          图例显隐：legendShow: false （空：隐藏）
          点值显隐：labelShow: false  （空：隐藏）
          面积显隐：areaShow: false   （空：隐藏）
          y轴名称： y_name: '温度'    （空：无）
          窗单位：  tool_dw： '°C'    （空：无）
          窗x名称： tool_name_x '时间'（空：无）
          窗y名称： tool_name_y '值'  （空：无）
  */
  const colorLists = dictStore().colorLists
  const setOption = {
    Scatter(attr:any, data:any, pramas:any){
      var extent = attr.extent?attr.extent:4
      var colorList = !isNull(attr.colorList)? attr.colorList : colorLists
      var legendArr = !isNull(attr.legendArr)?attr.legendArr:['']
      var seriesArr = []
      for (var i = 0; i <= legendArr.length-1; i++) {
        let series = {
          name: legendArr[i],type: 'scatter',symbolSize: 2, showSymbol: false,connectNulls:true,smooth: true,sampling: 'average',large: true,animation: false,clip: true,  
          lineStyle:{color:colorList[i].color},
          itemStyle: {color:colorList[i].color},
          label: {show: attr.labelShow,position: 'top',color: '#1BFFDF',fontSize: newSize(12),fontWeight: 'bold', 
            rich:{ 
              a:{fontSize: newSize(12), padding: [0, 0, 8, 0]},
              b:{fontSize: newSize(12), padding: [0, 0, 8, 0], color: '#FF4D4F'},
              c:{fontSize: newSize(12), padding: [0, 0, 8, 0], color: '#DC1185'},
              d:{fontSize: newSize(12), padding: [0, 0, 8, 0], color: '#FEC746'},
            },
            formatter: function(p) {
              if (p.value[2] == 'isAlarm') {
                return `${p.value[4]}`
              }else if (p.value[2] == 'offline') {
                if(p.value[1] == 0) return `在线`
                else if(p.value[1] == 1) return `{c|离线}`
                else return `{d|故障}`
              } else {
                if(p.value[3] == 0) return Math.floor((p.value[1]*100))/100
                if(p.value[3] == 1) return `{b|${Math.floor((p.value[1]*100))/100}}`
              }
            }
          },
          yAxisIndex: 0,
          data: [],
        }
        if(attr.areaShow) series.areaStyle = {color: {type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: colorList[i].start}, { offset: 1, color: colorList[i].end}], global: false}} 
        seriesArr.push(series)
      }
      let grid = [{top: 30, bottom: '0', left: '0', right: newSize(16), containLabel: true}]
      let tooltip = {show: true, backgroundColor:'rgba(0,0,0,0.5)', textStyle: {color: '#FFFFFF'}, trigger: 'item', 
      formatter: function (p:any) {return (attr.tool_name_x?attr.tool_name_x:'x：') + p.value[0] + '<br />' + (attr.tool_name_y?attr.tool_name_y:'y：') + (Math.floor((p.value[1]*100))/100) + ' ' + (attr.tool_dw?attr.tool_dw:'')}}
      let legend = {show: attr.legendShow,data: legendArr,align:'left',x:'right',y: 'top',top: -2,icon: "circle",itemWidth: 8,itemHeight: 8,
        textStyle: {color: '#FFFFFF',rich: {a: {verticalAlign: 'middle'}},padding:[4,0,0,0]}}
      let dataZoom = [{type: 'inside',show : true,realtime : true,startValue: attr.zoomStart?attr.zoomStart:0,endValue: attr.zoomEnd?attr.zoomEnd:1000}]
      let xAxis = {
        type: 'category',
        boundaryGap: false,
        //刻度线
        axisTick: {show: false},
        // 轴线
        axisLine: {lineStyle: {color: '#113D72',fontSize: newSize(12),type: 'dashed'}},
        // 分割线
        splitLine: {show: false,lineStyle: {color: '#113D72',type: 'dashed'}},
        // 轴文字
        axisLabel: {color: '#0065FF',show: true,fontSize: newSize(12),formatter:function(value:any) {return value.replace(' ', '\n')}},
        z: 10
      }
      let yAxis = [{
        name: attr.y_name,
        type: 'value',
        min: attr.min==0||attr.min?attr.min:(value) => {
          return -(Math.round(value.max * 10) / 10) + (Math.round(value.max * 10) / 10) / extent;
        },
        max: attr.max==0||attr.max?attr.max:(value) => {
          return (Math.round(value.max * 10) / 10) + (Math.round(value.max * 10) / 10) / extent;
        },
        //刻度线
        axisTick: {show: false},
        // 轴线
        axisLine: {show: true,lineStyle: {color: '#113D72',type: 'dashed'}},
        // 分割线
        splitLine: {show: false,lineStyle: {color: '#113D72',type: 'dashed'}},
        // 轴文字
        axisLabel: {color: '#0065FF',fontSize: newSize(12),formatter: '{value}'}
      }]
      const option = {
        grid: grid,
        tooltip: tooltip,
        legend: legend,
        dataZoom: dataZoom,
        xAxis: xAxis,
        yAxis: yAxis,
        series: seriesArr
      };
      return option
    },

  }
  export default setOption

