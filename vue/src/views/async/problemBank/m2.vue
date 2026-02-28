<template>
  <div class="layout-col">
    <!-- 标题 -->
    <aa-title title="">
      <template #left-content>
        <!-- <div class="flex-sc mr30">
          <span class="mr10">整治类型</span>
          <span class="w50x3">
            <el-select v-model="state.action_type" placeholder="请选择" style="width:100%" filterable clearable>
              <el-option v-for="(v, i) in action_types" :key="v.value" :value="String(v.value)" :label="v.name" />
            </el-select>
          </span>
        </div> -->
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
        <div class="rad4 ptb6 plr12 flex-cc cursor bo-i1-1 i1 ml15" @click.stop="toPath('/problemResult', {scheme_id: route.query.id, id: publicStore.active.id, parent_id: publicStore.active.parent_id})">
          <span class="f14 ml5">指标评价结果</span>
        </div>
        <div class="rad4 ptb6 plr12 flex-cc cursor bo-i1-1 i1 ml15" @click.stop="toPath('/problemUpdata', {scheme_id: route.query.id, id: publicStore.active.id, parent_id: publicStore.active.parent_id})">
          <span class="f14 ml5">整改进度更新</span>
        </div>
        <div class="rad4 ptb6 plr12 flex-cc cursor bo-i1-1 i1 ml15" @click.stop="toPath('/problemTrack')">
          <span class="f14 ml5">返回</span>
        </div>
      </template>
    </aa-title>
    <div class="layout-col">
      <el-table 
      v-if="!isNull(state.list)"
      v-loading.fullscreen.lock="state.loading" 
      header-cell-class-name="bgi16 c3"
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
      <el-table-column label="存在问题">
        <template #default="scope, $index">
          <el-popover title="" width="800" placement="top-start">
            <template #default>
              <div class="problem-content f18"><div class="hh100 overlay flex-col">{{scope.row.problem_content}}</div></div>
            </template>
            <template #reference>
              <span class="line2">{{scope.row.problem_content}}</span>
            </template>
          </el-popover>
        </template>
      </el-table-column>
      <!-- <el-table-column label="整治类型" align="center" width="80">
        <template #default="scope, $index">
          <span>{{scope.row.action_type?find(action_types, ['value', scope.row.action_type], 'name'):''}}</span>
        </template>
      </el-table-column> -->
      <!-- <el-table-column prop="action_unit" label="责任单位" width="100" align="center" /> -->
      <el-table-column prop="problem_num" label="问题数量" width="80" align="center" />
      <el-table-column prop="action_rate" label="整改进度" width="80" align="center" />
      <el-table-column label="问题区域" width="100" align="center" >
        <template #default="scope, $index">
          <span class="i1 cursor" @click.stop="problemRef.onVisable(scope.row)">查看问题分布</span>
        </template>
      </el-table-column>
       <el-table-column label="整改项目清单" width="100" align="center" >
        <template #default="scope, $index">
          <span class="i1 cursor" @click.stop="toPath('/project-push/ledger', {id: scope.row.id})">查看项目清单</span>
        </template>
      </el-table-column>
      </el-table>
    </div>
    <Problems :state="state" ref="problemRef" />
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
  let problemRef = $ref()
  const state = reactive({
	  ...publicStore.$state,
    status: 'all',
  })
  const indexMethod = (index) => { return parseInt(state.page) + index }
	const objectSpanMethod = ({
    row,
    column,
    rowIndex,
    columnIndex,
  }: SpanMethodProps) => {
    const data = state.list;
  
    // --- 处理第一列 (columnIndex === 1)：指标项 ---
    // 【注意】：这一列在 HTML 中没有写 prop="xxx"，所以必须手动指定字段 'parent_id'
    if (columnIndex === 1) {
      const field = 'parent_id'; // 手动指定该列依赖的实际字段
      const val = row[field];
  
      // 标准合并逻辑：如果当前行和上一行字段不同，则开始新的合并
      if (rowIndex === 0 || data[rowIndex - 1][field] !== val) {
        let spanCount = 1;
        // 向下查找有多少行是相同的
        for (let i = rowIndex + 1; i < data.length; i++) {
          if (data[i][field] === val) {
            spanCount++;
          } else {
            break;
          }
        }
        return { rowspan: spanCount, colspan: 1 };
      } else {
        return { rowspan: 0, colspan: 0 };
      }
    }
  
    // --- 处理第二列 (columnIndex === 2)：体检结果 ---
    // 这一列有 prop="result"，所以可以直接用 column.property
    if (columnIndex === 2) {
      const field = column.property;
      const val = row[field];
  
      if (rowIndex === 0 || data[rowIndex - 1][field] !== val) {
        let spanCount = 1;
        for (let i = rowIndex + 1; i < data.length; i++) {
          if (data[i][field] === val) {
            spanCount++;
          } else {
            break;
          }
        }
        return { rowspan: spanCount, colspan: 1 };
      } else {
        return { rowspan: 0, colspan: 0 };
      }
    }
  
    // 其他列（包括序号列 columnIndex === 0）保持默认，不合并
    return { rowspan: 1, colspan: 1 };
  };

  watch(() => publicStore.active, async (val, old) => {
    if(proxy.isNull(val)) return
    if(JSON.stringify(val) == JSON.stringify(old)) return
    await nextTick()
    init()
  },{ immediate: false, deep: true })

  const init = async() => {
    let query1 = {model: 't_task_problem', args: `parent_id='${publicStore.active.id}'`, order: `orderd ASC`} 
    let query2 = {model: 't_scheme_problem', args: `scheme_id='${route.query.id}' and parents_id='${publicStore.active.id}'`} 
    if(state.action_type !=='' && state.action_type!=null) query2.args += ` and action_type='${state.action_type}'`
    if(!proxy.isNull(state.datetime)) {
      const [startDate, endDate] = state.datetime
      const start = new Date(startDate.getFullYear(), 0, 1).getTime() + ''
      const end = new Date(endDate.getFullYear(), 11, 31, 23, 59, 59, 999).getTime() + ''
      query2.args += ` and check_time>='${start}' and check_time<='${end}'`
    }
    let res = await publicStore.http({Api1: query1, Api2: query2})
    state.task_problems = proxy.isNull(res.Api1)? [] : res.Api1
    state.list = proxy.isNull(res.Api2)? [] : res.Api2
    console.log("state.list", state.list)
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
  
<style scoped lang="scss"></style>
  
