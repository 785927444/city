<template>
	<div id="mapContainer" class="mapContainer">
		<!-- 右上角功能按钮区 -->
		<div class="map-controls">
			<button class="control-btn" title="工具箱" :class="{ active: showToolbox }" @click="toggleToolbox">
				<img :src="toolboxIcon" alt="工具箱" class="control-icon" @error="handleIconError" />
			</button>
		</div>

		<!-- 工具箱面板（仅保留要素绘制） -->
		<div v-if="showToolbox" class="toolbox-panel" :style="{ top: `${70}px`, right: `${70}px` }">
			<div class="toolbox-title">工具箱</div>

			<!-- 要素绘制模块 -->
			<div class="tool-module">
				<div class="module-title">要素绘制</div>
				<div class="tool-btns">
					<button
						class="tool-btn"
						title="线绘制"
						:class="{ active: currentTool.type === 'draw' && currentTool.subType === 'line' }"
						@click="startDraw('line')"
					>
						<img :src="lineIcon" alt="线绘制" class="tool-icon" @error="handleIconError" />
					</button>
					<button
						class="tool-btn"
						title="矩形绘制"
						:class="{ active: currentTool.type === 'draw' && currentTool.subType === 'rectangle' }"
						@click="startDraw('rectangle')"
					>
						<img :src="rectangleIcon" alt="矩形绘制" class="tool-icon" @error="handleIconError" />
					</button>
					<button
						class="tool-btn"
						title="多边形绘制"
						:class="{ active: currentTool.type === 'draw' && currentTool.subType === 'polygon' }"
						@click="startDraw('polygon')"
					>
						<img :src="polygonIcon" alt="多边形绘制" class="tool-icon" @error="handleIconError" />
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive } from 'vue'
import { OlMap } from '@/utils/GIS/olMapUtil/olMapUtils'
import { ElMessage } from 'element-plus'
import { defaultDrawTool } from '@/utils/GIS/olMapUtil/olDrawTool'

// 导入图标
// import toolboxIcon from '@/assets/images/tools.png'
// import rectangleIcon from '@/assets/images/rectangle2.png'
// import polygonIcon from '@/assets/images/polygon.png'
// import lineIcon from '@/assets/images/line.png'

// 地图实例 & 状态管理
const mapdata = defineModel('mapdata')
const mapInstance = ref<OlMap | null>(null)
const showToolbox = ref(false)

// 当前激活的工具
const currentTool = reactive({
	type: '',
	subType: ''
})

// 地图初始化配置
const MAP_INIT_CONFIG = {
	center: [112.5497, 37.8706] as [number, number],
	zoom: 11,
	maxZoom: 18,
	duration: 500
}

// 初始化地图
const initMap = () => {
	// let center = mapdata.value? JSON.parse(mapdata.value) : MAP_INIT_CONFIG.center
	// console.log("center---", center)
	try {
		const map = new OlMap({
			mapDiv: 'mapContainer',
			center: MAP_INIT_CONFIG.center,
			zoom: MAP_INIT_CONFIG.zoom,
			maxZoom: MAP_INIT_CONFIG.maxZoom
		})
		map.initMap()
		mapInstance.value = map

		if(mapdata.value){
			// let coordinates2= JSON.parse(mapdata.value)
			// console.log("coordinates2", coordinates2)
			const coordinates = [
				[112.580891, 37.784057],
				[112.735471, 37.784057],
				[112.735471, 37.878197],
				[112.580891, 37.878197],
			]

			defaultDrawTool.fitToCoordinates(coordinates)

			// defaultDrawTool.addPolygon(coordinates, {
			// 	fillColor: 'rgba(255, 0, 0, 0.3)',
			// 	strokeColor: 'blue',
			// 	strokeWidth: 2,
			// 	autoClose: true // 自动闭合多边形（默认true）
			// })
		}


	} catch (error) {
		console.error('地图初始化失败：', error)
	}
}

const toggleToolbox = () => {
	showToolbox.value = !showToolbox.value
	if (!showToolbox.value) {
		clearToolState()
	}
}

const clearToolState = () => {
	currentTool.type = ''
	currentTool.subType = ''

	// 停用绘制工具并清理图层
	defaultDrawTool.deactivate(false)

	// 清除地图的所有临时交互和图层
	if (mapInstance.value) {
		mapInstance.value.clearAllTools()
	}
}

