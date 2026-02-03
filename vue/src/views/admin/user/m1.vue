<template>
  <div class="layout-col ">
    <!-- 标题 -->
    <ab-title title="区域">
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
      <ListTree @handleNodeClick="handleNodeClick" @handleClick="handleClick" :state="state" ref="listTreeRef"/>
    </div>
    <!-- 底部 -->
    <aa-foot></aa-foot>
    <Add @init="init" :state="state" ref="addRef" />
    <!-- <Detail @init="init" :state="state" ref="detailRef" /> -->
  </div>
</template>

<script lang="ts" setup>
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const dictStore = proxy.dictStore()
  let addRef = $ref()
  let detailRef = $ref()
  let listTreeRef = $ref()
  const state = reactive({
	  ...publicStore.$state,
    listRow: true,
    listExpand: true,
    content: [
      // { width: 'w70',   show: true, align: 'left', key: '*', name: '序号' },
      { width: 'flex1', show: true, align: 'left',  key: 'station_name', name: '名称', type: 'icon1' },
      // { width: 'flex1', show: true, align: 'right', key: {}, name: '操作' }, 
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

  watch(() => publicStore.isTrue, async(val) => {
    await nextTick()
    init(publicStore.active.id)
  }, {immediate: false, deep: true})

  watch(() => configStore.distributId, async(val, old) => {
    await nextTick()
    if(proxy.isNull(val)) return
    init()
  }, {immediate: false, deep: true})

  const init = async(key) => {
    let list = []
    if(!proxy.isNull(configStore.stations)){
      if(!configStore.distributId || configStore.distributId == '0') {
        list = [...configStore.stations]
      }else{
        list = configStore.stations.filter(a=>a.id == configStore.distributId)
      }
    }else{
      state.query =  !configStore.distributId || configStore.distributId == '0'? {model: state.model} : {model: state.model, args: `id='${configStore.distributId}'`}
      state.params = {Api: state.query}
      let res = await publicStore.http(state.params)
      list = proxy.isNull(res)? [] : res.sort((a, b) => a.order - b.order)
    }
    state.empty = proxy.isNull(list)? true : false
    state.list = list
    publicStore._public.list = state.list
    publicStore._public.stations = state.list
    // if(!key && !state.empty) {
    //   publicStore.active = state.list[0]
    // } else{
    //   let station = state.list.find(a=>a.id == key)
    //   if(station) publicStore.active = {...station}
    // }
   setTree(key)
  }

  const setTree = async(key) => {
    state.tree = proxy.treeData(state.list, state.key, state.parent, 'children')
    let node1 = proxy.findNode(state.tree, (node) => { return !node.children })
    let node2 = proxy.findNode(state.tree, (node) => { return node[state.key] == key })
    let node = proxy.isNull(node2)? node1 : node2
    if(!node) return
    await nextTick()
    listTreeRef.handleNodeClick(node)
  }

  const handleNodeClick = (val) => { 
    publicStore.active = {...val} 
  }

  const handleClick = async(remark, val) => {
    if(remark == 'add' || remark == 'upd'){
      addRef.onVisable(val)
    }
    if(remark == 'del'){
      addRef.del(val)
    }
    if(remark == 'detail'){
      detailRef.onVisable(val)
    }
    if(remark == 'active'){
      publicStore.active = val
    }
  }
</script>
  
<style scoped lang="scss">

</style>
  