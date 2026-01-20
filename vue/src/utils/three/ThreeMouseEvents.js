import * as THREE from 'three'

export default class ThreeMouseEvents {
  constructor(viewer, isSelect, callback, type = 'click') {
    this.viewer = viewer
    this.isSelect = isSelect
    this.callback = callback
    this.type = type
    return this
  }
  startSelects() {
    this.stopSelects()
    this.bingEvent = this.throttle(this.event.bind(this, this), 100)
    this.viewer.renderer.domElement.addEventListener(this.type, this.bingEvent)
  }
  stopSelects() {
    this.viewer.renderer.domElement.removeEventListener(this.type, this.bingEvent)
  }
  event(that, event) {  
    // 创建射线
    const raycaster = new THREE.Raycaster()
    // 创建鼠标坐标
    const mouse = new THREE.Vector2()
    // 将鼠标位置归一化为设备坐标。x 和 y 方向的取值范围是 (-1 to +1)
    mouse.x = (event.offsetX / that.viewer.renderer.domElement.clientWidth) * 2 - 1
    mouse.y = -(event.offsetY / that.viewer.renderer.domElement.clientHeight) * 2 + 1
    // 设置射线的起点和终点
    raycaster.setFromCamera(mouse, that.viewer.camera) 
    // TODO: 第一个参数是否需要外部传入，减小监听范围
    const intersects = raycaster.intersectObject(that.viewer.scene, true) // 检测射线与模型是否相交
    if (intersects.length > 0 && intersects[0]) {
      that.callback(intersects[0].object, intersects[0].point)
    }
  }
  throttle(func, delay) {
    let lastTime = 0;
    return function(...args) {
        const now = Date.now();
        if (now - lastTime >= delay) {
            lastTime = now;
            func.apply(this, args);
        }
    }
  }
}