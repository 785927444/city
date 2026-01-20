<template>
  <div class="layout-col">
    <!-- 标题 -->
    <div class="ww100 flex-bc pl5 pr15 i15 ba1 mb4">  
        <span class="flex-sc h46 f16"><img class="w30" src="@/assets/imgs/title-dot.png"/><span>告警分类</span></span>
        <span class="flex-sc ml20">
        </span>
    </div>
    <!-- 内容 -->
    <div class="layout-row ba1 flex-cc">
      <div class="flex1"></div>
      <div class="ww100 flex4 relative flex-cc">
        <img class="w50x3" src="@/assets/imgs/tt2.png" />
        <div class="absolute-cc hh100" style="width: 100%" id="Pie_sensorAlarm"></div>
        <div class="absolute-cc cursor tc f14">
          <div class="mb2 fw f18">{{state.sum?state.sum:0}}</div>
          <div >总数</div>
        </div>
      </div>
      <div class="flex-col-cs flex4 relative ml20 hh100  ptb15 overlay">
        <div class="ww100 flex-sc tl p5 cursor" v-for="(v, i) in publicStore._public.alarmType" :key="i">
          <div class="w8 h8 mr8 rad100" :style="{background: v.color}"></div>
          <div class="ww55">{{v.name}}</div>
          <div class="w80">{{v.value}}</div>
          <div class="flex1">{{v.rate}}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import ec from "@/utils/chart";
  const { drawChart } = ec();
  const { proxy }: any = getCurrentInstance();
  const publicStore = proxy.publicStore();
  const configStore = proxy.configStore();
  const dictStore = proxy.dictStore();
  const state = reactive({
    ...publicStore.$state,
    sum: 0
  });

  watch(() => publicStore.active, async(val, old) => {
    if(proxy.isNull(val)) return
    if(JSON.stringify(val) == JSON.stringify(old)) return
    await nextTick();
    if(!proxy.isNull(publicStore._public.alarmType)) publicStore._public.alarmType.forEach(v => { v.value = 0 })
  }, { immediate: false, deep: true });

  watch(() => publicStore.model, async(val, old) => {
    if(JSON.stringify(val) == JSON.stringify(old)) return
    await nextTick();
    if(!proxy.isNull(publicStore._public.alarmTypes)){
      state.logType = {field: '', list: []}
      publicStore._public.alarmTypes.forEach((c, i) => {
        state.logType.list.push(c)
        let args = `COUNT(CASE WHEN clear_type = 0 AND alarm_code = '${c.alarm_code}' AND sensor_type= '${c.alarm_class}' AND sensor_id= '${publicStore.active.id}' THEN 1 END) AS ${c.alarm_class}_${c.alarm_code},`
        if(!proxy.isNull(publicStore.datetime)){
          let start = Date.parse(publicStore.datetime[0]) + ''
          let end = Date.parse(publicStore.datetime[1]) + ''
          args = `COUNT(CASE WHEN clear_type = 0 AND alarm_code = '${c.alarm_code}' AND sensor_type= '${c.alarm_class}' AND sensor_id= '${publicStore.active.id}' AND alarm_time>='${start}' and alarm_time<='${end}' THEN 1 END) AS ${c.alarm_class}_${c.alarm_code},`
        }
        state.logType.field += args
      })
      init()
    }
  }, { immediate: false, deep: true });

	const init = async() => {
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


  watch(() => publicStore._public.alarmType, async (val, old) => {
    if(proxy.isNull(val)) return
    if(JSON.stringify(val) == JSON.stringify(old)) return
    await nextTick()
    setChart(JSON.parse(JSON.stringify(val)))
  },{ immediate: false, deep: true })

	const setChart = async(data) => {
    let chart = 'Pie'
    let id = 'Pie_sensorAlarm'
    let params = {
        colorList: [],
        radius: ['78%', '60%'],
        labelShow: false,
        internalDiameterRatio: 0.8, 
        distance: 200, 
        alpha: 30, 
        pieHeight: 20, 
        opacity: 0.8
    }
    state.sum = 0
    data.forEach((item:any)=>{
        state.sum+=item.value
    })
    // state.sum = state.sum.toFixed(2);
    drawChart(chart, id, {}, data, params)
	}
</script>

<style scoped lang="scss">

</style>
