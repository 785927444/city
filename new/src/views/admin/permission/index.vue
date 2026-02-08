<template>
  <div class="layout-col">
    <div class="layout-col bss">
      <div class="ww100 flex-bc plr12 ptb8 bs4">
        <div class="flex-sc">
          <span class="f15 fw">权限列表</span>
        </div>
        <div class="flex-ec flex1 h30">
          <div class="rad4 ptb6 plr10 flex-cc cursor bgi3 white ml10" 
            v-if="state.auth.add && state.content.find(v=>{return typeof(v.key) == 'object'}) && state.content.find(v=>{return typeof(v.key) == 'object'})['key'].hasOwnProperty('add')" 
            @click.stop="handleClick('add', state.addItem)">
            <i-ep-plus class="f12 fw" /><span class="f14 ml5">{{state.content.find(v=>{return typeof(v.key) == 'object'})['key'].add}}</span>
          </div>
        </div>
      </div>
      <div class="row bgi22">
        <div :style="{textAlign: v.align, paddingRight: v.name=='操作'?'10px': 'inherit'}" v-for="(v, i) in state.content" :key="i" v-show="v.show" :class="v.width">{{v.name}}</div>
      </div>
      <div class="flex1 overlay ww100 flex-col-ss">
        <el-tree 
        class="ww100" 
        ref="treeRef" 
        :data="state.tree"
        :node-key="state.key" 
        :current-node-key="defaultId"
        :props="defaultProps"
        highlight-current    
        accordion
        @node-click="handleNodeClick"
        empty-text="暂无数据">
          <template #default="{ node, data }">
            <span class="row">
              <div v-show="v.show" :class="v.width" :style="{textAlign: v.align}" v-for="(v, i) in state.content" :key="i">
                <span v-if="typeof(v.key) == 'object'" class="i21 cursor mlr5" v-for="(vv, kk, ii) in v.key" :key="ii" :class="kk=='add'||state.auth[kk] == false?'none':''" @click.stop="handleClick(kk, data)">{{vv}}</span>
                <span v-else>{{isNull(data[v.key]) && v.key!=''? '/' : data[v.key]}}</span>
              </div>
            </span>
          </template>
        </el-tree>
      </div>
      <Add @init="init" :state="state" ref="exposeRef" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import Add from '@/components/Add'
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const dictStore = proxy.dictStore()
  const state = reactive({
	  ...publicStore.$state,
    content: [
      { width: 'flex1', show: true, align: 'left', key: 'name', name: '名称' },
      { width: 'w50x8', show: true, align: 'left', key: 'path', name: 'api接口' }, 
      { width: 'w50x8', show: true, align: 'left', key: 'order', name: '排序' }, 
      { width: 'w50x10', show: true, align: 'right', key: {add:'创建', child:'添加', upd:'编辑', del:'删除'},  name: '操作' },
    ],
    editFrom: [
      { required: true, editshow: true, key: 'parent_id', name: '上级', type: 'tree', list: [], node_key: 'id', parent_key: 'parent_id', top_name: '顶级' },
      { required: false, editshow: true, key: 'name', name: '名称', type: 'input' },
      { required: false, editshow: true, key: 'path', name: 'api接口', type: 'input' },
      { required: false, editshow: true, key: 'order', name: '排序', type: 'input' },
    ],
  })
  let exposeRef = $ref()
  let treeRef = $ref()
  let defaultId = $ref()
  let defaultProps = {
    children: 'children',
    label: 'name',
  }

  onMounted(async() => {
    init()
  })

  const init = async(key) => {
    state.params = {Api: state.query}
    let res = await publicStore.post(state.params, state.url.list)
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
    handleNodeClick(node)
  }

  const handleNodeClick = async(val) => {
    defaultId = val[state.key]
    treeRef.setCurrentKey(defaultId, true)
    publicStore.active = val
  }

  const handleClick = (remark, val) => {
    if(remark == 'add' || remark == 'upd'){
      exposeRef.onVisable(val)
    }
    if(remark == 'child'){
      let vall = proxy.varObj(state.parent, val[state.key])
      exposeRef.onVisable(vall)
    }
    if(remark == 'del'){
      exposeRef.del(val, state.key, state.url.del)
    }
  }
</script>
  
<style scoped lang="scss">

</style>
  