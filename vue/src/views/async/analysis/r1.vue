<template>
  <div class="layout-col">
    <!-- 标题 -->
	<div class="h40 ww100 flex-sc relative mb10">
		<img class="hh100" src="@/assets/imgs/title.png" />
		<div class="ww100 hh100 flex-sc absolute pl35">
			<span class="fw flex1 ptb5">今日资源</span>
			<div class="flex-ec flex1"></div>
		</div>
	</div>
	<div class="flex1 ww100 p15 ba1 flex-bc tc">
    <!-- 内容 -->
		<div class="flex-col-cc flex1 relative cursor i6">
			<div class="a1 ww90 ptb5 f12 mb8">离线</div>
			<img class="w86" src="@/assets/imgs/a2.png" />
			<div class="absolute-cc f22" style="top: 45%;">{{isNull(publicStore._public.offlineCount)? 0 : publicStore._public.offlineCount}}</div>
		</div>
		<div class="flex-col-cc flex1 relative cursor i8">
			<div class="a4 ww90 ptb5 f12 mb8">告警</div>
			<img class="w86" src="@/assets/imgs/a3.png" />
			<div class="absolute-cc f22" style="top: 45%">{{isNull(publicStore._public.alarmCount)? 0 : publicStore._public.alarmCount}}</div>
		</div>
		<div class="flex-col-cc flex1 relative cursor i1">
			<div class="a2 ww90 ptb5 f12 mb8">采集</div>
			<img class="w86" src="@/assets/imgs/a4.png" />
			<div class="absolute-cc f22" style="top: 45%">{{isNull(publicStore._public.Count)? 0 : publicStore._public.Count}}</div>
		</div>
		<!-- <div class="flex-col-cc flex1 relative cursor" @click.stop="publicStore._public.offlines='',publicStore._public.alarms='',publicStore._public.offline='',publicStore._public.isRun='',publicStore._public.alarm = '4'">
			<div class="a3 ww90 ptb5 f12 mb8">D级报警</div>
			<img class="w86" src="@/assets/imgs/a3.png" />
			<div class="absolute-cc f22" style="top: 45%">{{isNull(publicStore._public.devicesCount)? 0 : publicStore._public.devicesCount.isAlarm_D}}</div>
		</div> -->
	</div>
  </div>
</template>
<script lang="ts" setup>
  const { proxy }:any = getCurrentInstance()
	const configStore = proxy.configStore()
  const publicStore = proxy.publicStore()
  const state = reactive({
	  ...publicStore.$state,
		count: 0,
  })

	onMounted(async() => {
		await getSensor()
    getToday()
	  getCount()
		getOffline()
		getAlarm()
	})

	const getSensor = async() => {
	  let query = {model: "t_sensor", args: `class='0' and stationNum='${configStore.distributId}'`}
    let res = await publicStore.http({Api: query})
		publicStore._public.list = proxy.isNull(res)? [] : res
	}

	const getToday = () => {
		const today = new Date();
		const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
		const endTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
		state.start = startTime.getTime();
		state.end = endTime.getTime();
	}

	const getCount = async() => {
		let query1 = {model: `t_sensor_measure_float`, args: `timestamp>='${state.start}' and timestamp<='${state.end}'`, field: `COUNT(*)`}
    let query2 = {model: `t_sensor_measure_int`, args: `timestamp>='${state.start}' and timestamp<='${state.end}'`, field: `COUNT(*)`}
    let res = await publicStore.http({Api1: query1, Api2: query2})
    let count1 = proxy.isNull(res.Api1)? 0 : res.Api1[0]['COUNT(*)']
    let count2 = proxy.isNull(res.Api2)? 0 : res.Api2[0]['COUNT(*)']
		publicStore._public.Count = count1 + count2
	}

	const getOffline = async() => {
		let code = 'offline'
		let value = '0'
		let query = {
			model: `t_sensor_measure_int a JOIN t_sensor b ON a.sensor_id = b.id`, 
			args: `a.measurement_code='${code}' and a.timestamp>='${state.start}' and a.timestamp<='${state.end}' and a.value!='${value}' and b.stationNum='${configStore.distributId}' and b.class='0'`,
			field: `COUNT(DISTINCT a.sensor_id) AS count`
		}
    let res = await publicStore.http({Api: query})
		console.log("res---", res)
		publicStore._public.offlineCount = proxy.isNull(res)? 0 : res[0].count
	}

	const getAlarm = async() => {
		let code = 'isAlarm'
		let value = '0'
		let query = {
			model: `t_sensor_measure_int a JOIN t_sensor b ON a.sensor_id = b.id`, 
			args: `a.measurement_code='${code}' and a.timestamp>='${state.start}' and a.timestamp<='${state.end}' and a.value!='${value}' and b.class='0'`,
			field: `COUNT(DISTINCT a.sensor_id) AS count`
		}
    let res = await publicStore.http({Api: query})
		publicStore._public.alarmCount = proxy.isNull(res)? 0 : res[0].count
	}
</script>

<style scoped lang="scss">

</style>
