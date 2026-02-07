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

/**
 * 绘制工具类 - 仅保留核心几何图形绘制能力
 */
export class OlDrawTool {
	// 地图实例
	private map: Map | null = null
	// 绘制图层
	private drawLayer: VectorLayer<VectorSource> | null = null
	// 绘制交互实例
	private drawInteraction: Draw | null = null
	// 绘制结束监听器
	private queryListener: EventsKey | null = null
	// 绘制图层唯一标识
	private readonly DRAW_LAYER_CLASS = 'ol-draw-layer'

	/**
	 * 初始化绘制工具
	 * @param map OpenLayers 地图实例
	 */
	public initialize(map: Map): void {
		this.map = map
		this.cleanup()
	}

	/**
	 * 激活绘制工具
	 * @param geoType 几何类型: LineString/Polygon/Rectangle
	 * @param drawEndCallback 绘制结束回调函数
	 */
	private activate(geoType: 'LineString' | 'Polygon' | 'Rectangle', drawEndCallback?: (feature: Feature) => void): void {
		if (!this.map) {
			console.error('地图未初始化，请先调用 initialize 方法')
			return
		}

		// 清除所有绘制相关资源
		this.cleanup()

		// 创建绘制数据源
		const source = new VectorSource({ wrapX: false })
		source.clear()

		// 创建绘制图层
		this.drawLayer = this.createDrawLayer(source)
		this.drawLayer.set('className', this.DRAW_LAYER_CLASS)
		this.map.addLayer(this.drawLayer)

		// 解析绘制类型
		const { drawType, geometryFunction } = this.parseDrawType(geoType)

		// 配置绘制交互参数
		const drawOptions: DrawOptions = {
			source: source,
			type: drawType,
			freehand: false,
			geometryFunction: geometryFunction
		}

		// 创建绘制交互实例
		this.drawInteraction = new Draw(drawOptions)
		this.map.addInteraction(this.drawInteraction)

		// 绘制开始：清空已有要素
		this.drawInteraction.on('drawstart', () => {
			source.clear()
		})

		// 绘制结束：触发回调
		if (drawEndCallback) {
			this.queryListener = this.drawInteraction.on('drawend', (evt: DrawEvent) => {
				this.map?.removeInteraction(this.drawInteraction!)
				this.drawInteraction = null
				drawEndCallback(evt.feature)
			})
		}
	}

	/**
	 * 绘制多边形
	 * @param drawEndCallback 绘制结束回调
	 */
	public drawPolygon(drawEndCallback?: (feature: Feature) => void): void {
		this.activate('Polygon', drawEndCallback)
	}

	/**
	 * 绘制线
	 * @param drawEndCallback 绘制结束回调
	 */
	public drawLineString(drawEndCallback?: (feature: Feature) => void): void {
		this.activate('LineString', drawEndCallback)
	}

	/**
	 * 绘制矩形
	 * @param drawEndCallback 绘制结束回调
	 */
	public drawRectangle(drawEndCallback?: (feature: Feature) => void): void {
		this.activate('Rectangle', drawEndCallback)
	}

	/**
	 * 停用绘制工具
	 * @param keepLayer 是否保留绘制图层
	 */
	public deactivate(keepLayer: boolean = false): void {
		this.cleanup(keepLayer)
	}

