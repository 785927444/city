import * as echarts from 'echarts'
import 'echarts-gl'

/**
 * 环状图
 * @param {*} dom 渲染节点 
 * @param {*} title 统计图标题
 * @param {*} seriesData 统计数据 
 * @returns 返回 piechart
 */
export function drawRingPies(dom, piePrecent){
  if(echarts.getInstanceByDom(dom)) echarts.getInstanceByDom(dom).dispose()
  var ringchart = echarts.init(dom)
  let option = {
    title: {
      show: true,
      text: piePrecent + '%',
      textStyle: {
        color: 'red',
        fontSize: 12,
        fontFamily: '微软雅黑',
        fontWeight: 'bold'
      },
      subtext: '异常率',
      subtextStyle: {
        color: '#fff',
        fontSize: 12
      },
      x: 'center',
      y: 'center',
      itemGap: 2
    },
    series: {
      name: '异常率',
      type: 'pie',
      radius: ['65%', '85%'],
      avoidLabelOverlap: true,
      label: {
        show: false,
        position: 'center',
      },
      labelLine: {
        show: false
      },
      color: [{
        type: 'linear',
        colorStops: [{
            offset: 0,
            color: '#F29805' // 0% 处的颜色
          },
          {
            offset: 1,
            color: '#DB100D' // 100% 处的颜色
          }
        ],
        globalCoord: false // 缺省为 false
      }, '#0D1E56'],
      data: [{
          value: piePrecent,
          name: ''
        },
        {
          value: 100 - piePrecent,
          name: ''
        }
      ]
    }
  }
  ringchart.setOption(option)
}

export function drawLinesTrend(dom, weekData={}){
  let xAxisData = []
  let seriesData = []
  for (var i = 0; weekData.days && i < weekData.days.length; i++) {
    let days = weekData.days[i]
    xAxisData.push(days.day)
    seriesData.push(days.warningNum === 0 ? 0 : (days.warningNum / days.total * 100).toFixed(2))
  }
  if(echarts.getInstanceByDom(dom)) echarts.getInstanceByDom(dom).dispose()
  var chartLine = echarts.init(dom)
  let optionLine = {
    grid: {
      left: '8%', // 距离左边的距离
      right: '0%', // 距离右边的距离
      bottom: '10%', // 距离下边的距离
      top: '18%' , // 距离上边的距离
      borderWidth: 0 // 隐藏外部边框
    },
    tooltip: {
      trigger: 'axis'
    },
    yAxis: {
      name: '异常占比',
      nameTextStyle: {
        color: 'rgb(142, 165, 191)',
        fontSize: 12
      },
      type: 'value',
      axisLabel: {
        formatter: '{value}%',
        color: 'rgb(142, 165, 191)',
        fontSize: 12
      },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { // 网格线
        show: true,
        lineStyle: {
          color: 'rgb(142, 165, 191)', // "#1A489A"
          width: 1,
          type: 'solid'
        }
      },
      min: 0,
      max: 100
    },
    xAxis: {
      type: "category",
      axisLabel: {
        color: 'rgb(142, 165, 191)',
        fontSize: 12
      },
      axisLine: { show: false }, // 网格线
      axisTick: { show: false }, // 轴刻度线
      splitLine: { show: false }, // 网格线
      data: xAxisData
    },
    series: [{
      name: '异常占比',
      type: 'line',
      data: seriesData,
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: 'rgba(37,44,98,0.1)'
          },
          {
            offset: 1,
            color: 'rgba(8,236,242,.3)'
          }
        ])
      },
      label: {
        show: true,
        position: 'top',
        color: 'rgb(142, 165, 191)',
        textBorderColor: 'transparent'
      },
      itemStyle: {
        label: {
          show: false, // 开启显示每个柱子的值
          formatter: '{c}%',
          position: 'top', // 显示值的位置
          color: 'rgb(41, 139, 165)'
        },
        color: 'rgb(41, 139, 165)'
      },
      // animation: false
    }]
  }
  chartLine.setOption(optionLine)
}

