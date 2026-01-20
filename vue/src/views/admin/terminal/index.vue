<template>
  <div class="layout-col">
    <!-- 标题 -->
		<aa-title title="终端">
      <template #right-content>
        <div class="flex-ec flex1">
            <div class="rad4 ptb5 plr8 flex-cc cursor bgi22 i21 ml10 bo-i21-1" 
            v-if="state.content.find(v=>{return typeof(v.key) == 'object'}) && state.content.find(v=>{return typeof(v.key) == 'object'})['key'].hasOwnProperty('add')" 
            @click.stop="handleClick('add', state.addItem)">
            <i-ep-plus class="f12 fw" /><span class="f14 ml4">{{state.content.find(v=>{return typeof(v.key) == 'object'})['key'].add}}</span>
          </div>
        </div>
      </template>
    </aa-title>    
    <!-- 内容 -->
    <div class="layout-col ba1">
      <div class="row bgi22">
        <div :style="{textAlign: v.align}" v-for="(v, i) in state.content" :key="i" v-show="v.show" :class="typeof(v.key) == 'object'?v.width +' '+ 'mlr5':v.width">{{v.name}}</div>
      </div>
      <div class="table">
        <div class="row cursor" :class="index%2 == 1?'bgi23':'bgi18'" v-for="(item, index) in state.list" :key="index" @click="handleClick('active', item)">
          <div v-show="v.show" :class="v.width" :style="{textAlign: v.align}" v-for="(v, i) in state.content" :key="i">
            <span v-if="typeof(v.key) == 'object'" class="cursor mlr5" :class="kk=='add'||state.auth[kk] == false?'none':kk=='del'?'i8':'i21'" v-for="(vv, kk, ii) in v.key" :key="ii" @click.stop="handleClick(kk, item)">{{vv}}</span>
            <span v-else-if="v.key=='*'">{{(state.page-1)*state.limit + index+1}}</span>
            <span v-else-if="v.type == 'time'">{{item[v.key] == 0?'/':parseTime(item[v.key])}}</span>
            <span v-else-if="v.type == 'select'" :class="find(v.list, [v.value, item[v.key]], 'color')?find(v.list, [v.value, item[v.key]], 'color'):''">
              {{find(v.list, [v.value, item[v.key]], v.label)}}
            </span>
            <span v-else-if="v.type == 'switch'">
              <el-switch v-model="item[v.key]" :active-text="v.value[1].name" :inactive-text="v.value[0].name" :active-value="v.value[1].value" :inactive-value="v.value[0].value" inline-prompt @change="handleClick('switch', item)"></el-switch>
            </span>
            <span v-else-if="v.type == 'input'"><el-input v-model="item[v.value]" placeholder="请输入" style="width: 150px;" size="small" /></span>
            <span v-else-if="v.type == 'image'" class="flex-sc warp">
              <div class="flex-sc">
                <el-image class="w25 h25 m2 rad3 cursor" v-if="item[v.key].length!=0" :src="item[v.key]" :preview-src-list="state.srcList" @click.stop="state.srcList= [];state.srcList.push(item[v.key])" />
                <span class="w50 h25 ca flex-sc" v-else>暂无</span>
              </div>
            </span>
            <span v-else>{{isNull(item[v.key]) && v.key!=''? '/' : item[v.key]}}</span>
          </div>
        </div>
        <div v-if="state.empty" class="flex-cc ww100 tc ptb13 bgi18">没有数据</div>
      </div>
    </div>
		<!-- 底部 -->
		<aa-foot></aa-foot>
    <Add @init="init" :state="state" ref="addRef" />
  </div>
</template>

