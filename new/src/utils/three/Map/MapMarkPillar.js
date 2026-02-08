  import * as THREE from "three"
  import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer'
  import TWEEN from "@tweenjs/tween.js"
  import { deepMerge, random } from '@/utils/common'
  /**
   *
   * @param {object} {
   *  pointTextureUrl:标记点的图片url
   *  lightHaloTextureUrl:光圈的URL
   *  lightPillarUrl:光柱的URL
   *  scaleFactor:1 缩放系数，用来调整标记点和光圈的缩放大小
   * }
   *
   * @returns
   */
  // 纹理加载器
  const textureLoader = new THREE.TextureLoader()
  // 默认参数
  let defaultOptions = {
    pointTextureUrl: "china/biaozhu.png",
    lightHaloTextureUrl: "china/guangquan.png",
    lightPillarUrl: "china/guangzhu.png",
    radiusTop: 1,        // 圆柱顶部半径
    radiusBottom: 1,     // 圆柱底部半径（对于圆柱来说，顶部和底部可以相同）
    radialSegments: 32,  // 圆柱的段数
    scaleFactor: 1.2,    // 缩放系数
  }
  // 射线拾取对象
  const raycaster = new THREE.Raycaster()
  let containerWidth = window.width
  let containerHeight = window.height
  // 对象属性
  let getBoundingClientRect = null
  /**
   * 创建标记点
   * @param {*} R 地球半径，根据R来进行缩放
   * @returns
   */
  export function createPointMesh(lon, lat) {
    // 标记点：几何体，材质，
    const geometry = new THREE.PlaneGeometry(1, 1)
    const material = new THREE.MeshBasicMaterial({
      map: textureLoader.load(defaultOptions.pointTextureUrl),
      color: 0x00ffff,
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: false, //禁止写入深度缓冲区数据
    })
    let mesh = new THREE.Mesh(geometry, material)
    mesh.renderOrder = 97
    mesh.name = "createPointMesh"
    // 缩放
    const scale = 2.8 * defaultOptions.scaleFactor
    mesh.scale.set(scale, scale, scale)
    mesh.position.set(lon, lat, -0.5)
    return mesh
  }
  /**
   * 创建光圈
   * @param {*} R 地球半径，根据R来进行缩放
   * @returns
   */
  export function createLightHalo(lon, lat) {
    // 标记点：几何体，材质，
    const geometry = new THREE.PlaneGeometry(1, 1)
    const material = new THREE.MeshBasicMaterial({
      map: textureLoader.load(defaultOptions.lightHaloTextureUrl),
      color: 0x00ffff,
      side: THREE.DoubleSide,
      opacity: 0,
      transparent: true,
      depthWrite: false, //禁止写入深度缓冲区数据
    })
    let mesh = new THREE.Mesh(geometry, material)
    mesh.renderOrder = 98
    mesh.name = "createLightHalo"
    // 缩放
    const scale = 3.6 * defaultOptions.scaleFactor
    mesh.scale.set(scale, scale, scale)
    mesh.position.set(lon, lat, -0.5)
    // 动画延迟时间
    const delay = random(0, 2000)
    // 动画：透明度缩放动画
    mesh.tween1 = new TWEEN.Tween({ scale: scale, opacity: 0 })
      .to({ scale: scale * 1.5, opacity: 1 }, 1000)
      .delay(delay)
      .onUpdate((params) => {
        let { scale, opacity } = params
        mesh.scale.set(scale, scale, scale)
        mesh.material.opacity = opacity
      })
    mesh.tween2 = new TWEEN.Tween({ scale: scale * 1.5, opacity: 1 })
      .to({ scale: scale * 2, opacity: 0 }, 1000)
      .onUpdate((params) => {
        let { scale, opacity } = params
        mesh.scale.set(scale, scale, scale)
        mesh.material.opacity = opacity
      })
    mesh.tween1.chain(mesh.tween2)
    mesh.tween2.chain(mesh.tween1)
    mesh.tween1.start()
    return mesh
  }
  /**
   * 创建光柱
   * @param {*} lon
   * @param {*} lat
   * @param {*} heightScaleFactor 光柱高度的缩放系数
   * @returns
   */
  export function createLightPillar(lon, lat, heightScaleFactor = 1, options = {}) {
    Object.assign(defaultOptions, options)
    const group = new THREE.Object3D()
    // const group = new THREE.Group()
    // 柱体高度
    const height = 1 * heightScaleFactor
    // 柱体的geo,6.19=柱体图片高度/宽度的倍数
    const geometry = new THREE.CylinderGeometry(defaultOptions.radiusTop * defaultOptions.scaleFactor, defaultOptions.radiusBottom * defaultOptions.scaleFactor, height, defaultOptions.radialSegments)
    // 柱子材质
    const material = new THREE.MeshBasicMaterial({
      map: textureLoader.load(defaultOptions.lightPillarUrl),
      color: 0x00ffff,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
    // 光柱01
    let light01 = new THREE.Mesh(geometry, material)
    light01.name = "createLightPillar01"
    light01.rotateX(-Math.PI / 2)
    light01.position.set(lon, lat, -height / 2)
    // 光柱02：复制光柱01
    let light02 = light01.clone()
    light02.name = "createLightPillar02"
    // 光柱02，旋转90°，跟 光柱01交叉
    light02.rotateY(Math.PI / 2)
    // 文本
    const div = document.createElement('div')
    div.style.position = 'absolute'
    div.className = 'lightspan'
    div.innerHTML = `<span>${height}</span>`
    const label = new CSS2DObject(div)
    label.position.set(lon, lat, -height - 3)
    // 创建底部标点
    const bottomMesh = createPointMesh(lon, lat)
    // 创建光圈
    const lightHalo = createLightHalo(lon, lat)
    // 将光柱和标点添加到组里
    group.add(bottomMesh, lightHalo, light01, light02, label)
    return group
  }
  /**
   * 设置光柱颜色
   * @param {*} group
   * @param {*} color
   */
  export function setLightPillarColor(group, color) {
    group.children.forEach((item) => {
      item.material.color = new THREE.Color(color)
    })
  }
  /**
   * 射线拾取，返回选中的mesh
   * @param {*} event
   * @param {*} container
   * @param {*} camera
   * @param {*} mesh // 光柱group
   * @returns
   */
   export function getRaycasterObj(event, container, camera, mesh) {
    //屏幕坐标转WebGL标准设备坐标
    if (!getBoundingClientRect) {
      getBoundingClientRect = container.getBoundingClientRect()
      containerWidth = container.offsetWidth
      containerHeight = container.offsetHeight
    }
    var x = ((event.clientX - getBoundingClientRect.left) / containerWidth) * 2 - 1
    var y = -((event.clientY - getBoundingClientRect.top) / containerHeight) * 2 + 1
    //通过鼠标单击位置标准设备坐标和相机参数计算射线投射器`Raycaster`的射线属性.ray
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera)
    //返回.intersectObjects()参数中射线选中的网格模型对象
    // 未选中对象返回空数组[],选中一个数组1个元素，选中两个数组两个元素
    var intersects = raycaster.intersectObjects(mesh)
    return intersects
  }
  /**
   * 选择光柱，返回选择的对象
   * @param {*} event
   * @param {*} container
   * @param {*} camera
   * @param {*} mesh
   * @returns 返回选择的对象
   */
  export function chooseLightPillar(event, container, camera, mesh) {
    event.preventDefault()
    // 获取拾取的对象数组
    let intersects = getRaycasterObj(event, container, camera, mesh)
    // 大于0说明，说明选中了mesh,返回对象
    if (intersects.length > 0) {
      return intersects[0]
    }
    return null
  }
