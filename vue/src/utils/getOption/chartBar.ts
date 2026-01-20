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
		x轴名称： x_name: '温度'    （空：无）
		y轴名称： y_name: '温度'    （空：无）
		z轴名称： z_name: '温度'    （空：无）
		窗单位：  tool_dw： '°C'    （空：无）
		窗x名称： tool_name_x '时间'（空：无）
		窗y名称： tool_name_y '值'  （空：无）
		窗z名称： tool_name_z '值'  （空：无）
*/
const colorLists = dictStore().colorLists
const setOption = {
	Bar(attr:any, data:any, pramas:any){
		var extent = attr.extent?attr.extent:4
		var colorList = !isNull(attr.colorList)? attr.colorList : colorLists
		var legendArr = !isNull(attr.legendArr)?attr.legendArr:['']
		var seriesArr = []
		for (var i = 0; i <= legendArr.length-1; i++) {
			let seriesTop = {
				name: '', type: 'pictorialBar', symbol: 'circle', animation: false, symbolSize: [newSize(30), newSize(10)], symbolOffset: [0, newSize(-4)],
				symbolPosition: 'end', z: 3, color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#83bff6' }, { offset: 0.5, color: '#188df0' },
				{ offset: 1, color: '#188df0' }]), silent: false, barMinHeight: 5, data: []
			}
			let series = {
				name: legendArr[i], type: 'bar', barWidth: newSize(30), connectNulls: true, smooth: true, sampling: 'average', large: true, animation: false, clip: true,  
				itemStyle: {
					borderRadius: [3, 3, 0, 0],
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
						{ offset: 0, color: '#83bff6' },
						{ offset: 0.5, color: '#188df0' },
						{ offset: 1, color: '#188df0' }
					])
				},
				emphasis: {
					itemStyle: {
						color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
							{ offset: 0, color: '#2378f7' },
							{ offset: 0.7, color: '#2378f7' },
							{ offset: 1, color: '#83bff6' }
						])
					}
				},
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
			let temp = i == 0?seriesTop:series
			seriesArr.push(temp)
		}
		let grid = [{top: 30, left: '0%', bottom: '0%', right: '0%', containLabel: true}]
		let tooltip = {show: true, backgroundColor:'rgba(0,0,0,0.5)', textStyle: {color: '#FFFFFF'}, trigger: 'item', 
		formatter: function (p:any) {return (attr.tool_name_x?attr.tool_name_x:'x：') + p.value[0] + '<br />' + (attr.tool_name_y?attr.tool_name_y:'y：') + (Math.floor((p.value[1]*100))/100) + ' ' + (attr.tool_dw?attr.tool_dw:'')}}
		let legend = {show: attr.legendShow,data: legendArr,align:'left',x:'right',y: 'top',top: -2,icon: "roundRect",itemWidth: 18,itemHeight: 12,
			textStyle: {color: '#FFFFFF',rich: {a: {verticalAlign: 'middle'}},padding:[4,0,0,0]}}
		let dataZoom = [{type: 'inside',show : true,realtime : true,startValue: attr.zoomStart?attr.zoomStart:0,endValue: attr.zoomEnd?attr.zoomEnd:1000}]
		let xAxis = {
			type: 'category',
			 //刻度线
			axisTick: {show: false},
			// 轴线
			axisLine: {lineStyle: {color: '#6f8dcb',fontSize: newSize(12),type: 'dashed'}},
			// 分割线
			splitLine: {show: false,lineStyle: {color: '#6f8dcb',type: 'dashed'}},
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
			axisLine: {show: true,lineStyle: {color: '#6f8dcb',type: 'dashed'}},
			// 分割线
			splitLine: {show: false,lineStyle: {color: '#6f8dcb',type: 'dashed'}},
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

	Bars(attr:any, data:any, pramas:any){
		var extent = attr.extent?attr.extent:4
		var colorList = !isNull(attr.colorList)? attr.colorList : colorLists
		var legendArr = !isNull(attr.legendArr)?attr.legendArr:['']
		var seriesArr = []
		for (var i = 0; i <= attr.legendArr.length-1; i++) {
			let series = {
				name: attr.legendArr[i],type: 'bar',barWidth: newSize(10),connectNulls:true,smooth: true,sampling: 'average',large: true,animation: false,clip: true,  
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
				itemStyle: {
					borderRadius: [0, 0, 0, 0],
						color: i == 0? new echarts.graphic.LinearGradient(0, 0, 0, 1, [
							{ offset: 0, color: 'rgba(96, 231, 255, 1)' },
							{ offset: 0.5, color: 'rgba(96, 231, 255, 0.5)' },
							{ offset: 1, color: 'rgba(96, 231, 255, 0)' }
						]) : new echarts.graphic.LinearGradient(0, 0, 0, 1, [
							{ offset: 0, color: 'rgba(255, 200, 95, 1)' },
							{ offset: 0.5, color: 'rgba(255, 200, 95, 0.5)' },
							{ offset: 1, color: 'rgba(255, 200, 95, 0)' }
						]) 
					},
				emphasis: {
					itemStyle: {
						color: i == 0? new echarts.graphic.LinearGradient(0, 0, 0, 1, [
							{ offset: 0, color: 'rgba(96, 231, 255, 1)' },
							{ offset: 0.5, color: 'rgba(96, 231, 255, 0.5)' },
							{ offset: 1, color: 'rgba(96, 231, 255, 0)' }
						]) : new echarts.graphic.LinearGradient(0, 0, 0, 1, [
							{ offset: 0, color: 'rgba(255, 200, 95, 1)' },
							{ offset: 0.5, color: 'rgba(255, 200, 95, 0.5)' },
							{ offset: 1, color: 'rgba(255, 200, 95, 0)' }
						]) 
					}
				},
				yAxisIndex: 0,
				data: [],
			}
			seriesArr.push(series)
		}
		for (var i = 0; i <= attr.legendArr.length-1; i++) {
			let seriesTop = {
		  	name: '',type: 'pictorialBar',symbol: 'circle',animation: false,symbolSize: [newSize(10), newSize(10)],symbolOffset: [attr.legendArr.length==1?0:i==0?newSize(-6):newSize(6), newSize(-4)],
				symbolPosition: 'end', z: 3,color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#DCF3FF' },{ offset: 0.5, color: '#DCF3FF' },
				{ offset: 1, color: '#DCF3FF' }]),silent: false,barMinHeight: 5,data: [], itemStyle: {
					shadowBlur: 6, // 设置阴影模糊程度，这里可以调整以获得想要的发光效果
					shadowColor: 'rgba(255, 255, 255, 0.5)', // 设置阴影颜色，可以选择任意颜色
				}
			}
			seriesArr.push(seriesTop)
		}
		let grid = [{top: 30, left: '0%', bottom: '0%', right: '0%', containLabel: true}]
		let tooltip = {show: true, backgroundColor:'rgba(0,0,0,0.5)', textStyle: {color: '#FFFFFF'}, trigger: 'item', 
		formatter: function (p:any) {return (attr.tool_name_x?attr.tool_name_x:'x：') + p.value[0] + '<br />' + (attr.tool_name_y?attr.tool_name_y:'y：') + (Math.floor((p.value[1]*100))/100) + ' ' + (attr.tool_dw?attr.tool_dw:'')}}
		let legend = {show: attr.legendShow,data: legendArr,align:'left',x:'right',y: 'top',top: -2,icon: "roundRect",itemWidth: 18,itemHeight: 12,
			textStyle: {color: '#FFFFFF',rich: {a: {verticalAlign: 'middle'}},padding:[4,0,0,0]}}
		let dataZoom = [{type: 'inside',show : true,realtime : true,startValue: attr.zoomStart?attr.zoomStart:0,endValue: attr.zoomEnd?attr.zoomEnd:1000}]
		let xAxis = {
			type: 'category',
			 //刻度线
			axisTick: {show: false},
			// 轴线
			axisLine: {lineStyle: {color: '#6f8dcb',fontSize: newSize(12)}},
			// 分割线
			splitLine: {show: false,lineStyle: {color: '#6f8dcb'}},
			// 轴文字
			axisLabel: {color: '#6f8dcb',show: true,fontSize: newSize(12),formatter:function(value:any) {return value.replace(' ', '\n')}},
			z: 10
		}
		let yAxisShow = attr.yAxisShow===false?false:true;
		let yAxis = [{
			name: attr.y_name,
			type: 'value',
			min: attr.min==0||attr.min?attr.min:(value) => {
				return Math.floor(-(Math.round(value.max * 10) / 10) - (Math.round(value.max * 10) / 10) / extent);
			},
			max: attr.max==0||attr.max?attr.max:(value) => {
				return Math.floor((Math.round(value.max * 10) / 10) + (Math.round(value.max * 10) / 10) / extent)
			},
			//刻度线
			axisTick: {show: false},
			// 轴线
			axisLine: {show: yAxisShow,lineStyle: {color: '#6f8dcb'}},
			// 分割线
			splitLine: {show: !yAxisShow,lineStyle: {color: '#939393'}},
			// 轴文字
			axisLabel: {color: '#6f8dcb',fontSize: newSize(12),formatter: '{value}'}
		}]
		// console.log(seriesArr)
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

	Bar3d(attr:any, data:any, pramas:any){
		let colors = [{color: '#006E03'}, {color: '#A0FF00'}, {color: '#FF0000'}, {color: '#64C814'}, {color: '#F0F008'}, {color: '#960000'}, {color: '#e0f3f8'}, {color: '#ffffbf'}, {color: '#fee090'}]
		let colorList = !isNull(pramas.colorList)? pramas.colorList : colors
		var colorArr = []
		let space = 4
		let max = Number(attr.max)
		let min = Number(attr.min)
		let dw = (attr.tool_dw?attr.tool_dw:'')
		let p = attr.p
		let pieces = []
		let spitAvg = (Math.abs(max) + Math.abs(min))/5
		let lblFlag = ""
		let priceObj = {}
		var seriesArr = []
		
		let zArr:any = []
		if(min < 0){
			let spit = (max - min)*(1/5)
			for (let i = 0; i <= 5; i++) {
				zArr.push(min + spit*i);
			}
			if(max < 0){
				spitAvg = spit
			}
		}
		for (var i = 0; i < 2; i++) {
			let series = {type: 'bar3D', data: [], symbolSize: 1, barSize: 0.3, shading: 'lambert', sampling: 'average', large: true,
				showSymbol: false, animation: false, label: {fontSize: 12,borderWidth: 1}, emphasis: {label: {show: false}}}
			seriesArr.push(series)
		}
		for(var j=0; j<3; j++) {
			// if(min<0){
			//   lblFlag = j==0? min  + '~ 0' + dw : j==1? '0 ~' + max/2 + dw : j==2? max/2 + '~' + max + dw : ''
			//   priceObj = { min: j==0?min:j==1?0:j==2?max/2:'', max: j==0?0:j==1?max/2:j==2?max:'', label: lblFlag}
			// }else{
			lblFlag = j==2? Math.floor(((j*spitAvg) + min)*100)/100 + dw + '以上' : Math.floor(((j*spitAvg) + min)*100)/100  + '~' + Math.floor(((j+1) * spitAvg + min)*100)/100 + (attr.tool_dw?attr.tool_dw:'')
			if(min<0){
					priceObj = { min: (j*spitAvg), max: j==2? max-min : ((j+1) * spitAvg), label: lblFlag}
			}else{
					priceObj = { min: (j*spitAvg) + min, max: j==2? max : ((j+1) * spitAvg + min), label: lblFlag}
			}
			// }
			pieces.push(priceObj)
			colorArr.push(colorList[j].color)
		}
		let tooltip = { show: true, backgroundColor:'rgba(0,0,0,0.5)', textStyle : {color: '#FFFFFF'},
			formatter: function (params:any) { return (attr.tool_name_x?attr.tool_name_x:'x：') + params.value[0] + '<br />' + (attr.tool_name_y?attr.tool_name_y:'y：') + params.value[1] + '°' + '<br />' + (attr.tool_name_z?attr.tool_name_z:'z：') + Math.floor((min<0?params.value[2]+min:params.value[2])*100)/100 + ' ' + dw }
		}
		let visualMap = { show: true, type: 'piecewise', selectedMode: 'multiple', splitNumber: 6, max: max, itemGap: 0, itemWidth: 14, itemHeight: 20, top:'top', symbol: "rect",                 
			inRange: { symbol: "rect", color: colorArr },
			outOfRange: { symbol: "rect" },
			textStyle: { color: '#2773E6', fontSize: 12 },
			pieces: pieces
		}
		let xAxis3D = {name: attr.x_name?attr.x_name:'', type: 'value', nameGap: 30, min:0, max:p, interval: p/space,
			splitLine: { show: true, interval: 'auto', lineStyle: { color: '#2773E6', opacity: 1, width: 1 }},
			axisLabel: { show: true, color: '#0065FF' }
		}
		let yAxis3D = {name: attr.y_name?attr.y_name:'', type: 'value', nameGap: 30, min:0, max:360, interval: 360/space,
			splitLine: { show: true, interval: 'auto', lineStyle: { color: '#2773E6', opacity: 1, width: 1 }},
			axisLabel: { show: true, color: '#0065FF', fontSize: 12, formatter: function (value:any) { return (value + '°');}}
		}
		let zAxis3D = { name: attr.z_name?attr.z_name:'', type: 'value', nameGap: 40, min: min < 0? 0 : min, max: min < 0? max - min : max, interval: (max-min)/5,
			splitLine: { show: true, lineStyle: {color: '#2773E6', opacity: 1, width: 1}},
			axisLabel: { show: true, color: '#0065FF', fontSize: 12, interval: (Math.abs(max) + Math.abs(min)) /2 - 1,
			formatter: function (value:any, index:any) {
				if(min < 0){ var texts = []; texts.push(zArr[index] + dw); return texts;
				}else{ return value + dw }
			}}
		}
		let grid3D = { show: true, top: -30, boxWidth: 90, boxHeight: 90, boxDepth: 90,
			viewControl: { alpha: 0, beta: 90,rotateSensitivity: 1, zoomSensitivity: 1, panSensitivity: 1, autoRotate: false },
			axisLine: { show: true, interval: 1, lineStyle: { color: '#2773E6', opacity: 0.1, width: 1 }},
			axisTick: { show: false },
			axisPointer: { show: false, lineStyle: { color: 'rgba(39, 115, 230, 1)', opacity: 1, width: 1 },
			label: { show: true, formatter: function (value:any, valueAll:any) {  return '' }, margin: 'auto', color: "#fff",
				borderWidth: 0, borderColor: '#fff', fontFamily: 'sans-serif', fontSize: 12, fontWeight: 'normal'}},
			environment: 'auto',
			light: { main: { intensity: 1.2, shadow: true }, ambient: { intensity: 0.3 } }
		}
		const option = {
			animation: false,
			top: 'top',
			tooltip: tooltip,	
			visualMap: visualMap,
			xAxis3D: xAxis3D,
			yAxis3D: yAxis3D,
			zAxis3D: zAxis3D, 
			grid3D: grid3D,
			series: seriesArr
		};
		return option
	},
}

export default setOption