<script lang="ts" setup>
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  let addRef = $ref()
  const state = reactive({
	  ...publicStore.$state,
    content: [
      { width: 'w70',   show: true, align: 'center', key: '*', name: '序号' },
      { width: 'w50x5', show: true, align: 'left', key: 'id', name: 'ID', type: 'icon5' },  
      { width: 'w50x5', show: true, align: 'left', key: 'name', name: '名称' },
      { width: 'w50x5', show: true, align: 'left', key: 'parent_type', name: '通信关联', type: 'select', list: [], value: 'id', label: 'name' },
      { width: 'w50x5', show: true, align: 'left', key: 'instlPos', name: '安装位置' },
      { width: 'flex1', show: true, align: 'right', key: {}, name: '操作' },
    ],
    editFrom: [],
    addItem: {},
    imgs: [],
    type: 'ZYTJZD',
  })

  onMounted(async() => {
    publicStore.init({path: '/sensor'}, state)
    if(!configStore.distributId) configStore.distributId = '0'
    let query1 = {model: "t_station", args: `parent_id='0'`}
    let query2 = {model: "t_sensor_template", args: `attribute='0'`}
    let query3 = {model: "t_model"}
    let query4 = {model: "t_sensor", args: configStore.distributId=='0'? `class='2'` : `class='2' and stationNum='${configStore.distributId}'`}
    query4.args = configStore.user&&configStore.user.role_id=='1'?query4.args : query4.args + ' and id > 0'
    let params = {Api1: query1, Api2: query2, Api3: query3, Api4: query4}
    let res = await publicStore.http(params)
    publicStore._public.stations = proxy.isNull(res.Api1)? [] : res.Api1.sort((a, b) => a.order - b.order)
    publicStore._public.templates = proxy.isNull(res.Api2)? [] : res.Api2
    publicStore._public.models = proxy.isNull(res.Api3)? [] : res.Api3
    publicStore._public.qzlist = proxy.isNull(res.Api4)? [] : res.Api4.map(a => ({...a, id: String(a.id)}))
    init()
  })

  watch(() => configStore.distributId, async(val, old) => {
    await nextTick()
    if(proxy.isNull(val)) return
    init()
  }, {immediate: false, deep: true})

  const init = async(key) => {
    state.query = {model: state.model, args: `parent_id='${publicStore.active.id}'`}
    state.query = configStore.distributId=='0'? {model: state.model, args: `type='${state.type}'`} : {model: state.model, args: `type='${state.type}' and stationNum='${configStore.distributId}'`}
    state.params = {Api: state.query}
    let res = await publicStore.http(state.params)
    state.empty = proxy.isNull(res)? true : false
    state.list = proxy.isNull(res)? [] : res.sort((a, b) => a.order - b.order)
    state.list.forEach(v => {
      if(!proxy.isNull(publicStore._public.models)){
        let exist = publicStore._public.models.find(a=>a.id == v.model)
        v.picture = exist? exist.picture : ''
      } else {
        v.picture = ''
      }
    })
    setInit()
  }
  
  const setInit = () => {
    if(!configStore.distributId || configStore.distributId == '0') {
      state.addItem = {class: '0'}
      state.editFrom = [
        { required: true, editshow: true, name: '厂站', key: 'stationNum', type: 'select', list: publicStore._public.stations, value: 'id', label: 'station_name' },
        { required: true, editshow: 'disabled',  name: 'ID', key: 'id',  type: 'input', class: 'number' },
        { required: true,  editshow: true, name: '名称', key: 'name', type: 'input' },
        // { required: true,  editshow: true,  name: '类型', key: 'type', type: 'select', list: [], value: 'type', label: 'name', relation: ['comm_params']},
        // { required: false, editshow: true,  name: '模型', key: 'model', type: 'select', list: [], value: 'id', label: 'name', filt: ['type', 'type'] },
        { required: false, editshow: 'none', name: '区域', key: 'bayNum', type: 'input'},
        { required: false, editshow: true, name: '安装位置', key: 'instlPos',  type: 'input' },
        // { required: false, editshow: true, name: '图谱计算', key: 'computeIntvalSec',  type: 'input' },
        { required: false, editshow: true, name: '采样存储', key: 'storeIntvalSecs',  type: 'input' },
        { required: false, editshow: true, name: '告警存储', key: 'alarmTigrStoreSecs',  type: 'input' },
        { required: false, editshow: true, name: 'IP/串口号',   key: 'localSvcIP',  type: 'input' },
        { required: false, editshow: true, name: '端口/波特率', key: 'localSvcPort', type: 'input' },
        { required: false, editshow: true, name: '通信关联', key: 'parent_type', type: 'select', list: [], value: 'id', label: 'name' },
        { required: false, editshow: true, name: '通信参数', key: 'comm_params',  type: 'json' },
      ]
    }else{
      state.addItem = {stationNum: configStore.distributId, class: '0'}
      state.editFrom = [
        { required: true, editshow: 'disabled',  name: 'ID', key: 'id',  type: 'input', class: 'number' },
        { required: true,  editshow: true, name: '名称', key: 'name', type: 'input' },
        // { required: true,  editshow: true,  name: '类型', key: 'type', type: 'select', list: [], value: 'type', label: 'name', relation: ['comm_params']},
        // { required: false, editshow: true,  name: '模型', key: 'model', type: 'select', list: [], value: 'id', label: 'name', filt: ['type', 'type'] },
        { required: false, editshow: 'none', name: '区域', key: 'bayNum', type: 'input'},
        { required: false, editshow: true, name: '安装位置', key: 'instlPos',  type: 'input' },
        // { required: false, editshow: true, name: '图谱计算', key: 'computeIntvalSec',  type: 'input' },
        { required: false, editshow: true, name: '采样存储', key: 'storeIntvalSecs',  type: 'input' },
        { required: false, editshow: true, name: '告警存储', key: 'alarmTigrStoreSecs',  type: 'input' },
        { required: false, editshow: true, name: 'IP/串口号',   key: 'localSvcIP',  type: 'input' },
        { required: false, editshow: true, name: '端口/波特率', key: 'localSvcPort', type: 'input' },
        { required: false, editshow: true, name: '通信关联', key: 'parent_type', type: 'select', list: [], value: 'id', label: 'name' },
        { required: false, editshow: true, name: '通信参数', key: 'comm_params',  type: 'json' },
      ]
    }
    state.content.forEach(v => {
      if(v.key == 'model') v.list = publicStore._public.models
      if(v.key == 'type') v.list = publicStore._public.templates
      if(v.key == 'parent_type') v.list = publicStore._public.qzlist
    })
    state.editFrom.forEach(v => {
      if(v.key == 'model') v.list = publicStore._public.models
      if(v.key == 'type') v.list = publicStore._public.templates
      if(v.key == 'parent_type') v.list = publicStore._public.qzlist
    })
    getParent()
  }

  const getParent = async() => {
    state.addItem.type = state.type
    let query = {model: state.model, args: `type='${state.type+'_node'}'`}
    let res = await publicStore.http({Api: query})
    if(!proxy.isNull(res)){
      state.addItem.parent_id = res[0].id
    }
  }

  const handleClick = async(remark, val) => {
    if(remark == 'add' || remark == 'upd'){
      addRef.onVisable(val)
    }
    if(remark == 'del'){
      addRef.del(val)
    }
    if(remark == 'sensorset'){
      proxy.toPath('/sensor_cfg_property', {sensorid: val.id})
    }
    if(remark == 'sensoralarm'){
      proxy.toPath('/sensor_alert_interval', {sensorid: val.id})
    }
    if(remark == 'sensorcontrol'){
      proxy.toPath('/sensor_control_property', {sensorid: val.id})
    }
  }
</script>
  
<style scoped lang="scss">

</style>
  