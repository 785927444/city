<template>
  <div class="layout-col flex1">
    <!-- 标题 -->
    <aa-title title="前置">
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
        <div class="row cursor" :class="publicStore.active[state.key] == item[state.key]?'active':index%2 == 1?'bgi23':'bgi18'" v-for="(item, index) in state.list" :key="index" @click="handleClick('active', item)">
          <div v-show="v.show" :class="v.width" :style="{textAlign: v.align}" v-for="(v, i) in state.content" :key="i">
            <span v-if="typeof(v.key) == 'object'" class="i21 cursor mlr5" :class="kk=='add'||state.auth[kk] == false?'none':''" v-for="(vv, kk, ii) in v.key" :key="ii" @click.stop="handleClick(kk, item)">{{vv}}</span>
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
            <span v-else-if="v.key == 'name'">{{isNull(item[v.key]) && v.key!=''? '/' : item[v.key]}} ({{item['child']}})</span>
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
      { width: 'flex1', show: true, align: 'left', key: 'name', name: '名称' },
    ],
    model: 't_sensor',
  })

  onMounted(async() => {
    if(!configStore.distributId) configStore.distributId = '0'
    let query1 = {model: "t_station", field: "id, parent_id, station_name, `order`"}
    let query2 = {model: "t_sensor_template", args: `attribute='1'`}
    let query3 = {model: "t_model"}
    let query4 = {model: "t_gateway"}
    let params = {Api1: query1, Api2: query2, Api3: query3, Api4: query4}
    let res = await publicStore.http(params)
    publicStore._public.stations = proxy.isNull(res.Api1)? [] : res.Api1.filter(a=>a.parent_id == '0').sort((a, b) => a.order - b.order)
    publicStore._public.templates = proxy.isNull(res.Api2)? [] : res.Api2
    publicStore._public.models = proxy.isNull(res.Api3)? [] : res.Api3
    state.bays = proxy.isNull(res.Api1)? [] : res.Api1.filter(a=>a.parent_id != '0')
    state.gateways = proxy.isNull(res.Api4)? [] : res.Api4
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

  const init = async(key) => {
    setInit()
    let query = {model: state.model}
    if(!configStore.distributId || configStore.distributId=='0'){
      if(configStore.user&&configStore.user.role_id!='1'){
       query.args = `id > 0`
      }
    }else{
      query.args = `stationNum='${configStore.distributId}'`
      if(configStore.user&&configStore.user.role_id!='1'){
       query.args += ' and id > 0'
      }
    }
    let res = await publicStore.http({Api: query})
    getChild(res)
    state.empty = proxy.isNull(res)? true : false
    state.list = proxy.isNull(res)? [] : res.filter(a=>a.class == '2') .sort((a, b) => a.order - b.order)
    publicStore._public.list = state.list
    publicStore._public.lists = proxy.isNull(res)? [] : res
    if(!key) publicStore.active = proxy.isNull(res)? {} : state.list[0]
  }

 const setInit = () => {
    if(!configStore.distributId || configStore.distributId == '0') {
      publicStore._public.bays = [...state.bays]
      publicStore._public.gateways = [...state.gateways]
    }else{
      let station = publicStore._public.stations.find(a=>a.id == configStore.distributId)
      if(station) publicStore._public.bays = state.bays.filter(a=>a.parent_id == station.id)
      publicStore._public.gateways = state.gateways.filter(a=>a.station_code == configStore.distributId)
    }
  }

  const getChild = async(res) => {
    res.forEach(v => {
      if(v.class != '0'){
        v.child = 0
        let lists = res.filter(a=>a.parent_id == v.id )
        if(!proxy.isNull(lists)) v.child = lists.length
      }
    })
  }

  const handleClick = (remark, val) => {
    if(remark == 'active'){
      publicStore.active = Object.assign({}, val)
    }
  }
</script>
  
<style scoped lang="scss">

</style>
  