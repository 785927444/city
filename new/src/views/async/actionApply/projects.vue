<template>
  <div class="topclass">
    <el-dialog modal-class="topclass" v-model="state.isFalse" title="项目列表" :before-close="onVisable" :draggable="true" width="65%">
      <div class="ww100 h100x6 flex-col hidden">
        <!-- 标题 -->
        <aa-title title="">
          <template #left-content>
            <div class="flex-sc">
              <div class="flex-sc mr30">
                <span class="mr10">项目周期</span>
                <span class="w50x4 flex-sc">
                  <el-date-picker style="width: 100%;" v-model="state.construct_datetime" start-placeholder="开始周期" end-placeholder="结束周期" type="yearrange" value-format="YYYY" format="YYYY" />
                </span>
              </div>  
              <div class="flex-sc mr30">
                <span class="mr10">实施状态</span>
                <span class="w50x3 flex-sc">
                  <el-select v-model="state.completion_status" placeholder="请选择" style="width:100%" filterable clearable>
                    <el-option v-for="(v, i) in dictStore.project_completion_statuss" :key="v.value" :value="String(v.value)" :label="v.name" />
                  </el-select>
                </span>
              </div>
              <div class="flex-sc mr15">
                <span class="mr10">项目名称</span>
                <span class="w50x3 flex-sc">
                  <el-input v-model="state.search" style="width: 100%;" placeholder="请输入" />
                </span>
              </div>
              <div class="rad4 ptb5 w80 flex-cc cursor bgi1 white ml10" @click.stop="state.page=1;init()">搜索</div>
            </div>
          </template>
          <template #right-content></template>
        </aa-title>
        <!-- 内容 -->
        <div class="layout-col white-rgba50 rad8 p15">
          <el-table 
          v-if="!isNull(state.list)"
          v-loading.fullscreen.lock="state.loading" 
          header-cell-class-name="bgi16 c3"
          :cell-style="{'background-color': '#FFFFFF', 'color': '#626366'}"
          border
          empty-text="暂无数据" 
          :data="state.list" stripe>
          <el-table-column type="index" :index="indexMethod" label="序号" align="center" width="50" />
          <el-table-column prop="name" label="项目名称" />
          <el-table-column label="地区" align="center" width="140">
            <template #default="scope, $index">
              <span v-if="scope.row.province_name">{{ scope.row.province_name }}</span>
              <span v-if="scope.row.city_name">-{{ scope.row.city_name }}</span>
              <span v-if="scope.row.district_name">-{{ scope.row.district_name }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="construct_scale" label="建设规模" width="100" align="center" />
          <el-table-column prop="construct_nature" label="建设性质" width="100" align="center" />
          <el-table-column prop="construct_price" label="投资预估(万元)" width="100" align="center" />
          <el-table-column label="项目周期" align="center" width="100">
            <template #default="scope, $index">
              <span class="" v-if="scope.row.construct_datetime_start&&scope.row.construct_datetime_end">{{ scope.row.construct_datetime_start }} ~ {{ scope.row.construct_datetime_end }} </span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="100">
            <template #default="scope, $index">
              <span class="i1 cursor" @click.stop="handleClick('exportdata', scope.row)">导入</span>
            </template>
          </el-table-column>
          </el-table>
          <Pagination class="" style="padding-bottom: 0;" v-show="state.total>0" :total="state.total" v-model:page.sync="state.page" v-model:limit.sync="state.limit" @pagination="init" />
        </div>
      </div>
      <ViewFiles ref="viewRef" />
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
  import api from '@/api'
  const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const dictStore = proxy.dictStore()
  let formRef = $ref()
  const state = reactive({
	  ...publicStore.$state,
    ruleList: {},
  })
  const props = defineProps({
    state: {
      type: [Object, Array],
      default: ()=>{return {}}
    },
  })
  const indexMethod = (index) => { return parseInt(state.page) + index }

  const emit = defineEmits(['init'])

  const onVisable = async (val?: any) => {
    state.isFalse = !state.isFalse
    if(!state.isFalse) return
    state.active = {...val}
    init()
  }

  const init = async(key) => {
    let model = 't_scheme_project p'
    let field = `p.*, sp.name as schemeName, sp.parent_area`
    let join = `t_scheme_plan sp ON p.scheme_id = sp.id`
    let args = `sp.release_status = '1'`
    let query = {model: model, field: field, join: join, args: args}
    if(state.province) {
      query.args += ` and sp.province='${state.province}'`
      if(state.city) query.args += ` and sp.city='${state.city}'`
      if(!proxy.isNull(state.construct_datetime)) {
        const [start, end] = state.construct_datetime
        query.args += ` and p.construct_datetime_start>='${start}' and p.construct_datetime_end<='${end}'`
      }
      if(state.completion_status) query.args += ` and p.completion_status='${state.completion_status}'`
      if(state.search) query.args += ` and p.name LIKE '%${state.search}%'`
    }
    let q1 = {limit: state.limit, page: state.page}
    let q2 = {field: `COUNT(*)`}
    let query1 = {}
    let query2 = {}
    Object.assign(query1, query, q1)
    Object.assign(query2, query, q2)
    let res = await publicStore.http({Api1: query1, Api2: query2})
    state.total = proxy.isNull(res.Api2)? 0 : res.Api2[0]['COUNT(*)']
    state.empty = proxy.isNull(res.Api1)? true : false
    state.list = proxy.isNull(res.Api1)? [] : res.Api1
    state.list.forEach(v => {
      v.area = (v.province_name||'') + (v.city_name?`-${v.city_name}`:'') + (v.district_name?`-${v.district_name}`:'')
    })
  }

  const handleClick = (remark, val) => {
    if(remark == 'exportdata'){
      // 项目名称 任务类型 建设规模 建设性质 投资预估
      let data ={
        num: val.num, 
        name: val.name, 
        task_type: val.task_type,
        construct_scale: val.construct_scale,
        construct_nature: val.construct_nature,
        construct_price: val.construct_price,
        construct_datetime_start: val.construct_datetime_start,
        construct_datetime_end: val.construct_datetime_end,
      }
      publicStore.form = {...publicStore.form, ...data}
      ElNotification({ title: '提示', message: '导入成功', type: 'success' })
      onVisable()
    }
  }
 
  // 暴露给父组件
  defineExpose({
    onVisable
  })
</script>

<style scoped lang="scss">

</style>
