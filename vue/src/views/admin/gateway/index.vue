<template>
  <div class="layout-col">
    <!-- 标题 -->
    <div class="h40 ww100 flex-sc relative mb10">
      <img class="hh100" src="@/assets/imgs/title4.png" />
      <div class="ww100 hh100 flex-sc absolute pl35">
        <span class="fw flex1 ptb5">网关配置</span>
        <div class="flex-ec flex1">
          <div class="rad4 ptb5 plr8 flex-cc cursor bgi22 i21 ml10 bo-i21-1" 
            v-if="state.content.find(v=>{return typeof(v.key) == 'object'}) && state.content.find(v=>{return typeof(v.key) == 'object'})['key'].hasOwnProperty('add')" 
            @click.stop="handleClick('add', state.addItem)">
            <i-ep-plus class="f12 fw" /><span class="f14 ml4">{{state.content.find(v=>{return typeof(v.key) == 'object'})['key'].add}}</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 内容 -->
    <div class="row bgi22">
      <div :style="{textAlign: v.align}" v-for="(v, i) in state.content" :key="i" v-show="v.show" :class="typeof(v.key) == 'object'?v.width +' '+ 'mlr5':v.width">{{v.name}}</div>
    </div>
    <div class="table bss">
      <div class="row cursor" :class="publicStore.active[state.key] == item[state.key]?'active':index%2 == 1?'bgi23':'bgi18'" v-for="(item, index) in state.list" :key="index" @click="handleClick('active', item)">
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
          <span v-else-if="v.type == 'preload'&&v.filed">{{item[v.key]?item[v.key][v.filed]:''}}</span>
          <span v-else-if="v.type == 'image'" class="flex-sc warp">
            <div class="flex-sc" v-if="typeof(item[v.key]) == 'string'">
              <el-image class="w25 h25 m2 rad3 cursor" v-if="item[v.key].length!=0" :src="I(item[v.key])" :preview-src-list="state.srcList" @click.stop="state.srcList= [];state.srcList.push(I(item[v.key]))" />
              <span class="w50 h25 ca flex-sc" v-else>暂无</span>
            </div>
            <div class="flex-sc" v-else v-for="(img, ii) in item[v.key]" :key="ii">
              <el-image :class="ii==0?'':'ml5'" class="w25 h25 rad3 cursor" :src="I(img)" :preview-src-list="state.srcList" @click.stop="state.srcList= [];state.srcList.push(I(img))" />
            </div>
          </span>
          <span v-else>{{isNull(item[v.key]) && v.key!=''? '/' : item[v.key]}}</span>
        </div>
      </div>
      <div v-if="state.empty" class="flex-cc ww100 tc ptb13 bgi18">没有数据</div>
    </div>
    <Add @init="init" :state="state" ref="addRef" />
  </div>
</template>

<script lang="ts" setup>
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const dictStore = proxy.dictStore()
  let asyncsRef = $ref()
  let addRef = $ref()
  const state = reactive({
	  ...publicStore.$state,
    content: [
      { width: 'w50x4', show: true, align: 'left',  key: 'machine_name', name: '名称' },
      { width: 'w50x4', show: true, align: 'left',  key: 'gateway_type', name: '类型', type: 'select', list: [], value: 'gateway_class', label: 'gateway_name' },
      { width: 'w50x8', show: true, align: 'left',  key: 'machine_code', name: '物理地址' },
      { width: 'w50x3', show: true, align: 'left',  key: 'parent_node_ip', name: 'IP' },
      { width: 'w50x3', show: true, align: 'left',  key: 'parent_node_port', name: '端口' },
      { width: 'flex1', show: true, align: 'right', key: {},  name: '操作' },
    ],
    editFrom: [],
    addItem: {},
  })

  onMounted(async() => {
    await publicStore.init({path: '/gateway'}, state)
    if(!configStore.distributId) configStore.distributId = '0'
    let query1 = {model: "t_station", args: `parent_id='0'`}
    let query2 = {model: "t_gateway_type"}
    let params = {Api1: query1, Api2: query2}
    let res = await publicStore.http(params)
    publicStore._public.stations = proxy.isNull(res.Api1)? [] : res.Api1.sort((a, b) => a.order - b.order)
    publicStore._public.gatewayTypes = proxy.isNull(res.Api2)? [] : res.Api2
    init()
  })

  watch(() => configStore.distributId, async(val, old) => {
    await nextTick()
    if(proxy.isNull(val)) return
    init()
  }, {immediate: false, deep: true})

  watch(() => publicStore.isTrue, async(val) => {
    await nextTick()
    console.log('更新---')
    init(publicStore.active.id)
  }, {immediate: false, deep: true})
  
  const init = async() => {
    state.query = !configStore.distributId || configStore.distributId=='0'? {model: state.model} : {model: state.model, args: `station_code='${configStore.distributId}'`}
    state.params = {Api: state.query}
    let res = await publicStore.http(state.params)
    state.empty = proxy.isNull(res)? true : false
    state.list = proxy.isNull(res)? [] : res
    setInit()
  }

  const setInit = async() => {
    state.content.forEach(v => { if(v.key == 'gateway_type') v.list = publicStore._public.gatewayTypes })
    if(!configStore.distributId || configStore.distributId == '0') {
      state.addItem = {}
      state.editFrom = [
        { required: true, editshow: true, name: '上级', key: 'station_code', type: 'select', list: publicStore._public.stations, value: 'id', label: 'station_name' },
        { required: true, editshow: true, name: '名称', key: 'machine_name', type: 'input' },
        { required: false, editshow: true, name: '类型', key: 'gateway_type', type: 'select', list: publicStore._public.gatewayTypes, value: 'gateway_class', label: 'gateway_name' },
        { required: false, editshow: true, name: '物理地址', key: 'machine_code', type: 'input' },
        { required: false, editshow: true, name: 'IP', key: 'parent_node_ip', type: 'input' },
        { required: false, editshow: true, name: '端口', key: 'parent_node_port', type: 'input' },
      ]
    }else{
      state.addItem = {station_code: configStore.distributId}
      state.editFrom = [
        { required: true, editshow: 'none', name: '上级', key: 'station_code', type: 'input' },
        { required: true, editshow: true, name: '名称', key: 'machine_name', type: 'input' },
        { required: false, editshow: true, name: '类型', key: 'gateway_type', type: 'select', list: publicStore._public.gatewayTypes, value: 'gateway_class', label: 'gateway_name' },
        { required: false, editshow: true, name: '物理地址', key: 'machine_code', type: 'input' },
        { required: false, editshow: true, name: 'IP', key: 'parent_node_ip', type: 'input' },
        { required: false, editshow: true, name: '端口', key: 'parent_node_port', type: 'input' },
      ]
    }
  }

  const handleClick = (remark, val) => {
    if(remark == 'add' || remark == 'upd'){
      addRef.onVisable(val)
    }
    if(remark == 'del'){
      addRef.del(val)
    }
  }

</script>
  
<style scoped lang="scss">

</style>
  