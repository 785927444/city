  // 饼状图
  import * as echarts from 'echarts'
  import axios from 'axios'
	import configStore from '@/stores/configStore'
	import dictStore from '@/stores/dictStore'
  import { isNull, newSize } from "@/utils/common"
	import { setAdcodes, getMapDatas } from '@/utils/map'
	const svg = `<?xml version='1.0' encoding='UTF-8' standalone='no'?>
	<svg height="209.973mm" baseProfile="tiny" xmlns:cc="http://creativecommons.org/ns#" viewBox="0 0 3507 2480" width="296.926mm" version="1.2" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
		<path name="哈哈" style="fill: #082141; fill-opacity: 0.9; stroke: transparent;" d="M726.185,1048.18 L2493.04,328.351 L2591.2,1898.89 L1020.66,2226.08 L726.185,1048.18"/>
	</svg>`;
	
	const colorLists = dictStore().colorLists
  const setOption = {
	  async Map(attr:any, data:any, pramas:any = '') {
			let colorList = !isNull(pramas.colorList)? pramas.colorList : colorLists
			// 选择地图
			let map:any = `./china/`+configStore().adcode+`.json`
			let mapName:any = ''
			return new Promise((resolve, reject) => {
				axios.get(map).then(async (thisMap:any) => {
					console.log('更新地图--thisMap', thisMap)
					thisMap = thisMap.data
					// 引入地图
					echarts.registerMap(mapName, thisMap)
					// 地图导航
					await setAdcodes(thisMap)
					// 数据处理
					let res = getMapDatas(thisMap, data)
					// 网格配置
					let tooltip = [{ 
						show: true,
						backgroundColor: "none",
						borderWidth: 0,
						padding: 0,
						formatter: function(params:any, callback:any) {
							if (isNull(params.data)) return
							return (
								"<div class='custom-tooltip-box'>" +
								"<span style='color:#1BFFDF'>" + params.name +"</span>" + "<br />" +
								"<div style='display:flex;align-items: center;margin-top: 5px;'><span class='bg-img'></span>组织：" + params.data.value2 +"</div>" + 
								"<div style='display:flex;align-items: center;margin-top: 5px'><span class='bg-img'></span>公司：" + params.data.value3 +"</div>" +
								"</div>"
							);
						},
					}]
					let geo = {
						zoom: configStore().provinceId == ''? 1.2 : 1, 
						top: configStore().provinceId == ''? '15%' : '10%', 
						map: mapName,
						roam: true,
						scaleLimit: { min: 0.5, max: 10 },
						left: 'center', 
						regions: [
							{name: "南海诸岛", itemStyle: {opacity: 0}, label: {show: false}}
						]
					}
					let geoStyle1 = {
						z: 1, 
						itemStyle: {areaColor: {type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#223857'}, {offset: 1, color: '#223857'}], globalCoord: false},
						shadowColor: '#0f0d16', shadowOffsetX: 0, shadowOffsetY: 10, color: '#FFFFFF', borderColor: '#83e8f3', borderWidth: 2, shadowBlur: 6}
					} 
					let geoStyle2 = {
						z: 2, 
						itemStyle: {areaColor: {type: 'linear', x: 0, y: 0, x2: 0, y2: 1,colorStops: [{ offset: 0, color: '#223857'}, {offset: 1, color: '#223857'}], globalCoord: false},
						shadowColor: '#3b90e1', shadowOffsetX: 0, shadowOffsetY: 6}
					}
					let geoStyle3 = {
						z: 3, 
						itemStyle: {areaColor: {type: 'image', image: './china/bg.png', repeat: 'repeat'}, 
						color: '#FFFFFF', borderColor: '#5a89af', borderWidth: 1, shadowColor: 'rgba(0, 0, 0, 0.15)', shadowOffsetX: 0, shadowOffsetY: 4},
						emphasis: {show: true,itemStyle: {borderColor: 'rgba(0, 135, 255, 0.8)',borderWidth: 1,borderType:'solid',color: '#ffffff',areaColor: {type: 'linear', x: 0, y: 0, x2: 0, y2: 1,colorStops: [{ offset: 0, color: '#00D9C6'}, {offset: 1, color: '#0087FF'}],globalCoord: false}}},  
						label: {show: true,fontSize: '10px',color:'#FFFFFF'}
					}
					let geos = [Object.assign({}, geo, geoStyle1), Object.assign({}, geo, geoStyle2), Object.assign({}, geo, geoStyle3)]
          let map = Object.assign({}, geo, { type: 'map', geoIndex: 2, animation: false, data: res.mapData })
					let custom = {data: res.mapMark,silent: true, type: "custom",coordinateSystem: "geo",label: {show: true,fontSize: 8,color:'#FFFFFF',formatter(value:any) {return value.data.value[2]}},
						showEffectOn: "render",rippleEffect: {brushType: "stroke"},emphasis: {scale: true},zlevel: 4,renderItem(params:any, api:any) {
							const coord = api.coord([api.value(0, params.dataIndex), api.value(1, params.dataIndex)]);
							const circles = [];
							for (let i = 0; i < 5; i++) {
								circles.push({type: 'circle',shape: {cx: 0, cy: 0, r: 12},style: {stroke: '#409eff', fill: 'none', lineWidth: 2},
									keyframeAnimation: {duration: 4000,loop: true,delay: (-i / 4) * 4000, keyframes: [{percent: 0, scaleX: 0, scaleY: 0, style: {opacity: 1}},{percent: 1, scaleX: 1, scaleY: 0.4, style: {opacity: 0}}]}
								});
							}
							return {
								type: 'group',x: coord[0],y: coord[1],z: -1,
								children: [
									...circles,
									{type: 'path',style: {fill: '#409eff'},
									shape: {x: -10,y: -25,width: 20,height: 20,d: 'M16 0c-5.523 0-10 4.477-10 10 0 10 10 22 10 22s10-12 10-22c0-5.523-4.477-10-10-10zM16 16c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6 6z'},
									keyframeAnimation: {duration: 1000,loop: true,delay: Math.random() * 1000,keyframes: [{y: -5,percent: 0.5,easing: 'cubicOut'},{y: 0,percent: 1,easing: 'bounceOut'}]}}
								]
							};
						}
					}
					let series = [map, custom]
					const option = {
						tooltip: tooltip,
						geo: geos,
						series: series,
					}
					resolve(option)
				}).catch((err:any) => {
					console.log('找不到地图json---', err)
					reject(err)
				})
			})
		},
		
	  async Map3D(attr:any, data:any, pramas:any = '') {
			let colorList = !isNull(pramas.colorList)? pramas.colorList : colorLists
			// 选择地图
			let map:any = `./china/`+configStore().adcode+`.json`
			let mapName:any = ''
			return new Promise((resolve, reject) => {
				axios.get(map).then(async (thisMap:any) => {
					console.log('更新地图--thisMap', thisMap)
					thisMap = thisMap.data
					// 引入地图
					echarts.registerMap(mapName, thisMap)
					// 地图导航
					await setAdcodes(thisMap)
					// 数据处理
					let res = getMapDatas(thisMap, data)
					// 网格配置
					let tooltip = [
						{ 
							show: true,
							backgroundColor: "none",
							borderWidth: 0,
							padding: 0,
							formatter: function(params:any, callback:any) {
								if (isNull(params.data)) return
								return (
									"<div class='custom-tooltip-box'>" +
									"<span style='color:#1BFFDF'>" + params.name +"</span>" + "<br />" +
									"<div style='display:flex;align-items: center;margin-top: 5px;'><span class='bg-img'></span>组织：" + params.data.value2 +"</div>" + 
									"<div style='display:flex;align-items: center;margin-top: 5px'><span class='bg-img'></span>公司：" + params.data.value3 +"</div>" +
									"</div>"
								);
							},
						}
					]
					// 热力图配置
					let min = 0
					let max = res.max
					let spitAvg = (Math.abs(max) + Math.abs(min))/4
					let lblFlag = ""
					let priceObj = {}
					let pieces = []
					let colorArr = []
					let colors = ["#87aa66", "#eba438", "#d94d4c"]
					for(var j = 0; j < 3; j++) {
						lblFlag = j==2? Math.floor(((j*spitAvg) + min)*100)/100 + '以上' : Math.floor(((j*spitAvg) + min)*100)/100  + '~' + Math.floor(((j+1)*spitAvg + min)*100)/100
						if(min<0){
								priceObj = { min: (j*spitAvg), max: j==2? max-min : ((j+1) * spitAvg), label: lblFlag}
						}else{
								priceObj = { min: (j*spitAvg) + min, max: j==2? max : ((j+1) * spitAvg + min), label: lblFlag}
						}
						pieces.push(priceObj)
						colorArr.push(colors[j])
					}
					let visualMap = [ 
						{show: false},
						{ show: true, 
							max: max,
							pieces: pieces,
							type: 'piecewise', 
							selectedMode: 'multiple', 
							splitNumber: 6, 
							itemGap: 0, 
							itemWidth: newSize(14), 
							itemHeight: newSize(20), 
							top:'top', 
							symbol: "rect",                 
							inRange: { symbol: "rect", color: colorArr },
							outOfRange: { symbol: "rect" },
							textStyle: { color: '#2773E6', fontSize: newSize(12) }
						}
					]
					// 3D地图配置
					let geo3D = {
						show: true,                // 是否显示
						map: mapName,              // 指定地图
						left: "center",            // 水平位置
						roam: true,                // 允许平移和缩放
						zoom: 2,                   // 缩放值
						regionHeight: newSize(5),  // 高度值
						animation: true,          // 禁用动画效果
						shading: "realistic",      // 光照效果（color、lambert、realistic）
						// realisticMaterial: {
						// 	detailTexture: "./china/bg.png",
						// 	textureTiling: 2,  // 纹理的平铺次数
						// 	roughness: 0.5,    // 表面的粗糙程度
						// 	metalness: 0,      // 材料的金属度
						// },
						// 标签
						label: {
							show: true,
							fontSize: newSize(12),
							color: "#f5f5f5",
							formatter: function ({name}) {
								return `${name} ` //注意name后加了空格
							},
						},
						// 三维地理坐标系组件 包括颜色，透明度，描边等。
						itemStyle: {
							color: "#0a599f",        // 地图板块的颜色 [ default: #0a599f ]
							opacity: 1,              // 地图板块的不透明度 [ default: 1 ]
							borderWidth: newSize(2), // 地图板块间的分隔线 [ default: 0 ]
							borderColor: "#b3f8ff",  // 地图板块描边的颜色 [ default: #b3f8ff ]
						},
						// 鼠标经过触发
						emphasis: {
							show: true,
							label: {
								show: true,
								fontSize: newSize(12),
								color: "#2773E6", // 地图文字的颜色
							},
							itemStyle: {
								color: "#b3f8ff", // 地图板块的颜色
								opacity: 1,       // 地图板块的透明度
							},
						},
						// 灯光
						light: {
							// 主光源
							main: {
								color: "#ffffff",       // 光照颜色
								intensity: 2,           // 光照强度
								shadow: true,           // 是否显示阴影
								shadowQuality: "light", // 阴影亮度（light, medium, strong）
								alpha: 50,              // 光源相对于地球的高度（0-90）
								beta: 10,               // 光源照射的角度
							},
							ambient: {
								color: "#ffffff",       // 光照颜色
								intensity: 0.1,         // 光照强度
							},
						},
						// 自定义区域配置
						regions: [],
						// 三维视图的行为配置
						viewControl: {
							projection: "perspective",           // 投影类型(透视投影：perspective 正交投影：orthographic)
							// orthographicSize: 60,             // 正交投影，设置视图的大小
							// maxOrthographicSize: 400,         // 最小限度正交投影时尺寸
							// minOrthographicSize: 20,          // 最大限度正交投影时尺寸
							distance: 100,                       // 相机与物体的初始距离
							alpha: 65,                           // 控制视图的上下角度
							beta: 0,                             // 控制视图的左右角度
							minDistance: 40,                     // 最小限度目标对象之间距离
							maxDistance: 400,                    // 最大限度目标对象之间距离
							minAlpha: 0,                         // 最小限度上下角度
							maxAlpha: 90,                        // 最大限度上下角度
							minBeta: -1036800,                   // 最小限度左右角度
							maxBeta: 1036800,                    // 最大限度左右角度
							animation: false,                    // 禁用动画效果
							animationDurationUpdate: 1000,       // 更新视图时动画持续的时间
							animationEasingUpdate: "cubicInOut", // 更新动画的缓动效果
							autoRotate: false,                   // 自动旋转
							autoRotateDirection: "cw",           // 自动旋转的方向
							autoRotateSpeed: 10,                 // 自动旋转的速度
							autoRotateAfterStill: 3,             // 鼠标停止后，多久自动旋转
							damping: 0.8,                        // 动画阻尼效果，影响视图的平滑度
							rotateSensitivity: 1,                // 旋转的灵敏度
							zoomSensitivity: 1,                  // 缩放的灵敏度
							panSensitivity: 1,                   // 平移的灵敏度
							panMouseButton: "middle",            // 标按钮用于平移（如 "middle" 表示滚轮按钮）
							rotateMouseButton: "left",           // 鼠标按钮用于旋转（如 "left" 表示左键）
							center: [0, 0, 0],                   // 视图中心点的坐标
						},
					}
					// 3D柱状图配置
					let bar3D = {
						type: "bar3D",
						coordinateSystem: "geo3D",
						regionHeight: newSize(1000) ,
						name: mapName,
						animation: false,
						geo3DIndex: 0,
						barSize: newSize(3),
						bevelSize: 0.2,
						zlevel: 1,
						opacity: 1,
						shading: "lambert",
						label: {
							show: true,
							rich:{ 
								a:{fontSize: newSize(12), padding: [0, 0, 0, 0], color: '#1BFFDF', fontWeight: 'bold'},
								b:{fontSize: newSize(12), padding: [0, 0, 0, 0], color: '#1BFFDF', fontWeight: 'bold'},
								c:{fontSize: newSize(12), padding: [6, 6, 6, 6], color: '#b3f8ff', fontWeight: 'bold', borderWidth: newSize(1), borderColor: "#b3f8ff", borderRadius: [2, 2, 2, 2], backgroundColor: "rgba(45, 35, 240, 0.3)"},
							},
							formatter: function(v:any) {
								return v.data&&v.data.name&&v.data.value?`{c|${v.data.name.substring(0, 2)} / ${v.data.value[2]}}`: ' ' 
							},
						},
						data: res.mapMark,
					}
					let series = [
						// 用于点击
						Object.assign({}, geo3D, { type: 'map3D', zlevel: -1, data: res.mapData, itemStyle: {} }),
						// 数据展示
						bar3D,
					]
					
					const option = {
						animation: true,
						tooltip: tooltip,
						visualMap: visualMap,
						geo3D: geo3D,
						series: series,
					}
					resolve(option)
				}).catch((err:any) => {
					console.log('找不到地图json---', err)
					reject(err)
				})
			})
		}
  }
	
  export default setOption