	/**
	 * 清理绘制资源
	 */
	private cleanup(keepLayer: boolean = false): void {
		// 移除绘制交互
		if (this.map && this.drawInteraction) {
			this.map.removeInteraction(this.drawInteraction)
			this.drawInteraction = null
		}

		// 移除监听器
		if (this.queryListener) {
			unByKey(this.queryListener)
			this.queryListener = null
		}

		// 移除绘制图层
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

	/**
	 * 解析绘制类型
	 */
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

	/**
	 * 创建通用绘制图层
	 */
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

	/**
	 * 提取几何图形的顶点坐标
	 */
	public getGeometryVertices(feature: Feature): number[][] {
		const geometry = feature.getGeometry()
		if (!geometry) return []

		let coordinates: number[][] = []

		if (geometry instanceof LineString) {
			coordinates = geometry.getCoordinates() as number[][]
		} else if (geometry instanceof Polygon) {
			coordinates = geometry.getCoordinates()[0] as number[][]
			// 移除最后一个重复的闭合点
			if (coordinates.length > 1 && JSON.stringify(coordinates[0]) === JSON.stringify(coordinates[coordinates.length - 1])) {
				coordinates.pop()
			}
		}

		return coordinates
	}

/**
	 * 添加多边形（使用4326坐标，不进行转换）
	 * @param coordinates 多边形顶点坐标数组 [[lng, lat], [lng, lat], ...]
	 * @param options 配置选项
	 */
	public addPolygon(
		coordinates: number[][],
		options?: {
			fillColor?: string
			strokeColor?: string
			strokeWidth?: number
			autoClose?: boolean // 是否自动闭合多边形（首尾点相同时不重复添加）
		}
	): void {
		if (!this.map) {
			console.error('地图未初始化')
			return
		}

		// 校验坐标数据
		if (!coordinates || coordinates.length < 3) {
			console.error('多边形至少需要3个顶点')
			return
		}

		// 彻底清除所有绘制图层
		this.cleanup()

		// 处理多边形闭合（确保第一个点和最后一个点相同）
		let processedCoords = [...coordinates]
		console.log("processedCoords", processedCoords)
		const firstCoord = coordinates[0]
		const lastCoord = coordinates[coordinates.length - 1]

		// 根据autoClose选项决定是否自动闭合
		const autoClose = options?.autoClose ?? true

		if (autoClose && (firstCoord[0] !== lastCoord[0] || firstCoord[1] !== lastCoord[1])) {
			// 添加第一个点作为最后一个点以实现闭合
			processedCoords.push([firstCoord[0], firstCoord[1]])
		}

		// 创建多边形要素
		const polygonFeature = new Feature({
			geometry: new Polygon([processedCoords]) // 注意：Polygon构造函数需要嵌套数组
		})

		// 创建图层并添加到地图
		const source = new VectorSource({ features: [polygonFeature] })
		console.log("source", source)
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
		console.log("this.drawLayer", this.drawLayer)
		this.map.addLayer(this.drawLayer)
	}

/**
 * 根据传入的坐标集合进行定位
 * @param coordinates 坐标集合数组，格式为 [[lng1, lat1], [lng2, lat2], ...]
 * @param options 定位配置项
 * @returns boolean 定位是否成功
 */
public fitToCoordinates(
  coordinates: number[][], 
  options: { padding?: number[]; duration?: number; maxZoom?: number } = {}
): boolean {
  // 1. 基础校验
  if (!this.state.map) {
    console.warn('【OlMap】地图实例未初始化，无法定位')
    return false
  }
  
  const view = this.state.map.getView()
  if (!view) {
    console.warn('【OlMap】地图视图未初始化，无法定位')
    return false
  }
  
  // 2. 验证坐标数据
  if (!coordinates || coordinates.length === 0) {
    console.warn('【OlMap】坐标集合为空，无法定位')
    return false
  }
  
  // 确保坐标是二维数组
  if (!Array.isArray(coordinates[0])) {
    console.warn('【OlMap】坐标格式不正确，应为[[lng, lat], ...]格式')
    return false
  }
  
  console.log('【OlMap】开始定位到坐标集合，坐标点数量:', coordinates.length)
  
  // 3. 计算坐标集合的边界范围
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
  
  // 4. 创建范围（Extent）数组：[minLng, minLat, maxLng, maxLat]
  const extent: Extent = [minLng, minLat, maxLng, maxLat]
  
  console.log('【OlMap】计算出的边界范围:', {
    minLng, minLat, maxLng, maxLat,
    width: maxLng - minLng,
    height: maxLat - minLat
  })
  
  // 5. 设置定位参数
  const defaultOptions = { 
    padding: [80, 80, 80, 80], 
    duration: 500, 
    maxZoom: 16 
  }
  const finalOptions = { ...defaultOptions, ...options }
  
  // 6. 执行定位
  view.fit(extent, finalOptions)
  
  console.log(`✅ 已定位到坐标集合范围，包含 ${coordinates.length} 个坐标点`)
  return true
}


}

/** 默认绘制工具实例 */
export const defaultDrawTool = new OlDrawTool()
