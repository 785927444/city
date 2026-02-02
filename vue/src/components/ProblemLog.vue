<template>
  <div class="topclass">
    <el-dialog modal-class="topclass" v-model="state.isFalse" title="整改进度更新" :before-close="onVisable" :draggable="true" width="62%">
      <div class="ww100 h100x6 flex-col hidden">
        <!-- 标题 -->
        <!-- <aa-title title="">
          <template #left-content>
            <div class="flex-sc">
              <span class="mr10">状态</span>
              <span class="w50x3">
                <el-select v-model="state.status" placeholder="请选择" style="width:100%" filterable clearable>
                  <el-option v-for="(v, i) in problem_statuss" :key="v.value" :value="String(v.value)" :label="v.name" />
                </el-select>
              </span>
              <div class="rad4 ptb5 w80 flex-cc cursor bgi1 white ml10" @click.stop="state.page=1;init()">搜索</div>
            </div>
          </template>
          <template #right-content></template>
        </aa-title> -->
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
          <el-table-column prop="msg" label="修改内容" />
          <el-table-column prop="action_rate" label="原进度" width="100" align="center" />
          <el-table-column prop="new_action_rate" label="新进度" width="100" align="center" />
          <el-table-column label="原支撑材料" align="center" width="100">
            <template #default="scope, $index">
                <span class="i1 cursor" @click.stop="viewRef.onVisable(scope.row.action_material)" v-if="scope.row.action_material">查看</span>
                <span v-else>无</span>
              </template>
          </el-table-column>
          <el-table-column label="新支撑材料" align="center" width="100">
            <template #default="scope, $index">
                <span class="i1 cursor" @click.stop="viewRef.onVisable(scope.row.new_action_material)" v-if="scope.row.new_action_material">查看</span>
                <span v-else>无</span>
              </template>
          </el-table-column>
          <el-table-column label="更新时间" align="center" width="150">
            <template #default="scope, $index">
              <span>{{parseTime(scope.row.update_time)}}</span>
            </template>
          </el-table-column>
          </el-table>
        </div>
      </div>
      <ViewFiles ref="viewRef" />
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
  const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const problem_statuss = [
    {value: '0', name: '未匹配'},
    {value: '1', name: '已匹配'},
  ]
  let viewRef = $ref()
  const state = reactive({
	  ...publicStore.$state,
    status: '',
  })

  const indexMethod = (index) => { return parseInt(state.page) + index }

  const props = defineProps({
    state: {
      type: [Object, Array],
      default: ()=>{return {}}
    },
  })

  const onVisable = async (val?: any) => {
    state.isFalse = !state.isFalse
    if(!state.isFalse) return
    state.active = {...val}
    init()
  }

  const init = async(key) => {
    let query = {model: 't_scheme_problem_log', args: `scheme_id='${state.active.scheme_id}' and parent_id='${state.active.parent_id}'`}
    if(state.status!==''&&state.status!=null) query.args +=` and problem_status='${state.status}'`
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

  // 暴露给父组件
  defineExpose({
    onVisable
  })
</script>

<style scoped lang="scss">
// :deep(.el-dialog__body){
//   padding: 0;
// }
</style>
