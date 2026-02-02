// 引入three.js
import { Cache, WebGLRenderer, PerspectiveCamera, Scene, PCFSoftShadowMap, SRGBColorSpace, Color, AxesHelper, GridHelper, CameraHelper } from "three"
import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer" 
import { CSS3DRenderer } from "three/examples/jsm/renderers/CSS3DRenderer"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import Stats from "three/examples/jsm/libs/stats.module"
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'
import TWEEN from '@tweenjs/tween.js'
import Lights from "./Lights"
import SkyBoxs from './SkyBoxs'
import ModelLoader from './ModelLoader'
import TexturesLoader from './TexturesLoader'
import FilesLoader from './FilesLoader'
import Labels from './Labels'
import ThreeMouseEvent from "./ThreeMouseEvent"
import ThreeMouseEvents from "./ThreeMouseEvents"

export default class Viewer {
  constructor(id = "container", options = {}) {
    Cache.enabled = true
    let defaultOptions = {
      sky: false,
      isFull: true,
      guiVisibel: false,
      statsVisibel: false,
      cameraHelperVisibel: false,
      axesHelpeVisibel: false,
      gridHelperVisibel: false,
      width: window.innerWidth,
      height: window.innerHeight,
      bgColor: 0x000000,
      materialColor: 0xff0000,
      controls: {
        visibel: true, // 是否开启
        enableDamping: true, // 阻尼
        dampingFactor: 0.4, // 阻尼系数
        autoRotate: false, // 自动旋转
        minPolarAngle: -Math.PI, // 相机垂直旋转角度的下限
        maxPolarAngle: Math.PI / 2.01, // 相机垂直旋转角度的上限
        target: undefined, // 锁定目标点
      },
    }
    Object.keys(defaultOptions).forEach(key => {
      if (!(key in options)) { 
        options[key] = defaultOptions[key]; 
      }
    })
    this.options = options
    this.id = id
    this.dom = document.getElementById(id)
    this.scene = undefined
    this.camera = undefined
    this.renderer = undefined
    this.controls = undefined
    this.animateEventList = []
    this.labelRenderer = undefined
    this.css3DRenderer = undefined
    this.isAnimating = false  // 控制动画状态
    this.animRequestId = null  // 用于存储请求的动画帧 ID
    this.modelLoader = null
    this.labelIns = null
    this.skyboxs = null
    this.gui = null;
    this.initViewer()
    // window.addEventListener("resize", this.resize)
  }
  initViewer() {
    this.initScene()
    this.initCamera()
    this.initRenderer()
    this.initControl()
    this.initLight()
    this.initModelLoader()
    this.initTexturesLoader()
    this.initFilesLoader()
    this.initLabels()
    const animate = () => {
      if (!this.isAnimating) return; 
      requestAnimationFrame(animate)
      this.updateDom()
      this.renderDom()
      // 全局的公共动画函数，添加函数可同步执行
      this.tween()
      this.animateEventList.forEach(event => {
          // event.fun && event.content && event.fun(event.content)
          event.fun?.(event.content)
      })
    }
    this.isAnimating = true
    animate()
    // 辅助***********
    this.Gui()
    this.addStats()
    this.CameraHelper()
    this.AxesHelper()
    this.GridHelper()
  }

