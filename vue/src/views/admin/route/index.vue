<template>
  <div class="layout-col">
    <div class="layout-col">
      <!-- 标题 -->
      <aa-title title="路由列表">
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
    </div>
  </div>
</template>

<script lang="ts" setup>
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const dictStore = proxy.dictStore()
  let addRef = $ref()
  let listTreeRef = $ref()
  let permissionRef = $ref()
  const state = reactive({
	  ...publicStore.$state,
    content: [
      { width: 'flex1', show: true, align: 'left', key: 'name', name: '名称' },
      { width: 'w50x6', show: true, align: 'left', key: 'component', name: '文件路径' }, 
      { width: 'w50x4', show: true, align: 'left', key: 'path', name: '请求路径' }, 
      { width: 'w50x3', show: true, align: 'left', key: 'isroute', name: '是否路由', type: 'select', list: dictStore.isList, value: 'value', label: 'name' },
      { width: 'w50x4', show: true, align: 'left', key: 'redirect', name: '重定向' },
      { width: 'w50x2', show: true, align: 'left', key: 'icon', name: '图标' },
      { width: 'w50x2', show: true, align: 'left', key: 'order', name: '排序' }, 
      { width: 'w50x4', show: true, align: 'right', key: publicStore.auth,  name: '操作' },
    ],
    editFrom: [
      { required: true, editshow: true, key: 'parent_id', name: '上级', type: 'tree', list: [], node_key: 'id', parent_key: 'parent_id', top_name: '顶级' },
      { required: true, editshow: true, key: 'name', name: '名称', type: 'input' },
      { required: true, editshow: true, key: 'component', name: '文件路径', type: 'input' },
      { required: true, editshow: true, key: 'path', name: '请求路径', type: 'input' },
      { required: true, editshow: true, key: 'isroute', name: '是否路由', type: 'select', list: dictStore.isList, value: 'value', label: 'name' },
      { required: false, editshow: true, key: 'redirect', name: '重定向', type: 'input' },
      { required: false, editshow: true, key: 'icon', name: '图标', type: 'input' },
      { required: false, editshow: true, key: 'order', name: '排序', type: 'input' },
    ],
    addItem: {},
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
  }
</script>
  
<style scoped lang="scss">

</style>
  