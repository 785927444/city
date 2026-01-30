import { TextureLoader, MeshPhongMaterial, MeshLambertMaterial, MultiplyOperation, RepeatWrapping, MathUtils, Color } from "three"
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'

// 贴图
const texture = new TextureLoader()
const textureMap = texture.load("china/gz-map.jpg")
// 缩放因子
const scale = 0.0128
// 设置纹理重复
textureMap.repeat.set(scale, scale)
// 设置纹理偏移
textureMap.offset.set(0, 0)
// 环绕方式 水平（S
textureMap.wrapS = RepeatWrapping
// 环绕方式 垂直（T）
textureMap.wrapT = RepeatWrapping
// 禁止翻转
textureMap.flipY = false
// 旋转弧度
textureMap.rotation = MathUtils.degToRad(45)
// 地图图面
const topFaceMaterial = new MeshPhongMaterial({
  map: textureMap,
  // color: 0x569def,
  transparent: true,
  opacity: 0.9,
  combine: MultiplyOperation,
})
// 地图侧边
const sideMaterial = new MeshLambertMaterial({
  color: 0x276DD6,
  transparent: true,
  opacity: 0.9,
})
// 侧边材质uniform
const mapUf = {
  uTime: { value: 0.0 },
  uHeight: { value: 3.5 },
  uColor: { value: new Color("#016DD6") }, // 侧边过渡颜色
  color1: { value: new Color("#2E28A3") }, // 侧边渐变颜色1
  color2: { value: new Color("#FFFFFF") }, // 侧边渐变颜色2
  uStart: { value: -3.5 },
  uSpeed: { value: 6 },
};
// 在材质渲染前修改shader代码
sideMaterial.onBeforeCompile = (shader) => {
  shader.uniforms = {
    ...shader.uniforms,
    ...mapUf,
  };
  shader.vertexShader = shader.vertexShader.replace(
    "void main() {",
    `
      varying vec3 vPosition;
      void main() {
        vPosition = position;
    `
  );
  shader.fragmentShader = shader.fragmentShader.replace(
    "void main() {",
    `
      varying vec3 vPosition;
      uniform float uTime;
      uniform vec3 uColor;
      uniform float uSpeed;
      uniform float uStart;
      uniform float uHeight;
      uniform vec3 color1;
      uniform vec3 color2;
      void main() {
    `
  );
  shader.fragmentShader = shader.fragmentShader.replace(
    "#include <dithering_fragment>",
    `
    vec3 gradient = mix(color1, color2, vPosition.z/8.0);
    outgoingLight = outgoingLight*gradient;
    // outgoingLight = color1;
    
    // 开始的位置
    float y = uStart + uTime * uSpeed;
    // 高度
    float h = uHeight / 1.0;
    if(vPosition.z > y && vPosition.z < y + h * 1.0) {
        float per = 0.0;
        if(vPosition.z < y + h){
            per = (vPosition.z - y) / h;
            outgoingLight = mix(outgoingLight,uColor,per);
        }else{
            per = (vPosition.z - y - h) / h;
            outgoingLight = mix(uColor,outgoingLight,per);
        }
    }

    gl_FragColor = vec4( outgoingLight, diffuseColor.a );
    #include <dithering_fragment>
    `
  );   
}
// 地图分界
const lineMaterial = new LineMaterial({color: 0x60928b, linewidth: 1,	transparent: true, depthTest: false})

export { topFaceMaterial, sideMaterial, mapUf, lineMaterial }