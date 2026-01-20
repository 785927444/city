<template>
  <div class="layout-col">
		<div class="absolute t0 l0 cursor" @click="toPath('/home')">返回</div>
		<div class="ww100 hh100" id="container"></div>
  </div>
</template>

<script lang="ts" setup>
  import { gsap } from "gsap"
  import * as THREE from "three"
	import Viewer from '@/utils/three/Viewer'
	import scheduled from "@/utils/scheduled"
	const { createScheduled } = scheduled()
	const { proxy }:any = getCurrentInstance()
	const configStore = proxy.configStore()
	const publicStore = proxy.publicStore()
	const state = reactive({
		...configStore.$state,
		...publicStore.$state,
		models: {},
		css2dLabel: {},
		css3dLabel: {},
	})
  // 动画
  let timeen = {}
  // 轨迹
  let curve = {}
	// 测试点
	let markPoints = [[0, 0, 60],	[0, 0, 0],	[30, 0, 0], [30, 0, 60]]
	// 动作
  let animalIndex = 0
	// 控制键位
	let keyEnum = {}
  // 特殊键位
	let isJumping = false
	// 速度向量
	let velocity = new THREE.Vector3(0, 0, -10)
	// 初始速度
	let velocityLength = velocity.length()
	// 调节速度
	let scaled = 0.01	

	onBeforeUnmount(async() => {
		if (state.viewer) {
			state.viewer.dispose()
			state.viewer = {}
		}
	})

	onMounted(async() => {
		// 场景
		await setInit()
		// 模型
		await setModel()
		// 事件
		state.viewer.startSelectEvent('click', true, (model, point)=>{
			console.log("model---", model)
			console.log("point---", point)
		})
	})

  // 初始化
	const setInit = async() => {
		state.viewer = new Viewer()
		state.viewer.camera.position.set(0, 15, 100)
		console.log("state.viewer", state.viewer)
	}

	const setModel = async() => {
		// 地面
		setGround()
		// 人物
		setRen()
		// 障碍物
		setOther()
	}

	const getRandom = (min, max) => {return Math.floor(Math.random()*(max-min+1) + min)}
	
	const setOther = async() => {
		const num = 200
		const meshs = []
		const boxMaterial = new THREE.MeshStandardMaterial({color: 0x3EBEE3, emissive: new THREE.Color(0x3EBEE3), emissiveIntensity: 10})
		for(let i = 0; i < num; i++){
			const w = getRandom(1, 4)
			const h = getRandom(2, 5)
			const d = getRandom(3, 6)
			const x = getRandom(-100, 100)
			const y = h / 2
			const z = getRandom(-100, 100)
			const boxGeometry = new THREE.BoxGeometry(w, h, d)
			const mesh = new THREE.Mesh(boxGeometry, boxMaterial)
			mesh.position.set(x, y, z)
			meshs[i] = mesh
		}
		state.viewer.scene.add(...meshs)
	}

	const setGround = async() => {
		// 1.普通地面
		// const ground = new THREE.Mesh(
		// 	new THREE.PlaneGeometry(200, 200),
		// 	new THREE.MeshLambertMaterial({
		// 		color: 0x011111,
		// 		side: THREE.DoubleSide,
		// 	})
		// )
		// ground.castShadow = true
		// ground.receiveShadow = true
		// ground.rotateX(-Math.PI / 2)
		// state.viewer.scene.add(ground)
		// 2.动态地面
		state.viewer.modelLoader.loadModelToScene('glb/ground.glb', (model) => {
			console.log('ground-model---', model)
			// 属性配置
			const key = 'ground'
			model.object.key = key
			model.object.name = '地面'
			model.object.userData = {id: '2'}
      model.object.position.set(0, 0.01, 0)
			model.object.scale.set(0.01, 0.01, 0.01)
      // 开启投影
			model.openCastShadow()
			// 接收阴影
			model.openReceiveShadow()
			const texture = (model.object.children[0] as any).material.map
    // 添加到动画
		  timeen[key] = planeAnimate(texture);
			state.viewer.addAnimate(timeen[key])
		})
	}

	const planeAnimate = (texture: any): Animate => {
		texture.wrapS = THREE.RepeatWrapping
		texture.wrapT = THREE.RepeatWrapping
		const animateFn = {
			fun: () => {
				const count = texture.repeat.y
				if (count <= 10) {
					texture.repeat.x += 0.01
					texture.repeat.y += 0.02
				} else {
					texture.repeat.x = 0
					texture.repeat.y = 0
				}
			},
			content: state.viewer,
		};
		return animateFn
	}

	const setRen = async() => {
		state.viewer.modelLoader.loadModelToScene('glb/ren.glb', (model) => {
			console.log('ren-model---', model)
			// 属性配置
			const key = 'ren'
			model.object.key = key
			model.object.name = '人物'
			model.object.userData = {id: '1'}
			model.object.position.set(0, 0, 60)
			model.object.scale.set(3, 3, 3)
			// model.object.rotateY(Math.PI)
	    // 开启投影
			model.openCastShadow()
			// 查找模型指定对象
			// const modelObject = model.object.getObjectByName('voda_0')
			// const modelObject.material = new THREE.MeshBasicMaterial({
			// 	map: videoTextTure,
			// 	side: THREE.DoubleSide,
			// 	transparent: true
			// })

      // 旋转方向 
			// const angle = (Math.PI / 180) * 180
			// const quaternion = new THREE.Quaternion()
			// 第一种
			// const axis = new THREE.Vector3(0, 1, 0)
			// quaternion.setFromAxisAngle(axis, angle)
			// 第二种
			// const euler = new THREE.Euler(0, angle, 0)
			// quaternion.setFromEuler(euler)
			// model.object.quaternion.copy(quaternion)

      // 三围盒子
			// let box = model.getBox()
			// 模型标签
			// state.viewer.labelIns.addCss2dLabel(
			// 	{x: (box.max.x + box.min.x)/2, y: box.max.y, z: (box.max.z + box.min.z)/2},
			// 	`<div class="elementContent"><h3>${model.object.name}</h3></div>`
			// )
			// 存储
      state.models[key] = model
			// 初始动作
			model.startAnimal(animalIndex)
			// 轨迹
			setCurve(key)
		})
	}

	const setCurve = (key) => {
		curve = new THREE.CatmullRomCurve3(markPoints.map(v => { return new THREE.Vector3(v[0], v[1], v[2]) }))
		// 曲线类型
		curve.curveType = 'catmullrom'
		// 是否封闭 
		curve.closed = true 
		// 线的张力，0为无弧度折线
		curve.tension = 0 
		// 自定义
		curve.division = 50
		// 物体运动时在运动路径的初始位置，范围0~1
		curve.progress = 0
		// 影响运动速率的一个值，范围0~1，需要和渲染频率结合计算才能得到真正的速率
		curve.velocity = 0.0008
		// 为曲线添加材质在场景中显示出来，不显示也不会影响运动轨迹，相当于一个Helper
		const points = curve.getPoints(curve.division) // 获取曲线上的点, 平均多少份
		const geometry = new THREE.BufferGeometry().setFromPoints(points) // 创建几何体
		const material = new THREE.LineBasicMaterial({ color: 0xff0000 }) // 线材质
		const curveLine = new THREE.Line(geometry, material) // 线
		curveLine.position.y = 1
		state.viewer.scene.add(curveLine)
    // 添加到动画
    timeen[key] = {fun: moveCurve, content: {model: state.models[key], key: key}}
    state.viewer.addAnimate(timeen[key])
	}

	const moveCurve = (content) => {
		if(!content) return
		const key = content.key
		if(keyEnum.keyx){
			if (curve.progress <= 1 - curve.velocity) {
				const model = content.model.object
				const point = curve.getPointAt(curve.progress) // 获取样条曲线指定点坐标 
				const pointBox = curve.getPointAt(curve.progress + curve.velocity) // 获取样条曲线指定点坐标
				if (point && pointBox) {
					model.position.set(point.x, point.y, point.z)
					// 因为这个模型加载进来默认面部是正对Z轴负方向的，所以直接lookAt会导致出现倒着跑的现象，这里用重新设置朝向的方法来解决。
					// 1.面像Z轴正方向
				  model.lookAt(pointBox.x, pointBox.y, pointBox.z)
					// 2.面像Z轴负方向 .lookAt ( eye : Vector3, target : Vector3, up : Vector3 ) : this,构造一个旋转矩阵，从eye 指向 target，由向量 up 定向。
					// 以下代码在多段路径时可重复执行 
					// const targetPos = pointBox   // 目标位置点
					// const offsetAngle = 0 // 目标移动时的朝向偏移
					// const mtx = new THREE.Matrix4()  // 创建一个4维矩阵
					// mtx.lookAt(model.position, targetPos, model.up) //设置朝向
					// mtx.multiply(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0, offsetAngle, 0)))
					// const toRot = new THREE.Quaternion().setFromRotationMatrix(mtx)  //计算出需要进行旋转的四元数值
					// model.quaternion.slerp(toRot, 0.2)
				}
				curve.progress += curve.velocity
			}else{
				curve.progress = 0
			  state.viewer.removeAnimate(timeen[key])
			}
		}
	}

	// 键盘按下
	window.addEventListener('keydown', (e) => {
		const model = state.models['ren']
		const code = e.code.toLocaleLowerCase()
		// 特殊需等待动作完成
		if(code == 'space' && !isJumping){
			isJumping = true
		}
		keyEnum[code] = true
		if((keyEnum.shiftleft && keyEnum.keyw) || (keyEnum.shiftleft && keyEnum.keys) 
		|| (keyEnum.shiftleft && keyEnum.keya) || (keyEnum.shiftleft && keyEnum.keyd)){
			animalIndex = 3
			scaled = 0.03
		} else if(keyEnum.keyw || keyEnum.keys || keyEnum.keya || keyEnum.keyd || keyEnum.keyx){
      animalIndex = 6
			scaled = 0.01
		} else{
      animalIndex = 0
		}
		model.updateAction(animalIndex)
		updLookAt(keyEnum)
	})

	// 键盘抬起
	window.addEventListener('keyup', (e) => {
		const model = state.models['ren']
		const code = e.code.toLocaleLowerCase()
		// 特殊需等待动作完成
		if(code == 'space' && isJumping){
			const time = model.getAnimatTime()
			setTimeout(() => {
				isJumping = false
			}, time * 900);
		}
		keyEnum[code] = false
		animalIndex = 0
		model.updateAction(animalIndex)
	})

	const updLookAt = (keyEnum) => {
		// 人物位置
    const model = state.models['ren'].object
    const modelPosition = model.position.clone()
		// 相机向量
		const cameraVelocity = new THREE.Vector3()
		state.viewer.camera.getWorldDirection(cameraVelocity)
		// 人物朝向
		const lookAtVelocity = new THREE.Vector3()
		if(keyEnum.keyw){
			lookAtVelocity.set(modelPosition.x + cameraVelocity.x, modelPosition.y, modelPosition.z + cameraVelocity.z)
			model.lookAt(lookAtVelocity)
      cameraVelocity.y = 0
			cameraVelocity.normalize()
			cameraVelocity.setLength(velocityLength)
			const scaledVelocity = cameraVelocity.clone().multiplyScalar(scaled);
			model.position.add(scaledVelocity)
			state.viewer.camera.position.add(scaledVelocity)
		}else if(keyEnum.keys){
			lookAtVelocity.set(modelPosition.x - cameraVelocity.x, modelPosition.y, modelPosition.z - cameraVelocity.z)
			model.lookAt(lookAtVelocity)
      cameraVelocity.y = 0
			cameraVelocity.normalize()
			cameraVelocity.setLength(velocityLength)
			const scaledVelocity = cameraVelocity.clone().multiplyScalar(scaled);
			model.position.sub(scaledVelocity)
			state.viewer.camera.position.sub(scaledVelocity)
		}else if(keyEnum.keya){
			const leftVelocity = new THREE.Vector3(-cameraVelocity.z, 0, cameraVelocity.x)
			lookAtVelocity.set(modelPosition.x - leftVelocity.x, modelPosition.y, modelPosition.z - leftVelocity.z)
			model.lookAt(lookAtVelocity)
			leftVelocity.setLength(velocityLength)
			const scaledVelocity = leftVelocity.negate().clone().multiplyScalar(scaled);
			model.position.add(scaledVelocity)
      state.viewer.camera.position.add(scaledVelocity)
		}else if(keyEnum.keyd){
			const rightVelocity = new THREE.Vector3(cameraVelocity.z, 0, -cameraVelocity.x)
			lookAtVelocity.set(modelPosition.x - rightVelocity.x, modelPosition.y, modelPosition.z - rightVelocity.z)
			model.lookAt(lookAtVelocity)
			rightVelocity.setLength(velocityLength)
			const scaledVelocity = rightVelocity.negate().clone().multiplyScalar(scaled);
			model.position.add(scaledVelocity)
			state.viewer.camera.position.add(scaledVelocity)
		}
	}

  // const createTag = (object3d) => {
  //   // 创建各个区域的元素
  //   const element = document.createElement("div");
  //   element.className = "elementTag";
  //   element.innerHTML = `
  //     <div class="elementContent">
  //       <h3>${object3d.name}</h3>
  //       <p>温度：26℃</p>
  //       <p>湿度：50%</p>
  //     </div>
  //   `;
  //   const objectCSS3D = new CSS3DObject(element);
  //   objectCSS3D.position.copy(object3d.position);
  //   objectCSS3D.scale.set(0.2, 0.2, 0.2);
  //   return objectCSS3D;
  //   // scene.add(objectCSS3D);
  // }

	// const addAnimate = (content) => {
	// 	if(!content) return
	// 	const keyEnum = content.keyEnum
	// 	const model = content.model.model
	// 	const velocity = content.velocity
	// 	const scaled = content.scaled
	// 	if(keyEnum.keyw){
  //     model.scene.position.addScaledVector(velocity, scaled)
	// 	}
	// }

  // 拉近距离
	// const setDistant = async(model) => {
	// 	if(model.isGroup) {
	// 		if(model.name.includes('zuo') || model.name == '快递车'){
  //       // 确保矩阵已更新
	// 			model.updateMatrixWorld()
	// 			const worldPosition = new THREE.Vector3()
	// 			model.getWorldPosition(worldPosition)
	// 			let z = 0
	// 			if(model.name.includes('zuo')) z = 30
	// 			if(model.name == '快递车') z = 10	
	// 			gsap.to(state.viewer.camera.position, {
	// 				x: worldPosition.x + 5,
	// 				y: worldPosition.y + 5,
	// 				z: worldPosition.z + z,
	// 				duration: 2,
	// 				ease: 'Bounce.inOut'
	// 			})
	// 		}
	// 	}
	// }

</script>

<style scoped lang="scss">

</style>
