<template>
  <div class="layout-col flex3 ml15">
    <!-- 标题 -->
    <div class="h40 ww100 flex-sc relative mb10">
      <img class="hh100" src="@/assets/imgs/title3.png" />
      <div class="ww100 hh100 flex-sc absolute pl35">
        <span class="fw flex1 ptb5">{{isNull(publicStore.active)?'':publicStore.active.name + ' - 路由配置'}}</span>
        <div class="flex-ec flex1">
          <el-form class="ww100 flex-ec" :model="state.from" label-width="115px" v-if="state.auth.upd">
            <div class="rad4 ptb5 plr8 flex-cc cursor bgi22 i21 ml10 bo-i21-1" @click.stop="handleSubmit(formRef)">
              <i-ep-connection class="f12 fw" /><span class="f14 ml2">保存</span>
            </div>
          </el-form>
        </div>
      </div>
    </div>
    <!-- 内容 -->
    <div class="row bgi22">
      <div :style="{textAlign: v.align, paddingRight: v.name=='操作'?'10px': 'inherit'}" v-for="(v, i) in state.content" :key="i" v-show="v.show" :class="v.width">{{v.name}}</div>
    </div>
    <div class="table-col bss">
      <el-tree 
        :data="state.tree" 
        :props="defaultProps" 
        :default-expand-all="true"
        :node-key="state.key"
        ref="treeRef"
        class="ww100"
        highlight-current
        empty-text="暂无数据"
        show-checkbox>
        <template #default="{ node, data }">
          <span class="flex-bc">
            <span>{{ node.label }}</span>
          </span>
        </template>
      </el-tree>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import api from '@/api'
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  let addRef = $ref()
  let treeRef = $ref()
  let tree = $ref([])
  let defaultKeys = $ref()
  const defaultProps = {
    children: 'children',
    label: 'name',
  }
  const state = reactive({
	  ...publicStore.$state,
    content: [
      { width: 'flex1', show: true, align: 'start', key: 'name', name: '名称', type: 'icon2' }, 
    ],
  })

  watch(() => publicStore._public.routeList, async(val) => {
    await nextTick()
    if(proxy.isNull(val)) return
    setInit()
  }, {immediate: false, deep: true})

  watch(() => publicStore.active, async(val) => {
    await nextTick()
    if(proxy.isNull(val)) return
    setInit()
    init()
  }, {immediate: false, deep: true})

  const setInit = async () => {
    if(proxy.isNull(publicStore._public.routeList)) return
    if(proxy.isNull(publicStore.active)) return
    let list = publicStore.active[state.key] == 1 || (configStore.user&&configStore.user.role_id == '1')? publicStore._public.routeList : publicStore._public.routeList.filter(a=>a.path != '/route' && a.path != '/auth')
    state.tree = proxy.treeData(list.sort((a, b) => a.order - b.order), state.key, state.parent, 'children')
  }

  const init = async(key) => {
    state.query = {model: "t_role_route", args: `role_id='${publicStore.active[state.key]}'`, field: "route_id"}
    state.params = {Api: state.query}
    let res = await publicStore.http(state.params)
    state.list = proxy.isNull(res)? [] : proxy.isNull(res)? [] : res
    setKey(key)
  }

  const setKey= async(key) => {
    state.active = state.list.map(item => item.route_id)
    let active = filterNode(state.tree, JSON.parse(JSON.stringify(state.active)))
    console.log('active--route', active)
    await nextTick()
    treeRef.setCheckedKeys(active, false)
  }

  const handleSubmit = async(formEl) => {
    let list = treeRef.getCheckedKeys(false)
    list = addMissingParentIds(state.tree, list);
    const addedItems = list.filter(item => !state.active.includes(item))
    const deletedItems = state.active.filter(item => !list.includes(item))
    if(!proxy.isNull(addedItems)) await setAdd(addedItems)
    if(!proxy.isNull(deletedItems)) await setDel(deletedItems)
  }

  const setAdd = async(items) => {
    let query = {model: "t_role_route", list: []}
    query.list = items.map(v => { return {role_id: publicStore.active[state.key], route_id: v}})
    api.addApi(query).then(res => {
      if(res.code == 200){
        init()
        ElNotification({ title: '提示', message: '添加成功', type: 'success' })
      }else{
        ElNotification({ title: '提示', message: '添加失败', type: 'error' })
      }
    }).catch((err) => {
        ElNotification({ title: '提示', message: '添加失败', type: 'error' })
    })
  }

  const setDel = async(items) => {
    let query = {model: "t_role_route", list: []}
    query.list = items.map(v => { return {role_id: publicStore.active[state.key], route_id: v}})
    api.delApi(query).then(res => {
      if(res.code == 200){
        init()
        ElNotification({ title: '提示', message: '删除成功', type: 'success' })
      }
    }).catch((err) => {
        ElNotification({ title: '提示', message: '删除失败', type: 'error' })
    })
  }

  const addMissingParentIds = (arr1: any[], arr2: number[]): number[] => {
    const parentIds: Set<number> = new Set();
    for (const item of arr1) {
      for (const child of item.children) {
        if (arr2.includes(child.id) && !arr2.includes(item.id)) {
          parentIds.add(item.id);
        }
      }
    }
    return Array.from(parentIds).concat(arr2);
  }

  const filterNode = (parentNode: Node, childNodeIds: number[]): Node => {
    parentNode.forEach(item => {
      if(item.parent_id == 0) {
        let index = childNodeIds.findIndex(a=>a == item.id)
        if(index!=-1 && item.children) {
          const arr1Set  = new Set(childNodeIds)
          if(!item.children.every(item => arr1Set.has(item.id))){
            childNodeIds.splice(index, 1)
          }
        }
      }
    })
    return childNodeIds
  }
</script>
  
<style scoped lang="scss">

</style>
  