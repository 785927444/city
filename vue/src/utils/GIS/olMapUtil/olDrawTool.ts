import Map from 'ol/Map'
import Draw, { type DrawEvent, type Options as DrawOptions, type GeometryFunction } from 'ol/interaction/Draw'
import { createBox } from 'ol/interaction/Draw'
import VectorSource from 'ol/source/Vector'
import VectorLayer from 'ol/layer/Vector'
import Feature from 'ol/Feature'
import { Polygon, Point, LineString } from 'ol/geom'
import { Fill, Style, Stroke, Circle as CircleStyle } from 'ol/style'
import { unByKey } from 'ol/Observable'
import type { EventsKey } from 'ol/events'
import type { Coordinate } from 'ol/coordinate'

export class OlDrawTool {
	private map: Map | null = null
	private drawLayer: VectorLayer<VectorSource> | null = null
	private drawInteraction: Draw | null = null
	private queryListener: EventsKey | null = null
	private readonly DRAW_LAYER_CLASS = 'ol-draw-layer'

	public initialize(map: Map): void {
		this.map = map
		this.cleanup()
	}

	private activate(geoType: 'LineString' | 'Polygon' | 'Rectangle', drawEndCallback?: (feature: Feature) => void): void {
		if (!this.map) {
			console.error('地图未初始化，请先调用 initialize 方法')
			return
		}

		this.cleanup()

		const source = new VectorSource({ wrapX: false })
		source.clear()

		this.drawLayer = this.createDrawLayer(source)
		this.drawLayer.set('className', this.DRAW_LAYER_CLASS)
		this.map.addLayer(this.drawLayer)

		const { drawType, geometryFunction } = this.parseDrawType(geoType)

		const drawOptions: DrawOptions = {
			source: source,
			type: drawType,
			freehand: false,
			geometryFunction: geometryFunction
		}

		this.drawInteraction = new Draw(drawOptions)
		this.map.addInteraction(this.drawInteraction)

		this.drawInteraction.on('drawstart', () => {
			source.clear()
		})

		if (drawEndCallback) {
			this.queryListener = this.drawInteraction.on('drawend', (evt: DrawEvent) => {
				this.map?.removeInteraction(this.drawInteraction!)
				this.drawInteraction = null
				drawEndCallback(evt.feature)
			})
		}
	}

	public drawPolygon(drawEndCallback?: (feature: Feature) => void): void {
		this.activate('Polygon', drawEndCallback)
	}

	public drawLineString(drawEndCallback?: (feature: Feature) => void): void {
		this.activate('LineString', drawEndCallback)
	}

	public drawRectangle(drawEndCallback?: (feature: Feature) => void): void {
		this.activate('Rectangle', drawEndCallback)
	}

	public deactivate(keepLayer: boolean = false): void {
		this.cleanup(keepLayer)
	}

	private cleanup(keepLayer: boolean = false): void {
		if (this.map && this.drawInteraction) {
			this.map.removeInteraction(this.drawInteraction)
			this.drawInteraction = null
		}

		if (this.queryListener) {
			unByKey(this.queryListener)
			this.queryListener = null
		}

		if (this.map && !keepLayer) {
			const layers = this.map.getLayers().getArray()
			layers.forEach(layer => {
				if (layer.get('className') === this.DRAW_LAYER_CLASS) {
					this.map!.removeLayer(layer)
				}
			})
			this.drawLayer = null
		}
	}

	private parseDrawType(geoType: 'LineString' | 'Polygon' | 'Rectangle'): {
		drawType: 'LineString' | 'Polygon' | 'Circle'
		geometryFunction?: GeometryFunction
	} {
		let drawType: 'LineString' | 'Polygon' | 'Circle' = 'Polygon'
		let geometryFunction: GeometryFunction | undefined = undefined

		switch (geoType) {
			case 'LineString':
				drawType = 'LineString'
				break
			case 'Polygon':
				drawType = 'Polygon'
				break
			case 'Rectangle':
				drawType = 'Circle'
				geometryFunction = createBox()
				break
		}

		return { drawType, geometryFunction }
	}

