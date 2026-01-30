<template>
  <div class="layout-col">
    <!-- 标题 -->
    <ab-title title="字典">
      <template #right-content>
        <div class="rad4 ptb5 plr8 flex-cc cursor bgi1 white ml10" 
          v-if="state.content.find(v=>{return typeof(v.key) == 'object'}) && state.content.find(v=>{return typeof(v.key) == 'object'})['key'].hasOwnProperty('add')" 
          @click.stop="addRef.onVisable(state.addItem)">
          <i-ep-plus class="f12 fw" /><span class="f14 ml2">{{state.content.find(v=>{return typeof(v.key) == 'object'})['key'].add}}</span>
        </div>
      </template>
    </ab-title> 
    <!-- 内容 -->
    <div class="layout-col">
      <List @handleClick="handleClick" :state="state"/>
    </div>
    <!-- 底部 -->
    <aa-foot></aa-foot>
    <Add @init="init" :state="state" ref="addRef" />
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
    listRow: true,
    content: [
      { width: 'w50',   show: true, align: 'left', key: '*', name: '序号' },
      { width: 'w50x2', show: true, align: 'left',  key: 'name', name: '名称', type: 'icon1' },
      { width: 'flex1', show: true, align: 'right', key: {add: '添加', upd:'编辑', del: '删除'}, name: '操作' },
    ],
    editFrom: [
      { required: true, editshow: true, name: '名称', key: 'name', type: 'input' },
      { required: true, editshow: true, name: '类型', key: 'type', type: 'input' },
      { required: false, editshow: true,  name: '排序', key: 'order',  type: 'input' },
    ],
  })

  onMounted(async() => {
    init()
  })

  const init = async(key) => {
    state.query = {model: state.model, args: `parent_id='0'`}
    state.params = {Api: state.query}
    let res = await publicStore.http(state.params)
    state.empty = proxy.isNull(res)? true : false
    state.list = proxy.isNull(res)? [] : res.sort((a, b) => a.order - b.order)
    publicStore._public.list = state.list
    if(!key) publicStore.active = proxy.isNull(res)? {} : state.list[0]
  }

  const handleClick = (remark, val) => {
    if(remark == 'add' || remark == 'upd'){
      addRef.onVisable(val)
    }
    if(remark == 'del'){
      addRef.del(val)
    }
    if(remark == 'active'){
      publicStore.active = {...val}
    }
  }
</script>
  
<style scoped lang="scss">

</style>
  