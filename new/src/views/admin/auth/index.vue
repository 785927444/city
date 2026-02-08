<template>
  <div class="layout-col">
    <div class="layout-col">
      <!-- 标题 -->
      <aa-title title="权限列表">
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
  </div>
</template>

<script lang="ts" setup>
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const dictStore = proxy.dictStore()
  let addRef = $ref()
  const state = reactive({
	  ...publicStore.$state,
    content: [
      { width: 'w70',   show: true, align: 'center', key: '*', name: '序号' },
      { width: 'w50x4', show: true, align: 'left', key: 'model', name: '模型' },
      { width: 'w50x4', show: true, align: 'left', key: 'name', name: '名称' },
      { width: 'w50x4', show: true, align: 'left', key: 'path', name: '类型', type: 'select', list: dictStore.authList, value: 'value', label: 'name' },
      { width: 'w50x4', show: true, align: 'left', key: 'order', name: '排序' },
      { width: 'w50x4', show: true, align: 'left', key: 'type', name: '其他' }, 
      { width: 'flex1', show: true, align: 'right', key: publicStore.auth, name: '操作' },
    ],
    editFrom: [
      { required: true, editshow: true, key: 'model', name: '模型', type: 'input' },
      { required: true, editshow: true, key: 'name', name: '名称', type: 'input' },
      { required: true, editshow: true, key: 'path', name: '类型', type: 'select', list: dictStore.authList, value: 'value', label: 'name' },
      { required: false, editshow: true, key: 'order', name: '排序', type: 'input' },
      { required: false, editshow: true, key: 'type', name: '其他', type: 'input' },
    ],
  })

  onMounted(async() => {
    init()
  })

  const setInit = (key) => {}

  const init = async(key) => {
    state.query = {model: state.model}
    state.params = {Api: state.query}
    let res = await publicStore.http(state.params)
    state.empty = proxy.isNull(res)? true : false
    state.list = proxy.isNull(res)? [] : res.sort((a, b) => a.order - b.order)
    publicStore._public.list = state.list
    setInit(key)
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
  