<template>
  <div class="layout-col">
    <!-- 标题 -->
    <aa-title :title="isNull(publicStore.active)?'':publicStore.active.name">
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
      <Pagination class="" style="padding-bottom: 0;" v-show="state.total>0" :total="state.total" v-model:page.sync="state.page" v-model:limit.sync="state.limit" @pagination="init" />
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
  const state = reactive({
	  ...publicStore.$state,
    content: [
      { width: 'w70',   show: true, align: 'center', key: '*', name: '序号' },
      { width: 'w50x5', show: true, align: 'left', key: 'adcode', name: '区域', type: 'select', list: [], value: 'adcode', label: 'name' }, 
      { width: 'w50x5', show: true, align: 'left', key: 'year', name: '年份', type: 'select', list: [], value: 'value', label: 'name' }, 
      { width: 'w50x5', show: true, align: 'left', key: 'value', name: 'CO2因子' }, 
      { width: 'w50x5', show: true, align: 'left', key: 'order', name: '排序' }, 
      { width: 'flex1', show: true, align: 'right', key: {add: '添加', upd:'编辑', del: '删除'}, name: '操作' },
    ],
    editFrom: [
      { required: true, editshow: 'none', name: '上级', key: 'parent_id', type: 'input' },
      { required: true, editshow: 'none', name: '特征码', key: 'code', type: 'input' },
      { required: true, editshow: true,  name: '区域', key: 'adcode', type: 'select', list: [], value: 'adcode', label: 'name' },
      { required: true, editshow: true,  name: '年份', key: 'year', type: 'select', list: [], value: 'value', label: 'name' },
      { required: false, editshow: true,  name: '数值', key: 'value', type: 'input' },
      { required: false, editshow: true,  name: '排序', key: 'order',  type: 'input' },
    ],
    addItem: {},
  })

  onMounted(async() => {
    let year = proxy.parseTime(new Date(), '{y}')
    let years = []
    for (let i = 0; i < 5; i++) {
      let v = year-i
      years.push({name: v+'年', value: v})
    }
    state.year = year
    state.years = years
  })

  watch(() => publicStore.active, async(val) => {
    await nextTick()
    if(proxy.isNull(val)) return
    state.addItem = {parent_id: publicStore.active.id,  type: 1, code: 'CO2'}
    state.content.forEach(v => { 
      if(v.key == 'adcode') v.list = publicStore._public.provinces
      if(v.key == 'year') v.list = state.years
     })
    state.editFrom.forEach(v => { 
      if(v.key == 'adcode') v.list = publicStore._public.provinces
      if(v.key == 'year') v.list = state.years
     })
    init()
  }, {immediate: false, deep: true})

  const init = async() => {
    let args = state.year? `type='1' and code='CO2' and parent_id='${publicStore.active.id}' and year=${state.year}` : `type='1' and code='CO2' and parent_id='${publicStore.active.id}'`
    state.query = {model: state.model, args: args}
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
  