  /**
  * 渲染场景
  */
  initScene() {
    this.scene = new Scene()
    // 背景色
    // this.scene.background = new Color(this.options.bgColor)
    // this.css3dScene = new Scene()
  }
  /**
  * 渲染相机
  */
   initCamera() {
    // 设置45°的透视相机, 更符合人眼观察
    let width = this.dom.offsetWidth
    let height = this.dom.offsetHeight
    this.camera = new PerspectiveCamera(45, width / height, 0.1, 20000);
    // 相机位置
    this.camera.position.set(-50, 50, 50) 
    // 相机方向
    this.camera.lookAt(0, 0, 0) 
  }
  /**
  * 初始化控制
  */
   initControl() {
    if (!this.options.controls.visibel) return false;
    // 轨道控制器，使相机围绕目标进行轨道运动（旋转|缩放|平移）
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.minPolarAngle = this.options.controls.minPolarAngle;
    this.controls.maxPolarAngle = this.options.controls.maxPolarAngle;
    this.controls.autoRotate = this.options.controls.autoRotate;
    this.controls.enableDamping = this.options.controls.enableDamping;
    this.controls.dampingFactor = this.options.controls.dampingFactor;
  }
  /**
  * 渲染器
  */
  initRenderer() {
    // 初始化渲染器
    this.renderer = new WebGLRenderer({
      antialias: true,               // true/false表示是否开启反锯齿
      alpha: true,                   // true/false 表示是否可以设置背景色透明
      precision: "highp",            // highp/mediump/lowp 表示着色精度选择
      premultipliedAlpha: true,      // true/false 表示是否可以设置像素深度（用来度量图像的分辨率）
      logarithmicDepthBuffer: true,  // true/false 表示是否使用对数深度缓冲，true性能不好
      preserveDrawingBuffer: false,  // true/false 表示是否保存绘图缓冲
      physicallyCorrectLights: true, // true/false 表示是否开启物理光照
    })
    this.renderer.clearDepth();                          // 设置深度缓冲区
    this.renderer.shadowMap.enabled = true               // 场景中的阴影自动更新
    this.renderer.shadowMap.type = PCFSoftShadowMap      // 阴影质量 1.THREE.BasicShadowMap（标准阴影贴图，耗性能低，质量差） 2.THREE.PCFShadowMap（阴影边缘平滑，兼顾效果和性能） 3.THREE.PCFSoftShadowMap（柔和，耗性能高，效果好） 4.THREE.VSMShadowMap（可变级别，处理大面积光源， 性能和效果的平衡）
    this.renderer.outputColorSpace = SRGBColorSpace      // 可以看到更亮的材质，同时这也影响到环境贴图。
    this.dom.appendChild(this.renderer.domElement)       // 将渲染器添加到画布中
    // 二维标签
    this.labelRenderer = new CSS2DRenderer() // 标签渲染器
    this.labelRenderer.domElement.style.zIndex = 2
    this.labelRenderer.domElement.style.position = 'absolute'
    this.labelRenderer.domElement.style.top = '0px'
    this.labelRenderer.domElement.style.left = '0px'
    this.labelRenderer.domElement.style.pointerEvents = 'none'// 避免HTML标签遮挡三维场景的鼠标事件
    this.dom.appendChild(this.labelRenderer.domElement)
    // 三维标签
    this.css3DRenderer = new CSS3DRenderer() // 标签渲染器
    this.css3DRenderer.domElement.style.zIndex = 2
    this.css3DRenderer.domElement.style.position = 'absolute'
    this.css3DRenderer.domElement.style.top = '0px'
    this.css3DRenderer.domElement.style.left = '0px'
    this.css3DRenderer.domElement.style.pointerEvents = 'none'// 避免HTML标签遮挡三维场景的鼠标事件
    this.dom.appendChild(this.css3DRenderer.domElement)
  }
  /**
  * 渲染DOM
  */
  renderDom() {
    if(this.renderer) this.renderer.render(this.scene, this.camera) // 渲染场景
    if(this.labelRenderer) this.labelRenderer.render(this.scene, this.camera) // 渲染2d标签场景
    if(this.css3DRenderer) this.css3DRenderer.render(this.scene, this.camera) // 渲染3d标签场景
    // if(this.css3DRenderer) this.css3DRenderer.render(this.css3dScene, this.camera) // 渲染3d标签场景
  }
  /**
  * 更新DOM
  */
  updateDom() {
    let width = this.dom.offsetWidth
    let height = this.dom.offsetHeight
    // 控制相机旋转缩放的更新
    if(this.controls && this.options.controls.visibel) {
      this.controls.update()
    }
    if(this.camera) this.camera.aspect = width / height // 摄像机视锥体的长宽比，通常是使用画布的宽/画布的高
    if(this.camera) this.camera.updateProjectionMatrix() // 更新摄像机投影矩阵 在任何参数被改变以后必须被调用,来使得这些改变生效
    if(this.renderer) this.renderer.setSize(width, height) // 设置渲染器的尺寸
    if(this.renderer) this.renderer.setPixelRatio(window.devicePixelRatio * 1.5) // 设置渲染器的像素比
    if(this.labelRenderer) this.labelRenderer.setSize(width, height) // 设置标签渲染器的尺寸
    if(this.css3DRenderer) this.css3DRenderer.setSize(width, height) // 设置标签渲染器的尺寸
  }
  /**
  * 初始化灯光
  */
  initLight() {
    if (!this.lights) {
      this.lights = new Lights(this)
      // 添加环境光
      this.lights.addAmbientLight({color: 0xffffff, intensity: 1}) 
      // 添加平行光
      this.lights.addDirectionalLight([-10, 50, 20], { color: 0xffffff, intensity: 3 })
      // 天空盒
      if(!this.options.sky) return
      this.skyboxs = new SkyBoxs(this)
      this.setSky(this.options.sky)
    }
  }
  setSky(sky) {
    // 获取环境光
    const ambientLight = this.scene.getObjectByProperty('type', 'AmbientLight')
    // 获取平行光
    const directionalLight = this.scene.getObjectByProperty('type', 'DirectionalLight')
    // 获取聚合光
    const spotLights = this.scene.getObjectsByProperty('type', 'SpotLight')
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
    this.skyboxs.setSkybox(sky)
  }
  /**
  * 初始化模型渲染器
  */
  initModelLoader(){
    this.modelLoader = new ModelLoader(this)
  }
  /**
  * 初始化贴图渲染器
  */
  initTexturesLoader(){
    this.texturesLoader = new TexturesLoader(this)
  }
  /**
  * 初始化文件加载器
  */
  initFilesLoader(){
    this.filesLoader = new FilesLoader()
  }
  /**
  * 实例化标签
  */
  initLabels() {
    this.labelIns = new Labels(this)
  }
  /**
  * 添加全局的动画事件
  * @param animate 函数加参数对象
  * 传入对象 = {
        fun: 函数名称,
        content: 函数参数
    }
  */
  addAnimate(animate) {
    this.animateEventList.push(animate)
  }
  /**
  * 移除全局的动画事件
  * @param animate 函数加参数对象
  * 传入对象 = {
          fun: 函数名称,
          content: 函数参数
      }
  */
  removeAnimate(animate) {
    this.animateEventList.map((val, i) => {
      if (val === animate || val.fun.name === animate.fun.name ){
        this.animateEventList.splice(i, 1)
      }
    })
  }
  /**
  * 开启鼠标事件
  * @param {*} mouseType 鼠标类型
  * @param {*} isSelect 是否选中
  * @param {*} callback 鼠标回调
  */
  startSelectEvent(mouseType, isSelect, callback) {
    if (!this.mouseEvent) {
      this.mouseEvent = new ThreeMouseEvent(this, isSelect, callback, mouseType)
    }
    this.mouseEvent.startSelect()
  }
  /**
  * 关闭鼠标事件
  */
  stopSelectEvent() {
    this.mouseEvent?.stopSelect()
  }
  /**
  * 开启鼠标事件2
  * @param {*} mouseType 鼠标类型
  * @param {*} isSelect 是否选中
  * @param {*} callback 鼠标回调
  */
   startSelectEvents(mouseType, isSelect, callback) {
    if (!this.mouseEvents) {
      this.mouseEvents = new ThreeMouseEvents(this, isSelect, callback, mouseType)
    }
    this.mouseEvents.startSelects()
  }
  /**
  * 关闭鼠标事件
  */
  stopSelectEvent() {
    this.mouseEvent?.stopSelect()
  }
  
