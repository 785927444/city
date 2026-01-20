<template>
  <div class="layout-row i15">
    <!-- 系统信息 -->
    <div class="flex1 hh100 p10">
      <div class="layout-col ba1 rad5 p20 f16" >
        <div class="ww100 flex-sc">
          <span class="w50x2">本地时间</span>
          <span class="white">{{ state.locattime }}</span>
        </div>
        <div class="ww100 flex-sc mt25">
          <span class="w50x2">系统时间</span>
          <span class="white">{{ !isNull(state.host)&&state.host.currentTime? parseTime(state.host.currentTime) : '' }}</span>
        </div>
        <div class="ww100 flex-sc mt25">
          <span class="w50x2">运行时长</span>
          <span class="white">{{ !isNull(state.host)&&state.host.uptime? formatUptime(state.host.uptime) : '' }}</span>
        </div>
        <div class="ww100 flex-sc mt25">
          <span class="w50x2">开机时间</span>
          <span class="white">{{ !isNull(state.host)&&state.host.boot_time? parseTime(state.host.boot_time*1000) : '' }}</span>
        </div>
        <div class="ww100 flex-sc mt25">
          <span class="w50x2">关机时间</span>
          <span class="white">{{ !isNull(state.host)&&state.host.last_shutdown_time? parseTime(state.host.last_shutdown_time*1000) : '' }}</span>
        </div>
        <div class="ww100 flex-sc mt25">
          <span class="w50x2">操作系统</span>
          <span class="white">{{ !isNull(state.host)&&state.host.os? state.host.os : '' }}</span>
        </div>
        <div class="ww100 flex-sc mt25">
          <span class="w50x2">内核版本</span>
          <span class="white">{{ !isNull(state.host)&&state.host.kernel_version? state.host.kernel_version : '' }}</span>
        </div>
        <div class="ww100 flex-sc mt25">
          <span class="w50x2">发行名称</span>
          <span class="white mr10">{{ !isNull(state.host)&&state.host.platform? state.host.platform : '' }}</span>
        </div>
        <div class="ww100 flex-sc mt25">
          <span class="w50x2">发行家族</span>
          <span class="white mr10">{{ !isNull(state.host)&&state.host.platform_family? state.host.platform_family : '' }}</span>
        </div>
        <div class="ww100 flex-sc mt25">
          <span class="w50x2">发行版本</span>
          <span class="white mr10">{{ !isNull(state.host)&&state.host.platform_version? state.host.platform_version : '' }}</span>
        </div>
      </div>
    </div>
    <!-- 其他信息 -->
    <div class="flex3 hh100 flex-col">
      <!-- CPU信息 -->
      <div class="flex1 hh100 p10">
        <div class="ww100 hh100 flex-col-bc ba1 rad5 hidden p20 relative">
          <div class="ww100 f20 flex-sc">
            <div class="bgi22 p15 ww20">
              <span class="">CPU信息</span>
              <span class="ml10">CPU</span>
            </div>
          </div>
          <div class="flex1 ww100 flex-sc mt15">
            <div class="flex-sc flex1">
              <span class="f22">物理核心</span>
              <span class="ml15 mr10 f30 white">{{ !isNull(state.cpu)&&state.cpu.physical_cores? state.cpu.physical_cores : '' }}</span>
              <span class="mt15">个</span>
            </div>
            <div class="flex-sc flex1">
              <span class="f22">逻辑核心</span>
              <span class="ml15 mr10 f30 white">{{ !isNull(state.cpu)&&state.cpu.logical_cores? state.cpu.logical_cores : '' }}</span>
              <span class="mt15">个</span>
            </div>
            <div class="flex-sc flex1">
              <span class="f22">插槽数量</span>
              <span class="ml15 mr10 f30 white">{{ !isNull(state.cpu)&&state.cpu.sockets? state.cpu.sockets : '' }}</span>
              <span class="mt15">个</span>
            </div>
            <div class="flex-sc flex1">
              <span class="f22">运行频率</span>
              <span class="ml15 mr10 f30 white">{{ !isNull(state.cpu)&&state.cpu.mhz? state.cpu.mhz : '' }}</span>
              <span class="mt15">GHz</span>
            </div>
            <div class="flex-sc flex1"></div>
          </div>
          <div class="ww100 relative">
            <div class="ww100 h38 black-rgba60 rad4"></div>
            <div class="h38 absolute z1 t0 l0 radd" 
            :class="!isNull(state.cpu)?'ww' + Math.floor(state.cpu.usage_percent):''" 
             :style="{backgroundImage: 
             !isNull(state.cpu) && state.cpu.usage_percent <= 35? 'linear-gradient(to right, #B1C9F1, #4187FF)': 
             !isNull(state.cpu) && state.cpu.usage_percent > 35 && state.cpu.usage_percent<=70 ? 'linear-gradient(to right, #fcf6c2, #FEC746)': 
             'linear-gradient(to right, #F98994, #DC1185)'}">
            </div>
          </div>
          <div class="absolute flex-ec r40 t40 z1">
            <div class="w50x2 h50x2" id="Liquidfill_liqu1"></div>                
          </div>
        </div>
      </div>
      <!-- 内存信息 -->
      <div class="flex1 hh100 p10">
        <div class="ww100 hh100 flex-col-bc ba1 rad5 hidden p20 relative">
          <div class="ww100 f20 flex-sc">
            <div class="bgi22 p15 ww20">
              <span class="">内存信息</span>
              <span class="ml10">Memory</span>
            </div>
          </div>
          <div class="flex1 ww100 flex-sc mt15">
            <div class="flex-sc flex1">
              <span class="f22">总量</span>
              <span class="ml15 mr10 f30 white">{{ !isNull(state.memory)&&state.memory.total? bytesToMB(state.memory.total) : '' }}</span>
              <span class="mt15">MB</span>
            </div>
            <div class="flex-sc flex1">
              <span class="f22">使用</span>
              <span class="ml15 mr10 f30 white">{{ !isNull(state.memory)&&state.memory.used? bytesToMB(state.memory.used) : '' }}</span>
              <span class="mt15">MB</span>
            </div>
            <div class="flex-sc flex1">
              <span class="f22">可用</span>
              <span class="ml15 mr10 f30 white">{{ !isNull(state.memory)&&state.memory.available? bytesToMB(state.memory.available) : '' }}</span>
              <span class="mt15">MB</span>
            </div>
            <div class="flex-sc flex1"></div>
          </div>
          <div class="ww100 relative">
            <div class="ww100 h38 black-rgba60 rad4"></div>
            <div class="h38 absolute z1 t0 l0 radd" 
            :class="!isNull(state.memory)?'ww' + Math.floor(state.memory.used_percent):''" 
             :style="{backgroundImage: 
             !isNull(state.memory) && state.memory.used_percent <= 35? 'linear-gradient(to right, #B1C9F1, #4187FF)': 
             !isNull(state.memory) && state.memory.used_percent > 35 && state.memory.used_percent<=70 ? 'linear-gradient(to right, #fcf6c2, #FEC746)': 
             'linear-gradient(to right, #F98994, #DC1185)'}">
            </div>
            <div class="absolute ww100 flex-ec r0 tx z1">
              <span>已使用：</span>
              <span>{{!isNull(state.memory)&&state.memory.used? bytesToMB(state.memory.used) + 'MB': ''}} / {{ !isNull(state.memory)&&state.memory.total? bytesToMB(state.memory.total) + 'MB' : '' }}</span>
            </div>
          </div>
          <div class="absolute flex-ec r40 t40 z1">
            <div class="w50x2 h50x2" id="Liquidfill_liqu2"></div>                
          </div>
        </div>
      </div>
      <!-- 硬盘信息 -->
      <div class="flex1 hh100 p10">
        <div class="ww100 hh100 flex-col-bc ba1 rad5 hidden p20 relative">
          <div class="ww100 f20 flex-sc">
            <div class="bgi22 p15 ww20">
              <span class="">硬盘信息</span>
              <span class="ml10">Disk</span>
            </div>
          </div>
          <div class="flex1 ww100 flex-sc mt15">
            <div class="flex-sc flex1">
              <span class="f22">总量</span>
              <span class="ml15 mr10 f30 white">{{ !isNull(state.disk)&&state.disk.total? bytesToMB(state.disk.total) : '' }}</span>
              <span class="mt15">MB</span>
            </div>
            <div class="flex-sc flex1">
              <span class="f22">使用</span>
              <span class="ml15 mr10 f30 white">{{ !isNull(state.disk)&&state.disk.used? bytesToMB(state.disk.used) : '' }}</span>
              <span class="mt15">MB</span>
            </div>
            <div class="flex-sc flex1">
              <span class="f22">可用</span>
              <span class="ml15 mr10 f30 white">{{ !isNull(state.disk)&&state.disk.free? bytesToMB(state.disk.free) : '' }}</span>
              <span class="mt15">MB</span>
            </div>
            <div class="flex-sc flex1"></div>
          </div>
          <div class="ww100 relative">
            <div class="ww100 h38 black-rgba60 rad4"></div>
            <div class="h38 absolute z1 t0 l0 radd" 
            :class="!isNull(state.disk)?'ww' + Math.floor(state.disk.used_percent):''" 
             :style="{backgroundImage: 
             !isNull(state.disk) && state.disk.used_percent <= 35? 'linear-gradient(to right, #B1C9F1, #4187FF)': 
             !isNull(state.disk) && state.disk.used_percent > 35 && state.disk.used_percent<=70 ? 'linear-gradient(to right, #fcf6c2, #FEC746)': 
             'linear-gradient(to right, #F98994, #DC1185)'}">
            </div>
            <div class="absolute ww100 flex-ec r0 tx z1">
              <span>已使用：</span>
              <span>{{!isNull(state.disk)&&state.disk.used? bytesToMB(state.disk.used) + 'MB': ''}} / {{ !isNull(state.disk)&&state.disk.total? bytesToMB(state.disk.total) + 'MB' : '' }}</span>
            </div>
          </div>
          <div class="absolute flex-ec r40 t40 z1">
            <div class="w50x2 h50x2" id="Liquidfill_liqu3"></div>                
          </div>
        </div>
      </div>
    </div>
    <!-- <div class="layout-row i15" style="height: 33.3%;">
      <div class="flex1 hh100 p10">
        <div class="layout-col ba1 rad5 p20">
          <div><span class="f16">CPU负荷率</span><span class="ml10">CPU_load</span></div>
          <div class="layout-row mt10">
            <div class="flex1 hh100 flex-col-ss">
              <div class="flex-cc"><span class="f40">{{ state.CPU_load?Math.floor((state.CPU_load*1000))/10:'' }}</span><span class="ml10 mt18">%</span></div>
            </div>
            <div class="flex1 hh100 flex-col-cc">
              <div class="ww60 hh60"id="Liquidfill_liqu1"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex1 hh100 p10">
        <div class="layout-col ba1 rad5 p20">
          <div><span class="f16">内存使用率</span><span class="ml10">Memory_usagc</span></div>
          <div class="layout-row mt10">
            <div class="flex1 hh100 flex-col-ss">
              <div class="flex-cc"><span class="f40">{{ state.memory_usage?Math.floor((state.memory_usage*1000))/10:'' }}</span><span class="ml10 mt18">%</span></div>
            </div>
            <div class="flex1 hh100 flex-col-cc">
              <div class="ww60 hh60"id="Liquidfill_liqu2"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex1 hh100 p10">
        <div class="layout-col ba1 rad5 p20">
          <div><span class="f16">硬盘使用率</span><span class="ml10">Hard_disk_usage</span></div>
          <div class="layout-row mt10">
            <div class="flex1 hh100 flex-col-ss">
              <div class="flex-cc"><span class="f40">{{ state.hard_disk_usage?Math.floor((state.hard_disk_usage*1000))/10:'' }}</span><span class="ml10 mt18">%</span></div>
            </div>
            <div class="flex1 hh100 flex-col-cc">
              <div class="ww60 hh60"id="Liquidfill_liqu3"></div>
            </div>
          </div>
        </div>
      </div>
    </div> -->
  </div>
