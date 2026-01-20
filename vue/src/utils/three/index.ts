  import * as THREE from "three"
  import Viewer from './Viewer'
  import Lights from './Lights'
  import SkyBoxs from '@/utils/three/SkyBoxs'
  import Labels from '@/utils/three/Labels'
  import ModelLoader from '@/utils/three/ModelLoader'
  import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'
  import configStore from '@/stores/configStore'
	import publicStore from '@/stores/publicStore'
	import router from '@/router'
	import api from '@/api'

	export default function th() {
    let state:any = {}

    // 调试工具
    let gui:any = null
    const initGui = (ctx) => {
      gui = gui || new GUI()
      if(ctx){
        // gui.add(event, "fuc").name("方法")
        // gui.add(model.position, "x", 10, 10).name("model的x轴位置")
        gui.add(ctx.position, "x", 1, 100).name("x轴位置")
        gui.add(ctx.position, "y", 1, 100).name("y轴位置")
        gui.add(ctx.position, "z", 1, 100).name("z轴位置")
      }
    }

    // 初始化
    const drawThree = (dom = "container", scene = {}, camera = {}, renderer = {}) => {
      state = new Viewer(dom, scene, camera, renderer)
      setBase()
      setModel()
      console.log("state---", state)
      return state
    }

    // 基础设置
    const setBase = async() => {
      // 辅助工具
      state.CameraHelper()
      state.AxesHelper()
      state.GridHelper()
      // 状态检测
      state.addStats()
      // 阴影映射
      state.renderer.shadowMap.enabled = true
      // 阴影质量 
      // 1.THREE.BasicShadowMap（标准阴影贴图，耗性能低，质量差） 2.THREE.PCFShadowMap（阴影边缘平滑，兼顾效果和性能）
      // 3.THREE.PCFSoftShadowMap（柔和，耗性能高，效果好） 4.THREE.VSMShadowMap（可变级别，处理大面积光源， 性能和效果的平衡）
      state.renderer.shadowMap.type = THREE.PCFSoftShadowMap
      // 设置光线
      setLight()
    }

    const setLight = async() => {
      // 初始化光线
      const lights = new Lights(state)
      // 添加环境光
      const ambientLight = lights.addAmbientLight({
        color: 0xffffff, 
        intensity: 1
      }) 
      // 添加平行光
      const directionalLight = lights.addDirectionalLight([-10, 50, 20], {
        color: 0xffffff,
        intensity: 8 
      })
      // 天空盒
      setSky('day')
    }

    const setSky = async(sky) => {
      if (!state.skyboxs) {
        state.skyboxs = new SkyBoxs(state)
      }
      // 获取环境光
      const ambientLight = state.scene.getObjectByProperty('type', 'AmbientLight')
      // 获取平行光
      const directionalLight = state.scene.getObjectByProperty('type', 'DirectionalLight')
      // 获取聚合光
      const spotLights = state.scene.getObjectsByProperty('type', 'SpotLight')
      if(sky == 'day'){
        ambientLight.intensity = 1.0
        spotLights.forEach((spotLight) => {spotLight.visible = false})
      }else if(sky == 'dusk'){
        ambientLight.intensity = 0.7
        spotLights.forEach((spotLight) => {spotLight.visible = false})
      }else if(sky == 'night'){
		    ambientLight.intensity = 0.3
		  	spotLights.forEach((spotLight) => { spotLight.visible = true })
      }
      state.skyboxs.setSkybox(sky)
    }

    // 创建模型
    const setModel = async() => {
      // 模型加载
      state.modelLoader = new ModelLoader(state)
      // 存储加载
      state.models = {}
      // 标签实例
      state.labelIns = new Labels(state)
      // 模式操作
      setAction()
    }

    const setAction = async() => {
      // MouseMove()
      MouseClick()
    } 
    
    // 鼠标点击
    const MouseClick = async() => {
      let clickTimer = null;
      const doubleClickDelay = 300; // 定义双击的时间间隔（毫秒）
      state.renderer.domElement.addEventListener('click', (e) => {
        // 如果有定时器，表示是双击
        if (clickTimer) {
          clearTimeout(clickTimer); // 清除之前的定时器
          clickTimer = null; // 重置定时器
          handleDoubleClick(e); // 调用双击处理函数
        } else {
          // 设置定时器来处理单击
          clickTimer = setTimeout(() => {
            handleSingleClick(e); // 调用单击处理函数
            clickTimer = null; // 清除定时器
          }, doubleClickDelay);
        }
      })
    }

    // 单击 将鼠标位置归一化为设备坐标。
    const handleSingleClick = async(e) => {
      //x 和 y 方向的取值范围是 (-1 to +1)
      const mouse = new THREE.Vector2()
      const width = state.renderer.domElement.clientWidth
      const height = state.renderer.domElement.clientHeight
      mouse.x = (e.offsetX / width) * 2 - 1
      mouse.y = -(e.offsetY / height) * 2 + 1
      // 通过摄像机和鼠标位置更新射线
      const rayCaster = new THREE.Raycaster()
      rayCaster.setFromCamera(mouse, state.camera)
      // TODO: 第一个参数是否需要指定模型 计算物体和射线的焦点
      const intersects = rayCaster.intersectObject(state.scene, true)
      if (intersects.length > 0) {
        const object = intersects[0].object
        if(!object) return
        console.log('object---', object)
        // 世界坐标转平面坐标
        const worldVector = new THREE.Vector3(object.x, object.y, object.z)
        const dncPostion = worldVector.project(state.camera)
        const left = dncPostion.x * width/2 + width/2
        const top = -dncPostion.y * height/2 + height/2
        // 点击操作
        if(!object.parent) return
        setClick(object.parent)
      }
    }
	
    // 双击击
    const handleDoubleClick = async(e) => {
      const rayCaster = new THREE.Raycaster()
      const mouse = new THREE.Vector2()
      // 将鼠标位置归一化为设备坐标。x 和 y 方向的取值范围是 (-1 to +1)
      mouse.x = (e.offsetX / state.renderer.domElement.clientWidth) * 2 - 1
      mouse.y = -(e.offsetY / state.renderer.domElement.clientHeight) * 2 + 1
      // 通过摄像机和鼠标位置更新射线
      rayCaster.setFromCamera(mouse, state.camera)
      // TODO: 第一个参数是否需要指定模型
      const intersects = rayCaster.intersectObject(state.scene, true) // 计算物体和射线的焦点
      if (intersects.length > 0) {
        const model = intersects[0].object.parent
        if(!model) return
        // 双击操作
        setDoubleClick(model)
      }
    }

    // 点击操作
    const setClick = async(model) => {
      if(model.parent){
        let id = model.parent.userData.id
        console.log("id---", id)
      }
    }

    // 双击操作
    const setDoubleClick = async(model) => {
      if(model.parent){
        let id = model.parent.userData.id
        console.log("id---", id)
      }
    }

    // 销毁
    onBeforeUnmount(() => {
      console.log('触发 onUnmounted-------------')
      if (state) {
        state.dispose()
        state = {}
      }
    })
    
    return {
      initGui,
      drawThree,
    }
	}

  



