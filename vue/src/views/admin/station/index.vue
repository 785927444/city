<template>
  <div class="layout-col">
    <div class="layout-col">
      <!-- 标题 -->
      <aa-title title="区域">
        <template #left-content></template>
        <template #right-content>
          <div class="rad4 ptb5 plr8 flex-cc cursor bgi1 white ml10" 
            v-if="state.content.find(v=>{return typeof(v.key) == 'object'}) && state.content.find(v=>{return typeof(v.key) == 'object'})['key'].hasOwnProperty('add')" 
            @click.stop="addRef.onVisable(state.addItem)">
            <i-ep-plus class="f12 fw" /><span class="f14 ml2">{{state.content.find(v=>{return typeof(v.key) == 'object'})['key'].add}}</span>
          </div>
        </template>
      </aa-title>
      <!-- 内容 -->
      <div class="layout-col white-rgba50 rad8 p15">
        <ListTree @handleNodeClick="handleNodeClick" @handleClick="handleClick" :state="state" ref="listTreeRef"/>
      </div>
      <Add @init="init" :state="state" ref="addRef" />
      <Area @init="init" :state="state" ref="areaRef" />
      <Industry @init="init" :state="state" ref="industryRef" />
    </div>
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
  let listTreeRef = $ref()
  let permissionRef = $ref()
  const state = reactive({
	  ...publicStore.$state,
    content: [
      { width: 'flex1', show: true, align: 'left', key: 'station_name', name: '名称' },
      { width: 'w50x4', show: true, align: 'left', key: 'province_name', name: '省名' },
      { width: 'w50x4', show: true, align: 'left', key: 'city_name', name: '市名' }, 
      { width: 'w50x4', show: true, align: 'left', key: 'district_name', name: '区名' },
      { width: 'w50x3', show: true, align: 'left', key: 'province', name: '省' }, 
      { width: 'w50x3', show: true, align: 'left', key: 'city', name: '市' }, 
      { width: 'w50x3', show: true, align: 'left', key: 'district', name: '区' },
      { width: 'w50x2', show: true, align: 'left', key: 'order', name: '排序' },
      { width: 'w50x5', show: true, align: 'right', key: publicStore.auth,  name: '操作' },
    ],
    editFrom: [
      { required: true, editshow: true, key: 'parent_id', name: '上级', type: 'tree', list: [], node_key: 'id', parent_key: 'parent_id', top_name: '顶级' },
      { required: true, editshow: true, key: 'station_name', name: '名称', type: 'input' },
      { required: false, editshow: true, key: 'order', name: '排序', type: 'input' },
    ],
    addItem: {},
    defaultProps: {
      children: 'children',
      label: 'station_name',
    },   
  })

  onMounted(async() => {
    init()
  })

  const init = async(key) => {
    state.query = {model: state.model}
    state.params = {Api: state.query}
    let res = await publicStore.http(state.params)
    state.empty = proxy.isNull(res)? true : false
    state.list = proxy.isNull(res)? [] : res.sort((a, b) => a.order - b.order)
    publicStore._public.list = state.list
    state.editFrom[0].list = state.list
    setTree(key)
  }

   const setTree = async(key) => {
    state.tree = proxy.treeData(state.list, state.key, state.parent, 'children')
    let node1 = proxy.findNode(state.tree, (node) => { return !node.children })
    let node2 = proxy.findNode(state.tree, (node) => { return node[state.key] == key })
    let node = proxy.isNull(node2)? node1 : node2
    await nextTick()
    listTreeRef.handleNodeClick(node)
  }

  const handleNodeClick = (val) => { publicStore.active = {...val} }

  const handleClick = (remark, val) => {
    console.log("val---",remark, val)
    if(remark == 'add' || remark == 'upd'){
      addRef.onVisable(val)
    }
    if(remark == 'child'){
      let vall = proxy.varObj(state.parent, val[state.key])
      addRef.onVisable(vall)
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
  