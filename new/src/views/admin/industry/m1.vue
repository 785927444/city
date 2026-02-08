<template>
  <div class="layout-col flex1">
    <!-- 标题 -->
    <ab-title title="行业">
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
    <Add @init="init" :state="state" ref="addRef" />
  </div>
</template>

<script lang="ts" setup>
  import axios from 'axios'
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const dictStore = proxy.dictStore()
  let addRef = $ref()
  let listTreeRef = $ref()
  const state = reactive({
	  ...publicStore.$state,
    listRow: true,
    listExpand: true,
    content: [
      { width: 'flex1', show: true, align: 'left',  key: 'name', name: '名称', type: 'icon5' },
      { width: 'w50x3', show: true, align: 'right', key: {add: '添加', upd:'编辑', del: '删除'}, name: '操作' }, 
    ],
    editFrom: [
      { required: true, editshow: 'none', name: '上级', key: 'parent_id', type: 'input' },
      { required: true, editshow: true, name: '名称', key: 'name', type: 'input' },
      { required: false, editshow: true, name: '排序', key: 'order',  type: 'input' },
    ],
    addItem: {parent_id: '0', type: 0},
  })

  onMounted(async() => {
    await getProvinces()
    init()
  })

  const getProvinces = async() => {
    let res = await axios.get(`./china/100000.json`)
    publicStore._public.provinces = res.data.features.map(a => {
      return a.properties
    })
  }

  const init = async(key) => {
    state.query = {model: state.model, args: `type=0`}
    state.params = {Api: state.query}
    let res = await publicStore.http(state.params)
    state.empty = proxy.isNull(res)? true : false
    state.list = proxy.isNull(res)? [] : res.sort((a, b) => a.order - b.order)
    publicStore._public.list = state.list
    if(!proxy.isNull(state.list)) setTree(key)
  }

  const setTree = async(key) => {
    state.tree = proxy.treeData(state.list, state.key, state.parent, 'children')
    let node1 = proxy.findNode(state.tree, (node) => { return !node.children })
    let node2 = proxy.findNode(state.tree, (node) => { return node[state.key] == key })
    let node = proxy.isNull(node2)? node1 : node2
    await nextTick()
    listTreeRef.handleNodeClick(node)
  }

  const handleNodeClick = async(val) => {
    if(!val.classify) publicStore.active = Object.assign({}, val)
  }

  const handleClick = (remark, val) => {
    if(remark == 'add'){
      let addItem = {parent_id: val.id, type: 0 }
      addRef.onVisable(addItem)
    }
    if(remark == 'upd'){
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
  