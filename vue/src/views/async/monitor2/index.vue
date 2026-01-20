<template>
	<div class="layout-row plr15 pb15">
		<div class="layout-col flex2 mr15">
			<div class="flex-col flex2 mb15">
				<r1 class="flex1 mb15 " />
				<r2 class="flex1" />
		  </div>
			<r3 class="flex1" />
		</div>
		<div class="layout-col flex5">
			<l1 class="flex2 mb15" />
			<div class="flex1 ww100 flex-sc hidden">
        <l21 class="flex1 hh100 mr15" v-model:grain="state.grain1" @getStar="getStar" />
				<l22 class="flex1 hh100" v-model:grain="state.grain2" @getStar="getStar" />
			</div>
			<!-- <l2 class="flex1" @getLog="getLog" /> -->
		</div>
	</div>
</template>

<script lang="ts" setup>
	import r1 from './r1'
	import r2 from './r2'
	import r3 from './r3'
	import l1 from './l1'
	// import l2 from './l2'
	import l21 from './l21'
	import l22 from './l22'
	import scheduled from "@/utils/scheduled"
	const { createScheduled } = scheduled()
	const { proxy }:any = getCurrentInstance()
	const configStore = proxy.configStore()
	const publicStore = proxy.publicStore()
	const dictStore = proxy.dictStore()
	const state = reactive({
		...publicStore.$state,
		num: 0,
		init: 0,
		grain1: 'day',
		grain2: 'day',
	})

	// 生命周期
	onMounted(async() => {
	  init()
    createScheduled('monitor2', 5*1000, () => { getReal() })
	})

	// 实时请求
	const getReal = async() => {
		getDevicesData()
		getLogType()
		// getLog()
		getStar()
	}

  // 初始化
	const init = async() => {
		await getInit()
		getDevices()
		// getLog()
		getStar()
	}

	// 初始化详情
	const getInit = async() => {
    let query1 = {model: "t_sensor_template", args: `attribute=0`}
		let query2 = {model: "t_station", args: `parent_id='${configStore.distributId}'`}
		let query3 = {model: "t_sensor_template_cfg_point", args: `type='1'`}
		let query4 = {model: "t_sensor_alarm_type"}
    let params = {Api1: query1, Api2: query2, Api3: query3, Api4: query4}
		let res = await publicStore.http(params)
		state.templates = proxy.isNull(res.Api1)? [] : res.Api1
		state.bays = proxy.isNull(res.Api2)? [] : res.Api2
		state.alarmTypes = proxy.isNull(res.Api4)? [] : res.Api4
		let list = proxy.isNull(res.Api3)? [] : res.Api3
		let templateCfgs = []
		list.forEach(v => {
			if(!proxy.isNull(v.calcRuleExpres)){
				try {
					let cfg = JSON.parse(v.calcRuleExpres)
					if(!proxy.isNull(cfg)){
						let exist_cfg = templateCfgs.find(a=>a.sensor_type == v.sensor_type)
						if(exist_cfg) {
							exist_cfg.cfgs.push(cfg)
						}else{
							templateCfgs.push({sensor_type: v.sensor_type, cfgs: [cfg]})
						}
					}
				} catch (error) {
					console.error("解析失败:", error.message)
				}
			}
		})
		state.templateCfgs = templateCfgs
	} 

	// 获取设备信息
	const getDevices = async() => {
    let query = {model: "t_sensor", args: `stationNum='${configStore.distributId}' and class='0'`}
    let params = {Api: query}
		let res = await publicStore.http(params)
		publicStore._public.devices = proxy.isNull(res)? [] : res
		let templates = []
		let bays = []
		state.logType = {field: '', list: []}
		state.query = {model: "redis"}
		state.query.key = publicStore._public.devices.map((a) => {
      setTemplates(a, templates)
			setBays(a, bays)
			setCfg(a)
			setAlarmTypes(a)
			return "mo:Hash:sensor:" + a.id
		})
		publicStore._public.templates = templates
		publicStore._public.bays = bays
		getDevicesData()
		getLogType()
	}

	// 设置类型
	const setTemplates = (a, templates) => {
		if(!proxy.isNull(state.templates)){
      templates.some(b => b.type == a.type) || (state.templates.find(b => b.type == a.type) && templates.push(state.templates.find(b => b.type == a.type)))
		}else{
			templates = []
		}
	}

	// 设置间隔
	const setBays = (a, bays) => {
		if(!proxy.isNull(state.bays)){
      bays.some(b => b.id == a.bayNum) || (state.bays.find(b => b.id == a.bayNum) && bays.push(state.bays.find(b => b.id == a.bayNum)))
		}else{
			bays = []
		}
	}

	// 设置配置
	const setCfg = (a) => {
		if(!proxy.isNull(state.templateCfgs)){
			let exist_cfg = state.templateCfgs.find(b=>b.sensor_type == a.type);
			if(exist_cfg) {
				a.cfgs = exist_cfg.cfgs
			}
		}
	}

	// 设置告警类型
	const setAlarmTypes = (a) => {
		if(!proxy.isNull(state.alarmTypes)){
			let exist = state.logType.list.find(b=>b.alarm_class == a.type)
			if(!exist){
				let alarmTypes = state.alarmTypes.filter(b=>b.alarm_class == a.type)
				if(!proxy.isNull(alarmTypes)){
					alarmTypes.forEach(c => {
						state.logType.list.push(c)
						state.logType.field += `COUNT(CASE WHEN clear_type = 0 AND alarm_code = '${c.alarm_code}' AND sensor_type= '${c.alarm_class}' THEN 1 END) AS ${c.alarm_class}_${c.alarm_code},`
					})
				}
			}
		}
	}

	// 实时请求设置信息
	const getDevicesData = async() => {
		if (!proxy.isNull(publicStore._public.devices)){
			let res = await publicStore.http({getApi: state.query})
			let baysData = JSON.parse(JSON.stringify(publicStore._public.bays))
			let homeInfo = {}
			let homeDevices = []
      publicStore._public.devices.forEach(vv => {
        let device =  Object.assign({}, vv)
        let redis_exist = res.find(a=>a.sensor_id == vv.id)
        let redis_data = redis_exist? redis_exist : {}
        Object.assign(device, redis_data)
        if(device.isAlarm) device.alarm = device.isAlarm>0? '1' : '0'
				if(!proxy.isNull(baysData)){
					let bay = baysData.find(a=>a.id == vv.bayNum)
					if(bay) setData(bay, redis_data)
				}
        setData(homeInfo, redis_data)
        homeDevices.push(device)
      })
			publicStore._public.baysData = baysData
      publicStore._public.homeInfo = homeInfo
      publicStore._public.homeDevices = homeDevices
		} else{
			publicStore._public.baysData = []
      publicStore._public.homeInfo = {}
      publicStore._public.homeDevices = []
    }
		publicStore._public.init = !publicStore._public.init
		getLineType()
	}

	// 设置数据
  const setData = (info, data) => {
    info['sum'] = !info['sum'] ? 1 : info['sum'] + 1
    Object.keys(data).forEach((key)=>{
      if (key.indexOf('_tc')==-1 && (typeof data[key] === 'number' || (typeof data[key] === 'string' && data[key].trim() !== '' && !isNaN(Number(data[key].trim()))))) {
        if(key == 'timestamp'){
          // 最大
          if(!info[key] || info[key] && info[key]<data[key]) info[key] = data[key]
        }else{
          // 累计
          info[key] = !info[key] ? Number(data[key]) : Number(info[key]) + Number(data[key])
        }
        // 工况
        if(key == 'offline') {
          info[key+data[key]] = !info[key+data[key]] ? 1 : info[key+data[key]] + 1
        }
        // 告警
        if(key == 'isAlarm') {
          if(data[key] > 0) info['alarm1'] = !info['alarm1'] ? 1 : info['alarm1'] + 1
          if(data[key] == 0) info['alarm0'] = !info['alarm0'] ? 1 : info['alarm0'] + 1
        }
        // 运行状态
        if(key == 'Operation_State') {
          info[key+data[key]] = !info[key+data[key]] ? 1 : info[key+data[key]] + 1
        }
				// 空调运行
				if(key == '2022') {
					info[key+data[key]] = !info[key+data[key]] ? 1 : info[key+data[key]] + 1
				}
      } 
    })
  }

	const getStar = async() => {
		let query1 = { model: "t_sensortype_star", args: `stationnum='${configStore.distributId}' and type='PA' and grain='${state.grain1}'`, limit: 1 }
		let query2 = { model: "t_sensortype_star", args: `stationnum='${configStore.distributId}' and type='PB' and grain='${state.grain2}'`, limit: 1 }
		let res = await publicStore.http({Api1: query1, Api2: query2})
		if(!proxy.isNull(res)){
			// 发电预测
			setStar1(res.Api1)
      // 负荷预测
			setStar2(res.Api2)
		}
	}

	const setStar1 = async(res) => {
		let format = '{m}-{d} {h}:{i}:{s}'
		let start = 0
		let end = 0
		let chart = [{name: '实际曲线', code: 'OutputPower', data: []},{name: '预测曲线', code: 'OutputPower', data: []}]
		let list = []
		let data = res.find(a=>a.type == 'PA')
		if(data)	list = JSON.parse(data['value'])
		chart[1].data = list.map((v, i)=> {
			const value = Math.floor(100*Number(v.value))/100
			const timestamp = Date.parse(v.time)
			start = timestamp < start ? timestamp : start
			end = timestamp > end ? timestamp : end
			return [proxy.parseTime(v.time, format), v.power, timestamp+'']
		})
		let timekey = 'date'
		let type = 'photovoltaic'
		let code = 'pv_active_power'
		let args = `code IN ('${code}') and station_num='${configStore.distributId}' and type='${type}'`
		let query = {model: "t_sensor_measure_float_station", args: args, order: "(date + 0) desc", limit: 200 }
		args = args + ` and date > ${start} and date < ${end}`
		let ress = await publicStore.http({Api: query})
    if(!proxy.isNull(ress)){
			ress.forEach((v, i)=> {
				const value = Math.floor(100*Number(v.value))/100
				const timestamp = v[timekey]
				const time = !isNaN(parseFloat(timestamp)) && isFinite(timestamp)? parseTime(timestamp, format) : timestamp.split('T')[0].slice(5)
				const item = [time, value, timestamp]
				const exist = chart[0].data.find(a=>a[0]==time)
				v[code] = value
				if(exist){
					exist[1] += value
				}else{
					chart[0].data.unshift(item)
				}
			})
		}
		publicStore._public.DevicesOutputPower = [...chart]
	}

	const setStar2 = async(res) => {
		let format = '{m}-{d} {h}:{i}:{s}'
		let start = 0
		let end = 0
		let chart = [{name: '实际曲线', code: 'Power', data: []}, {name: '预测曲线', code: 'Power', data: []}]
		let list = []
		let data = res.find(a=>a.type == 'PB')
		if(data)	list = JSON.parse(data['value'])
		chart[1].data = list.map((v, i)=> {
			const value = Math.floor(100*Number(v.value))/100
			const timestamp = Date.parse(v.time)
			start = timestamp < start ? timestamp : start
			end = timestamp > end ? timestamp : end
			return [proxy.parseTime(v.time, format), v.power, timestamp+'']
		})
		// let timekey = 'date'
		// let type = 'photovoltaic'
		// let code = 'pv_active_power'
		// let args = `code IN ('${code}') and station_num='${configStore.distributId}' and type='${type}'`
		// let query = {model: "t_sensor_measure_float_station", args: args, order: "(date + 0) desc", limit: 200 }
		// args = args + ` and date > ${start} and date < ${end}`
		// let ress = await publicStore.http({Api: query})
    // if(!proxy.isNull(ress)){
		// 	ress.forEach((v, i)=> {
		// 		const value = Math.floor(100*Number(v.value))/100
		// 		const timestamp = v[timekey]
		// 		const time = !isNaN(parseFloat(timestamp)) && isFinite(timestamp)? parseTime(timestamp, format) : timestamp.split('T')[0].slice(5)
		// 		const item = [time, value, timestamp]
		// 		const exist = chart[0].data.find(a=>a[0]==time)
		// 		v[code] = value
		// 		if(exist){
		// 			exist[1] += value
		// 		}else{
		// 			chart[0].data.unshift(item)
		// 		}
		// 	})
		// }
		publicStore._public.DevicesPower = [...chart]
	}
	
	const getLog = async() => {
    let query = {model: "t_sensor_alarm_log", args: `clear_type=0`, limit: 10, order: 'last_activation_time desc'}
		let res = await publicStore.http({Api: query})
		publicStore._public.alarmLog = proxy.isNull(res)? [] : res
	} 

	const getLogType = async() => {
		if(!state.logType.field) return
		let query = {model: "t_sensor_alarm_log", field:  state.logType.field.slice(0, -1)}
		let res = await publicStore.http({Api: query})
		let data = proxy.isNull(res)? {} : res[0]
		publicStore._public.alarmType = state.logType.list.map((v, i) => {
			let key = v.alarm_class + '_' + v.alarm_code
			let value = data[key]? data[key] : 0
			return {name: v.alarm_name, value: value, color: dictStore.colorLists[i].color}
		});
    // console.log("publicStore._public.alarmType---", publicStore._public.alarmType)
	}

	const getLineType = async() => {
		if(proxy.isNull(publicStore._public.homeInfo)) return
		let l0 = publicStore._public.homeInfo.offline0?publicStore._public.homeInfo.offline0:0
		let l1 = publicStore._public.homeInfo.offline1?publicStore._public.homeInfo.offline1:0
		let l10 = publicStore._public.homeInfo.offline10?publicStore._public.homeInfo.offline10:0
    let ll = publicStore._public.homeInfo.sum - l0 - l1 - l10
		let res = [
			{name: '在线', value: l0, color: dictStore.colorLists[0].color},
			{name: '离线', value: l1, color: dictStore.colorLists[1].color},
			{name: '故障', value: l10, color: dictStore.colorLists[2].color},
			{name: '其他', value: ll, color: dictStore.colorLists[3].color},
		]
		publicStore._public.lineType = res
    // console.log("publicStore._public.lineType---", publicStore._public.lineType)
	}
</script>

<style lang="scss">
 
</style>