  /**
  * 关闭销毁
  */
  dispose() {
    // 停止动画事件
    this.isAnimating = false // 停止动画
    if (this.animRequestId) {
      cancelAnimationFrame(this.animRequestId); // 取消请求动画帧
      this.animRequestId = null // 清空 ID
    }
    // 停止鼠标事件
    this.stopSelectEvent()

    // 移除事件监听器，如果你有使用的话
    window.removeEventListener("resize", this.resize)

    // 清理动画事件
    this.animateEventList.length = 0

    // 清理渲染器
    if (this.renderer) {
      this.renderer.forceContextLoss() // 强制丢失WebGL上下文，这对于释放资源很有帮助
      this.renderer.dispose()
      this.renderer.content = null;
      let gl = this.renderer.domElement.getContext("webgl")
      if (gl && gl.getExtension("WEBGL_lose_context")) {
        gl.getExtension("WEBGL_lose_context").loseContext()
      }
      console.log('Renderer disposed')
    }
    
    // 清理标签渲染器
    if (this.labelRenderer && typeof this.labelRenderer.dispose === 'function') {
        this.labelRenderer.dispose();
    } else {
        console.warn('labelRenderer dispose method not available');
    }

    if (this.css3DRenderer && typeof this.css3DRenderer.dispose === 'function') {
      this.css3DRenderer.dispose();
    } else {
      console.warn('labelRenderer dispose method not available');
    }

    // 清理场景中的所有对象
    if (this.scene) {
      // 清除场景中的所有物体
      this.destroySceneObjects(this.scene)
    }
    // 清理材质与物体
    this.scene.traverse((child) => {
      if (child.material) {
        child.material.dispose()
      }
      if (child.geometry) {
        child.geometry.dispose()
      }
      child = null
    })
    // 清理场景
    this.scene.clear()

    // 清除其他可能的引用
    this.dom.removeChild(this.renderer.domElement);
    this.dom.removeChild(this.labelRenderer.domElement);
    this.dom.removeChild(this.css3DRenderer.domElement);
    
    // 清空所有引用，以便垃圾回收
    this.renderer = null;
    this.labelRenderer = null;
    this.css3DRenderer = null;
    this.scene = null;
    this.camera = null;
    this.controls = null;
  }