export function drawLineTrendQS(dom, trendAnalysis) {
  const unit = trendAnalysis.length > 0 && trendAnalysis[0].amplUnit || 'dB'
  let xAxisData = []
  let seriesData = []
  let maxAmpl = 10
  let minAmpl = 0
  for (var i = 0; i < trendAnalysis.length; i++) {
    const ampl = parseFloat(trendAnalysis[i].ampl)
    if(maxAmpl < ampl ) maxAmpl = Math.ceil(ampl/5) * 5
    if(minAmpl > ampl ) minAmpl = Math.ceil(ampl/5) * 5
    xAxisData.push(trendAnalysis[i].day)
    seriesData.push(ampl)
  }
  if(echarts.getInstanceByDom(dom)) echarts.getInstanceByDom(dom).dispose()
  var chartLine = echarts.init(dom)
  let optionLine = {
    grid: {
      top: 40,
      left: 20,
      right: 20,
      bottom: 0,
      containLabel: true
    },
    tooltip: {
      trigger: 'axis'
    }, 
    yAxis: {
      name: `幅值（${unit}）`,
      nameTextStyle: {
        color: '#266FDE',
        fontSize: 12
      },
      type: 'value',
      splitArea: {
        show: true,
        areaStyle: {
          color: ['#0C315F', 'transparent']
        }
      },
      axisLabel: {
        formatter: '{value}',
        color:  '#266FDE' , // y轴文字颜色 
        fontSize: 12
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      splitLine: { // 网格线
        show: true,
        lineStyle: {
          width: 0,
        }
      },
      min: parseInt(minAmpl),
      max: parseInt(maxAmpl)
    },
    xAxis: {
      type: "category",
      axisLabel: {
        color: '#266FDE', // x轴文字颜色 
        fontSize: 12
      },
      axisLine: { // 网格线
        show: false
      },
      axisTick: { // 轴刻度线
        show: false
      },
      splitLine: { // 网格线
        show: false
      },
      data: xAxisData
    },
    series: [{
      name: `幅值（${unit}）`,
      type: 'line',
      lineStyle: {
        color: '#73c0de',
      },
      data: seriesData,
      itemStyle: {
        label: {
          show: false, // 开启显示每个柱子的值
          formatter: '{c}',
          position: 'top', // 显示值的位置
          color: 'rgb(13,29,77)',
          fontSize: 12
        },
        opacity: 0,
        color: '#73c0de'
      },
      // animation: false
    }]
  }
  chartLine.setOption(optionLine)
}

const limit = [
  {min: -10, max: 80},
  {min: 0, max: 70},
  {min: -60, max: 0}
]

export function draw2DPicture(dom, data){
  if(echarts.getInstanceByDom(dom)) echarts.getInstanceByDom(dom).dispose()
  var chart = echarts.init(dom)
  let l = {
    min: -10,
    max: 80
  }
  if(data.checkMethod){
    if(data.checkMethod.match('超声波')) {
      l = limit[0]
    } else if(data.checkMethod.match('暂态')) {
      l = limit[1]
    } else if(data.checkMethod.match('特高频')) {
      l = limit[2]
    }
  }
  let opt = {
    title:{
      text:`Y轴：幅值[dB] -- X轴：相位[度]`,
      textStyle:{
        color: 'rgb(39,115,230)',
        fontSize: 12
      },
      left:'center',
      bottom: 30
    },
    grid: [{
      left: '0%',
      bottom: '0%',
      right: '2%',
      height: "88%",
      containLabel: true
    }],
    tooltip: {
      show: true,
      formatter: function (params) {
        return '相位：' + params.value[0]+ '°' + '<br />采值：' + (params.value[1]) +' ' + data.amplUnit
      }
    },
    xAxis: {
      max: 360,
      interval: 90,
      splitLine: {
        lineStyle: {
          color: 'rgb(39,115,230)',
          fontSize: 12
        }
      },
      axisLine:{
        show:false,
        lineStyle:{
          color: 'rgb(39,115,230)'
        }
      },
      axisLabel:{
        fontWeight:'bold',
        fontSize: 12,
        formatter:'{value}°'
      }
    },
    yAxis: {
      min: l.min,
      max: l.max,
      splitLine: {
        lineStyle: {
          color: 'rgb(39,115,230)'
        }
      },
      axisLine:{
        lineStyle:{
          color: 'rgb(39,115,230)'
        }
      },
      axisLabel:{
        fontWeight:'bold',
        fontSize: 12
      }
    },
    series: [
      {
        type: 'line',
        showSymbol: false,
        clip: true,
        lineStyle: {
          color: '#2C77F9',
          type: 'dotted'
        },
        data: getLineData(l)
      },
      {
        symbolSize: 2,
        itemStyle:{
          color: 'rgb(240,240,8)'
        },
        data: deal2DData(JSON.parse(data.phaseDiagramPointStr || "[]") || []),
        type: 'scatter'
      }
    ]
  }
  chart.setOption(opt)
}

function deal2DData(pdData) {
  let list = []
  pdData.forEach(pd=>{
    list.push([pd[1], pd[2]])
  })
  return list
}

function func(x, data){
  let v1 = (Math.abs(data.max)+Math.abs(data.min))/2
  let v2 = (parseInt(data.max)+parseInt(data.min))/2
  return v1*Math.sin((2*Math.PI/360)*x)+v2
}

function getLineData(dt){
  let data = [];
  for (let i = 0; i <= 360; i += 1) {
    data.push([i, func(i, dt)])
  }
  return data
}
function funSin(x, max, min){ 
	let v1 = (Math.abs(max)+Math.abs(min))/2
	let v2 = (parseInt(max)+parseInt(min))/2
	return v1*Math.sin((2*Math.PI/360)*x)+v2
}
function getLineSinData(max, min){
  let dt = [];
  for (let i=0; i<=360; i++) {
    dt.push([i, funSin(i, max, min)])
  }
  return dt
}
export function draw3DPicture(dom, data, unit='dB'){
  if(echarts.getInstanceByDom(dom)) echarts.getInstanceByDom(dom).dispose()
  var chart = echarts.init(dom)
	let seriesData = JSON.parse(data.phaseDiagramPointStr || "[]")
	let max = parseInt(data.upperLimit || 40)
  max = max + (5 - max%5 )
	let min = parseInt(data.lowerLimit || -10)
  min = min - (5 + max%5 )
	let dataX = []
  for(var i = 0; i <= 50; i += 10){
    dataX.push(i)
  }
  let dataY = []
  for(var y=0; y<=360; y+=90) {
    dataY.push(y)
  }
  let dataZ = []
  for(var z = 0; z <= (max + 4); z += 20){
    dataZ.push(z)
  }
	let pieces = []
	let spitAvg = (Math.abs(max) + Math.abs(min))/5
	let priceObj = {}
	let lblFlag = " "
  for(var j=0; j<5; j++) {
    lblFlag = ((j*spitAvg) + min) + '~'+((j+1) * spitAvg + min)+ (data.amplUnit || 'dB')
    priceObj = { min: (j*spitAvg) + min, max: ((j+1) * spitAvg + min), label: lblFlag}
		pieces.push(priceObj)
	}
	let opt = {
    // backgroundColor: '#0D1D4D', // "#0D1D4D",
    top: 'top',
    tooltip: {
      show: true,
      formatter: function (params) {
        return '周期：' + params.value[0] + '<br />相位：' + params.value[1] + '°' + '<br />采值：' + params.value[2] + ' ' + (data.amplUnit || 'dB')
      }
    },			 
    visualMap: { 
      show: true,
      type: 'piecewise',   
      selectedMode: 'multiple',
      splitNumber: 6,
      max: max, 
      itemGap: 0,
      itemWidth: 14,
      itemHeight: 14,
      top:'top',
      symbol: "rect",                 
      inRange: {
        symbol: "rect",
        color: ['#006E03', '#64C814', '#A0FF00', '#F0F008', '#FF0000', '#960000']
      },
      outOfRange: {
        symbol: "rect"
      },
      textStyle: {
        color: '#2773E6',
        fontSize: 12
      },
      pieces: pieces
    },
    xAxis3D: {
      name: '周期',
      type: 'value',
      data: dataX,
      splitLine: {
        show: true,
        interval: 'auto',
        lineStyle: {
            color: '#2773E6',
            opacity: 1,
            width: 1
        }
      },
      axisLabel: {
        show: true
      }
    },
    yAxis3D: {
      name: '相位',
      type: 'value',
      data: dataY,
      min:0,
      max:360,
      interval: 90,
      splitLine: {
        show: true,
        interval: 'auto',
        lineStyle: {
          color: '#2773E6',
          opacity: 1,
          width: 1
        }
      },
      axisLabel: {
        show: true,
        fontSize: 12,
        formatter: function (value) {
          return (value + '°');
        }
      }
    },
    zAxis3D: {
      name: '采样',            
      type: 'value',
      data: dataZ,
      splitLine: {
        show: true, 
        lineStyle: {
            color: '#2773E6',
            opacity: 1,
            width: 1
        }
      },
      axisLabel: {
        show: true,
        fontSize: 12,
        interval: (Math.abs(max) + Math.abs(min)) /2 - 1,
        formatter: function (value) { 
            return value + (data.amplUnit || 'dB') // unit: dB
        }
      }
    },
    grid3D: { 
      top: -30,
      show: true,
      boxWidth: 80,
      boxHeight: 80,
      boxDepth: 80,
      axisLine: {
        show: true,
        interval: 1,
        lineStyle: {
          color: '#2773E6',
          opacity: 0.1,
          width: 1
        }
      },
      axisTick: {
        show: false
      },
      axisPointer: {
        show: false,
        lineStyle: {
          color: 'rgba(39, 115, 230, 1)',
          opacity: 1,
          width: 1
        },
        label: {
          show: true,
          formatter: function (value, valueAll) {
            return ''
          },
          margin: 'auto',
          color: "#fff",
          borderWidth: 0,
          borderColor: '#fff',
          fontFamily: 'sans-serif',
          fontSize: 12,
          fontWeight: 'normal'
        }
      },
      environment: 'auto',
      light: {
        main: {
          intensity: 1.2,
          shadow: true
        },
        ambient: {
          intensity: 0.3
        }
      }
    },
    series: [{
      type: 'bar3D',
      data: seriesData.map(function (item) {
        return {
          value: [item[0], item[1], item[2]]
        }
      }),
      symbolSize: 1,
      shading: 'lambert',
      label: {
        fontSize: 12,
        borderWidth: 1
      },
      emphasis: {
        label: {
          show: false
        }
      }
    }]
  }
  chart.setOption(opt)
}

/**
 * 饼状图
 * @param {*} dom 渲染节点 
 * @param {*} title 统计图标题
 * @param {*} seriesData 统计数据 
 * @returns 返回 piechart
 */
export function drawPies(dom, {title = '', seriesData = []}) {
  return new Promise(resolve=>{
    if(echarts.getInstanceByDom(dom)) echarts.getInstanceByDom(dom).dispose()
    var piechart = echarts.init(dom, 'light')
    piechart.setOption({
      title: { text: title || '' },
      legend: { show:true, bottom: 'bottom' },
      toolbox: {
        show: true,
        feature: {
          saveAsImage: {
            title:"保存"
          }
        }
      },
      tooltip: { trigger: 'item', formatter: '{a} <br/>{b} : {c} ({d}%)' },
      series: [
        {
          name: '详情',
          type: 'pie',
          roseType: 'area',
          startAngle:10, // 起始角度
          radius: [40, 90],
          itemStyle: {
            borderRadius: 5
          },
          label:{
            show: true,
            formatter: '{b}\n{num|{c}}',
            rich: {
              num:{
                align: 'center'
              }
            },
            textBorderWidth: 0
          },
          data: seriesData || [],
          animationEasing: 'cubicInOut',
          animationDuration: 1000
        }
      ]
    })
    resolve(piechart)
  })
}

/**
 * 折线统计图
 * @param {*} dom 渲染节点 
 * @param {*} title 统计图标题
 * @param {*} xAxisData 水平坐标标签 []
 * @param {*} yAxisData 垂直坐标标签 []
 * @param {*} seriesData 统计数据 [{ name: '2020', type: 'line', data: [] }]
 * @returns 返回 linechart
 */
export function drawLines(dom, {title = '', xAxisData, yAxisData, seriesData = []}) {
  return new Promise(resolve=>{
    if(echarts.getInstanceByDom(dom)) echarts.getInstanceByDom(dom).dispose()
    var linechart = echarts.init(dom, 'light')
    linechart.setOption({
      title: { text: title },
      legend: { show:true, bottom: 'bottom' },
      tooltip: { trigger: 'axis' },
      toolbox: {
        show: true,
        feature: {
          saveAsImage: {
            title:"保存"
          }
        }
      },
      xAxis: {
        type: xAxisData ? 'category' : 'value',
        data: xAxisData,
        boundaryGap: false,
        minInterval: 1,
        axisLabel: {
          interval: 0
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: '#7f8188',
            opacity: '0.4'
          }
        },
        axisTick: {
          show: true,
          lineStyle: {
            color: '#7f8188',
            opacity: '0.4'
          }
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: '#7f8188',
            opacity: '0.4'
          }
        },
        splitNumber: 12
      },
      yAxis: {
        type: yAxisData ? 'category' : 'value',
        data: yAxisData,
        boundaryGap: false,
        minInterval: 1,
        axisLine: {
          show: true,
          lineStyle: {
            color: '#7f8188',
            opacity: '0.4'
          }
        },
        axisTick: {
          show: true,
          lineStyle: {
            color: '#7f8188',
            opacity: '0.4'
          }
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: '#7f8188',
            width: 1,
            opacity: '0.4'
          }
        }
      },
      series: seriesData,
      color: ['#7f007f', '#f04155', '#00d000']
    })
    resolve(linechart)
  })
}

/**
 * 柱状统计图
 * @param {*} dom 渲染节点 
 * @param {*} title 统计图标题
 * @param {*} xAxisData 水平坐标标签 []
 * @param {*} yAxisData 垂直坐标标签 []
 * @param {*} seriesData 统计数据 [{ name: '', type: 'line', data: [] }]
 * @returns 返回 barchart
 */
 export function drawBars(dom, {title = '',yAxisData, xAxisData, seriesData = []}) {
  return new Promise(resolve=>{
    if(echarts.getInstanceByDom(dom)) echarts.getInstanceByDom(dom).dispose()
    var barchart = echarts.init(dom, 'light')
    barchart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: { show: true },
      xAxis: [{
          type: xAxisData ? 'category' : 'value',
          data: xAxisData,
          axisTick: { show: false }
        }],
      yAxis: [{ 
        type: yAxisData ? 'category' : 'value',
        data: yAxisData,
        axisTick: { show: false }
      }],
      series: [
        // {
        //   name: 'Forest',
        //   type: 'bar',
        //   barGap: 0,
        //   label: labelOption,
        //   emphasis: {
        //     focus: 'series'
        //   },
        //   data: [320, 332, 301, 334, 390]
        // }
      ]
    })
    resolve(barchart)
  })
}
