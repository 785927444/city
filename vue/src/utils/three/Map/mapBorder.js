import { Path, BufferGeometry, BufferAttribute, PointsMaterial, Points } from "three"
import { fetchData } from '@/utils/common'

// 初始化动态描边
export async function initMapBorder(adcode, projection, mapGroup) {
	// 地图数据
	const data = await fetchData(`china/${adcode + '0'}.json`)
	const total = 5000
	const length = 4000
	const speed = 30
	const path = new Path()
	const polygonCoordinates = data.features[0].geometry.type === "Polygon" ? [data.features[0].geometry.coordinates] : data.features[0].geometry.coordinates
	polygonCoordinates.forEach((item, index) => {
		if (!index) {
			item.forEach((arr, index1) => {
				if (index1) return
				arr.map((lonLat, index2) => {
					const [x, y] = projection(lonLat)
					if (index2) {
						path.lineTo(x, y)
					} else {
						path.moveTo(x, y)
					}
				});
			});
		}
	})
	const pointArr = path.getSpacedPoints(total - 1)
	const points = drawPoints(pointArr, 0)
	points.name = "流光-发光";
	points.index = 0
	points.length = length
	points.total = total
	points.pointArr = pointArr
	points.speed = speed
	points.rotateX(Math.PI / 2)
	mapGroup.add(points)
	return points
}

function drawPoints(pointArr, h) {
	// 流光粒子颜色
	const pointsColorStart = "#007fff"
	const pointsColorEnd = "#000000"
	// 流光粒子宽度
	const pointsWidth = 1
	const vertices = new Float32Array(pointArr.length * 3);
	const colors = new Float32Array(pointArr.length * 4);
	for (let i = 0; i < pointArr.length; i++) {
		vertices[i * 3] = pointArr[i].x;
		vertices[i * 3 + 1] = h;
		vertices[i * 3 + 2] = pointArr[i].y;

		colors[i * 4] = 0;
		colors[i * 4 + 1] = 0;
		colors[i * 4 + 2] = 0;
		colors[i * 4 + 3] = 0;
	}
	const geometry = new BufferGeometry();
	geometry.setAttribute("position", new BufferAttribute(vertices, 3));
	geometry.setAttribute("color", new BufferAttribute(colors, 4));
	const material = new PointsMaterial({
		vertexColors: true,
		size: pointsWidth,
		transparent: true,
		depthWrite: true,
	});
	const points = new Points(geometry, material);
	const colorStart = hexToRgba(pointsColorEnd);
	const colorEnd = hexToRgba(pointsColorStart);
	points.colorStart = colorStart;
	points.colorEnd = colorEnd;
	return points;
}

function hexToRgba(hex) {
	hex = hex.replace(/^#/, "");
	const bigint = parseInt(hex, 16);
	const r = (bigint >> 16) & 255;
	const g = (bigint >> 8) & 255;
	const b = bigint & 255;
	return [r / 255, g / 255, b / 255, 1];
}

export async function flowLightAnimation(points) {
	const total = points.total;
	const pointArr = points.pointArr;
	points.index = (points.index + points.speed) % total;

	const colors = new Float32Array(pointArr.length * 4);
	for (let i = 0; i < pointArr.length; i++) {
		const relativeIndex = (i - points.index + total) % total;
		let gradientRatio = 0;

		if (relativeIndex < points.length) {
			gradientRatio = 1 - relativeIndex / points.length;
		} else if (relativeIndex >= total - points.length) {
			gradientRatio = 1 - (total - relativeIndex) / points.length;
		}

		if (relativeIndex < points.length || relativeIndex >= total - points.length) {
			const r = points.colorStart[0] * gradientRatio + points.colorEnd[0] * (1 - gradientRatio);
			const g = points.colorStart[1] * gradientRatio + points.colorEnd[1] * (1 - gradientRatio);
			const b = points.colorStart[2] * gradientRatio + points.colorEnd[2] * (1 - gradientRatio);

			colors[i * 4] = r;
			colors[i * 4 + 1] = g;
			colors[i * 4 + 2] = b;
			colors[i * 4 + 3] = 1;
		} else {
			colors[i * 4] = 0;
			colors[i * 4 + 1] = 0;
			colors[i * 4 + 2] = 0;
			colors[i * 4 + 3] = 0;
		}
	}
	points.geometry.setAttribute("color", new BufferAttribute(colors, 4));
	points.geometry.needsUpdate = true;
}
