import * as echarts from 'echarts'
import 'echarts-gl'
import 'echarts-liquidfill'
import axios from 'axios'
import router from '../router'
import { isNull, isArray, throttle } from "./common"
import configStore from '@/stores/configStore'
import publicStore from '@/stores/publicStore'
import chartPie from "./getOption/chartPie"
import chartLine from "./getOption/chartLine"
import chartBar from "./getOption/chartBar"
import chartScatter from "./getOption/chartScatter"
import chartMap from "./getOption/chartMap"
import chartGauge from "./getOption/chartGauge"
import chartRadar from "./getOption/chartRadar"
import chartLaser from "./getOption/chartLaser"
import chartLiquidfill from "./getOption/chartLiquidfill"

const Func = async(type:any, id:any, attr:any, data:any, pramas:any) => {
  let option:any
  switch (true) {
    case type.indexOf('Pie') !== -1:
      option = chartPie[type](attr, data, pramas)
      break;
    case type.indexOf('Line') !== -1:
      option = chartLine[type](attr, data, pramas)
      break;
    case type.indexOf('Bar') !== -1:
      option = chartBar[type](attr, data, pramas)
      break;
    case type.indexOf('Scatter') !== -1:
      option = chartScatter[type](attr, data, pramas)
      break;
    case type.indexOf('Map') !== -1:
      option = chartMap[type](attr, data, pramas)
      break;
    case type.indexOf('Gauge') !== -1:
      option = chartGauge[type](attr, data, pramas)
      break;
    case type.indexOf('Radar') !== -1:
      option = chartRadar[type](attr, data, pramas)
      break;
    case type.indexOf('Laser') !== -1:
      option = chartLaser[type](attr, data, pramas)
      break;
    case type.indexOf('Liquidfill') !== -1:
      option = chartLiquidfill[type](attr, data, pramas)
      break;
    default:
    console.log('echart失败---')
    option = {}
  }
  return option
}

 /* attr --- 为空才会触发重绘 否则只数据更新  */

