import { InteractiveGroup } from "three/examples/jsm/interactive/InteractiveGroup"
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer'
import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer"

export default class Labels {
  constructor(viewer) {
    this.viewer = viewer
    this.group = new InteractiveGroup(this.viewer.renderer, this.viewer.camera) // 创建交互对象
    this.viewer.scene.add(this.group)
  }
  /**
   * 添加2d标签
   * @param {*} position 
   * @param {*} html html内容
   */
  addCss2dLabel(position = { x: 0, y: 0, z: 0 }, html = "", className = "element") {
    // 如果已经存在标签，先将其从场景中移除
    // if (this.label) {
    //   this.viewer.scene.remove(this.label); // 从场景中移除旧的标签
    //   this.label.element.remove(); // 从DOM中移除旧标签的元素
    // }
    const div = document.createElement('div')
    div.style.position = 'absolute'
    div.className = className
    div.innerHTML = html
    this.label = new CSS2DObject(div)
    this.label.position.set(position.x, position.y, position.z)
    this.viewer.scene.add(this.label)
    return this.label
  }

  /**
   * 添加2d标签
   * @param {*} position 
   * @param {*} html html内容
   */
   addCss2dLabelId(id, position = { x: 0, y: 0, z: 0 }, html = "", className = "element") {
    // 根据 ID 查找并移除已存在的标签
    const existingLabel = Array.from(this.viewer.scene.children).find(child => {
        return child instanceof CSS2DObject && child.element.getAttribute('data-id') === id;
    });

    // 如果找到已有的标签，先将其从场景中移除
    if (existingLabel) {
        this.viewer.scene.remove(existingLabel); // 从场景中移除旧的标签
        existingLabel.element.remove(); // 从DOM中移除旧标签的元素
    }
    
    const div = document.createElement('div')
    div.setAttribute('data-id', id);
    div.style.position = 'absolute'
    div.className = className
    div.innerHTML = html
    this.label = new CSS2DObject(div)
    this.label.position.set(position.x, position.y, position.z)
    this.viewer.scene.add(this.label)
    return this.label
  }

  /**
   * 移除2d标签
   * @param {*} position 
   * @param {*} html html内容
   */
   delCss2dLabelId(id) {
    // 根据 ID 查找并移除已存在的标签
    const existingLabel = Array.from(this.viewer.scene.children).find(child => {
        return child instanceof CSS2DObject && child.element.getAttribute('data-id') === id;
    });

    // 如果找到已有的标签，先将其从场景中移除
    if (existingLabel) {
        this.viewer.scene.remove(existingLabel); // 从场景中移除旧的标签
        existingLabel.element.remove(); // 从DOM中移除旧标签的元素
    }
  }

  /**
   * 添加3d标签
   * @param {*} position 
   * @param {*} html html内容
   */
   addCss3dLabel(position = { x: 0, y: 0, z: 0 }, html = "", className = "element") {
    // 如果已经存在标签，先将其从场景中移除
    if (this.label) {
      this.viewer.scene.remove(this.label); // 从场景中移除旧的标签
      this.label.element.remove(); // 从DOM中移除旧标签的元素
    }
    const div = document.createElement('div')
    div.style.position = 'absolute'
    div.className = className
    div.innerHTML = html
    this.label = new CSS3DObject(div)
    this.label.position.set(position.x, position.y, position.z)
    this.viewer.scene.add(this.label)
    return this.label
  }

  /**
   * 添加3d标签
   * @param {*} position 
   * @param {*} html html内容
   */
   addCss3dLabelId(id, position = { x: 0, y: 0, z: 0 }, html = "", className = "element") {
    // 根据 ID 查找并移除已存在的标签
    const existingLabel = Array.from(this.viewer.scene.children).find(child => {
        return child instanceof CSS3DObject && child.element.getAttribute('data-id') === id;
    });
    // 如果找到已有的标签，先将其从场景中移除
    // if (existingLabel) {
    //     this.viewer.scene.remove(existingLabel); // 从场景中移除旧的标签
    //     existingLabel.element.remove(); // 从DOM中移除旧标签的元素
    // }
    const div = document.createElement('div')
    div.setAttribute('data-id', id);
    div.style.position = 'absolute'
    div.className = className
    div.innerHTML = html
    this.label = new CSS3DObject(div)
    this.label.position.set(position.x, position.y, position.z)
    this.viewer.scene.add(this.label)
    return this.label
  }

  /**
   * 移除3d标签
   * @param {*} position 
   * @param {*} html html内容
   */
   delCss3dLabelId(id) {
    // 根据 ID 查找并移除已存在的标签
    const existingLabel = Array.from(this.viewer.scene.children).find(child => {
        return child instanceof CSS3DObject && child.element.getAttribute('data-id') === id;
    });

    // 如果找到已有的标签，先将其从场景中移除
    if (existingLabel) {
        this.viewer.scene.remove(existingLabel); // 从场景中移除旧的标签
        existingLabel.element.remove(); // 从DOM中移除旧标签的元素
    }
  }
}