	private createDrawLayer(source: VectorSource): VectorLayer<VectorSource> {
		return new VectorLayer({
			source: source,
			style: new Style({
				fill: new Fill({ color: 'rgba(59, 130, 246, 0.2)' }),
				stroke: new Stroke({ color: 'red', width: 3 }),
				image: new CircleStyle({
					radius: 7,
					fill: new Fill({ color: 'red' }),
					stroke: new Stroke({ color: '#fff', width: 1 })
				})
			})
		})
	}

	public getGeometryVertices(feature: Feature): number[][] {
		const geometry = feature.getGeometry()
		if (!geometry) return []

		let coordinates: number[][] = []

		if (geometry instanceof LineString) {
			coordinates = geometry.getCoordinates() as number[][]
		} else if (geometry instanceof Polygon) {
			coordinates = geometry.getCoordinates()[0] as number[][]
			if (coordinates.length > 1 && JSON.stringify(coordinates[0]) === JSON.stringify(coordinates[coordinates.length - 1])) {
				coordinates.pop()
			}
		}

		return coordinates
	}

	public addPolygon(
		coordinates: number[][],
		options?: {
			fillColor?: string
			strokeColor?: string
			strokeWidth?: number
			autoClose?: boolean
		}
	): void {
		if (!this.map) {
			console.error('地图未初始化')
			return
		}

		if (!coordinates || coordinates.length < 3) {
			console.error('多边形至少需要3个顶点')
			return
		}

		this.cleanup()

		let processedCoords = [...coordinates]

		const firstCoord = coordinates[0]
		const lastCoord = coordinates[coordinates.length - 1]

		const autoClose = options?.autoClose ?? true

		if (autoClose && (firstCoord[0] !== lastCoord[0] || firstCoord[1] !== lastCoord[1])) {
			processedCoords.push([firstCoord[0], firstCoord[1]])
		}

		const polygonFeature = new Feature({
			geometry: new Polygon([processedCoords])
		})

		const source = new VectorSource({ features: [polygonFeature] })

		this.drawLayer = new VectorLayer({
			source: source,
			style: new Style({
				fill: new Fill({
					color: options?.fillColor || 'rgba(59, 130, 246, 0.3)'
				}),
				stroke: new Stroke({
					color: options?.strokeColor || 'red',
					width: options?.strokeWidth || 3
				})
			})
		})
		this.drawLayer.set('className', this.DRAW_LAYER_CLASS)
		this.drawLayer.set('name', this.DRAW_LAYER_CLASS)
		this.map.addLayer(this.drawLayer)
	}

public fitToCoordinates(
  coordinates: number[][], 
  options: { padding?: number[]; duration?: number; maxZoom?: number } = {}
): boolean {
  if (!this.state.map) {
    console.warn('【OlMap】地图实例未初始化，无法定位')
    return false
  }
  
  const view = this.state.map.getView()
  if (!view) {
    console.warn('【OlMap】地图视图未初始化，无法定位')
    return false
  }
  
  if (!coordinates || coordinates.length === 0) {
    console.warn('【OlMap】坐标集合为空，无法定位')
    return false
  }
  
  if (!Array.isArray(coordinates[0])) {
    console.warn('【OlMap】坐标格式不正确，应为[[lng, lat], ...]格式')
    return false
  }
  
  console.log('【OlMap】开始定位到坐标集合，坐标点数量:', coordinates.length)
  
  let minLng = Infinity
  let minLat = Infinity
  let maxLng = -Infinity
  let maxLat = -Infinity
  
  coordinates.forEach(coord => {
    const [lng, lat] = coord
    minLng = Math.min(minLng, lng)
    minLat = Math.min(minLat, lat)
    maxLng = Math.max(maxLng, lng)
    maxLat = Math.max(maxLat, lat)
  })
  
  const extent: Extent = [minLng, minLat, maxLng, maxLat]
  
  console.log('【OlMap】计算出的边界范围:', {
    minLng, minLat, maxLng, maxLat,
    width: maxLng - minLng,
    height: maxLat - minLat
  })
  
  const defaultOptions = { 
    padding: [80, 80, 80, 80], 
    duration: 500, 
    maxZoom: 16 
  }
  const finalOptions = { ...defaultOptions, ...options }
  
  view.fit(extent, finalOptions)
  
  console.log(`✅ 已定位到坐标集合范围，包含 ${coordinates.length} 个坐标点`)
  return true
}

}

export const defaultDrawTool = new OlDrawTool()
