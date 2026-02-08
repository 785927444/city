import { Object3D, Shape, ExtrudeGeometry, Mesh } from "three"
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer'
import { topFaceMaterial, sideMaterial, lineMaterial } from './mapMaterial' 
import { createLightPillar } from './MapMarkPillar'
import { createMapLine } from './MapLine'
import { random } from '@/utils/common'

const extrudeSettings = {depth: 3.5, bevelEnabled: true, bevelSegments: 1, bevelThickness: 0.1}
// 创建区域
export function initArea(properties, projection, coordinates, mapGroup, scale) {
  // 实列对象
	const area = new Object3D()
  // 旋转角度
  area.rotateX(Math.PI)
  // 循环坐标 绘制shape、border
  coordinates.forEach((multiPolygon) => {
    const shape = new Shape()
    const border = new Object3D()
    multiPolygon.forEach((polygon) => {
      const pointsArray = new Array()
      for (let i = 0; i < polygon.length; i++) {
        let [x, y] = projection(polygon[i])
        pointsArray.push(x, y, 0)
        if (i === 0) {
          shape.moveTo(x, y)
        }
        shape.lineTo(x, y)
      }
      // 地图拉伸
      const geometry = new ExtrudeGeometry(shape, extrudeSettings)
      const mesh = new Mesh(geometry, [topFaceMaterial, sideMaterial])
      if (properties.name) {
        mesh.name = `地图`
        mesh.userData.name = properties.name
        mesh.userData.adcode = properties.adcode
      }
      // 地图边界
      initBorder(pointsArray, border, mesh)
      // 添加到区域
      area.add(mesh)
    })
  })
  // 地图名称
  initLabel(properties, projection, area)
  // 地图光柱
  initLightPoint(properties, projection, area, scale)
  // 地图数据
  mapGroup.add(area)
}

// 创建边界
export function initBorder(pointsArray, border, mesh) {
  const geometryLine = new LineGeometry()
  geometryLine.setPositions(pointsArray)
  const line = new Line2(geometryLine, lineMaterial);
  line.computeLineDistances()
  border.add(line)
  mesh.add(border)
}

// 创建标签
export function initLabel(properties, projection, area) {
  if (!properties.centroid && !properties.center) {
    return false
  }
  const div = document.createElement('div')
  div.style.position = 'absolute'
  div.className = 'mapDiv'
  div.innerHTML = `<div class="mapSpan i29 f10">${properties.name}</div>`
  let label = new CSS2DObject(div)
  let position = properties.centroid || properties.center
  position = projection(position)
  label.position.set(...position, 0.5)
  area.add(label)
}

// 创建光柱
export function initLightPoint(properties, projection, area, scale) {
  if (!properties.centroid && !properties.center) {
    return false
  }
  let heightScaleFactor = random(-20, 20)
  if(heightScaleFactor < 0 || heightScaleFactor % 2 == 0) return
  let position = properties.centroid || properties.center
  position = projection(position)
  let light = createLightPillar(...position, heightScaleFactor, {scaleFactor: 1 / scale})
  // light.rotateX(-Math.PI)
  // light.position.set(...position, -0.5)
  area.add(light)
}

// 创建顶部底部边线
export function initBorderLine(data, projection, mapGroup) {
  let lineTop = createMapLine(data, {color: 0xffffff, linewidth: 1, transparent: true, depthTest: false}, "Line2", projection)
  lineTop.position.z += 0.305
  let lineBottom = createMapLine(data, {color: 0x61fbfd, linewidth: 2,	depthTest: false}, "Line2")
  lineBottom.position.z -= 0.1905
  mapGroup.add(lineTop)
  mapGroup.add(lineBottom)
}

