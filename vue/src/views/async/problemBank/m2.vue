<template>
  <div class="layout-col">
    <!-- 标题 -->
    <aa-title title="">
      <template #left-content>
        <div class="flex-sc mr30">
          <span class="mr10">整治类型</span>
          <span class="w50x3">
            <el-select v-model="state.action_type" placeholder="请选择" style="width:100%" filterable :clearable="configStore.user.parent_id == '0'">
              <el-option v-for="(v, i) in state.action_types" :key="v.value" :value="String(v.value)" :label="v.name" />
            </el-select>
          </span>
        </div>
        <div class="flex-sc mr30">
          <span class="mr10">体检年份</span>
          <span class="w50x3">
            <el-date-picker v-model="state.datetime" type="year" placeholder="请选择" style="width:100%" />
          </span>
        </div>
        <div class="rad4 ptb6 plr12 flex-cc cursor bgi1 white" @click.stop="init()">
          <i-ep-filter class="f12 fw" /><span class="f14 ml5">搜索</span>
        </div>
      </template>
      <template #right-content></template>
    </aa-title>
    <div class="layout-col">
      <el-table 
      v-loading.fullscreen.lock="state.loading" 
      :header-cell-style="{'background-color': '#EEEEEE', 'color': '#313233'}"
      :cell-style="{'background-color': '#FFFFFF', 'color': '#626366'}"
      :span-method="objectSpanMethod"
      border
      empty-text="暂无数据" 
      :data="state.list" stripe>
      <el-table-column type="index" :index="indexMethod" label="序号" align="center" width="50" />
      <el-table-column label="指标项" width="150">
        <template #default="scope, $index">
          <span>{{scope.row.parent_id?find(state.task_problems, ['id', scope.row.parent_id], 'name'):''}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="result" label="体检结果" align="center" width="80"/>
      <el-table-column prop="problem_content" label="存在问题" />
      <el-table-column label="整治类型" width="80">
        <template #default="scope, $index">
          <span>{{scope.row.action_type?find(action_types, ['value', scope.row.action_type], 'name'):''}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="problem_num" label="问题数量" width="80" align="center" />
      <el-table-column prop="action_rate" label="整改进度" width="80" align="center" />
      <el-table-column label="问题区域" width="100">
        <template #default="scope, $index">
          <span class="i1 cursor">查看问题分布</span>
        </template>
      </el-table-column>
       <el-table-column label="整改项目清单" width="100">
        <template #default="scope, $index">
          <span class="i1 cursor">查看项目清单</span>
        </template>
      </el-table-column>
      </el-table>
    </div>
    <Add @init="init" :state="state" ref="addRef" />
  </div>
</template>

<script lang="ts" setup>
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const route = useRoute()
  const action_types = [
    {value: '1', name: '限时整改', color: 'i5'},
    {value: '2', name: '尽力整改', color: 'i11'},
  ]
  const state = reactive({
	  ...publicStore.$state,
    status: 'all',
  })
  let defaultHeight = $ref()
  const indexMethod = (index) => { return parseInt(state.page) + index }
  const objectSpanMethod = ({
    row,
    column,
    rowIndex,
    columnIndex,
  }: SpanMethodProps) => {
    if (columnIndex === 1 || columnIndex === 2) {
      if (rowIndex % 2 === 0) {
        return { rowspan: 2, colspan: 1, }
      } else {
        return { rowspan: 0, colspan: 0, }
      }
    }
  }
  onBeforeMount(() => {
    defaultHeight = document.body.clientHeight + "px"
  }) 

  watch(() => publicStore.active, async (val, old) => {
    if(proxy.isNull(val)) return
    if(JSON.stringify(val) == JSON.stringify(old)) return
    await nextTick()
    init()
    state.list = [
  {
    id: '12987122',
    name: 'Tom',
    amount1: '234',
    amount2: '3.2',
    amount3: 10,
  },
  {
    id: '12987123',
    name: 'Tom',
    amount1: '165',
    amount2: '4.43',
    amount3: 12,
  },
  {
    id: '12987124',
    name: 'Tom',
    amount1: '324',
    amount2: '1.9',
    amount3: 9,
  },
  {
    id: '12987125',
    name: 'Tom',
    amount1: '621',
    amount2: '2.2',
    amount3: 17,
  },
  {
    id: '12987126',
    name: 'Tom',
    amount1: '539',
    amount2: '4.1',
    amount3: 15,
  },
]

  },{ immediate: false, deep: true })

  const init = async() => {
    console.log("route.query", route.query)
    let query1 = {model: 't_task_problem', args: `parent_id='${publicStore.active.id}'`, order: `orderd ASC`} 
    let query2 = {model: 't_scheme_problem', args: `scheme_id='${route.query.id}' and parents_id='${publicStore.active.parent_id}'`} 
    let res = await publicStore.http({Api1: query1, Api2: query2})
    state.task_problems = proxy.isNull(res.Api1)? [] : res.Api1
    state.list = proxy.isNull(res.Api2)? [] : res.Api2
  
    console.log("publicStore.active", publicStore.active)
    console.log("res", res)
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
  