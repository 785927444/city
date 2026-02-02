import { FileLoader } from 'three';
const loader = new FileLoader();
loader.responseType = "json";


export default class FilesLoader {
  constructor() {
    this.progress = 0
  }
  /**
  * 加载文件
  * @param url 文件的路径
  */
  async loadFile(url) {
    try {
      let data = await loader.loadAsync(url, event => {
        this.progress = (event.loaded / event.total).toFixed(2)
      })
      return data = JSON.parse(data)
    } catch (error) {
      console.log(error)
    }
  }
  async loadFile2(url) {
    return await new Promise((resolve) => {
       loader.load(url, (res) => {
        resolve(res)
      });
    })
  }
}