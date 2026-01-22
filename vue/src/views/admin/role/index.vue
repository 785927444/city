<template>
  <div class="layout-col">
    <!-- 标题 -->
    <aa-title title="角色列表">
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
      <List @handleClick="handleClick" :state="state"/>
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
      { width: 'w70',   show: true, align: 'center', key: '*', name: '序号' },
      { width: 'w50x5', show: true, align: 'left', key: 'name', name: '名称' },
      { width: 'w50x5', show: true, align: 'left', key: 'description', name: '描述' }, 
      { width: 'flex1', show: true, align: 'right', key: publicStore.auth,  name: '操作' },
    ],
    editFrom: [
      { required: true, editshow: 'none', key: 'id',  name: 'ID', type: 'input', class: 'update_key' },
      { required: true,  editshow: true, key: 'name', name: '名称', type: 'input' },
      { required: false, editshow: true, key: 'description', name: '描述', type: 'input' },
    ],
  })

  onMounted(async() => {
    init()
  })

  const setInit = (key) => {
    let exist = state.list.find(a=>a[state.key] == key)
    // handleClick('active', proxy.isNull(exist)?state.list[0] : exist)
  }

  const init = async(key) => {
    let query1 = {model: state.model, args: `CAST(id AS SIGNED)>${configStore.user.role_id}`, order: `CAST(id AS SIGNED) ASC`}
    let query2 = {model: "t_route"}
    let query3 = {model: "t_auth"}
    let params = {Api1: query1, Api2: query2, Api3: query3}
    let res = await publicStore.http(params)
    state.empty = proxy.isNull(res.Api1)? true : false
    state.list = proxy.isNull(res.Api1)? [] : res.Api1
    publicStore._public.list = state.list
    publicStore._public.routeList = proxy.isNull(res.Api2)? [] : res.Api2
    publicStore._public.authList = proxy.isNull(res.Api3)? [] : res.Api3
    setInit(key)
  }

  const handleClick = (remark, val) => {
    if(remark == 'add' || remark == 'upd'){
      addRef.onVisable(val)
    }
    if(remark == 'del'){
      addRef.del(val)
    }
    if(remark == 'active'){
      publicStore.active = val
    }
  }
</script>
  
<style scoped lang="scss">

</style>
  