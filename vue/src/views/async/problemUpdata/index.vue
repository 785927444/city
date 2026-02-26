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
        <div class="rad4 ptb6 plr12 flex-cc cursor bo-i1-1 i1 ml15" @click.stop="problemlogRef.onVisable({scheme_id: state.active.scheme_id, parent_id: state.active.id})">
          <span class="f14 ml5">查看更新记录</span>
        </div>
        <div class="rad4 ptb6 plr12 flex-cc cursor bo-i1-1 i1 ml15" @click.stop="onSave()">
          <span class="f14 ml5">保存</span>
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
        :cell-style="cellStyle"
        :span-method="objectSpanMethod"
        border
        empty-text="暂无数据" 
        :data="state.list" stripe>
        <el-table-column type="index" :index="indexMethod" label="序号" align="center" width="50" />
        <el-table-column label="指标项" width="250">
          <template #default="scope, $index">
            <span>{{scope.row.parent_id?find(state.task_problems, ['id', scope.row.parent_id], 'name'):''}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="result" label="体检结果" align="center" width="80"/>
        <el-table-column label="存在问题">
          <template #default="scope, $index">
            <el-popover title="" width="800" placement="top-start">
              <template #default>
                <div class="problem-content f18">
                  <div class="hh100 overlay flex-col">{{scope.row.problem_content}}</div>
                </div>
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
        <el-table-column prop="problem_num" label="问题数量" width="80" align="center" />
        <el-table-column label="整改进度" width="100" align="center" >
            <template #default="scope, $index">
            <el-input  class="i1 cursor progress-input" v-model.number="scope.row.action_rate" placeholder="请输入进度" type="number" min="0" max="100" :controls="false"
              oninput="if(value>100)value=100;if(value<0)value=0;if(value.indexOf('.')>=0)value=value.slice(0,value.indexOf('.')+3)"/>
            </template>
          </el-table-column>
        <el-table-column label="问题区域" align="center"  width="100">
          <template #default="scope, $index">
            <span class="i1 cursor" @click.stop="problemRef.onVisable(scope.row)">查看问题分布</span>
          </template>
        </el-table-column>
        <el-table-column label="整改项目清单" align="center"  width="100">
          <template #default="scope, $index">
            <span class="i1 cursor" @click.stop="toPath('/schemePlansManagerCity', {id: scope.row.id})">查看项目清单</span>
          </template>
        </el-table-column>
        <el-table-column label="支撑材料上传" width="100" align="center" >
          <template #default="scope, $index">
            <!-- <span class="i1 cursor" @click.stop="">上传</span> -->
             <span class="ww100 flex-cc">
              <UploadTextNoName  v-model:model="scope.row.action_material" />
              <span class="i1 cursor ml10" @click.stop="viewFile(scope.row)" v-if="scope.row.action_material">查看</span>
             </span>
          </template>
        </el-table-column>
        </el-table>
      </div>
    </div>
    <Problems :state="state" ref="problemRef" />
    <ProblemLog :state="state" ref="problemlogRef" />
    <ViewFiles ref="viewRef" />
  </div>
</template>

<script lang="ts" setup>
  import api from '@/api'
  import router from '@/router'
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const route = useRoute()
  const action_types = [
    {value: '1', name: '限时整改', color: 'i5'},
    {value: '2', name: '尽力整改', color: 'i11'},
  ]
  let viewRef = $ref()
  let problemRef = $ref()
  let problemlogRef = $ref()
  const state = reactive({
	  ...publicStore.$state,
  })
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
	const cellStyle = ({ column }) => {
  if (column.label === '整改进度' || column.label ==='支撑材料上传') {
    return {
      'background-color': '#FFFFFF',
      'color': '#626366'
    }
  }
  return {
    'background-color': '#F5F5F5',
    'color': '#626366'
  }
}

  onMounted(async() => {
    state.active = {...route.query}
    await getInit()
    init()
  })

  // 预览
  const viewFile = (v) => {
    const filePath = v.action_material
    viewRef.onVisable(filePath)
  }

  const getInit = async() => {
    let query = {model: 't_task_type', args: `parent_id='${state.active.parent_id}'`, order: `orderd ASC`}
    let res = await publicStore.http({Api: query})
    state.actives = proxy.isNull(res)? [] : res.sort((a, b) => a.orderd - b.orderd)
  }

  const init = async(key) => {
    let query1 = {model: 't_task_problem', args: `parent_id='${state.active.id}'`, order: `orderd ASC`} 
    let query2 = {model: 't_scheme_problem', args: `scheme_id='${state.active.scheme_id}' and parents_id='${state.active.id}'`} 
    if(!proxy.isNull(state.datetime)) {
      const [startDate, endDate] = state.datetime
      const start = new Date(startDate.getFullYear(), 0, 1).getTime() + ''
      const end = new Date(endDate.getFullYear(), 11, 31, 23, 59, 59, 999).getTime() + ''
      query2.args += ` and check_time>='${start}' and check_time<='${end}'`
    }
    let res = await publicStore.http({Api1: query1, Api2: query2})
    state.task_problems = proxy.isNull(res.Api1)? [] : res.Api1
    state.list = proxy.isNull(res.Api2)? [] : JSON.parse(JSON.stringify(res.Api2))
    state.oldlist = proxy.isNull(res.Api2)? [] : JSON.parse(JSON.stringify(res.Api2))
    // console.log("state.active", state.active)
  }

  const onSave = async() => {
    ElMessageBox.confirm('是否确定保存?', '温馨提示', {confirmButtonText: '确定', cancelButtonText: '关闭', type: 'success'}).then(() => {
      // 获取更新数组
      let params = setParams()
      console.log("params", params)
      // 无数据变化
      if(proxy.isNull(params)) return ElNotification({ title: '提示', message: '无数据改变', type: 'info' })
      let { forms, changeFile, logs } = getAllProcessedData(params)
      // console.log('forms---', forms)
      // console.log('changeFile---', changeFile)
      // console.log('logs---', logs)
      let query = {model: 't_scheme_problem', list: forms}
      api.updApi(query).then((res:any) => {
        if(res.code == 200){
          ElNotification({ title: '提示', message: '操作成功', type: 'success' })
          init()
          setChangeFile(changeFile)
          setlog(logs)
        }else{
          ElNotification({ title: '提示', message: res.msg?res.msg:'操作失败400', type: 'error' })
        }
      }).catch((err) => {
        ElNotification({ title: '提示', message: '操作失败401', type: 'error' })
      })
    })
  }

  const setChangeFile = async(changeFile) => {
    if(proxy.isNull(changeFile)) return console.log("无需转移")
    let query = {list: changeFile}
    publicStore.http({changeFileApi: query}).then(res=>{
      console.log("转移res", res)
    })
  }

  const setlog = async(logs) => {
    if(proxy.isNull(logs)) return
    let params = {model: 't_scheme_problem_log', list: logs}
    api.addApi(params).then((res:any) => {}).catch((err) => {})
  }

  const setParams = () => {
	  let chul = state.list
	  .map((item, i) => {
	    // 通过索引获取原数据（保持第一段代码的逻辑：通过索引对比）
	    const oldItem = state.oldlist[i];
	    if (!oldItem) return null;
	    const msgs = [];
	    // 对比整改进度
	    if (item.action_rate !== oldItem.action_rate) {
	      msgs.push(`整改进度从原来${oldItem.action_rate || '空'}到${item.action_rate || '空'}`);
	    }
	    // 对比支撑材料
	    if (item.action_material !== oldItem.action_material) {
	      msgs.push('支撑材料已改变');
	    }
	    // 如果没有变化，返回 null 用于后续过滤
	    if (msgs.length === 0) return null;
	    // 返回最终的日志对象
	    return {
        id: item.id,
	      scheme_id: state.active.scheme_id,
	      parent_id: state.active.id,
	      msg: msgs.join('，'),
	      action_rate: oldItem.action_rate,
	      new_action_rate: item.action_rate,
	      action_material: oldItem.action_material,
	      new_action_material: item.action_material,
	      update_time: Date.now() + ''
	    };
	  })
	  .filter(Boolean);
    return chul
  }

	const getAllProcessedData = (params) => {
	  const forms = []
	  const logs = []
	  const changeFile = []
	  const base = 'static/problems'
	  const timeStr = Date.now() + ''
	  params.forEach((item, i) => {
	    // 1. 提取原始值
	    const old_rate = item.action_rate
	    const old_mat = item.action_material
	    // 2. 初始化最终值和变更消息数组
	    let final_rate = old_rate
	    let final_mat = old_mat
	    const msgs = []
	    // 3. 处理整改进度 (action_rate)
	    if (item.new_action_rate != null && item.new_action_rate !== old_rate) {
	      final_rate = item.new_action_rate
	      msgs.push(`整改进度从原来${old_rate || '空'}到${final_rate || '空'}`)
	    }
	    // 4. 处理支撑材料 (action_material) 及 文件路径转换
	    const new_mat = item.new_action_material
	    if (new_mat != null && new_mat !== old_mat) {
	      if (new_mat.includes('/uploads')) {
	        // 需要转换文件路径
	        const ext = '.' + new_mat.split('.').pop()
	        const newfile = `${base}/${item.id}_${timeStr}_${i}${ext}`
	        // 记录文件映射关系
	        changeFile.push({ oldfile: new_mat, newfile })
	        // 关键：日志和表单都使用转换后的新路径
	        final_mat = newfile 
	      } else {
	        // 普通文本变更
	        final_mat = new_mat
	      }
	      msgs.push('支撑材料已改变')
	    }
	    // 5. 组装 Forms 数据
	    forms.push({
	      id: item.id,
	      action_rate: final_rate,
	      action_material: final_mat
	    })
	    // 6. 组装 Logs 数据 (仅当有变更时)
	    if (msgs.length > 0) {
	      const { id, ...rest } = item // 排除 id，保留其他字段(如 parent_id, scheme_id 等)
	      logs.push({
	        ...rest,
	        msg: msgs.join('，'),
	        action_rate: old_rate,
	        new_action_rate: final_rate,
	        action_material: old_mat,
	        new_action_material: final_mat, // 重点：这里存入的是转换后的 newfile
	        update_time: timeStr
	      })
	    }
	  })
	  return { forms, logs, changeFile }
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
/* 只针对添加了 progress-input 类的输入框 */
.progress-input :deep(.el-input__wrapper) {
  background-color: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
}

.progress-input :deep(.el-input__inner) {
  color: #266fff !important;
  text-align: center !important;
  background-color: transparent !important;
  border: none !important;
}

/* 去掉数字输入框箭头 */
.progress-input :deep(input[type="number"]::-webkit-outer-spin-button),
.progress-input :deep(input[type="number"]::-webkit-inner-spin-button) {
  -webkit-appearance: none;
  margin: 0;
}

// .progress-input :deep(input[type="number"]) {
//   -moz-appearance: textfield;
// }
</style>
  