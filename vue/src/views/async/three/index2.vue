<template>
	<div class="scenes"
		style="position: fixed;left: 0;top: 0;z-index: 10; pointer-events: none;transition: all 1s;" 
    :style="{transform: `translate3d(0, ${-index * 100}vh, 0)`}">
		<div v-for="item in scenes" style="width: 100vw;height: 100vh;">
			<h1 style="padding: 50px 50px; font-size: 50px; color: #fff">{{ item.text }}</h1>
		</div>
	</div>
</template>

<script lang="ts" setup>
	import * as THREE from 'three'
	// 导入动画库
	import gsap from 'gsap';
	import { onMounted } from "vue";
	// 加载GLTF模型
	import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
	// 解压GLTF模型
	import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
	// 导入控制器
	import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
	// 解析 HDR 纹理数据
	import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
	// 导入水面
	import { Water } from 'three/examples/jsm/objects/Water2'

	onMounted(async() => {
		render()
	})

	// 获取dom节点
	const dom = document.getElementById("app")
	// 初始化场景
	const scene = new THREE.Scene()
	// 初始化相机
	const camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000)
	camera.position.set(-20, 8, 18)
	camera.updateProjectionMatrix()
  // 初始化渲染器
	const renderer = new THREE.WebGLRenderer({
		antialias: true // 设置抗锯齿
	})
	renderer.setSize(dom.clientWidth, dom.clientHeight)
	dom.appendChild(renderer.domElement)
	// 设置色调映射
	renderer.toneMapping = THREE.ACESFilmicToneMapping // 色调映射技术，是在电影和电视行业中广泛使用的一种技术
	renderer.toneMappingExposure = 0.3 // 色调亮光程度
	// 设置渲染器允许阴影效果
	renderer.shadowMap.enabled = true
	renderer.physicallyCorrectLights = true
	// 初始化控制器
	const controls = new OrbitControls(camera,renderer.domElement)
	controls.target.set(-8,2,0)
	controls.enableDamping = true // 设置控制阻尼

	// 初始化loader
	const dracoLoader = new DRACOLoader()
	dracoLoader.setDecoderPath("/js/draco/")
	const gltfLoader = new GLTFLoader()
	gltfLoader.setDRACOLoader(dracoLoader)
	// 加载模型
	gltfLoader.load("glb/christmas.glb",(gltf)=>{
		const model = gltf.scene
		model.traverse((child)=>{
			if(child.name === 'Plane'){
				child.visible = false
			}
			// 设置物体是允许接收和投射阴影的
			if(child.isMesh){
				child.castShadow = true
				child.receiveShadow = true
			}
		})
		scene.add(model)
	})
	
	// 创建水面
	const waterGeometry = new THREE.CircleGeometry(100,100)
	const water = new Water(waterGeometry,{
		textureWidth: 1024,
		textureHeight: 1024,
		color: 0xeeeeff,
		flowDirection: new THREE.Vector2(1,1),
		scale: 100
	})
	water.rotation.x = -Math.PI /2
	water.position.y = -0.1
	scene.add(water)
	
	// 添加平行光
	const light = new THREE.DirectionalLight(0xffffff,1)
	light.position.set(0, 50, 0)
	scene.add(light)

	// 添加点光源
	const pointLight = new THREE.PointLight(0xffffff,50,10)
	pointLight.position.set(0.1, 2.4, 0)
	pointLight.castShadow = true
	scene.add(pointLight)
	
	// 创建点光源组
	const pointLightGroup = new THREE.Group();
	pointLightGroup.position.set(-8, 2.5, -1.5);
	let radius = 3;
	let pointLightArr = [];
	for (let i = 0; i < 3; i++) {
		// 创建球体当灯泡
		const sphereGeometry = new THREE.SphereGeometry(0.2, 32, 32);
		const sphereMaterial = new THREE.MeshStandardMaterial({
			color: 0xffffff,
			emissive: 0xffffff,
			emissiveIntensity: 10,
		});
		const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
		pointLightArr.push(sphere);
		sphere.position.set(
			radius * Math.cos((i * 2 * Math.PI) / 3),
			Math.cos((i * 2 * Math.PI) / 3),
			radius * Math.sin((i * 2 * Math.PI) / 3)
		);
	
		let pointLight = new THREE.PointLight(0xffffff, 50);
		sphere.add(pointLight);
	
		pointLightGroup.add(sphere);
	}
	scene.add(pointLightGroup);

	// 使用补间函数，从0到2π，使灯泡旋转
	let options = {
		angle: 0,
	};
	gsap.to(options, {
		angle: Math.PI * 2,
		duration: 10,
		repeat: -1,
		ease: "linear",
		onUpdate: () => {
			pointLightGroup.rotation.y = options.angle;
			pointLightArr.forEach((item, index) => {
				item.position.set(
					radius * Math.cos((index * 2 * Math.PI) / 3),
					Math.cos((index * 2 * Math.PI) / 3 + options.angle * 5),
					radius * Math.sin((index * 2 * Math.PI) / 3)
				);
			});
		},
	});
	
	// 加载纹理贴图
	let rgbeLoader = new RGBELoader()
	rgbeLoader.load('./images/christmas-sky.hdr',(texture)=>{
		texture.mapping = THREE.EquirectangularReflectionMapping
		scene.background = texture
		scene.environment = texture
	})
	
	// 使用补间动画移动相机
	let timeLine1 = gsap.timeline()
	let timeLine2 = gsap.timeline()
	// 定义相机移动函数
	const translateCamera = (position,target) =>{ 
		timeLine1.to(camera.position, {
			x: position.x,
			y: position.y,
			z: position.z,
			duration: 1,
			ease: "power2.inOut",
		});
	
		timeLine2.to(controls.target, {
			x: target.x,
			y: target.y,
			z: target.z,
			duration: 1,
			ease: "power2.inOut",
		});
	}
	
	// 添加文字场景
	let scenes = [
		{
			text:'圣诞节快乐',
			callback:()=>{
				// 执行函数切换位置
				translateCamera(
					new THREE.Vector3(-3.23, 3, 4.06),
					new THREE.Vector3(-8, 2, 0)
				);
				restoreHeart()
			}
		},
		{
			text:'世界这么大还能遇见你',
			callback:()=>{
				translateCamera(new THREE.Vector3(7, 0, 23), new THREE.Vector3(0, 0, 0))
			}
		},
		{
			text:'愿与你探寻整个世界',
			callback:()=>{
				translateCamera(new THREE.Vector3(10, 3, 0), new THREE.Vector3(5, 2, 0))
			}
		},
		{
			text:'愿将天上的星星送给你',
			callback:()=>{
				translateCamera(new THREE.Vector3(7, 0, 28), new THREE.Vector3(0, 0, 0))
				makeHeart()
			}
		},
		{
			text:'愿你开心每一天',
			callback:()=>{
				translateCamera(
					new THREE.Vector3(-20, 1.3, 6.6),
					new THREE.Vector3(5, 2, 0)
				);
			}
		},
	]
	
	let index = ref(0)
	let isAnimate = false;
	// 监听鼠标滚轮事件
	window.addEventListener(
		"wheel",
		(e) => {
			if (isAnimate) return;
			isAnimate = true;
			if (e.deltaY > 0) {
				index.value++;
				if (index.value > scenes.length - 1) {
					index.value = 0;
				}
			}
			scenes[index.value].callback();
			setTimeout(() => {
				isAnimate = false;
			}, 1000);
		},
		false
	);
	
	// 实例化创建漫天星星
	let starsInstance = new THREE.InstancedMesh(
		new THREE.SphereGeometry(0.1, 32, 32),
		new THREE.MeshStandardMaterial({
			color: 0xffffff,
			emissive: 0xffffff, //模拟自发光材质，并且不会受到光照的影响。
			emissiveIntensity: 10, // 控制发光效果强度
		}),
		100 // 创建100个
	);
	// 星星随机到天上
	let starsArr = [];
	let endArr = [];
	for (let i = 0; i < 100; i++) {
		let x = Math.random() * 100 - 50;
		let y = Math.random() * 100 - 50;
		let z = Math.random() * 100 - 50;
		starsArr.push(new THREE.Vector3(x, y, z));
	
		let matrix = new THREE.Matrix4();
		matrix.setPosition(x, y, z);
		starsInstance.setMatrixAt(i, matrix);
	}
	scene.add(starsInstance);
	
	// 创建爱心路径
	let heartShape = new THREE.Shape();
	heartShape.moveTo(25, 25);
	heartShape.bezierCurveTo(25, 25, 20, 0, 0, 0);
	heartShape.bezierCurveTo(-30, 0, -30, 35, -30, 35);
	heartShape.bezierCurveTo(-30, 55, -10, 77, 25, 95);
	heartShape.bezierCurveTo(60, 77, 80, 55, 80, 35);
	heartShape.bezierCurveTo(80, 35, 80, 0, 50, 0);
	heartShape.bezierCurveTo(35, 0, 25, 25, 25, 25);
	
	// 根据爱心路径获取点
	let center = new THREE.Vector3(0, 2, 10);
	for (let i = 0; i < 100; i++) {
		let point = heartShape.getPoint(i / 100);
		endArr.push(
			new THREE.Vector3(
				point.x * 0.1 + center.x,
				point.y * 0.1 + center.y,
				center.z
			)
		);
	}
	
	// 创建爱心动画
	function makeHeart() {
		let params = {
			time: 0,
		};
	
		gsap.to(params, {
			time: 1,
			duration: 1,
			onUpdate: () => {
				for (let i = 0; i < 100; i++) {
					let x = starsArr[i].x + (endArr[i].x - starsArr[i].x) * params.time;
					let y = starsArr[i].y + (endArr[i].y - starsArr[i].y) * params.time;
					let z = starsArr[i].z + (endArr[i].z - starsArr[i].z) * params.time;
					let matrix = new THREE.Matrix4();
					matrix.setPosition(x, y, z);
					starsInstance.setMatrixAt(i, matrix);
				}
				starsInstance.instanceMatrix.needsUpdate = true;
			},
		});
	}
	
	function restoreHeart() {
		let params = {
			time: 0,
		};
	
		gsap.to(params, {
			time: 1,
			duration: 1,
			onUpdate: () => {
				for (let i = 0; i < 100; i++) {
					let x = endArr[i].x + (starsArr[i].x - endArr[i].x) * params.time;
					let y = endArr[i].y + (starsArr[i].y - endArr[i].y) * params.time;
					let z = endArr[i].z + (starsArr[i].z - endArr[i].z) * params.time;
					let matrix = new THREE.Matrix4();
					matrix.setPosition(x, y, z);
					starsInstance.setMatrixAt(i, matrix);
				}
				starsInstance.instanceMatrix.needsUpdate = true;
			},
		});
	}
	

 
	var timer = setInterval(function() {
		var scrollEvent = new WheelEvent('wheel', { deltaY: 100 });
		window.dispatchEvent(scrollEvent);
	}, 5000);

	document.addEventListener('click', function() {
		if(timer){
		  clearInterval(timer);
			timer = null
		}else{
			var scrollEvent = new WheelEvent('wheel', { deltaY: 100 });
			window.dispatchEvent(scrollEvent);
			timer = setInterval(function() {
				var scrollEvent = new WheelEvent('wheel', { deltaY: 100 });
				window.dispatchEvent(scrollEvent);
			}, 5000);
		}
	})

	const render = () =>{ 
		requestAnimationFrame(render)
		renderer.render(scene, camera)
		controls.update()
	}
	
	// 监听页面变化
	window.addEventListener("resize",()=>{  
		renderer.setSize(dom.clientWidth, dom.clientHeight)
		camera.aspect = dom.clientWidth/dom.clientHeight
		camera.updateProjectionMatrix()
	})
 
 
</script>

<style scoped lang="scss">

</style>
