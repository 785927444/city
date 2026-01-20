<template>
  <div class="layout-row plr15 pb15">
    <MyTree class="flex1 hh100 mr15" />
    <div class="flex4 layout-col">
      <t1 class="mb15" />
      <c1 class="flex3 mb15" />
      <b1 class="flex5" />
    </div>
  </div>
</template>
<script lang="ts" setup>
  import MyTree from "./tree";
  import t1 from "./t1";
  import c1 from "./c1";
  import b1 from "./b1";
  import scheduled from "@/utils/scheduled";
  const { createScheduled } = scheduled();
  const { proxy }: any = getCurrentInstance();
  const configStore = proxy.configStore();
  const publicStore = proxy.publicStore();
  const state = reactive({
    ...publicStore.$state,
  });

  onMounted(async () => {
    await getInit();
    createScheduled("air_control", 3 * 1000, () => {
      getDevicesData();
      getDevicesPower();
    });
  });

	onBeforeUnmount(async() => {
		publicStore._public.DevicesPower = ''
		publicStore.rechart()
	})

  watch(() => publicStore.active, async (val) => {
    if(proxy.isNull(val)) return
    getDevices();
  },{ immediate: false, deep: true });

  watch(() => publicStore._public.init, async (val) => {
    getDevices();
  },{ immediate: false, deep: true });

  const getInit = async () => {
    let query2 = { model: "t_sensor_control_property"}
    let query3 = { model: "t_sensor_template_control_point"}
    let res = await publicStore.http({ Api2: query2, Api3: query3 })
    publicStore._public.sensorControls = proxy.isNull(res.Api2)? [] : res.Api2;
    publicStore._public.templateControls = proxy.isNull(res.Api3)? [] : res.Api3.sort((a, b) => a.order - b.order);
  };

  const getDevices = async () => {
    if(proxy.isNull(publicStore.active)) return
    publicStore._public.devices = publicStore.active.parent_id == '0'? 
    publicStore._public.allDevices.filter(a=>a.stationNum == publicStore.active.id) :
    publicStore._public.allDevices.filter(a=>a.bayNum == publicStore.active.id)
    state.query = {model: "redis"}
    state.ids = []
    state.query.key = publicStore._public.devices.map((a) => {
      // ids
      let id = state.ids.find(b=>b == a.id)
      if(!id) state.ids.push(a.id)
      // 控制
      a.control = []
      let sensorControls = !proxy.isNull(publicStore._public.sensorControls)? publicStore._public.sensorControls.filter(b=>b.sensor_id == a.id) : []
      if(!proxy.isNull(sensorControls)){
        sensorControls.forEach(c => {
          if(!proxy.isNull(c.value)){
            try {
              let temp = JSON.parse(c.value)
              a.control.push(temp)
            } catch (error) {
              console.error("解析失败:", error.message)
            }
          }
        })
      } else{
        let templateControls = publicStore._public.templateControls.filter(b=>b.sensor_type == a.type)
        if(!proxy.isNull(templateControls)){
          templateControls.forEach(c => {
            if(!proxy.isNull(c.calcRuleExpres)){
              try {
                let temp = JSON.parse(c.calcRuleExpres)
                a.control.push(temp)
              } catch (error) {
                console.error("解析失败:", error.message)
              }
            }
          })
        }
      }
      // 实时
      return "mo:Hash:sensor:" + a.id;
    });
    getDevicesData();
    getDevicesPower();
  };

  // 实时请求设置信息
  const getDevicesData = async() => {
    if (!proxy.isNull(publicStore._public.devices)){
      let params = {getApi: state.query}
      let res = await publicStore.http(params)
      let homeInfo = {}
      let homeDevices = []
      publicStore._public.devices.forEach(vv => {
        // 重置实时
        let device =  Object.assign({}, vv)
        let redis_exist = res.find(a=>a.sensor_id == vv.id)
        let redis_data = redis_exist? redis_exist : {}
        Object.assign(device, redis_data)
        if(device.isAlarm) device.alarm = device.isAlarm>0? '1' : '0'
        setData(homeInfo, redis_data)
        // 获取设备
        homeDevices.push(device)
      })
      publicStore._public.homeInfo = homeInfo
      publicStore._public.homeDevices = homeDevices
      // console.log("publicStore._public.homeInfo---", publicStore._public.homeInfo)
      // console.log("publicStore._public.homeDevices---", publicStore._public.homeDevices)
    } else{
      publicStore._public.homeInfo = {};
      publicStore._public.homeDevices = [];
    }
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
        if(key == '2022') {
          info[key+data[key]] = !info[key+data[key]] ? 1 : info[key+data[key]] + 1
        }
      } 
    })
  }

  // 总功率
  watch(() => publicStore.datetime, async (val) => {
    getDevicesPower();
  },{ immediate: false, deep: true });

  // 查看总功率
  watch(() => publicStore.chartDot, async(val, old) => {
    if(proxy.isNull(val)) return
    if(!proxy.isNull(publicStore._public.homeInfo) && !proxy.isNull(publicStore._public.homeInfo.timestamp) && Number(publicStore._public.homeInfo.timestamp) == Number(val[2])){
      publicStore._public.DevicesPowerList = ''
    }else{
      let timestamp = val[2]+''
      let DevicesPowerList = []
      state.DevicesPowerList.forEach(v => {
        if(v.timestamp == timestamp) {
          let exsit = publicStore._public.devices.find(a=>a.id == v.sensor_id)
          if(exsit) {
            v.name = exsit.name
            DevicesPowerList.push(v)
          }
        }
      })
      publicStore._public.DevicesPowerList = DevicesPowerList
    }
  }, { immediate: false, deep: true });

  const getDevicesPower = async() => {
    let name = 'DevicesPower'
    let code = "Total_Power"
    let chart = [{name: '功率趋势', code: code, data: []}]
    if (!proxy.isNull(publicStore._public.devices)){
      let query = getCodeQuery(code)
      let res = await publicStore.http({ Api: query })
      let list = proxy.isNull(res)? [] : res
      let timekey = !proxy.isNull(publicStore.active) && publicStore.active.parent_id == '0'?'date':'timestamp'
      list.forEach((v, i)=> {
        let value = Math.floor(100*Number(v.value))/100
        let timestamp = v[timekey]
        let time = proxy.parseTime(timestamp, '{m}-{d} {h}:{i}:{s}')
        let item = [time, value, timestamp]
        let exist = chart[0].data.find(a=>a[0]==time)
        v[code] = value
        if(exist){
          exist[1] += value
        }else{
          chart[0].data.unshift(item)
        }
      })
    } 
    publicStore._public[name] = chart
  }

  // 获取测点参数
  const getCodeQuery = (code) => {
    let query = {}
    if(!proxy.isNull(publicStore.active) && publicStore.active.parent_id == '0'){
      let limit = 20
      let args = `code IN ('${code}') and station_num='${publicStore.active.id}' and type='${publicStore.actIndex}'`
      if(!proxy.isNull(state.datetime)) args += ` and date>='${state.datetime.start}' and date<='${state.datetime.end}'`
      query = { model: "t_sensor_measure_float_station", order: "date desc", limit: limit, args: args }
    } else {
      let num = 10
      let length = publicStore._public.devices.length
      let limit = num * length > 100? 100 : num * length
      let ids = state.ids.map(a => `'${a}'`).join(',')
      let args = `measurement_code IN ('${code}') and sensor_id IN (${ids})`
      if(!proxy.isNull(state.datetime)) args += ` and timestamp>='${state.datetime.start}' and timestamp<='${state.datetime.end}'`
      query = { model: "t_sensor_measure_float", order: "timestamp desc", limit: limit, args: args }
    }
    return query
  }
</script>