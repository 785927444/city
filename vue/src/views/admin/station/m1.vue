<template>
  <div class="layout-col">
    <!-- 标题 -->
    <ab-title title="组织">
      <template #right-content>
        <div class="rad4 ptb5 plr8 flex-cc cursor bgi1 white ml10" 
          v-if="state.content.find(v=>{return typeof(v.key) == 'object'}) && state.content.find(v=>{return typeof(v.key) == 'object'})['key'].hasOwnProperty('add')" 
          @click.stop="addRef.onVisable(state.addItem)">
          <i-ep-plus class="f12 fw" /><span class="f14 ml2">{{state.content.find(v=>{return typeof(v.key) == 'object'})['key'].add}}</span>
        </div>
      </template>
    </ab-title>
    <!-- 内容 -->
    <div class="layout-col bg-white">
      <List @handleClick="handleClick" :state="state"/>
    </div>
		<!-- 底部 -->
		<aa-foot></aa-foot>
    <Add @init="init" :state="state" ref="addRef" />
    <Area @init="init" :state="state" ref="areaRef" />
    <Industry @init="init" :state="state" ref="industryRef" />
  </div>
</template>

<script lang="ts" setup>
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const dictStore = proxy.dictStore()
  let addRef = $ref()
  let areaRef = $ref()
  let industryRef = $ref()
  const state = reactive({
	  ...publicStore.$state,
    listRow: true,
    content: [
      // { width: 'w70',   show: true, align: 'left', key: '*', name: '序号' },
      { width: 'w50x3', show: true, align: 'left',  key: 'station_name', name: '名称', type: 'icon1' },
      { width: 'flex1', show: true, align: 'right', key: {}, name: '操作' }, 
    ],
    editFrom: [
      { required: true, editshow: 'none', name: '上级', key: 'parent_id', type: 'input' },
      { required: true, editshow: true, name: '名称', key: 'station_name', type: 'input' },
      { required: false, editshow: true, name: '排序', key: 'order',  type: 'input' },
    ],
    addItem: {parent_id: '0'},
  })

  onMounted(async() => {
    publicStore.init({path: '/station'}, state)
    if(!configStore.distributId) configStore.distributId = '0'
    init()
  })

  const init = async(key) => {
    state.query =  !configStore.distributId || configStore.distributId == '0'? {model: state.model, args: `parent_id='0'`} : {model: state.model, args: `id='${configStore.distributId}'`}
    state.params = {Api: state.query}
    let res = await publicStore.http(state.params)
    state.empty = proxy.isNull(res)? true : false
    state.list = proxy.isNull(res)? [] : res.sort((a, b) => a.order - b.order)
    publicStore._public.list = state.list
    publicStore._public.stations = state.list
    if(!key && !state.empty) {
      publicStore.active = state.list[0]
    } else{
      let station = state.list.find(a=>a.id == key)
      if(station) publicStore.active = {...station}
    }
  }

  const handleClick = async(remark, val) => {
    if(remark == 'add' || remark == 'upd'){
      addRef.onVisable(val)
    }
    if(remark == 'del'){
      addRef.del(val)
    }
    if(remark == 'area'){
      areaRef.onVisable(val)
    }
    if(remark == 'industry'){
      industryRef.onVisable(val)
    }
    if(remark == 'active'){
      publicStore.active = val
    }
  }
</script>
  
<style scoped lang="scss">

</style>
  