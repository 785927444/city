import Map from 'ol/Map'
import View from 'ol/View'
import { defaults as Defaults } from 'ol/control.js'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import XYZ from 'ol/source/XYZ'
import { Draw } from 'ol/interaction'
import type { Extent } from 'ol/extent'
import type { ProjectionLike } from 'ol/proj'

interface OlMapOptions {
	mapDiv: string
	center: [number, number]
	zoom?: number
	maxZoom?: number
	minZoom?: number
	projection?: ProjectionLike
}

interface OlMapState {
	map: Map | null
	tdtImgLayer: TileLayer<XYZ> | null
	tdtImgAnoLyr: TileLayer<XYZ> | null
	tdtVecLayer: TileLayer<XYZ> | null
	tdtVecAnoLyr: TileLayer<XYZ> | null
}

export class OlMap {
	private readonly options: OlMapOptions
	public state: OlMapState
	private readonly projection: ProjectionLike

	constructor(options: OlMapOptions) {
		const DEFAULT_CONFIG = {
			zoom: 11,
			maxZoom: 18,
			minZoom: 6,
			projection: 'EPSG:4326' as ProjectionLike
		}

		this.options = { ...DEFAULT_CONFIG, ...options }
		this.projection = this.options.projection || DEFAULT_CONFIG.projection

		this.state = {
			map: null,
			tdtImgLayer: null,
			tdtImgAnoLyr: null,
			tdtVecLayer: null,
			tdtVecAnoLyr: null
		}
	}

	public initMap(): void {
		if (this.state.map) {
			console.warn('地图已初始化，无需重复初始化')
			return
		}

		const TDT_TOKEN = 'b87243f128237807fd23bf559c54cf91'

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

	public clearAllTools(): void {
		if (this.state.map) {
			this.removeDrawInteraction()

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

	public destroyMap(): void {
		if (this.state.map) {
			this.state.map.dispose()
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

export const defaultOlMap = new OlMap({
	mapDiv: 'mapContainer',
	center: [112.5497, 37.8706]
})
