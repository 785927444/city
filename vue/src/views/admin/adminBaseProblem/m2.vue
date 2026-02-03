<template>
  <div class="layout-col">
    <!-- 标题 -->
    <aa-title title="">
      <template #left-content>
        <div class="flex-sc">
          <el-input v-model="state.search" placeholder="请输入" />
          <div class="rad4 ptb5 w80 flex-cc cursor bgi1 white ml10" @click.stop="state.page=1;init()">搜索</div>
        </div>
      </template>
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
      { width: 'w60',   show: true, align: 'center', key: '*', name: '序号' },
      { width: 'flex1', show: true, align: 'left', key: 'name', name: '问题指标项' }, 
      { width: 'w50x4', show: true, align: 'center', key: 'unit', name: '量化单位' }, 
      { width: 'w50x4', show: true, align: 'right', key: {add: '新增', start: '启用', upd: '编辑', del: '删除'}, name: '操作' },
    ],
    editFrom: [
      { required: true,  editshow: 'none', name: '上级',     key: 'parent_id', type: 'input' },
      { required: true,  editshow: true,   name: '问题指标项', key: 'name', type: 'input' },
      { required: true,  editshow: true,   name: '量化单位', key: 'unit', type: 'input' },
      { required: false, editshow: true,   name: '所属维度', key: 'type', type: 'input' },
      { required: false, editshow: true,  name: '排序',     key: 'orderd', type: 'input' },
    ],
    addItem: {},
    model: 't_task_problem',
  })

  watch(() => publicStore.active, async(val) => {
    if(proxy.isNull(val)) return
    await nextTick()
    state.addItem = {parent_id: val.id}
    await getInit()
    init()
    // console.log("publicStore.active", publicStore.active)
  }, {immediate: false, deep: true})

  const getInit = async() => {}

  const init = async(key) => {
    let query = {model: state.model, args: `parent_id='${publicStore.active.id}'`, order: `orderd ASC`} 
    if(state.search) query.args += ` and name LIKE '%${state.search}%'`
    let q1 = {limit: state.limit, page: state.page}
    let q2 = {field: `COUNT(*)`}
    let query1 = {}
    let query2 = {}
    Object.assign(query1, query, q1)
    Object.assign(query2, query, q2)
    let res = await publicStore.http({Api1: query1, Api2: query2})
    state.empty = proxy.isNull(res.Api1)? true : false
    state.list = proxy.isNull(res.Api1)? [] : res.Api1
    state.total = proxy.isNull(res.Api2)? 0 : res.Api2[0]['COUNT(*)']
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
:deep(.el-input.is-disabled .el-input__inner){
  color: inherit;
  -webkit-text-fill-color: inherit;
}
:deep(.table .el-input__wrapper) {
  min-height: auto;
  color: inherit;
  padding: 0;
  background: none !important;
  box-shadow: 0 0 0 0px #276dd6 inset !important;
}
:deep(.select_input .el-input__inner) {
  color: inherit;
}
:deep(.table .el-select__wrapper){
  min-height: auto;
  color: inherit;
  padding: 0;
  background: none !important;
  box-shadow: 0 0 0 0px #276dd6 inset !important;
}
:deep(.select_input .el-select__input){
  color: inherit !important;
}
:deep(.select_input .el-select__selected-item){
  color: inherit !important;
}
.hover1:hover {
  color: #093a83;
  background: #3ebee3;
}
</style>
  