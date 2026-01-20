<template>
  <div class="layout-col flex1">
    <!-- 标题 -->
    <div class="h40 ww100 flex-sc relative mb5">
      <img class="hh100" src="@/assets/imgs/title2.png" />
      <div class="ww100 hh100 flex-sc absolute pl35">
        <span class="fw flex1 ptb5">设备节点</span>
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
      <div :style="{textAlign: v.align, paddingRight: v.name=='操作'?'10px': 'inherit'}" v-for="(v, i) in state.content" :key="i" v-show="v.show" :class="v.width">{{v.name}}</div>
    </div>
    <div class="flex1 overlay ww100 flex-col-ss bss">
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
              <span v-if="typeof(v.key) == 'object'" class="i21 cursor mlr5" v-for="(vv, kk, ii) in v.key" :key="ii" :class="kk=='add'?'none':''" @click.stop="handleClick(kk, data)">{{vv}}</span>
              <span v-else-if="v.key=='*'">{{index+1}}</span>
              <span v-else-if="v.type == 'icon2'" class="flex-sc">
                <img v-if="data.node_type == 0" class="mr5" src="@/assets/imgs/ic1.png" />
                <img v-if="data.node_type == 1" class="mr5" src="@/assets/imgs/ic2.png" />
                <div>{{data[v.key]}} 
                  <span v-if="data['child']">
                    <span>({{data['child']}}</span>
                    <span v-if="data['childchild']&&data['childchild']!=0"> / {{data['childchild']}}</span>)
                  </span>
                </div>
              </span>
              <span v-else>{{isNull(data[v.key]) && v.key!=''? '/' : data[v.key]}}</span>
            </div>
          </span>
        </template>
      </el-tree>
    </div>
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
      { width: 'flex1', show: true, align: 'start', key: 'name', name: '名称', type: 'icon2' }, 
    ],
    editFrom: [
      { required: true, editshow: true,  name: '上级', key: 'up_id', type: ['tree', [], 'id', 'up_id', '顶级'] },
      { required: true, editshow: true,  name: '名称', key: 'name',  type: ['input'] },
    ],
    addItem: {},
    model: 't_sensor',
  })
  let exposeRef = $ref()
  let treeRef = $ref()
  let defaultProps = {
    children: 'children',
    label: 'name',
  }
  let defaultId = $ref()

  onMounted(async() => {
    if(!configStore.distributId) configStore.distributId = '0'
    let query1 = {model: "t_station", args: `parent_id='0'`}
    // let query2 = {model: "t_sensor_template", args: `attribute='0'`}
    // let query3 = {model: "t_model"}
    let params = {Api1: query1}
    let res = await publicStore.http(params)
    publicStore._public.stations = proxy.isNull(res)? [] : res.sort((a, b) => a.order - b.order)
    // publicStore._public.templates = proxy.isNull(res.Api2)? [] : res.Api2
    // publicStore._public.models = proxy.isNull(res.Api3)? [] : res.Api3
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
    state.query = configStore.distributId=='0'? {model: state.model} : {model: state.model, args: `stationNum='${configStore.distributId}'`}
    state.params = {Api: state.query}
    let res = await publicStore.http(state.params)
    getChild(res)
    state.empty = proxy.isNull(res)? true : false
    state.list = proxy.isNull(res)? [] : res.sort((a, b) => a.order - b.order)
    publicStore._public.list = state.list
    setTree(key)
  }

  const getChild = async(res) => {
    res.forEach(v => {
      // if(v.class != '0'){
        v.child = 0
        v.childchild = 0
        let lists = res.filter(a=>a.parent_id == v.id )
        if(!proxy.isNull(lists)) {
          v.child = lists.length
          if(v.class == '3'){
            let parent = res.find(a=>a.id == v.parent_id)
            parent.childchild += v.child
          }
        }
      // }
    })
  }

  const setTree = async(key) => {
    state.tree = proxy.treeData(state.list, state.key, state.parent, 'children')
    let node1 = proxy.findNode(state.tree, (node) => { return !node.children })
    let node2 = proxy.findNode(state.tree, (node) => { return node[state.key] == key })
    let node = proxy.isNull(node2)? node1 : node2
    await nextTick()
    defaultId = node[state.key]
    treeRef.setCurrentKey(defaultId, true)
    publicStore.active = Object.assign({}, node)
  }

  const handleNodeClick = async(node) => {
    defaultId = node[state.key]
    publicStore.active = Object.assign({}, node)
  }

  const handleClick = (remark, val) => {

  }
</script>
  
<style scoped lang="scss">

</style>
  