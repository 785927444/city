<template>
  <div class="layout-col">
    <!-- 标题 -->
    <div class="ww100 flex-bc pl5 pr15 i15 ba1 mb4">  
        <span class="flex-sc h46 f16"><img class="w30" src="@/assets/imgs/title-dot.png"/><span>采样数据</span></span>
        <span class="flex-sc ml20">
          <span v-if="publicStore.status" class="rad4 bgi22 bo-i21-1 ptb4 plr8 cursor" @click.stop="publicStore.status = !publicStore.status">开始采样</span>
        </span>
    </div>
    <!-- 内容 -->
    <div class="layout-row p15 tc ba1 warp overlay i31">
      <div class="ww100 flex-sc tl">
        <span class="ww i15">设备名称</span>
        <span class="flex1">{{state.active?state.active.name:'暂无'}}</span>
      </div>
      <div class="ww100 flex-sc tl mt12">
        <span class="ww i15">采样时间</span>
        <span class="flex1">{{state.active&&state.active.timestamp?parseTime(state.active.timestamp):'/'}}</span>
      </div>
      <div class="ww100 flex-sc tl mt12">
        <span class="ww i15">在线工况</span>
        <span class="flex1" v-if="state.active&&state.active.offline" :class="find(state.offlines, ['value', state.active.offline], 'color')?find(state.offlines, ['value', state.active.offline], 'color'):''">
          {{find(state.offlines, ['value', state.active.offline], 'name')}}
        </span>
        <span v-else class="w100">/</span>
      </div>
      <div class="ww100 flex-sc tl mt12">
        <span class="ww i15">报警状态</span>
        <span class="flex1" v-if="state.active&&state.active.isAlarm&&!isNull(publicStore._public.alarmTypes)" :class="state.active.isAlarm=='0'?'i31':'i8'">
          {{state.active.isAlarm == '0'? '正常' : find(publicStore._public.alarmTypes, ['alarm_code', state.active.isAlarm], 'alarm_name')}}
        </span>
        <span v-else class="ww">/</span>
      </div>
      <div class="ww100 flex-sc tl mt12" v-for="(v, i) in state.active&&!isNull(state.active.datas)?state.active.datas.filter(a=>a.code!='offline'&&a.code!='isAlarm'):[]" :key="i">
        <span class="ww i15">{{v.name}}</span>
        <span class="flex1" v-if="!isNull(v.calcRuleExpres) && !isNull(v.calcRuleExpres.attr)" :class="v.value?find(v.calcRuleExpres.attr, ['value', v.value], 'color'):'i31'">
          {{find(v.calcRuleExpres.attr, ['value', v.value], 'name')}}
        </span>
        <span class="flex1 i31" v-else-if="!isNull(v.calcRuleExpres) && isNull(v.calcRuleExpres.attr)">
          {{v.value?((Math.round(v.value*100)/100) + ' ' + (v.calcRuleExpres.dw?v.calcRuleExpres.dw:'')) : '/'}}
        </span> 
        <span class="flex1" v-else>
          {{v.value?((Math.round(v.value*100)/100)) : '/'}}
        </span>
      </div>
    </div>

  </div>
</template>

<script lang="ts" setup>
  const { proxy }: any = getCurrentInstance();
  const publicStore = proxy.publicStore();
  const configStore = proxy.configStore();
  const state = reactive({
    ...publicStore.$state,
    offlines: [
      {name:"在线", value:"0", color: 'i11'},
      {name:"离线", value:"1", color: 'i6'},
      {name:"故障", value:"10", color: 'i8'}
    ],
  });

  watch(() => publicStore.active, async(val, old) => {
    if(proxy.isNull(val)) return
    if(JSON.stringify(val) == JSON.stringify(old)) return
    await nextTick();
    state.active = {}
  }, { immediate: false, deep: true });

  watch(() => publicStore.model, async(val, old) => {
    if(JSON.stringify(val) == JSON.stringify(old)) return
    await nextTick();
    state.temp_avtive = {}
    if(!proxy.isNull(publicStore._public.sensors)){
      let sensor = publicStore._public.sensors.find(a=>a.id == publicStore.active.id)
      Object.assign(state.temp_avtive, val, sensor) 
      if(state.temp_avtive.timestamp_tc){
        redis()
      }else{
        await init()
      }
      state.active = {...state.temp_avtive}
    }
  }, { immediate: false, deep: true });

  const init = async() => {
    let query1 = {model: `t_sensor_measure_float`, args: `sensor_id='${state.temp_avtive.id}' and timestamp='${state.temp_avtive.timestamp}'`}
    let query2 = {model: `t_sensor_measure_int`, args: `sensor_id='${state.temp_avtive.id}' and timestamp='${state.temp_avtive.timestamp}'`}
    let res = await publicStore.http({Api1: query1, Api2: query2})
    let res1 = proxy.isNull(res.Api1)?  [] : res.Api1
    let res2 = proxy.isNull(res.Api2)? [] : res.Api2
    let ress = [...res1, ...res2]
    state.temp_avtive.datas = publicStore._public.meas.map(v => {
      let temp = {}
      Object.assign(temp, v)
      let exist = ress.find(a=>a.measurement_code == temp.code)
      temp.value = exist? exist.value+'' : ''
      if(temp.code == 'offline') state.temp_avtive.offline = temp.value
      if(temp.code == 'isAlarm') state.temp_avtive.isAlarm = temp.value
      return temp
    })
  }

  const redis = async() => {
    state.temp_avtive.datas = publicStore._public.meas.map(v => {
      let value = state.temp_avtive[v.code]? state.temp_avtive[v.code] + '': ''
      let calcRuleExpres = v.calcRuleExpres? v.calcRuleExpres : ''
      return {sensor_id: state.temp_avtive.sensor_id, timestamp: state.temp_avtive.timestamp, name: v.name, code: v.code, value: value, calcRuleExpres: calcRuleExpres}
    })
  }

</script>

<style scoped lang="scss">
.ww{width: 120px; margin-right: 10px;}
</style>
