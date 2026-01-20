<template>
  <div class="layout-row p10 relative warp overlay">
    <!-- 3D地图 -->
		<div class="ww100 hh100 p10">
			<div class="ww100 hh100 p20 black-rgba20 flex-col">
			<div class="flex-sc ww100 mb20">
				<div class="cursor" @click.stop="onMap(-1)">全国</div>
				<div class="cursor" v-for="(v, i) in configStore.adcodes?configStore.adcodes:[]" :key="i" @click.stop="onMap(i)">
					<span class="mlr10">/</span>
					<span :class="i==configStore.adcodes.length-1?'i21':''">{{v.name}}</span>
				</div>
			</div>
				<div class="hh100 ww100" id="map"></div>
			</div>
		</div>
    <!-- 折线图表 -->
		<div class="ww50 hh33 p10">
			<div class="ww100 hh100 p20 black-rgba20">
				<div class="hh100 ww100" id="Line_1"></div>
			</div>
		</div>
    <!-- 柱状图表 -->
		<div class="ww50 hh33 p10">
			<div class="ww100 hh100 p20 black-rgba20">
				<div class="hh100 ww100" id="Bar_1"></div>
			</div>
		</div>
    <!-- 散点图表 -->
    <div class="ww50 hh33 p10">
			<div class="ww100 hh100 p20 black-rgba20">
        <div class="hh100 ww100" id="Scatter_1"></div>
			</div>
    </div>
    <!-- 3d柱状图表 -->
    <div class="ww50 hh33 p10">
			<div class="ww100 hh100 p20 black-rgba20">
        <div class="hh100 ww100" id="Bar3d_1"></div>
			</div>
    </div>
    <!-- 饼状图表 -->
    <div class="ww50 hh33 p10">
			<div class="ww100 hh100 p20 black-rgba20 flex-cc">
				<div class="flex1 hh100 flex-col-cc">
					<div class="ww100 h50x4 relative p20 tc">
						<img class="hh100" src="@/assets/imgs/tt1.png" />
						<div class="absolute-cc ww100 hh100" id="Pie_1"></div>
						<div class="absolute-cc cursor tc f14">
							<div class="mb2">设备</div>
							<div>使用率</div>
						</div>
					</div>
				</div>
				<div class="flex-col-cs flex1 relative ml20">
					<div class="ww100 flex-sc tl p5 cursor" v-for="(v, i) in publicStore._public.pieData?publicStore._public.pieData:[]" :key="i">
						<div class="w10 h10 rad100 mr8" :style="{background: v.color}"></div>
						<div class="w80">{{v.name}}</div>
						<div class="flex1">{{v.rate}}</div>
					</div>
				</div>
      </div>
		</div>
		<!-- 仪表盘图表 -->
		<div class="ww50 hh33 p10">
			<div class="ww100 hh100 p20 black-rgba20">
				<div class="ww100 hh100 flex-bc plr10">
					<div class="hh100 flex1 p10 flex-cc">
						<div class="h50x3 w50x3 relative flex-cc">
							<img class="ww100" src="@/assets/imgs/tt1.png" />
							<div class="absolute-cc hh100 ww100 z1" id="Gauge_1"></div>
						</div>
					</div>
					<div class="hh100 flex1 p10 flex-cc">
						<div class="h50x3 w50x3 relative flex-cc">
							<img class="ww100" src="@/assets/imgs/tt1.png" />
							<div class="absolute-cc hh100 ww100 z1" id="Gauge_2"></div>
						</div>
					</div>
					<div class="hh100 flex1 p10 flex-cc">
						<div class="h50x3 w50x3 relative flex-cc">
							<img class="ww100" src="@/assets/imgs/tt1.png" />
							<div class="absolute-cc hh100 ww100 z1" id="Gauge_3"></div>
						</div>
					</div>
				</div>
			</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import ec from "@/utils/chart"
	import { setAdcodes, getMapDatas } from '@/utils/map'
  const { drawChart } = ec()
	const { proxy }:any = getCurrentInstance()
	const publicStore = proxy.publicStore()
	const configStore = proxy.configStore()
	const state = reactive({
		...publicStore.$state,
	})
	
	onMounted(async() => {
		setTimeout(() => {
			publicStore._public.lineData = [
				{name: '充电量', data: [['00:00', 60], ['01:00', 30], ['02:00', 10], ['03:00', 30],['04:00', 50], ['05:00', 20], ['06:00', 25], ['07:00', 30],['08:00', 50], ['09:00', 40], ['10:00', 35], ['11:00', 50],['12:00', 45]]}, 
				{name: '放电量', data: [['00:00', 50], ['01:00', 40], ['02:00', 20], ['03:00', 40],['04:00', 30], ['05:00', 10], ['06:00', 0], ['07:00', 30],['08:00', 30], ['09:00', 45], ['10:00', 25], ['11:00', 15],['12:00', 35]]},
			]
			publicStore._public.barData = [
				{name: '充电量', data: [['00:00', 60], ['01:00', 30], ['02:00', 10], ['03:00', 30],['04:00', 50], ['05:00', 20], ['06:00', 25], ['07:00', 30],['08:00', 50], ['09:00', 40], ['10:00', 35], ['11:00', 50],['12:00', 45]]}, 
				{name: '充电量', data: [['00:00', 60], ['01:00', 30], ['02:00', 10], ['03:00', 30],['04:00', 50], ['05:00', 20], ['06:00', 25], ['07:00', 30],['08:00', 50], ['09:00', 40], ['10:00', 35], ['11:00', 50],['12:00', 45]]}, 
			]
			publicStore._public.pieData = [
				{name: '充电桩1#', value: 25, color: '#54CFF3', rate: '25%', key: 'count_A'},
				{name: '充电桩2#', value: 25, color: '#3E6AE3', rate: '25%', key: 'count_B'},
				{name: '充电桩3#', value: 25, color: '#F9B74A', rate: '25%', key: 'count_C'},
				{name: '充电桩4#', value: 25, color: '#F45C5C', rate: '25%', key: 'count_D'},
			]
      publicStore._public.gaugeData = [
        {value: 37, name: '总利用率', rate: '0.37', color: '#54CFF3', key: 'count_ABCD'},
        {value: 32, name: '总利用率',  rate: '0.32', color: '#3E6AE3', key: 'count_C'},
        {value: 46, name: '分布式光伏',  rate: '0.46', color: '#F9B74A', key: 'count_D'},
      ]
			publicStore._public.scatterData = [
				{name: '充电量', data: [['00:00', 60], ['01:00', 30], ['02:00', 10], ['03:00', 30],['04:00', 50], ['05:00', 20], ['06:00', 25], ['07:00', 30],['08:00', 50], ['09:00', 40], ['10:00', 35], ['11:00', 50],['12:00', 45]]}, 
				{name: '放电量', data: [['00:00', 50], ['01:00', 40], ['02:00', 20], ['03:00', 40],['04:00', 30], ['05:00', 10], ['06:00', 0], ['07:00', 30],['08:00', 30], ['09:00', 45], ['10:00', 25], ['11:00', 15],['12:00', 35]]},
			]
			publicStore._public.bar3dData = []
			publicStore._public.map3dData = [
			  {name: '测试站点1', aera: [440000, 440400, 440402], value: 50}, 
				{name: '测试站点2', aera: [440000, 440400, 440403], value: 100}, 
				{name: '测试站点3', aera: [440000, 440400, 440404], value: 150}, 
				{name: '测试站点4', aera: [450000, 450500, 450502], value: 200}, 
				{name: '测试站点5', aera: [530000, 532800, 532801], value: 10}
			]
		}, 10)

		// setInterval(() => {
		// 	const map3dData = JSON.parse(JSON.stringify(publicStore._public.map3dData))
		// 	map3dData.forEach(v => {
		// 		v.value+=Math.floor(Math.random() * 201) - 100;
		// 		if(v.value < 0) v.value = 10
		// 	})
		// 	publicStore._public.map3dData = map3dData
		// }, 10000)
	})
	
	watch(() => publicStore._public.lineData, async(val, old) => {
		if(state.active==2) return
		if(proxy.isNull(val)) return
		if(JSON.stringify(val) == JSON.stringify(old)) return
		await nextTick();
		setChart1()
	}, { immediate: false, deep: true })

	watch(() => publicStore._public.barData, async(val, old) => {
		if(state.active==2) return
		if(proxy.isNull(val)) return
		if(JSON.stringify(val) == JSON.stringify(old)) return
		await nextTick();
		setChart2()
	}, { immediate: false, deep: true })

	watch(() => publicStore._public.pieData, async(val, old) => {
		if(state.active==2) return
		if(proxy.isNull(val)) return
		if(JSON.stringify(val) == JSON.stringify(old)) return
		await nextTick();
		setChart3()
	}, { immediate: false, deep: true })

  watch(() => publicStore._public.gaugeData, async (val, old) => {
    if(proxy.isNull(val)) return
    if(JSON.stringify(val) == JSON.stringify(old)) return
    await nextTick()
    if(!old){
      setChart41()
      setChart42()
      setChart43()
    }else{
      if(JSON.stringify(val[0]) != JSON.stringify(old[0])) setChart41()
      if(JSON.stringify(val[1]) != JSON.stringify(old[1])) setChart42()
      if(JSON.stringify(val[2]) != JSON.stringify(old[2])) setChart43()
    }
  },{ immediate: false, deep: true });

	watch(() => publicStore._public.scatterData, async(val, old) => {
		if(state.active==2) return
		if(proxy.isNull(val)) return
		if(JSON.stringify(val) == JSON.stringify(old)) return
		await nextTick();
		setChart5()
	}, { immediate: false, deep: true })

	watch(() => publicStore._public.bar3dData, async(val, old) => {
		if(state.active==2) return
		// if(proxy.isNull(val)) return
		if(JSON.stringify(val) == JSON.stringify(old)) return
		await nextTick();
		setChart6()
	}, { immediate: false, deep: true })

	watch(() => publicStore._public.map3dData, async(val, old) => {
		// if(proxy.isNull(val)) return
		if(JSON.stringify(val) == JSON.stringify(old)) return
		await nextTick();
		setChart7()
	}, { immediate: false, deep: true })

	const setChart1 = async() => {
		let chart = 'Line'
		let id = 'Line_1'
		let attr = {
			min: 0, 
			max: 100,
			extent: 4, 
			colorList: [],
			legendArr: [],
			legendShow: true,
			labelShow: false,
			areaShow: true,
			y_name: 'kw',
			tool_dw: 'kw', 
			tool_name_x: '日期：', 
			tool_name_y: '数值：', 
		}
		let data = publicStore._public.lineData
		let series = {data: []}
		series = data.map(v => {
			attr.legendArr.push(v.name)
			let data = v.data
			return {data}
		})
		drawChart(chart, id, attr, {series: series}, {});
	}

	const setChart2 = async() => {
		let chart = 'Bar'
		let id = 'Bar_1'
		let attr = {
			min: 0, 
			// max: 100,
			extent: 4, 
			colorList: [],
			legendArr: [],
			legendShow: false,
			labelShow: true,
			y_name: 'kw',
			tool_dw: 'kw', 
			tool_name_x: '日期：', 
			tool_name_y: '数值：', 
		}
		let data = publicStore._public.barData
		let series = {data: []}
		series = data.map(v => {
			attr.legendArr.push(v.name)
			let data = v.data
			return {data}
		})
		console.log('series---', series)
		drawChart(chart, id, attr, {series: series}, {});
	}

	const setChart3 = async() => {
		let chart = 'Pie'
		let id = 'Pie_1'
		let params = {
			colorList: [],
			labelShow: false,
			internalDiameterRatio: 0.8, 
			distance: 200, 
			alpha: 30, 
			pieHeight: 20, 
			opacity: 0.8
		}
		let data = publicStore._public.pieData
		drawChart(chart, id, {}, data, params)
	}

  const setChart41 = async() => { 	
		let chart = 'Gauge'
		let id = 'Gauge_1'
    let gauge = publicStore._public.gaugeData[0]
		let data = [gauge]
    let params = {colors: gauge.color}
    let attr = {data: gauge.rate}
    drawChart(chart, id, attr, data, params)
  }

  const setChart42 = async() => { 
		let chart = 'Gauge'
		let id = 'Gauge_2'
    let gauge = publicStore._public.gaugeData[1]
		let data = [gauge]
    let params = {colors: gauge.color}
    let attr = {data: gauge.rate}
    drawChart(chart, id, attr, data, params)
  }

  const setChart43 = async() => {
		let chart = 'Gauge'
		let id = 'Gauge_3'
    let gauge = publicStore._public.gaugeData[2]
		let data = [gauge]
    let params = {colors: gauge.color}
    let attr = {data: gauge.rate}
    drawChart(chart, id, attr, data, params)
  }

	const setChart5 = async() => {
		let chart = 'Scatter'
		let id = 'Scatter_1'
		let attr = {
			min: 0, 
			max: 100,
			extent: 4, 
			colorList: [],
			legendArr: [],
			legendShow: true,
			labelShow: false,
			areaShow: true,
			y_name: 'kw',
			tool_dw: 'kw', 
			tool_name_x: '日期：', 
			tool_name_y: '数值：', 
		}
		let data = publicStore._public.scatterData
		let series = {data: []}
		series = data.map(v => {
			attr.legendArr.push(v.name)
			let data = v.data
			return {data}
		})
		drawChart(chart, id, attr, {series: series}, {});
	}

	const setChart6 = async() => {
		let chart = 'Bar3d'
		let id = 'Bar3d_1'
		let attr = {
			p: 4,
			min: 0, 
			max: 100,
			extent: 4, 
			colorList: [],
			x_name: '周期',
			y_name: '相位',
			z_name: '幅值',
			tool_dw: 'kw', 
			tool_name_x: '周期：', 
			tool_name_y: '相位：', 
			tool_name_z: '幅值：', 
		}
		let data = publicStore._public.bar3dData
		data =!proxy.isNull(data)? data : await getData_Bar3d(attr)
		// 标签过滤
		if(!proxy.isNull(publicStore.visualMap)){
			publicStore.visualMap.forEach(v => {
				if(!v.status) data = data.filter(a=>{return a[2] < v.num1 || a[2] >= v.num2})
			})
		}
		// 负数处理
		let negative = attr && attr.min && attr.min < 0 ? true : false
		data = data.map((item, index) => {
			let temp = [...item]
			if(attr.max && temp[2] >= Number(attr.max)) temp[2] = attr.max
			if(attr.min && temp[2] <= Number(attr.min)) temp[2] = attr.min
			if(negative) temp[2] = temp[2] - Number(attr.min)
			return temp
		})
		console.log('Bar3d---')
		drawChart(chart, id, attr, data, {});
	}

	const setChart7 = async() => {
		let chart = 'Map'
		let id = 'map'
		let params = {}
		let data = publicStore._public.map3dData
		drawChart(chart, id, {}, data, params)
	}

	const onMap = async(i) => {
		configStore.adcodes = i == -1? [] : configStore.adcodes.slice(0, i + 1)
		if(configStore.adcodes.length == 0) {
			configStore.adcode = 100000
		}else{
			configStore.adcode = configStore.adcodes[configStore.adcodes.length-1].adcode
		}
		publicStore.rechart('map')
		setChart7()
	}

  // 自动生成数据
	const getData_Bar3d = async (attr) => {
		console.log('生成-getData_Bar3d')
		let tempArr = []
		let p = attr.p
		let m = 360
		for(let x = 0; x < p; x++){
			for(let y = 0; y < m; y++){
				tempArr.push([x, y, Math.random()])
				// tempArr.push([x, y, Math.round(Math.random() * 100 - 50)])
			}
		}
		return tempArr
	};

  // 自动生成数据
	const getData_Scatter = async (attr) => {
		console.log('生成-getData_Scatter')
		let tempArr = []
		let p = attr.p
		let m = 360
		for(let x = 0; x < m; x++){
			tempArr.push([x, Math.random()])
		}
		return tempArr
	}; 

</script>

<style scoped lang="scss">

</style>