</template>

<script lang="ts" setup>
  import ec from "@/utils/chart"
import { parseTime } from "@/utils/common"
	import scheduled from "@/utils/scheduled"
  const { drawChart } = ec()
	const { createScheduled } = scheduled()
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const state = reactive({
	  ...publicStore.$state,
  })

  onMounted(async() => {
    init()
    createScheduled('dashboard', 3*1000, () => { init() })
  })

  const init = async() => {
    let res = await publicStore.http({systemApi: {}})
    state.locattime = proxy.parseTime(new Date().getTime())
    if(!proxy.isNull(res)) {
      state.host = res.host
      state.cpu = res.cpu
      state.cpu_used_percent = Math.floor(res.cpu.usage_percent)/100
      state.memory = res.memory
      state.memory_used_percent = res.memory.used_percent / 100
      state.disk = res.disk
      state.disk_used_percent = res.disk.used_percent / 100
    } else{
      state.host = {}
      state.cpu = {}
      state.memory = {}
      state.disk = {}
    }
    // console.log("res", res)
  }

  watch(() => state.cpu_used_percent, async (val, old) => {
    if(proxy.isNull(val)) return
    if(JSON.stringify(val) == JSON.stringify(old)) return
    await nextTick()
    let data = {name: 'CPU负荷率', status: val<=0.35?1:val>0.35&&val<=0.7?3:2, value: val}
    setChart1(JSON.parse(JSON.stringify(data)))
  },{ immediate: false, deep: true })

  watch(() => state.memory_used_percent, async (val, old) => {
    if(proxy.isNull(val)) return
    if(JSON.stringify(val) == JSON.stringify(old)) return
    await nextTick()
    let data = {name: '内存使用率', status: val<=0.35?1:val>0.35&&val<=0.7?3:2, value: val}
    setChart2(JSON.parse(JSON.stringify(data)))
  },{ immediate: false, deep: true })

  watch(() => state.disk_used_percent, async (val, old) => {
    if(proxy.isNull(val)) return
    if(JSON.stringify(val) == JSON.stringify(old)) return
    await nextTick()
    let data = {name: '硬盘使用率', status: val<=0.35?1:val>0.35&&val<=0.7?3:2, value: val}
    setChart3(JSON.parse(JSON.stringify(data)))
  },{ immediate: false, deep: true })

	const setChart1 = async(data) => {
    let chart = 'Liquidfill'
    let id = 'Liquidfill_liqu1'
    let params = {
        colorList: [],
        radius: ['78%', '60%'],
        labelShow: true,
    }
    drawChart(chart, id, {}, data, params)
	}

	const setChart2 = async(data) => {
    let chart = 'Liquidfill'
    let id = 'Liquidfill_liqu2'
    let params = {
        colorList: [],
        radius: ['78%', '60%'],
        labelShow: true,
    }
    drawChart(chart, id, {}, data, params)
	}

	const setChart3 = async(data) => {
    let chart = 'Liquidfill'
    let id = 'Liquidfill_liqu3'
    let params = {
        colorList: [],
        radius: ['78%', '60%'],
        labelShow: true,
    }
    drawChart(chart, id, {}, data, params)
	}

  const formatUptime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return '无效时间'
    const days = Math.floor(seconds / (3600 * 24))
    const hours = Math.floor((seconds % (3600 * 24)) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    const parts = []
    if (days > 0) parts.push(`${days}天`)
    if (hours > 0) parts.push(`${hours}时`)
    if (minutes > 0) parts.push(`${minutes}分`)
    if (secs > 0 || parts.length === 0) parts.push(`${secs}秒`)
    return parts.join(' ')
  }

  const bytesToMB = (bytes, precision = 2) => {
    if (isNaN(bytes)) return 'N/A'
    return (bytes / (1024 * 1024)).toFixed(precision)
  }

	// 获取设备信息
	// const getDevices = async() => {
  //   let query = {model: "t_sensor", args: `type='ZYTJZD' and class='0'`}
	// 	let res = await publicStore.http({Api: query})
	// 	publicStore._public.devices = proxy.isNull(res)? [] : res
	// 	state.query = {model: "redis"}
	// 	state.query.key = publicStore._public.devices.map((a) => { return "mo:Hash:sensor:" + a.id })
  //   getDevicesData()
	// }

	// 实时请求设置信息
	// const getDevicesData = async() => {
	// 	if (!proxy.isNull(publicStore._public.devices)){
	// 		let res = await publicStore.http({getApi: state.query})
	// 		let homeInfo = {}
	// 		let homeDevices = []
  //     publicStore._public.devices.forEach(vv => {
  //       let device =  Object.assign({}, vv)
  //       let redis_exist = res.find(a=>a.sensor_id == vv.id)
  //       let redis_data = redis_exist? redis_exist : {}
  //       Object.assign(device, redis_data)
  //       if(device.isAlarm) device.alarm = device.isAlarm>0? '1' : '0'
  //       setData(homeInfo, redis_data)
  //       homeDevices.push(device)
  //     })
  //     publicStore._public.homeInfo = homeInfo
  //     publicStore._public.homeDevices = homeDevices
	// 	} else{
  //     publicStore._public.homeInfo = {}
  //     publicStore._public.homeDevices = []
  //   }
  //   // publicStore._public.homeInfo = {CPU_load: '0.25', memory_usage: '0.50', memory_remaining: '100', hard_disk_usage: '0.75', hard_disk_remaining: '100'}
  //   console.log('publicStore._public.homeInfo', publicStore._public.homeInfo)
  //   console.log('publicStore._public.homeDevices', publicStore._public.homeDevices)
	// }

	// 设置数据
  // const setData = (info, data) => {
  //   info['sum'] = !info['sum'] ? 1 : info['sum'] + 1
  //   Object.keys(data).forEach((key)=>{
  //     if (key.indexOf('_tc')==-1 && (typeof data[key] === 'number' || (typeof data[key] === 'string' && data[key].trim() !== '' && !isNaN(Number(data[key].trim()))))) {
  //       if(key == 'timestamp'){
  //         // 最大
  //         if(!info[key] || info[key] && info[key]<data[key]) info[key] = data[key]
  //       }else{
  //         // 累计
  //         info[key] = !info[key] ? Number(data[key]) : Number(info[key]) + Number(data[key])
  //       }
  //       // 工况
  //       if(key == 'offline') {
  //         info[key+data[key]] = !info[key+data[key]] ? 1 : info[key+data[key]] + 1
  //       }
  //       // 告警
  //       if(key == 'isAlarm') {
  //         if(data[key] > 0) info['alarm1'] = !info['alarm1'] ? 1 : info['alarm1'] + 1
  //         if(data[key] == 0) info['alarm0'] = !info['alarm0'] ? 1 : info['alarm0'] + 1
  //       }
  //       // 运行状态
  //       if(key == 'Operation_State') {
  //         info[key+data[key]] = !info[key+data[key]] ? 1 : info[key+data[key]] + 1
  //       }
	// 			// 空调运行
	// 			if(key == '2022') {
	// 				info[key+data[key]] = !info[key+data[key]] ? 1 : info[key+data[key]] + 1
	// 			}
  //     } 
  //   })
  // }

  // watch(() => publicStore._public.homeInfo, async (val, old) => {
  //   if(proxy.isNull(val)) return
  //   if(JSON.stringify(val) == JSON.stringify(old)) return
  //   await nextTick()
  //   // cpu
  //   state.CPU_load = val.CPU_load/100
  //   // 内存使用率
  //   state.memory_usage = val.memory_usage/100
  //   // 内存剩余率
  //   state.memory_remain = 1 - state.memory_usage
  //   // 内存剩余量
  //   state.memory_remaining = val.memory_remaining
  //   // 内存总量
  //   state.memory = val.memory_remaining / state.memory_remain
  //   // 内存使用量
  //   state.memory_usageing = state.memory * state.memory_usage
  //   // 硬盘使用率
  //   state.hard_disk_usage = val.hard_disk_usage/100
  //   // 硬盘剩余率
  //   state.hard_disk_remain = 1 - state.hard_disk_usage
  //   // 硬盘剩余量
  //   state.hard_disk_remaining = val.hard_disk_remaining
  //   // 硬盘总量
  //   state.hard_disk = val.hard_disk_remaining / state.hard_disk_remain
  //   // 硬盘使用量
  //   state.hard_disk_usageing = state.hard_disk * state.hard_disk_usage
  // },{ immediate: false, deep: true })

</script>
  
<style scoped lang="scss">
.tx {
  top: -30px;
}
.radd {
  border-radius: 4px 0 0 4px;
}
</style>
  