const startDraw = (type: 'line' | 'rectangle' | 'polygon') => {
	// 彻底清除原有工具状态
	clearToolState()
	currentTool.type = 'draw'
	currentTool.subType = type

	// 校验地图实例
	const map = mapInstance.value
	if (!map || !map.state.map) {
		ElMessage.warning('地图未初始化，无法启动绘制')
		return
	}

	// 明确断言为OL原生Map实例
	const olMap = map.state.map as import('ol/Map').default
	if (!olMap) {
		ElMessage.error('获取地图实例失败，无法启动绘制')
		return
	}

	// 重新初始化绘制工具
	defaultDrawTool.initialize(olMap)

	// 绘制结束回调
	const drawEndCallback = (feature: import('ol/Feature').default) => {
		try {
			// 提取顶点坐标（4326坐标系）
			const vertices = defaultDrawTool.getGeometryVertices(feature)

			// 输出坐标（控制台+弹窗）
			console.log(`【${type}】绘制完成，顶点坐标：`, vertices)
			if(vertices) mapdata.value = JSON.stringify(vertices)
			const coordText = vertices.map(([lng, lat], index) => `顶点${index + 1}：${lng.toFixed(6)}, ${lat.toFixed(6)}`).join('\n')
			ElMessage.success(
				`【${type === 'line' ? '线' : type === 'rectangle' ? '矩形' : '多边形'}】绘制完成，共${vertices.length}个顶点,坐标信息：${coordText}`
			)

			// 只移除交互，保留图层
			defaultDrawTool.deactivate(true)
		} catch (error) {
			console.error('绘制完成后处理要素失败：', error)
			ElMessage.error('绘制要素添加到地图失败，请重试')
		}
	}

	// 根据类型启动绘制
	switch (type) {
		case 'line':
			defaultDrawTool.drawLineString(drawEndCallback)
			break
		case 'rectangle':
			defaultDrawTool.drawRectangle(drawEndCallback)
			break
		case 'polygon':
			defaultDrawTool.drawPolygon(drawEndCallback)
			break
	}
}

const handleIconError = (e: Event) => {
	const target = e.target as HTMLImageElement
	target.src =
		'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIGZpbGw9IiM2NjYiLz48cGF0aCBkPSJNMjAgMTBoLTJ2LTJoMnYyaTBNMjAgMTZ2LTRoLTJ2NGgyaTBNMTYgMTBoLTJ2LTJoMnYyaTBNMTYgMTZ2LTRoLTJ2NGgyaTBNMTIgMTBoLTJ2LTJoMnYyaTBNMTIgMTZ2LTRoLTJ2NGgyaTBNOCAxMHYtMmgtMnYyaDJNOCAxNnYtNGgtMnY0aDJNMTAgNnYyaC00VjZoNG0wIDJINnYtNmgyVjZoLTJ2LTJoMnYtMmg0djJoLTJ2MmgtNHYyaDR6IiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg=='
	target.alt = '默认图标'
}

// 生命周期
onMounted(() => {
	initMap()

})

onUnmounted(() => {
	if (mapInstance.value) {
		defaultDrawTool.deactivate()
		mapInstance.value.destroyMap()
		mapInstance.value = null
	}
})
</script>

<style lang="scss" scoped>
// 全局样式变量
$primary-color: #3b82f6;
$bg-white: rgba(255, 255, 255, 0.95);
$border-color: #ddd;
$hover-border: #666;
$active-bg: #e8f0fe;

.mapContainer {
	height: 91vh;
	position: relative;
	overflow: hidden;
}

// 右上角功能按钮区
.map-controls {
	position: absolute;
	top: 50px;
	right: 20px;
	display: flex;
	flex-direction: column;
	gap: 8px;
	z-index: 1000;

	.control-btn {
		width: 32px;
		height: 32px;
		background: rgba(255, 255, 255, 0.7);
		border: 1px solid $border-color;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;

		&:hover {
			background: #fff;
			border-color: $hover-border;
			transform: translateY(-1px);
		}

		&.active {
			background: $active-bg;
			border-color: $primary-color;
		}

		.control-icon {
			width: 26px;
			height: 26px;
			object-fit: contain;
		}
	}
}

// 工具箱面板
.toolbox-panel {
	position: absolute;
	background: $bg-white;
	border: 1px solid $border-color;
	border-radius: 6px;
	padding: 16px;
	z-index: 999;
	min-width: 200px;
	box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

	.toolbox-title {
		font-weight: 600;
		margin-bottom: 12px;
		text-align: center;
		font-size: 16px;
		border-bottom: 1px solid #eee;
		padding-bottom: 8px;
		color: #333;
	}

	.tool-module {
		margin-bottom: 16px;

		&:last-child {
			margin-bottom: 0;
		}

		.module-title {
			font-size: 14px;
			color: #666;
			margin-bottom: 8px;
			padding-left: 6px;
			border-left: 3px solid $primary-color;
			font-weight: 500;
		}

		.tool-btns {
			display: flex;
			gap: 8px;
			flex-wrap: wrap;

			.tool-btn {
				width: 44px;
				height: 44px;
				background: #f8f9fa;
				border: 1px solid $border-color;
				border-radius: 4px;
				cursor: pointer;
				display: flex;
				align-items: center;
				justify-content: center;
				transition: all 0.2s ease;

				&:hover {
					background: #eee;
					border-color: $primary-color;
				}

				&.active {
					background: $active-bg;
					border-color: $primary-color;
					box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
				}

				.tool-icon {
					width: 28px;
					height: 28px;
					object-fit: contain;
				}
			}
		}
	}
}

// 响应式适配
@media (max-width: 768px) {
	.toolbox-panel {
		right: 20px !important;
		top: 120px !important;
		min-width: 240px;
	}

	.map-controls {
		top: 10px;
		right: 10px;

		.control-btn {
			width: 40px;
			height: 40px;

			.control-icon {
				width: 28px;
				height: 28px;
			}
		}
	}
}
</style>
