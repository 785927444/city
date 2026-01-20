import * as d3 from "d3"
import Viewer from '@/utils/three/Viewer'
import { Group, Path, BufferGeometry, BufferAttribute, PointsMaterial, Points } from "three"
import { fetchData, isNull } from '@/utils/common'
import { mapUf } from './mapMaterial' 
import { initMapBorder, flowLightAnimation } from './mapBorder'
import { initArea } from './mapArea' 
import { initRotatingAperture, initRotatingPoint, initParticle, initCirclePoint, initSceneBg } from './mapBg'
import TWEEN from "@tweenjs/tween.js"
import publicStore from '@/stores/publicStore'
import configStore from '@/stores/configStore'

export default function map(id = "container", option = {}) {
	// 全局对象
	let state = {}
	// 动态参数
  let options = {}
	// 当前地图
	let adcode = '100000'
	// 当前地图组
	let mapGroup = new Group()
	// 当前选中
	let model = null
	// 模型缩放
	let scale = 1
	// 背景 - 旋转光圈
	let rotatingApertureMesh = null
	// 背景 - 旋转点
	let rotatingPointMesh = null
	// 背景 - 粒子
	let particleArr = null
	// 边界 - 粒子
	let flowLightPoints = null
  // 初始化
  const drawMap = async(viewer) => {
		initScene()
		initMapBg()
		initModel()
		initAnimate()
  }
	// 初始化场景
	const initScene = async() => {
		state.viewer = new Viewer(id, options)
		publicStore().viewer = state.viewer
		// 相机
		state.viewer.camera.position.set(0, 140, 140)
		// 环境光
    state.viewer.lights.lightList[0].light.color.set(0x219cf7)
		// 平行光
		state.viewer.lights.lightList[1].light.color.set(0x219cf7)
		state.viewer.lights.lightList[1].light.position.set(0, 0, 0)
		state.viewer.lights.lightList[1].light.intensity = 1
		// 移动事件
		onMousemove()
		// 点击事件
		onMouseclick()
		console.log("state.viewer", state.viewer)
	}

  // 初始化背景
	const initMapBg = () => {
		let width = 130
		let bgGroup = new Group()
		bgGroup.position.y -= 3.5
		bgGroup.rotateX(-Math.PI / 2)
		// 旋转光圈
		rotatingApertureMesh = initRotatingAperture(width, [0, 0], bgGroup)
		// 旋转点
		rotatingPointMesh = initRotatingPoint(width - 2, [0, 0], bgGroup)
		// 粒子
		// particleArr = initParticle(earthGroupBound, bgGroup)
		// 原点
		initCirclePoint(width, [0, 0], bgGroup)
		// 背景
		initSceneBg(width, [0, 0], bgGroup)
		// 将背景添加到场景中
		state.viewer.scene.add(bgGroup)
	}

	const initAdcode = () => {
		// 获取
		if(publicStore().mapAdcodes && publicStore().mapAdcodes.length != 0){
			const len = publicStore().mapAdcodes.length
      adcode = publicStore().mapAdcodes[len - 1].adcode
			// 省
      if(len == 1){
				if(adcode == '540000' || adcode == '650000' || adcode == '630000' || adcode == '620000' || adcode == '230000' || adcode == '150000'){
					scale =  2.5
				}else if(adcode == '460000' || adcode == '820000' || adcode == '810000'){
					scale =  20
				}else{
					scale =  7
				}
			}
			// 市
			if(len == 2){
				scale = 50
			}
		}else{
      adcode = '100000'
			scale =  0.9
		}
	}

	// 初始化地图
	const initModel = async() => {
		// 获取adcode
		initAdcode()
		console.log("adcode---", adcode)
		// 地图数据
		const fileData = await fetchData(`./china/${adcode}.json`)
		// 地图中心点
		const center = d3.geoCentroid(fileData)
		// 经纬度转换
		const projection = d3.geoMercator().center(center).translate([0, 0]);
		// 地图组
		mapGroup = new Group()
		mapGroup.scale.set(scale, scale, 1)
		// 旋转
		mapGroup.rotateX(-Math.PI / 2)
		fileData.features.forEach((elem, index) => {
			// 属性
			const properties = elem.properties
			// 坐标
			const coordinates = elem.geometry.type === "Polygon" ? [elem.geometry.coordinates] : elem.geometry.coordinates
			// 创建区域
			initArea(properties, projection, coordinates, mapGroup, scale)
		})
		console.log("mapGroup---", mapGroup)
		state.viewer.scene.add(mapGroup)
		// 动态描边
		if(adcode == '100000' || adcode == '440000'){
			flowLightPoints = await initMapBorder(adcode, projection, mapGroup)
		}else{
      flowLightPoints = null
		}
	}

	// 添加到动画
	const initAnimate = () => {
		let timeen = {fun: animate, content: {}}
		state.viewer.addAnimate(timeen)
	}

	// 动画
	const animate = () => {
		if (flowLightPoints) {
			flowLightAnimation(flowLightPoints);
		}
		// 侧边渐变
		if (mapUf) {
			mapUf.uTime.value += 0.005;
			if (mapUf.uTime.value >= 1) {
				mapUf.uTime.value = 0.0;
			}
		}
		// 旋转光圈
	  if (rotatingApertureMesh) {
	    rotatingApertureMesh.rotation.z += 0.001
	  }
		// 旋转点
	  if (rotatingPointMesh) {
	    rotatingPointMesh.rotation.z -= 0.001
	  }
	  // 粒子上升
	  // if (particleArr) {
	  //   for (let i = 0; i < particleArr.length; i++) {
	  //     particleArr[i].updateSequenceFrame()
	  //     particleArr[i].position.z += 0.5
	  //     if (particleArr[i].position.z >= 100) {
	  //       particleArr[i].position.z = -50
	  //     }
	  //   }
	  // }
	}

	// 移动
	const onMousemove = () => {
		state.viewer.startSelectEvent("mousemove", true, (object, point)=>{
			if(object.name == '地图' || object.name == 'createLightPillar01' || object.name == 'createLightPillar02'){
				if(object.name == 'createLightPillar01' || object.name == 'createLightPillar02'){
					parent = object.parent.parent.children[0]
					object = Object.assign({}, parent)
				}
		    if(!model || model == null){
					new TWEEN.Tween(object.parent.position).to({ z: 3 }, 100).easing(TWEEN.Easing.Sinusoidal.Out).start()
				} else {
          if(model.name == object.name && model.userData.name != object.userData.name){
						new TWEEN.Tween(model.parent.position).to({ z: 0 }, 100).easing(TWEEN.Easing.Sinusoidal.Out).start()
						new TWEEN.Tween(object.parent.position).to({ z: 3 }, 100).easing(TWEEN.Easing.Sinusoidal.Out).start()
					}
				}
				model = Object.assign({}, object)
			} else {
        if(model && model != null){
					new TWEEN.Tween(model.parent.position).to({ z: 0 }, 100).easing(TWEEN.Easing.Sinusoidal.Out).start()
					model = null
				}
			}
		})
	}

	// 点击
	const onMouseclick = () => {
		state.viewer.startSelectEvents("click", true, (object, point)=>{
			if(object.name == '地图' || object.name == 'createLightPillar01'){
				if(object.name == 'createLightPillar01' || object.name == 'createLightPillar02'){
					parent = object.parent.parent.children[0]
					object = Object.assign({}, parent)
				}
				if(object.userData.adcode){
					publicStore().mapAdcodes.push({adcode: object.userData.adcode, name: object.userData.name})
				}
			}
		})
	}

	// 切换
	watch(() => publicStore().mapAdcodes, async(val) => {
		if(isNull(val)) return
		state.viewer.destroySceneObjects(mapGroup)
		flowLightPoints = null
		initModel()
  },{immediate: false, deep: true})

  // 销毁
  onBeforeUnmount(() => {
		if (state.viewer) {
			state.viewer.dispose()
			state.viewer = {}
		}
  })
	// 暴露
	return {
		drawMap
	}
}
