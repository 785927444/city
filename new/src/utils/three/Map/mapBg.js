import * as THREE from "three"
import { createSequenceFrame } from './SequenceFrameAnimate'
import { random } from '@/utils/common'
// 贴图
const texture = new THREE.TextureLoader()
const rotatingApertureTexture = texture.load("china/rotatingAperture.png")
const rotatingPointTexture = texture.load("china/rotating-point.png")
const particleTexture = texture.load("china/lizi.png")
const circlePoint = texture.load("china/circle-point.png")
const sceneBg = texture.load("china/scene-bg.png")
const bottomZ = -0.2

// 初始化旋转光圈
export function initRotatingAperture(width, centerXY, bgGroup) {
  let plane = new THREE.PlaneGeometry(width, width)
  let material = new THREE.MeshBasicMaterial({
    map: rotatingApertureTexture,
    transparent: true,
    opacity: 1,
    depthTest: true,
  })
  let mesh = new THREE.Mesh(plane, material)
  mesh.position.set(...centerXY, -4.5)
  // mesh.scale.set(1.1, 1.1, 1.1)
	mesh.scale.set(0.85, 0.85, 0.85)
  bgGroup.add(mesh)
  return mesh
}

// 初始化旋转点
export function initRotatingPoint(width, centerXY, bgGroup) {
	let plane = new THREE.PlaneGeometry(width, width)
	let material = new THREE.MeshBasicMaterial({
		map: rotatingPointTexture,
		transparent: true,
		opacity: 1,
		depthTest: true,
	})
	let mesh = new THREE.Mesh(plane, material)
	mesh.position.set(...centerXY, bottomZ - 0.02)
	mesh.scale.set(1.05, 1.05, 1.05)
	bgGroup.add(mesh)
	return mesh
}

// 初始化粒子
export function initParticle(bound, bgGroup) {
	// 获取中心点和中间地图大小
	let { center, size } = bound
	// 构建范围，中间地图的2倍
	let minX = center.x - size.x
	let maxX = center.x + size.x
	let minY = center.y - size.y
	let maxY = center.y + size.y
	let minZ = -6
	let maxZ = 6

	let particleArr = []
  let particleGroup = new THREE.Group()
	for (let i = 0; i < 16; i++) {
		const particle = createSequenceFrame({
      texture: particleTexture,
			image: "",
			width: 180,
			height: 189,
			frame: 9,
			column: 9,
			row: 1,
			speed: 0.5,
		})
		let particleScale = random(5, 20) / 100
		particle.scale.set(particleScale, particleScale, particleScale)
		particle.rotation.x = Math.PI / 2
		let x = random(minX, maxX)
		let y = random(minY, maxY)
		let z = random(minZ, maxZ)
		particle.position.set(x, y, z)
		particleArr.push(particle)
    particleGroup.add(particle)
	}
  bgGroup.add(particleGroup)
	return particleArr
}

// 初始化原点
export function initCirclePoint(width, centerXY, bgGroup) {
  let plane = new THREE.PlaneGeometry(width, width)
  let material = new THREE.MeshPhongMaterial({
    color: 0x409eff,
    map: circlePoint,
    transparent: true,
    opacity: 1,
    // depthTest: false,
  })
  let mesh = new THREE.Mesh(plane, material)
  mesh.position.set(...centerXY, bottomZ - 0.1)
  // let mesh2 = mesh.clone()
  // mesh2.position.set(...centerXY, bottomZ - 0.001)
  bgGroup.add(mesh)
}

// 初始化背景
export function initSceneBg(width, centerXY, bgGroup) {
  let plane = new THREE.PlaneGeometry(width * 4, width * 4)
  let material = new THREE.MeshPhongMaterial({
    // color: 0x061920,
    color: 0x409eff,
    map: sceneBg,
    transparent: true,
    opacity: 1,
    depthTest: true,
  })
  let mesh = new THREE.Mesh(plane, material)
  mesh.position.set(...centerXY, bottomZ - 0.2)
  bgGroup.add(mesh)
}