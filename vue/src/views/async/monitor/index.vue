<template>
  <div class="layout-row">
    <div class="flex-col hh100 ww28 plr20 pb20 absolute t0 l0 z9">
			<r1 class="flex1 mb15" />
			<r2 class="flex1 mb15" />
			<r3 class="flex1" />
    </div>
		<div class="layout-col">
			<c />
		</div>
    <div class="flex-col hh100 ww28 plr20 pb20 absolute t0 r0 z9">
			<l1 class="flex1 mb15" />
			<l2 class="flex1 mb15" />
			<l3 class="flex1" />
    </div>
  </div>
</template>

<script lang="ts" setup>
	import r1 from './r1'
	import r2 from './r2'
	import r3 from './r3'
	import c from './c'
	import l1 from './l1'
	import l2 from './l2'
	import l3 from './l3'
	const { proxy }:any = getCurrentInstance()
	const configStore = proxy.configStore()
	const publicStore = proxy.publicStore()
	const state = reactive({
		...publicStore.$state,
		num: 0,
		time: null,
		timer1: null,
		timer2: null,
	})
	
	onMounted(async() => {
    state.timer1 = setTimeout(() => {
	    init()
    }, 100)
    state.timer2 = setTimeout(() => {
	    updata()
    }, 2000)
	})

  onBeforeUnmount(() => {
    clearTimeout(state.timer1)
		clearTimeout(state.timer2)
  })

	const init = async() => {
		publicStore._public.stations = [
			{id: 1, station_num: '76d49f60-30f0-4578-a7d7-f20ff1b89345', station_name: '长园共创园区1', province: '440000', city: '440400', district: '440402', offline: '0', alarm: '1'},
			{id: 2, station_num: '76d49f60-30f0-4578-a7d7-f20ff1b89345', station_name: '长园共创园区2', province: '440000', city: '440400', district: '440402', offline: '0', alarm: '1'},
			{id: 3, station_num: '76d49f60-30f0-4578-a7d7-f20ff1b89345', station_name: '长园共创园区3', province: '440000', city: '440400', district: '440402', offline: '0', alarm: '1'},
			{id: 4, station_num: '76d49f60-30f0-4578-a7d7-f20ff1b89345', station_name: '长园共创园区4', province: '440000', city: '440400', district: '440402', offline: '0', alarm: '1'},
			{id: 5, station_num: '76d49f60-30f0-4578-a7d7-f20ff1b89345', station_name: '长园共创园区5', province: '440000', city: '440400', district: '440402', offline: '0', alarm: '1'},
			{id: 6, station_num: '76d49f60-30f0-4578-a7d7-f20ff1b89345', station_name: '长园共创园区6', province: '440000', city: '440400', district: '440402', offline: '0', alarm: '1'},
			{id: 7, station_num: '76d49f60-30f0-4578-a7d7-f20ff1b89345', station_name: '长园共创园区7', province: '440000', city: '440400', district: '440402', offline: '0', alarm: '1'},
			{id: 8, station_num: '76d49f60-30f0-4578-a7d7-f20ff1b89345', station_name: '长园共创园区8', province: '440000', city: '440400', district: '440402', offline: '0', alarm: '1'},
			{id: 9, station_num: '76d49f60-30f0-4578-a7d7-f20ff1b89345', station_name: '长园共创园区9', province: '440000', city: '440400', district: '440402', offline: '0', alarm: '1'},
			{id: 10, station_num: '76d49f60-30f0-4578-a7d7-f20ff1b89345', station_name: '长园共创园区10', province: '440000', city: '440400', district: '440402', offline: '0', alarm: '1'},
			{id: 11, station_num: '76d49f60-30f0-4578-a7d7-f20ff1b89345', station_name: '长园共创园区11', province: '440000', city: '440400', district: '440402', offline: '0', alarm: '1'},
			{id: 12, station_num: '76d49f60-30f0-4578-a7d7-f20ff1b89345', station_name: '长园共创园区12', province: '440000', city: '440400', district: '440402', offline: '0', alarm: '1'},
		]
		publicStore._public.loadData = [
			{name: '计划负荷', data: [['00:00', 40], ['01:00', 38.5], ['02:00', 52.3], ['03:00', 50.2], ['04:00', 45.3], ['05:00', 38.5], ['06:00', 32.5], ['07:00', 40.1], ['08:00', 42.5], ['09:00', 48.5], ['10:00', 52.9], ['11:00', 50.4],['12:00', 49.8],['13:00', 40], ['14:00', 38.5], ['15:00', 52.3], ['16:00', 50.2],['17:00', 45.3], ['18:00', 38.5], ['19:00', 32.5], ['20:00', 40.1],['21:00', 42.5], ['22:00', 48.5], ['23:00', 52.9]]}, 
			{name: '实时负荷', data: [['00:00', 20], ['01:00', 26.3], ['02:00', 33.2], ['03:00', 39.4], ['04:00', 22.5], ['05:00', 15.5], ['06:00', 22.4], ['07:00', 23.5], ['08:00', 24.9], ['09:00', 29.9], ['10:00', 12.8], ['11:00', 18.8],['12:00', 26.6],['13:00', 20], ['14:00', 26.3], ['15:00', 33.2], ['16:00', 39.4],['17:00', 22.5], ['18:00', 15.5], ['19:00', 22.4], ['20:00', 23.5],['21:00', 14.9], ['22:00', 9.9], ['23:00', 22.8]]}
		]
		publicStore._public.laserData = {
			totle: 140,
			data: [
				{name: '广东省', value: 40},
				{name: '贵州省', value: 50},
				{name: '云南省', value: 50},
				{name: '四川省', value: 50},
				{name: '浙江省', value: 53},
			]
		}
		publicStore._public.rankData = [
			{name: '阳光湖储能站', value: 2980},
			{name: '长江源储能中心', value: 2550},
			{name: '山水间储能站', value: 2213},
			{name: '清风溪光伏基地', value: 143},
			{name: '高峰路电动充电站', value: 1276},
			{name: '荣华路电动充电站', value: 980},
			{name: '翠绿山光伏站', value: 137},
			{name: '蓝天坝储能基地', value: 1987},
			{name: '东风储能仓', value: 1876},
			{name: '城市绿充电站', value: 1680},
			{name: '四季大道充电站', value: 1550},
			{name: '海湾快速充电站', value: 1413},
			{name: '科技园充电枢纽', value: 1387},
			{name: '和谐园充电站', value: 550},
			{name: '雾山充电站', value: 213},
			{name: '阳光大道充电站', value: 187},
			{name: '友谊桥充电站', value: 176},
			{name: '阳光岭光伏站', value: 160},
			{name: '世纪园光伏发电站', value: 150},
			{name: '新兴岛光伏中心', value: 126},
		]
    publicStore._public.pieData = [
      {name: '光伏发电', value: 25, color: '#54CFF3', rate: '33%', key: 'count_A'},
      {name: '储能站', value: 25, color: '#3E6AE3', rate: '33%', key: 'count_B'},
      {name: 'LPS', value: 25, color: '#F9B74A', rate: '33%', key: 'count_C'},
    ]
    publicStore._public.baseData = {
			photovoltaic: 21.82,
			energy: 19.67,
			charge: 10.29,
			load: 4.68
		}

		publicStore._public.resourData = [
			{name: '可调上限', data: [['00:00', 33.4], ['01:00', 31.8], ['02:00', 33.4], ['03:00', 35.6],['04:00', 36.6], ['05:00', 24.5], ['06:00', 20.8], ['07:00', 18.8],['08:00', 16.7], ['09:00', 18.9], ['10:00', 26.4], ['11:00', 28.4],['12:00', 25.5], ['13:00', 33.4], ['14:00', 31.8], ['15:00', 33.4], ['16:00', 35.6],['17:00', 36.6], ['18:00', 24.5], ['19:00', 20.8], ['20:00', 18.8],['21:00', 16.7], ['22:00', 18.9], ['23:00', 26.4], ['24:00', 28.4]]}, 
			{name: '可调下限', data: [['00:00', 22.2], ['01:00', 26.2], ['02:00', 28.4], ['03:00', 15.8],['04:00', 12.8], ['05:00', 20.8], ['06:00', 22.4], ['07:00', 20.4],['08:00', 25.6], ['09:00', 23.5], ['10:00', 20.8], ['11:00', 18.4],['12:00', 24.6], ['13:00', 22.2], ['14:00', 26.2], ['15:00', 28.4], ['16:00', 15.8],['17:00', 12.8], ['18:00', 20.8], ['19:00', 22.4], ['20:00', 20.4],['21:00', 25.6], ['22:00', 23.5], ['23:00', 20.8], ['24:00', 18.4]]}
		]
		publicStore._public.powerHz = [
			{name: '', data: [['00:00', 0.01], ['02:00', 0.02], ['04:00', 0.02], ['06:00', 0.04],['08:00', 0.04], ['10:00', 0.05], ['12:00', 0.05], ['14:00', 0.04],['16:00', 0.04], ['18:00', 0.05], ['20:00', 0.06], ['22:00', 0.06],['24:00', 0.07]]}, 
		]
		publicStore._public.powerV = [
			{name: '', data: [['00:00', 1], ['02:00', 2], ['04:00', 2], ['06:00', 6],['08:00', 8], ['10:00', 8], ['12:00', 10], ['14:00', 5],['16:00', 4], ['18:00', 3], ['20:00', 4], ['22:00', 5],['24:00', 6]]}, 
		]
	}

	const updata = async() => {
		publicStore.viewer.addAnimate({fun: ()=>{
			state.num++
			if (state.num > 1000) state.num = 1
			if (state.num % 200 === 0) loadData()
			if (state.num % 230 === 0) pieData()
			if (state.num % 260 === 0) laserData()
			if (state.num % 300 === 0) baseData()
			// if (state.num % 500 === 0) reload()
		}, content: {}})
	}

	const reload = async() => {
		let time = proxy.parseTime(new Date(), '{y}-{m}-{d}')
		if(state.time != time){
			if(state.time) window.location.reload()
			state.time = time
		}
	}

	const baseData = async() => {}

	const loadData = async() => {
		publicStore._public.loadData = publicStore._public.loadData.map((v, i) => {
			let ii = proxy.random(0, 23)
			v.data[ii][1] = i == 0?  proxy.random(30, 55) : proxy.random(5, 35)
			return v
		})
	}

	const pieData = async() => {
		let totle = 0
		let index = proxy.random(0, 2)
		let value = proxy.random(5, 95)
		let pieData = publicStore._public.pieData.map((v, i) => {
			if(index == i) v.value = value
			totle += v.value
			return v
		})
		pieData.forEach(v => {
			v.rate = Math.floor((v.value/totle)*100) + '%'
		})
		publicStore._public.pieData = pieData
	}

	const laserData = async() => {
		let laserData = {totle: 0, data: []}
		let index = proxy.random(0, 4)
		let value = proxy.random(5, 95)
		laserData.data = publicStore._public.laserData.data.map((v, i) => {
			if(index == i) v.value = value
			laserData.totle += v.value
			return v
		})
		publicStore._public.laserData = Object.assign({}, laserData)
	}

</script>

<style scoped lang="scss">
 
</style>
