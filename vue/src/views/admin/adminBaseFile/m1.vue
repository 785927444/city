<template>
  <div class="layout-col">
    <!-- 标题 -->
    <ab-title title="文件标签">
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
      { width: 'flex1', show: true, align: 'left',  key: 'name', name: '名称', type: 'icon' },
      { width: 'w50x2', show: true, align: 'right', key: {add: '新增', upd: '编辑', del: '删除'}, name: '操作' }, 
    ],
    editFrom: [
      { required: true,  editshow: true, key: 'parent_id', name: '上级', type: 'tree', list: [], node_key: 'id', parent_key: 'parent_id', top_name: '顶级' },
      { required: true,  editshow: true, name: '名称', key: 'name', type: 'input' },
      { required: false, editshow: true, name: '类型', key: 'type', type: 'input' },
      { required: false, editshow: true, name: '描述', key: 'describe', type: 'input' },
      { required: false, editshow: true, name: '排序', key: 'orderd', type: 'input' },
    ],
    addItem: {},
    model: 't_file_type',
  })

  onMounted(async() => {
    await getInit()
    init()
  })

  const getInit = async() => {}

  const init = async(key) => {
    let query = {model: state.model, order: `orderd ASC`}
    let res = await publicStore.http({Api: query})
    state.list = proxy.isNull(res)? [] : res.sort((a, b) => a.orderd - b.orderd)
    publicStore._public.list = state.list
    state.editFrom[0].list = state.list
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
    if(!val.children) publicStore.active = {...val} 
  }

  const handleClick = (remark, val) => {
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
  