export default function ec() {
  let time_3d:any = null
  let mainId:any
  
  // 初始化
  const drawChart = (type:any, id:any, attr:any, data:any, pramas:any) => {
    let chartIndex = publicStore().chartArr.findIndex((a:any)=> a.id == id)
    if(chartIndex == -1){
      console.log(id+'首次')
      initChart(type, id, attr, data, pramas)
    }else{
      // console.log(id+'更新')
      reChart(type, id, attr, data, pramas)
    }
  }
  
  // 首次
  const initChart = async(type:any, id:any, attr:any, data:any, pramas:any) => {
    let myChart:any
    let option:any
    let dom:any = document.getElementById(id)
    if(!dom) return false
    myChart = echarts.init(dom)
    option = await Func(type, id, attr, data, pramas)
    let chart = {type: type, id: id, attr: JSON.parse(JSON.stringify(attr)), data: isArray(data)?[...data] : JSON.parse(JSON.stringify(data)), pramas: JSON.parse(JSON.stringify(pramas)), myChart: myChart, option: option}
    publicStore().chartArr.push(chart)
    myChart.setOption(option)
    setEvent(type, id, attr, data, pramas)
    if(!isNull(attr)) {
      setData(chart, data, true)
    }
  }

  // 更新
  const reChart = async(type:any, id:any, attr:any, data:any, pramas:any) => {
    let myChart:any
    let option:any
    let chart = publicStore().chartArr.find((a:any)=> a.id == id)
    myChart = chart.myChart
    if(!isNull(attr) && JSON.stringify(chart.attr) != JSON.stringify(attr)){
      console.log(id+'属性重绘')
      option = await Func(type, id, attr, data, pramas)
      chart.option = option
      chart.attr = JSON.parse(JSON.stringify(attr))
      chart.data = isArray(data)?[...data] : JSON.parse(JSON.stringify(data))
      myChart.setOption(option, true) 
      if(!isNull(attr)) {
        setData(chart, data, true)
      }
    }else{
      if(JSON.stringify(chart.data) != JSON.stringify(data)){
        if(isNull(attr)){
          console.log(id+'数据重绘')
          option = await Func(type, id, attr, data, pramas)
          chart.option = option
          chart.data = isArray(data)?[...data] : JSON.parse(JSON.stringify(data))
          myChart.setOption(option, true) 
        }else{
          console.log(id+'数据更新')
          chart.data = isArray(data)?[...data] : JSON.parse(JSON.stringify(data))
          setData(chart, data, false)
        }
      }else{
        console.log(id+'无数据更新')
      }
    }
  }

  // 数据
  const setData = (chart:any, data:any, first:any) => {
    if(!data) return false
    let myChart = chart.myChart
    let series = chart.option.series
    if(series[0].type == 'bar3D'){
      set3dData(chart, data, first)
    }if(series[0].type == 'radar' && !first){
      myChart.setOption({series: [{ data: data }]})
    } else{
      myChart.setOption(data)
    }
  }

  // 3d数据
  const set3dData = (chart:any, data:any, first:any) => {
    let myChart = chart.myChart
    let option = chart.option
    let id = chart.id
    if((id != 'prps_ddb' || mainId == 'prps_ddb' ) && !isNull(publicStore().visualMap)){
      let colors = option.visualMap.inRange.color
      publicStore().visualMap.forEach((v:any, i:any) => {
        if(v.color != colors[i]) {
          colors[i] = v.color
          myChart.clear()
          myChart.setOption(option, true)
        }
      })
    }
    if(first){
      time_3d = setTimeout(() => {
        for(let i = 0; i< 2; i++){
          myChart.appendData({ seriesIndex: i, data: data.slice(i*18000, (i+1)*18000)})
        }
      }, 10)
    }else{
      myChart.setOption({ series: [{ data: [] }] })
      for(let i = 0; i< 2; i++){
        myChart.appendData({ seriesIndex: i, data: data.slice(i*18000, (i+1)*18000)})
      }
    }
  }

  // 事件
  const setEvent = (type:any, id:any, attr:any, data:any, pramas) => {
    click(type, id, attr, data)
    dblclick(type, id, attr, data)
    datazoom(type, id, attr, data)
		georoam(type, id, attr, data)
  }

  // 单击
  const click = (type:any, id:any, attr:any, data:any) => {
    let chart = publicStore().chartArr.find((a:any)=> a.id == id) 
    let myChart = chart.myChart
    myChart.off("click")
    if(type.indexOf('Map') !== -1) return clickMap(type, id, attr, data, myChart)
    if(type.indexOf('Pie') !== -1) return clickPie(type, id, attr, data, myChart)
    if(type.indexOf('Bar') !== -1) return clickBar(type, id, attr, data, myChart)
    if(type == 'Bar3d') return clickBar3d(type, id, attr, data, myChart)
    myChart.getZr().on('click', function (params:any) {
      new Promise((resolve) => {
        console.log('单击触发')
        resolve(params);
      }).then((res) => {
        var point = [params.offsetX, params.offsetY]; // 获取点击位置
        if (params.target && params.target.type === 'rect') return
        var series = myChart.getOption().series; // 获取所有折线图数据
        var minDistance = Number.MAX_VALUE; // 初始化最小距离为最大值
        var targetSeries = null; // 初始化目标系列为空
        var targetPointIndex = null; // 初始化目标数据点索引为空
        for (var i = 0; i < series.length; i++) {
            var data = series[i].data; // 获取当前系列的数据
            for (var j = 0; j < data.length; j++) {
                var dataPoint = myChart.convertToPixel('grid', data[j]); // 将数据点转换成像素坐标
                var distance = Math.sqrt(Math.pow(point[0] - dataPoint[0], 2) + Math.pow(point[1] - dataPoint[1], 2)); // 计算点击位置与数据点的距禂
                if (distance < minDistance) {
                    minDistance = distance; // 更新最小距离
                    targetSeries = i; // 更新目标系列
                    targetPointIndex = j; // 更新目标数据点索引
                }
            }
        }
        if (targetSeries !== null && targetPointIndex !== null) {
            var targetData = series[targetSeries].data[targetPointIndex]; // 获取目标数据点
            console.log('折线', targetSeries, '点', targetPointIndex, '数据', targetData);
            if(targetData && targetData.length > 2) {
              publicStore().chartDot = targetData
              publicStore().isTrue = !publicStore().isTrue
            }
        }
        // if (params.topTarget) {
        //   var seriesIndex;          
        //   if (params.topTarget.type === 'ec-polyline') {
        //     seriesIndex = params.topTarget.parent.parent.__ecComponentInfo.index;
        //     console.log('点击线', seriesIndex)
        //   }
        // }
        // var pointInPixel= [params.offsetX, params.offsetY]
        // if (myChart.containPixel('grid',pointInPixel)) {
        //   let pointInGrid = myChart.convertFromPixel({ seriesIndex: 0 }, pointInPixel)
        //   console.log('pointInGrid-------', pointInGrid)
        //   var xIndex=pointInGrid[0]
        //   console.log('xIndex-------', xIndex)
        //   var op=myChart.getOption()
        //   console.log('op-------', op)
        //   console.log('点击点', op.series[0].data[xIndex])
        //   publicStore().chartDot = op.series[0].data[xIndex]
        //   publicStore().isTrue = !publicStore().isTrue
        // }
      })
    })
  }

  // 点击标签
  const clickBar3d = (type:any, id:any, attr:any, data:any, myChart:any) => {
    // 初始化标签
    let visualMap = publicStore().visualMap
    if(visualMap.length == 0){
      let option = myChart.getOption()
      let pieces = option.visualMap[0].pieces
      let inRangeColors = myChart.getOption().visualMap[0].controller.inRange.color
      visualMap = pieces.map((v, i) => {
        let num1 = 0
        let num2 = 0
        const matches = v.label.match(/-?\d+/g);
        if (matches && matches.length >= 2) {
          num1 = parseInt(matches[0]);
          num2 = parseInt(matches[1]);
          console.log(num1, num2);
        }else if (matches && matches.length == 1) {
          num1 = parseInt(matches[0]);
          num2 = num1==0? 10000 : (num1 + Math.abs(num1)*100)
        } else {
          console.log("未找到匹配的数字", matches);
        }
        v.num1 = num1
        v.num2 = num2
        v.status = true
        v.oldColor = inRangeColors[i]
        v.color = v.status? v.oldColor : '#5793f3'
        v.id = id
        return v
      })
      console.log('标签设置成功', visualMap)
      publicStore().visualMap = visualMap
    }
    myChart.on('datarangeselected', function(params:any) {
      new Promise((resolve) => {
        console.log('单击3d柱状图触发标签')
        resolve(params);
      }).then((res:any) => {
        if (id == 'prps_ddb' || mainId == 'prps_ddb') return
        let selected = Object.keys(params.selected).filter(key => params.selected[key] === false);
        let temp = [...visualMap]
        selected.forEach((v, i) => {
          temp[v].status = !temp[v].status
          temp[v].color = temp[v].status? temp[v].oldColor : '#5793f3'
        })
        publicStore().visualMap = temp
      })
    })
  }

  // 点击柱状图
  const clickBar = (type:any, id:any, attr:any, data:any, myChart:any) => {
    myChart.on("click", function(params:any) {
      new Promise((resolve) => {
        console.log('单击柱状图触发')
        resolve(params);
      }).then((res:any) => {
        let barDate = res.data[2]
        publicStore().barDate = barDate
      })
    });
  }
    
  // 点击圆饼
  const clickPie = (type:any, id:any, attr:any, data:any, myChart:any) => {
    myChart.on('legendselectchanged', function(params:any) {
      new Promise((resolve) => {
        console.log('单击圆饼触发')
        resolve(params);
      }).then((res:any) => {
        var selected = res.selected;
        var legendName = res.name;
        myChart.dispatchAction({
          type: 'legendSelect',
          name: legendName
        })
        publicStore().legendName = legendName
      })
    });

    myChart.getZr().on('click', function (params) {
      if(params && params.topTarget && params.topTarget.parent && params.topTarget.parent.style){
        publicStore().alarmStatus = !publicStore().alarmStatus
      }
    });
  }

  // 点击地图
  const clickMap = (type:any, id:any, attr:any, data:any, myChart:any) => {
		myChart.on("click", async function(params:any) {
      if(params.data && params.data.level != 'district'){
        let adcode = params.data.adcode
        if(adcode && adcode != configStore().adcode){
          console.log("点击更新地图---", params)
          configStore().adcode = adcode
          let option = await Func(type, id, attr, data, {})
          myChart.setOption(option, true)
        }
      }else{
        console.log("地区不可点击")
      }

		})
	}

  // 双击
  const dblclick = (type:any, id:any, attr:any, data:any) => {
    let chart = publicStore().chartArr.find((a:any)=> a.id == id) 
    let myChart = chart.myChart
    myChart.off("dblclick")
    myChart.getZr().on('dblclick', function (params:any) {
      new Promise((resolve) => {
        console.log('双击触发')
        if(type == 'Bar3d') publicStore().isFalse = !publicStore().isFalse
        resolve(params);
      }).then((res) => {
        console.log(id+'双击后...') 
        mainId = id
        let Bar3dData = []
        myChart.getOption().series.forEach(v => { Bar3dData = [...Bar3dData, ...v.data] })
        if(type == 'Bar3d') drawChart(type, 'Bar3d', attr, Bar3dData, {})
      })
    })
  }

  // 缩放
  const datazoom = (type:any, id:any, attr:any, data:any) => {
    if(id != 'zoom' && type != 'Line') return
    let chart = publicStore().chartArr.find((a:any)=> a.id == id) 
    if (!chart || !chart.myChart) return
    let myChart = chart.myChart
    // 防止重复绑定事件
    myChart.off('datazoom')
    // 记录上次的缩放范围
    let lastZoom = { start: 0, end: 100 }
    // 监控缩放事件
    myChart.on('datazoom', function (params:any) {
      const currentBatch = params.batch && params.batch[0]
      if (!currentBatch) return
      const currentStart = currentBatch.start
      const currentEnd = currentBatch.end
      const currentRange = currentEnd - currentStart
      // 计算与上次变化的差异
      const startDiff = Math.abs(currentStart - lastZoom.start)
      const endDiff = Math.abs(currentEnd - lastZoom.end)
      // 判断是缩放操作还是拖动操作（缩放操作时start和end会同时变化）
      const isZooming = startDiff > 1 && endDiff > 1
      // 确定缩放
      if (isZooming) {
        const option = myChart.getOption()
        let len = 0
        option.series.forEach((serie: any) => {
          if (serie.type === 'line') {
            let serieLength = serie.data.length
            len = serieLength > len ? serieLength : len
          }
        })
        // 设置缩放级别
        if (len <= 20) return
        const Range = len <= 50? 100 : 50
        const symbolSize = 5
        option.series.forEach((serie: any) => {
          if (serie.type === 'line') {
            serie.symbolSize = currentRange < Range? 5 : 0
          }
        })
        // 使用notMerge模式更新option，而不是clear+set
        myChart.setOption(option, {
          notMerge: false,
          replaceMerge: ['series'],
          lazyUpdate: true
        })
        
      }
      // 更新上次的缩放范围
      lastZoom = { start: currentStart, end: currentEnd };
    })
  }

  // 地图缩放
  const georoam = (type:any, id:any, attr:any, data:any) => {
    if(type.indexOf('Map') == -1) return
		let chart = publicStore().chartArr.find((a:any)=> a.id == id)
		let myChart = chart.myChart
		myChart.on('georoam',function(params:any){
			if (params.dy == 0 && params.dx == 0) return
			var option = myChart.getOption();
			if(params.zoom!=null&&params.zoom!=undefined){
				if(params.componentType == "series"){
					option.geo[0].zoom=option.series[0].zoom;
					option.geo[0].center=option.series[0].center;
					option.geo[1].zoom=option.series[0].zoom;
					option.geo[1].center=option.series[0].center;
				}else{
					option.series[0].zoom=option.geo[0].zoom;
					option.series[0].center=option.geo[0].center;
					option.geo[1].zoom=option.geo[0].zoom;
					option.geo[1].center=option.geo[0].center;
				}
				myChart.clear()
			}else{
				if(params.componentType == "series"){
					option.geo[0].center=option.series[0].center;
					option.geo[1].center=option.series[0].center;
				}else{
					option.series[0].center=option.geo[0].center;
					option.geo[1].center=option.geo[0].center;
				}
			}
			myChart.setOption(option);
		})
  }

  // 自适应
  window.addEventListener('resize', throttle(async() => {
    publicStore().chartArr.forEach(async chart => {
      let type= chart.type
      let id = chart.id
      let attr = chart.attr
      let data = chart.data
      let pramas = chart.pramas
      let series = chart.option.series
      let myChart = chart.myChart
      let option = await Func(type, id, attr, data, pramas)
      option.series.forEach((v, i) => { v.data = series[i].data })
      chart.option = option
      if(series[0].type == 'bar3D') {
        set3dData(chart, data, true)
      }else{
        myChart.setOption(option)
        if(!isNull(attr)){
          setData(chart, data, true)
        }
      }
      myChart.resize()
    })
  }, 500)) 

  // 销毁
  onBeforeUnmount(() => {
    console.log('触发charts onUnmounted', publicStore().chartArr)
    // if(publicStore().chartArr.length == 0) return 
    // clearTimeout(time_3d)
    // for(var i =0; i < publicStore().chartArr.length; i++){
    //   publicStore().chartArr[i].myChart.dispose()
    // }
  })

  return {
    drawChart
  };
}
