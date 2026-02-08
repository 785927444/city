<template>
  <div class="layout-col flex3 ml16">
    <!-- 标题 -->
    <aa-title :title="`${isNull(publicStore.active)?'':publicStore.active.name}`">
      <template #left-content></template>
      <template #right-content>
        <div class="flex-ec flex1">
          <div class="rad4 ptb5 plr8 flex-cc cursor bgi1 white ml10" 
            v-if="state.content.find(v=>{return typeof(v.key) == 'object'}) && state.content.find(v=>{return typeof(v.key) == 'object'})['key'].hasOwnProperty('add')" 
            @click.stop="handleClick('add', state.addItem)">
            <i-ep-plus class="f12 fw" /><span class="f14 ml4">{{state.content.find(v=>{return typeof(v.key) == 'object'})['key'].add}}</span>
          </div>
        </div>
      </template>
    </aa-title>
    <!-- 内容 -->
    <div class="layout-col white-rgba50 rad8 p15">
      <List @handleClick="handleClick" :state="state"/>
    </div>
    <!-- 底部 -->
    <aa-foot></aa-foot>
    <Add @init="init" :state="state" ref="addRef" />
  </div>
</template>

<script lang="ts" setup>
import { parentId } from '@/utils/tree'

	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const dictStore = proxy.dictStore()
  let addRef = $ref()
  const state = reactive({
	  ...publicStore.$state,
    content: [
      { width: 'w70',   show: true, align: 'center', key: '*', name: '序号' },
      { width: 'w50x4', show: true, align: 'left', key: 'name', name: '名称' }, 
      { width: 'w50x4', show: true, align: 'left', key: 'value', name: '数值' }, 
      { width: 'w50x8', show: true, align: 'left', key: 'attr', name: '扩展' },
      { width: 'w50x2', show: true, align: 'left', key: 'order', name: '排序' }, 
      { width: 'flex1', show: true, align: 'right', key: {add: '添加', upd:'编辑', del: '删除'}, name: '操作' },
    ],
    editFrom: [
      { required: true, editshow: true, name: '名称', key: 'name', type: 'input' },
      { required: true, editshow: true,  name: '数值', key: 'value', type: 'input' },
      { required: false, editshow: true,  name: '扩展', key: 'attr', type: 'input' },
      { required: false, editshow: true,  name: '排序', key: 'order',  type: 'input' },
    ],
    addItem: {parent_id: '0'},
  })

  watch(() => publicStore.active, async(val) => {
    if(proxy.isNull(val)) return
    await nextTick()
    state.addItem = {type: publicStore.active.type, parent_id: publicStore.active.id}
    init()
  }, {immediate: false, deep: true})

  const init = async() => {
    state.query = {model: state.model, args: `parent_id='${publicStore.active.id}'`}
    state.params = {Api: state.query}
    let res = await publicStore.http(state.params)
    state.empty = proxy.isNull(res)? true : false
    state.list = proxy.isNull(res)? [] : res.sort((a, b) => a.order - b.order)
  }

  const handleClick = async(remark, val) => {
    if(remark == 'add' || remark == 'upd'){
      addRef.onVisable(val)
    }
    if(remark == 'del'){
      addRef.del(val)
    }
  }

</script>
  
<style scoped lang="scss">

</style>
  