  /**
  * 清空dom
  */
  empty(elem) {
    while (elem && elem.lastChild) elem.removeChild(elem.lastChild);
  }

  /**
  * 销毁对象
  */
  destroySceneObjects(scene) {
    while (scene.children.length > 0) {
      const child = scene.children[0]; // 获取第一个孩子
      if (child.isMesh) {
        if (child.geometry) {
          child.geometry.dispose(); // 清理几何体
        }
        if(child.material){
          if (Array.isArray(child.material)) {
            child.material.forEach(material => material.dispose()); // 清理材质
          } else {
            child.material.dispose(); // 清理单一材质
          }
        }
      }else if (child.isObject3D) {
        if (child.geometry) {
          child.geometry.dispose(); // 清理几何体
        }
        if(child.material){
          if (Array.isArray(child.material)) {
            child.material.forEach(material => material.dispose()); // 清理材质
          } else {
            child.material.dispose(); // 清理单一材质
          }
        }
        this.destroySceneObjects(child); // 递归处理 isObject3D
      } else if (child.isGroup) {
        console.log("isGroup")
        this.destroySceneObjects(child); // 递归处理 Group
      } else if (child instanceof CSS2DObject) {
        console.log("CSS2DObject")
        if (child.element) {
          child.element.remove(); // 从 DOM 中移除
        }
      }
      scene.remove(child); // 从 scene 中移除对象
    }
  }

  /**
   * 添加对象到场景
   * @param {*} object  {} []
   */
  addObject(object) {
    if (isType('Array', object)) {
      this.scene.add(...object);
    } else {
      this.scene.add(object);
    }
  }
  /**
   * 移除对象
   * @param {*} object {} []
   */
  removeObject(object) {
    if (isType('Array', object)) {
      object.map((item) => {
        item.geometry.dispose();
      });
      this.scene.remove(...object);
    } else {
      object.geometry.dispose();
      this.scene.remove(object);
    }
  }
  /**
  * 添加tween动画
  */
  tween(){
    TWEEN.update()
  }
  /**
  * 添加参数调试
  */
  Gui(model){
    if (!this.options.guiVisibel) return
    this.gui = this.gui || new GUI()
    if(model){
      // gui.add(event, "fuc").name("方法")
      // gui.add(model.position, "x", 10, 10).name("model的x轴位置")
      gui.add(model.position, "x", 1, 100).name("x轴位置")
      gui.add(model.position, "y", 1, 100).name("y轴位置")
      gui.add(model.position, "z", 1, 100).name("z轴位置")
    }
  }
  /**
  * 添加状态检测
  */
  addStats() {
    if (!this.options.statsVisibel) return
    if (!this.statsControls) {
      this.statsControls = new Stats()
    }
    this.statsControls.dom.style.position = 'absolute'
    this.dom.appendChild(this.statsControls.dom)
    // 添加到动画
    this.statsUpdateObj = {
      fun: this.statsUpdate,
      content: this.statsControls
    }
    this.addAnimate(this.statsUpdateObj)
  }
  /**
  * 添加相机助手
  */
  CameraHelper() {
    if (!this.options.cameraHelperVisibel) return
    this.scene.add(new CameraHelper(this.camera))
  }
  /**
  * 添加坐标轴
  */
  AxesHelper(val) {
    if (!this.options.axesHelpeVisibel) return
    // 显示坐标轴(x轴: 红色; y轴: 绿色; z轴: 蓝色)
    // x轴水平方向(右正); y轴垂直方向(上正); z轴垂直xy平面即屏幕(外正)
    this.scene.add(new AxesHelper(val??200))
  }
  /**
  * 添加网格地面
  */
  GridHelper(val) {
    if (!this.options.gridHelperVisibel) return
    this.scene.add(new GridHelper(val??200, val??200, 0x444444, 'white'))
  }
  /**
  * 移除状态检测
  */
  removeStats() {
    if (this.statsControls && this.statsUpdateObj) {
      this.dom.removeChild(this.statsControls.dom)
      this.removeAnimate(this.statsUpdateObj)
    }
  }
  /**
  * 更新状态检测
  */
  statsUpdate(statsControls) {
    statsControls.update()
  }

} 
