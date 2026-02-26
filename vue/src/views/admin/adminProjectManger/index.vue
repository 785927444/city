<template>
  <div class="layout-col">
    <!-- 标题 -->
    <aa-title title="">
      <template #left-content>
        <div class="flex-sc">
          <div class="flex-sc mr15">
            <span class="mr10">名称</span>
            <span class="w50x3 flex-sc">
              <el-input v-model="state.search" placeholder="请输入" />
            </span>
          </div>
          <div class="flex-sc mr15">
            <span class="mr10">申请状态</span>
            <span class="w50x3 flex-sc">
              <el-select v-model="state.type" placeholder="请选择" style="width:100%" filterable clearable>
                <el-option v-for="(v, i) in apply_statuss" :key="v.valuevalue" :value="String(v.valuevalue)" :label="v.name" />
              </el-select>
            </span>
          </div>
          <div class="rad4 ptb5 w80 flex-cc cursor bgi1 white" @click.stop="state.page=1;init()">搜索</div>
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
  const apply_statuss = [
    {value: '0', name: '未申请储备'},
    {value: '1', name: '已申请储备'},
    {value: '2', name: '已通过储备'},
    {value: '3', name: '已退回储备'},
  ]
  const reserve_statuss = [
    {value: '0', name: '待审核'},
    {value: '1', name: '通过'},
    {value: '2', name: '驳回'},
  ]
  const push_statuss = [
    {value: '0', name: '待审核'},
    {value: '1', name: '通过'},
    {value: '2', name: '驳回'},
  ]
  const state = reactive({
	  ...publicStore.$state,
    content: [
      { width: 'w60',   show: true, align: 'center', key: '*', name: '序号' },
      { width: 'w50x8', show: true, align: 'left', key: 'name', name: '项目名称' }, 
      { width: 'w50x3', show: true, align: 'left',  key: 'apply_status', name: '申请状态', type: 'select', list: apply_statuss, value: 'value', label: 'name' },
      { width: 'w50x3', show: true, align: 'left',  key: 'reserve_status', name: '储备状态', type: 'select', list: reserve_statuss, value: 'value', label: 'name' },
      { width: 'w50x3', show: true, align: 'left',  key: 'push_status', name: '推送状态', type: 'select', list: push_statuss, value: 'value', label: 'name' },
      { width: 'w50x3', show: true, align: 'left', key: 'level', name: '项目类别', type: 'select', list: dictStore.levels, value: 'value', label: 'name' },
      { width: 'w50x5', show: true, align: 'left', key: 'area', name: '地区' },
      { width: 'flex1', show: true, align: 'right', key: {del: '删除'}, name: '操作' },
    ],
    editFrom: [],
    addItem: {},
    model: 't_project_report',
  })

  onMounted(async() => {
    await getInit()
    init()
  })

  const getInit = async() => {}

  const init = async(key) => {
    let query = {model: state.model, order: `id ASC`} 
    if(!query.args && state.search) query.args = `name LIKE '%${state.search}%'`
    if(!query.args && state.type) query.args = `type='${state.type}'`
    if(state.search && state.type) query.args = `type='${state.type}' and name LIKE '%${state.search}%'`
    let q1 = {limit: state.limit, page: state.page}
    let q2 = {field: `COUNT(*)`}
    let query1 = {}
    let query2 = {}
    Object.assign(query1, query, q1)
    Object.assign(query2, query, q2)
    let res = await publicStore.http({Api1: query1, Api2: query2})
    state.empty = proxy.isNull(res.Api1)? true : false
    state.list = proxy.isNull(res.Api1)? [] : res.Api1
    state.list.forEach(v => {
      v.user_name = proxy.decrypt(v.user_name)
      if(v.datetime) {
        let datetime = JSON.parse(v.datetime)
        v.datetime = datetime[0] + '~' + datetime[1]
      }
    })
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
  