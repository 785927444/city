<template>
  <div class="layout-row">
    <div class="flex1 hh100 hidden rad8">
      <div class="layout-col">
        <!-- 标题 -->
        <div class="ww100 bo-i16-1 rads8 hidden">
          <ab-title title="项目成果">
            <template #right-content></template>
          </ab-title>
        </div>
        <!-- 内容 -->
        <div class="layout-col white-rgba50 rady8 bo-i16-1">
          <ListTree @handleNodeClick="handleNodeClick" @handleClick="handleClick" :state="state" ref="listTreeRef"/>
        </div>
      </div>
    </div>
    <div class="flex4 hh100 hidden rad8 ml20">
      <div class="layout-col bgi16">
        <!-- 标题 -->
        <div class="ww100 bo-i16-1 rads8 hidden">
        <ab-title :title="state.active?state.active.name:''">
          <template #right-content><div class="cursor" @click.stop="viewRef.onVisable(state.active.file)">全屏</div></template>
        </ab-title>
        </div>
        <!-- 内容 -->
        <div class="layout-col white-rgba50 rady8 bo-i16-1">
          <div class="ww100 hh100 flex-col-sc f24 cc hidden bg-white" v-if="!isNull(state.active)">
            <div v-if="!state.active.data" class="ww100 hh100 flex-cc f24 cc">未找到资源</div>
            <!-- <div>{{ state.active.file }}</div> -->
            <iframe v-else class="ww100 hh100" :src="I(state.active.data)"></iframe>
            </div>
        </div>
      </div>
    </div>
    <ViewFiles ref="viewRef" />
  </div>
</template>

<script lang="ts" setup>
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const route = useRoute()
  let listTreeRef = $ref()
  let viewRef = $ref()
  const state = reactive({
	  ...publicStore.$state,
    listRow: true,
    listExpand: true,
    content: [
      { width: 'flex1', show: true, align: 'left', key: 'name', name: '名称' },
    ],
  })

  onMounted(async() => {
    init()
  })

  const onClose = () => { state.isFalse = !state.isFalse }

  const init = async(key) => {
    let query1 = {model: 't_file_type'}
    let query2 = {model: 't_file_content'}
    let query3 = {model: 't_file', args: `parent_id='${route.query.id}'`}
    let res = await publicStore.http({Api1: query1, Api2: query2, Api3: query3})
    let list1 = proxy.isNull(res.Api1)? [] : res.Api1.sort((a, b) => a.orderd - b.orderd)
    let list2 = proxy.isNull(res.Api2)? [] : res.Api2.sort((a, b) => a.orderd - b.orderd)
    let list3 = proxy.isNull(res.Api3)? [] : res.Api3
    let id = "019be0b6-e9f9-7081-b4a3-d808e0bc96ca"
    let plan = list1.find(a=>a.id==id)
    if(plan){
      let contents = []
      state.plans = list1.filter(a=>a.parent_id == id)
      state.plans.forEach(v => { 
        v.parent_id = '0'
        v.parent_type = `${plan.type}/${v.type}`
        let content = list2.filter(a=>a.parent_id == v.id)
        if(!proxy.isNull(content)){
          content.forEach(vv => {
            vv.parent_type = `${v.parent_type }/${vv.type}`
            contents.push(vv)
          })
        }
      })
      publicStore._public.contents = contents
      if(!proxy.isNull(list3)){
        list3.forEach(v => {
          let data = contents.find(a=>a.type == v.type)
          if(data) v.parent_id = data.id
        })
      }
      state.list = [...state.plans, ...contents, ...list3]
      setTree(key)
    }
  }

  const setTree = async(key) => {
    state.tree = proxy.treeData(state.list, state.key, state.parent, 'children')
    let node1 = proxy.findNode(state.tree, (node) => { return !node.children })
    let node2 = proxy.findNode(state.tree, (node) => { return node[state.key] == key })
    let node = proxy.isNull(node2)? node1 : node2
    await nextTick()
    listTreeRef.handleNodeClick(node)
  }

  const handleNodeClick = (val) => { 
    val.file = val.data?val.data : ''
    state.active = {...val}
   }

  const handleClick = (remark, val) => {}
</script>
  
<style scoped lang="scss">
.w110 { width: 110px; }
.rads8{ border-radius: 8px 8px 0 0; }
.rady8{ border-radius: 0 0 8px 8px; }
:deep(.el-dialog__body){padding: 0 !important;}
</style>
  