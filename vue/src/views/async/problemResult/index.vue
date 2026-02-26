<template>
  <div class="layout-col">
    <!-- 标题 -->
    <aa-title title="">
      <template #left-content>
        <div class="flex-sc mr15">
          <span class="mr10">体检年度</span>
          <span class="w50x6 flex-sc">
            <el-date-picker class="" style="width:100%" v-model="state.datetime"
            type="yearrange" range-separator="-" start-placeholder="请选择年度" end-placeholder="请选择年度"/>
          </span>
        </div>
        <div class="rad4 ptb6 plr12 flex-cc cursor bgi1 white" @click.stop="init()">
          <i-ep-filter class="f12 fw" /><span class="f14 ml5">搜索</span>
        </div>
      </template>
      <template #right-content>
        <div class="rad4 ptb6 plr12 flex-cc cursor bo-i1-1 i1 ml15" @click.stop="addRef.onVisable(state.addItem)">
          <span class="f14 ml5">新增</span>
        </div>
        <div class="rad4 ptb6 plr12 flex-cc cursor bo-i1-1 i1 ml15" @click.stop="router.back()">
          <span class="f14 ml5">返回</span>
        </div>
      </template>
    </aa-title>
    <!-- 内容 -->
    <div class="layout-col white-rgba50 rad8 p15">
      <!-- 头部 -->
      <div class="ww100 flex-sc p8 mb15">
        <div class="flex-sc fw f16 tc">
          <div class="mr20 cursor flex-col-cc" v-for="(v, i) in state.actives?state.actives:[]" :key="i" @click.stop="state.active.id=v.id;state.page=1;init()">
            <span class="mb5">{{ v.name }}</span>
            <span class="ww100 h3 rad10" :class="v.id == state.active.id?'bgi2':'black-rgba0'"></span>
          </div>
        </div>
      </div>
      <!-- 主题 -->
      <div class="layout-col">
        <el-table 
        v-if="!isNull(state.list)"
        v-loading.fullscreen.lock="state.loading" 
        header-cell-class-name="bgi16 c3"
        :cell-style="{'background-color': '#FFFFFF', 'color': '#626366'}"
        border
        empty-text="暂无数据" 
        :data="state.list" stripe>
        <el-table-column type="index" :index="indexMethod" label="序号" align="center" width="50" />
        <el-table-column label="指标名称">
          <template #default="scope, $index">
            <span>{{scope.row.parent_id?find(state.task_problems, ['id', scope.row.parent_id], 'name'):''}}</span>
          </template>
        </el-table-column>
        <el-table-column label="指标类别" width="170" align="center">
          <template #default="scope, $index">
            <span>{{scope.row.class?find(classs, ['value', scope.row.class], 'name'):''}}</span>
          </template>
        </el-table-column>
        <el-table-column label="所属维度" width="170" align="center">
          <template #default="scope, $index">
            <span>{{scope.row.parent_id?find(state.task_problems, ['id', scope.row.parent_id], 'type'):''}}</span>
          </template>
        </el-table-column>
        <el-table-column label="指标单位" width="170" align="center">
          <template #default="scope, $index">
            <span>{{scope.row.parent_id?find(state.task_problems, ['id', scope.row.parent_id], 'unit'):''}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="pre_year" label="上年指标值" width="170" align="center" />
        <el-table-column prop="nex_year" label="本年指标值" width="170" align="center" />
        <el-table-column label="评价结果" align="center" width="170">
          <template #default="scope, $index">
            <span>{{scope.row.res?find(ress, ['value', scope.row.res], 'name'):''}}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="55">
          <template #default="scope, $index">
            <span class="cursor i8" @click.stop="handleClick('del', scope.row)">删除</span>
          </template>
        </el-table-column>
        </el-table>
      </div>
    </div>
    <Add @init="init" :state="state" ref="addRef" />
  </div>
</template>

<script lang="ts" setup>
  import router from '@/router'
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const route = useRoute()
  let addRef = $ref()
  const ress = [
    {value: '1', name: '不达标'},
    {value: '2', name: '不足'},
    {value: '3', name: '达标'},
    {value: '4', name: '一般'},
    {value: '5', name: '较好'},
    {value: '6', name: '很好'},
  ]
  const classs = [
    {value: '1', name: '预期指标'},
    {value: '2', name: '底线指标'},
  ]
  const state = reactive({
	  ...publicStore.$state,
    editFrom: [
      { required: true, editshow: true,  name: '选择指标', key: 'parent_id', type: 'select', list: [], value: 'id', label: 'name' },
      { required: true, editshow: true,  name: '指标类别', key: 'class', type: 'select', list: classs, value: 'value', label: 'name' },
      { required: true, editshow: true, name: '上年指标值', key: 'pre_year', type: 'input', class: 'number', regex: ['^(100000|[1-9]\\d{0,4}|0)$', '请输入0~100000'] },
      { required: true, editshow: true, name: '本年指标值', key: 'nex_year', type: 'input', class: 'number', regex: ['^(100000|[1-9]\\d{0,4}|0)$', '请输入0~100000']},
      { required: true, editshow: true,  name: '评价', key: 'res', type: 'select', list: ress, value: 'value', label: 'name' },
    ],
    model: 't_scheme_problem_result',
  })
  const indexMethod = (index) => { return parseInt(state.page) + index }

  onMounted(async() => {
    state.active = {...route.query}
    await getInit()
    init()
  })

  const getInit = async() => {
    let query = {model: 't_problem_type', args: `parent_id='${state.active.parent_id}'`, order: `orderd ASC`}
    let res = await publicStore.http({Api: query})
    state.actives = proxy.isNull(res)? [] : res.sort((a, b) => a.orderd - b.orderd)
  }

  const init = async(key) => {
    setAddItem()
    let query1 = {model: 't_task_problem', args: `parent_id='${state.active.id}'`, order: `orderd ASC`} 
    let query2 = {model: 't_scheme_problem_result', args: `scheme_id='${state.active.scheme_id}' and parents_id='${state.active.id}'`} 
    if(!proxy.isNull(state.datetime)) {
      const [startDate, endDate] = state.datetime
      const start = new Date(startDate.getFullYear(), 0, 1).getTime() + ''
      const end = new Date(endDate.getFullYear(), 11, 31, 23, 59, 59, 999).getTime() + ''
      query2.args += ` and check_time>='${start}' and check_time<='${end}'`
    }
    let res = await publicStore.http({Api1: query1, Api2: query2})
    state.task_problems = proxy.isNull(res.Api1)? [] : res.Api1
    state.editFrom[0]['list'] = [...res.Api1]
    state.list = proxy.isNull(res.Api2)? [] : res.Api2
  }

  const setAddItem = () => {
    state.addItem = {
      check_year: '2026',
      check_time: '1770048252885',
      scheme_id: state.active.scheme_id, 
      parents_id: state.active.id, 
      user_id: configStore.user.id,
      user_name: configStore.user.name,
      province: configStore.user.province,
      province_name: configStore.user.province_name,
      city: configStore.user.city,
      city_name: configStore.user.city_name,
      district: configStore.user.district,
      district_name: configStore.user.district_name,
    }
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
  
