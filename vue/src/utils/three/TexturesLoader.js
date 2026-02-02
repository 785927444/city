import { TextureLoader } from 'three';
const texture = new TextureLoader()


export default class TexturesLoader {
  constructor() {
    this.progress = 0
  }
  /**
  * 加载贴图
  * @param url 贴图的路径
  */
  async loadFile(url) {
    try {
      const data = texture.load(url)
      return 	data
    } catch (error) {
      console.log(error)
    }
  }
}