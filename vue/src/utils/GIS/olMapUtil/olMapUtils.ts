import Map from 'ol/Map'
import View from 'ol/View'
import { defaults as Defaults } from 'ol/control.js'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import XYZ from 'ol/source/XYZ'
import { Draw } from 'ol/interaction'
import type { Extent } from 'ol/extent'
import type { ProjectionLike } from 'ol/proj'

//#region 接口定义
/** 地图初始化配置项 */
interface OlMapOptions {
	mapDiv: string
	center: [number, number]
	zoom?: number
	maxZoom?: number
	minZoom?: number
	projection?: ProjectionLike
}

/** 地图内部状态管理 */
interface OlMapState {
	map: Map | null
	tdtImgLayer: TileLayer<XYZ> | null
	tdtImgAnoLyr: TileLayer<XYZ> | null
	tdtVecLayer: TileLayer<XYZ> | null
	tdtVecAnoLyr: TileLayer<XYZ> | null
}
//#endregion

/**
 * 地图核心类 - 仅保留初始化和绘制辅助功能
 */
export class OlMap {
	// 配置项
	private readonly options: OlMapOptions
	// 地图状态
	public state: OlMapState
	// 地图投影
	private readonly projection: ProjectionLike

	constructor(options: OlMapOptions) {
		const DEFAULT_CONFIG = {
			zoom: 11,
			maxZoom: 18,
			minZoom: 6,
			projection: 'EPSG:4326' as ProjectionLike
		}

		// 合并配置
		this.options = { ...DEFAULT_CONFIG, ...options }
		this.projection = this.options.projection || DEFAULT_CONFIG.projection

		// 初始化状态
		this.state = {
			map: null,
			tdtImgLayer: null,
			tdtImgAnoLyr: null,
			tdtVecLayer: null,
			tdtVecAnoLyr: null
		}
	}

	/**
	 * 初始化地图（仅加载天地图底图）
	 */
	public initMap(): void {
		if (this.state.map) {
			console.warn('地图已初始化，无需重复初始化')
			return
		}

		const TDT_TOKEN = 'b87243f128237807fd23bf559c54cf91'

		// EPSG:4326 影像底图 + 注记
		const tdtImgSource = new XYZ({
			url: `http://t0.tianditu.gov.cn/DataServer?T=img_c&x={x}&y={y}&l={z}&tk=${TDT_TOKEN}`,
			projection: this.projection
		})
		this.state.tdtImgLayer = new TileLayer({
			source: tdtImgSource,
			visible: true
		})

		const tdtImgAnoSource = new XYZ({
			url: `http://t0.tianditu.gov.cn/DataServer?T=cia_c&x={x}&y={y}&l={z}&tk=${TDT_TOKEN}`,
			projection: this.projection
		})
		this.state.tdtImgAnoLyr = new TileLayer({
			source: tdtImgAnoSource,
			visible: true
		})

		// EPSG:4326 矢量底图 + 注记
		const tdtVecSource = new XYZ({
			url: `http://t0.tianditu.gov.cn/DataServer?T=vec_c&x={x}&y={y}&l={z}&tk=${TDT_TOKEN}`,
			projection: this.projection
		})
		this.state.tdtVecLayer = new TileLayer({
			source: tdtVecSource,
			visible: false
		})

		const tdtVecAnoSource = new XYZ({
			url: `http://t0.tianditu.gov.cn/DataServer?T=cva_c&x={x}&y={y}&l={z}&tk=${TDT_TOKEN}`,
			projection: this.projection
		})
		this.state.tdtVecAnoLyr = new TileLayer({
			source: tdtVecAnoSource,
			visible: false
		})

		// 创建地图实例
		this.state.map = new Map({
			target: this.options.mapDiv,
			layers: [this.state.tdtVecLayer, this.state.tdtVecAnoLyr, this.state.tdtImgLayer, this.state.tdtImgAnoLyr],
			view: new View({
				projection: this.projection,
				center: this.options.center,
				zoom: this.options.zoom,
				maxZoom: this.options.maxZoom,
				minZoom: this.options.minZoom
			}),
			controls: Defaults({ zoom: false, rotate: false })
		})

		console.log(`✅ 地图初始化完成，投影：${this.projection}`)
	}

	/**
	 * 移除绘制交互
	 */
	public removeDrawInteraction(): void {
		if (this.state.map) {
			const interactions = this.state.map.getInteractions().getArray()
			interactions.forEach(interaction => {
				if (interaction instanceof Draw) {
					this.state.map!.removeInteraction(interaction)
				}
			})
		}
	}

	/**
	 * 清除所有临时图层和交互（仅保留底图）
	 */
	public clearAllTools(): void {
		if (this.state.map) {
			// 移除绘制交互
			this.removeDrawInteraction()

			// 移除所有临时图层
			const layers = this.state.map.getLayers().getArray()
			for (let i = layers.length - 1; i >= 0; i--) {
				const layer = layers[i]
				const name = layer.get('name')
				if (name && name.includes('draw')) {
					this.state.map.removeLayer(layer)
				}
			}
		}
	}

	/**
	 * 销毁地图实例
	 */
	public destroyMap(): void {
		if (this.state.map) {
			this.state.map.dispose()
			// 重置状态
			this.state = {
				map: null,
				tdtImgLayer: null,
				tdtImgAnoLyr: null,
				tdtVecLayer: null,
				tdtVecAnoLyr: null
			}
			console.log('✅ 地图已销毁')
		}
	}
}

/** 默认地图实例 */
export const defaultOlMap = new OlMap({
	mapDiv: 'mapContainer',
	center: [112.5497, 37.8706]
})
