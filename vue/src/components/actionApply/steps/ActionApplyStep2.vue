<template>
  <div class="layout-col overlay">
    <div class="hh100 ww100 flex-sc warp">
      <el-form class="ww100 pplr15" ref="formRef" :model="publicStore.form" :rules="ruleList" label-width="120" :disabled="props.isReadonly">
        <div class="flex-sc warp ww100">
          <el-form-item label="方案名称" prop="plan_name" class="ww50 flex-sc">
            <el-input size="large" v-model="publicStore.form.plan_name" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="方案编制单位" prop="plan_unit" class="ww50 flex-sc">
            <el-input size="large" v-model="publicStore.form.plan_unit" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="复批时间" prop="approval_time" class="ww50 flex-sc">
            <el-date-picker v-model="publicStore.form.approval_time" style="width: 100%;" size="large" type="datetime" placeholder="请选择" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
          </el-form-item>
          <el-form-item label="方案摘要" prop="plan_abstract" class="ww100 flex-sc">
            <el-input size="large" v-model="publicStore.form.plan_abstract" type="textarea" :rows="4"  placeholder="请输入" />
          </el-form-item>
          <el-form-item label="基础建设条件" prop="condition" class="ww100 flex-sc">
            <el-input size="large" v-model="publicStore.form.condition" type="textarea" :rows="4"  placeholder="请输入" />
          </el-form-item>
          <el-form-item label="实施方案文件上传" prop="files2" class="ww100 flex-ss">
            <div class="ww100 plr30 ptb22 bo-i16-1 rad8 bg-white">
              <FileList v-if="publicStore.form?.plan_attr" v-model:files="publicStore.form.plan_attr" parent-field="plan_attr" :plans="props.plans" :contents="props.contents" :active="props.active"  />
            </div>
            </el-form-item>
        </div>
      <div class="ww100 white-rgba50 rad8 p15 mt16">
        <div class="flex-sc f18 plr10">
          <span>项目任务</span>
        </div>
        <div class="ww100 flex-sc pb20 mt10">
          <div class="mr40 pb10 f18 relative cursor actfont" :class="tabKey==='key'?'i1 bob-i1-2':'bob-tt-2'" @click.stop="tabKey='key'">
            <span>重点落实任务</span>
          </div>
          <div class="mr40 pb10 f18 relative cursor actfont" :class="tabKey==='check'?'i1 bob-i1-2':'bob-tt-2'" @click.stop="tabKey='check'">
            <span>体检整改任务</span>
          </div>
        </div>
        <div v-show="tabKey==='check'" class="layout-col white-rgba50 rad8 p15">
          <el-table
            header-cell-class-name="bgi16 c3 f18"
            :cell-style="{'background-color': '#FFFFFF', 'color': '#626366', 'fontSize': '16px'}"
            :row-style="{height: '60px'}"
            border
            empty-text="暂无数据"
            :data="checkTasksPage"
            stripe
            @selection-change="onCheckSelChange">
            <el-table-column type="selection" width="60" />
            <el-table-column type="index" label="序号" align="center" width="60" />
            <el-table-column prop="type" label="体检维度" align="center" min-width="150">
              <template #default="scope">
                <el-input v-model="scope.row.type" size="large" placeholder="自动带入" />
              </template>
            </el-table-column>
            <el-table-column prop="indicator" label="指标项" align="center" min-width="180">
              <template #default="scope">
                <el-input v-model="scope.row.indicator" size="large" placeholder="自动带入" />
              </template>
            </el-table-column>
            <el-table-column prop="problem" label="存在问题" align="center" width="220">
              <template #default="scope">
                <el-input v-model="scope.row.problem" size="large" placeholder="自动带入" />
              </template>
            </el-table-column>
            <el-table-column label="整改范围" align="center" min-width="100">
              <template #default="scope">
                <el-button type="primary" size="large" plain @click.stop="">选择</el-button>
              </template>
            </el-table-column>
            <el-table-column prop="content" label="整改内容" align="center" min-width="200">
              <template #default="scope">
                <el-input v-model="scope.row.content" size="large" placeholder="请输入" />
              </template>
            </el-table-column>
          </el-table>
          <div class="ww100 flex-sb mt10">
            <div class="flex-sc" v-if="!props.isReadonly">
              <div class="rad4 ptb8 plr20 f16 cursor bo-c8-1 c8 mr10" @click.stop="onCheckSelectAll">全选</div>
              <div class="rad4 ptb8 plr20 f16 cursor bgi13 i15 mr10" @click.stop="onCheckDelete">删除</div>
              <div class="rad4 ptb8 plr20 f16 cursor bgi10 i12 mr10" @click.stop="onCheckImport">新增</div>
            </div>
            <el-pagination
              layout="prev, pager, next"
              :page-count="5"
              :page-size="checkPage.limit"
              :current-page="checkPage.page"
              @current-change="p=>{checkPage.page=p}">
            </el-pagination>
          </div>
        </div>
        <div v-show="tabKey==='key'" class="layout-col white-rgba50 rad8 p15">
          <el-table
            header-cell-class-name="bgi16 c3 f18"
            :cell-style="{'background-color': '#FFFFFF', 'color': '#626366', 'fontSize': '16px'}"
            :row-style="{height: '60px'}"
            border
            empty-text="暂无数据"
            :data="keyTasksPage"
            stripe
            @selection-change="onKeySelChange">
            <el-table-column type="selection" width="60" />
            <el-table-column type="index" label="序号" align="center" width="60" />
            <el-table-column prop="task_type" label="任务类型" align="center" min-width="180">
              <template #default="scope">
                <el-select v-model="scope.row.task_type" size="large" placeholder="请选择" @change="scope.row.construct_content = ''">
                  <el-option 
                    v-for="v in (publicStore.form.task_type && publicStore._public.task_classs ? publicStore._public.task_classs.filter(a => a.parent_id == publicStore.form.task_type) : [])" 
                    :key="v.id" 
                    :label="v.name" 
                    :value="v.name" 
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="construct_content" label="建设内容" min-width="200">
              <template #default="scope">
                <el-select v-model="scope.row.construct_content" size="large" placeholder="请选择">
                  <el-option 
                    v-for="v in (scope.row.task_type && publicStore._public.construct_contents ? publicStore._public.construct_contents.filter(a => {
                      const parent = publicStore._public.task_classs.find(tc => tc.name === scope.row.task_type);
                      return parent && a.parent_id == parent.id;
                    }) : [])" 
                    :key="v.id" 
                    :label="v.name" 
                    :value="v.name" 
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="construct_scale" label="建设规模" align="center" min-width="100">
              <template #default="scope">
                <el-input v-model="scope.row.construct_scale" size="large" />
              </template>
            </el-table-column>
            <el-table-column prop="t2026" label="2026年目标" align="center" min-width="100">
              <template #default="scope">
                <el-input v-model="scope.row.t2026" size="large" />
              </template>
            </el-table-column>
            <el-table-column prop="t2027" label="2027年目标" align="center" min-width="100">
              <template #default="scope">
                <el-input v-model="scope.row.t2027" size="large" />
              </template>
            </el-table-column>
          </el-table>
          <div class="ww100 flex-se mt10" v-if="!props.isReadonly">
            <div></div>
            <div class="i1 cursor f16" @click.stop="onAddYear">添加年度</div>
          </div>
          <div class="ww100 flex-sb mt10">
            <div class="flex-sc" v-if="!props.isReadonly">
              <div class="rad4 ptb8 plr20 f16 cursor bo-c8-1 c8 mr10" @click.stop="onKeySelectAll">全选</div>
              <div class="rad4 ptb8 plr20 f16 cursor bgi13 i15 mr10" @click.stop="onKeyDelete">删除</div>
              <div class="rad4 ptb8 plr20 f16 cursor bgi10 i12 mr10" @click.stop="onKeyImport">新增</div>
            </div>
            <el-pagination
              layout="prev, pager, next"
              :page-count="5"
              :page-size="keyPage.limit"
              :current-page="keyPage.page"
              @current-change="p=>{keyPage.page=p}">
            </el-pagination>
          </div>
        </div>
      </div>
      <div class="ww100 white-rgba50 rad8 p15 mt16">
        <div class="flex-sc f18 plr10">
          <span>时序管理</span>
        </div>
        <div class="layout-col white-rgba50 rad8 p15 mt10">
          <el-table
            header-cell-class-name="bgi16 c3"
            :cell-style="{'background-color': '#FFFFFF', 'color': '#626366'}"
            border
            empty-text="暂无数据"
            :data="timelineRows"
            stripe>
            <el-table-column type="index" label="序号" align="center" width="80" />
            <el-table-column prop="year" label="年度" align="center" width="120" />
            <el-table-column prop="desc" label="阶段任务描述" />
            <el-table-column prop="investment" label="阶段投资" align="center" width="140" />
            <el-table-column label="操作" align="center" width="120">
              <template #default="scope"><span class="i1 cursor" @click.stop="onTimelineOp(scope.row)">查看</span></template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      </el-form>

      <el-dialog v-model="pickVisible" title="选择体检问题（可多选）" width="80%">
        <el-input v-model="keyword" clearable placeholder="搜索：维度 / 指标项 / 存在问题" class="mb10" />
        <el-table
          :data="filteredProblemList"
          height="420"
          @selection-change="onPickSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="dimensionName" label="体检维度" width="160" />
          <el-table-column prop="indicatorName" label="指标项" width="220" />
          <el-table-column prop="problemContent" label="存在问题" show-overflow-tooltip />
        </el-table>
        <template #footer>
          <el-button @click="pickVisible=false">取消</el-button>
          <el-button type="primary" @click="confirmPick">加入已选（{{ pickSelection.length }}）</el-button>
        </template>
      </el-dialog>

      <div class="ww100 flex-cc f18 p40 bot-i16-1 mt20" v-if="publicStore.form">
        <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" @click.stop="emitPrev">上一步</div>
        <template v-if="!props.isReadonly">
          <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" @click.stop="emitSave" v-if="!publicStore.form.id">保 存</div>
          <div v-else>
            <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" @click.stop="emitNext" v-if="publicStore.form.reserve_status=='1'">下一步</div>  
            <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" @click.stop="emitSave" v-if="publicStore.form.id && publicStore.form.apply_status=='0' && publicStore.form.reserve_status=='0' && route.query.key == 'enterprise'">申 请</div>
            <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" @click.stop="emitSave" v-if="publicStore.form.id && publicStore.form.apply_status=='1' && publicStore.form.reserve_status=='0' && route.query.key == 'enterprise' && route.query.action=='1f10502a-e388-6850-8aa3-265c92863865'">更 新</div>
           <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" @click.stop="emitSave('1')" v-if="publicStore.form.id && publicStore.form.reserve_status=='0' && route.query.key == 'department' && route.query.action=='019c041a-9f8c-7e9e-91eb-0ae051e6f324'">审 批</div>
           <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" @click.stop="emitSave" v-if="publicStore.form.id && publicStore.form.reserve_status>'0' && route.query.key == 'department' && route.query.action=='1f10502a-e388-6850-8aa3-265c92863865'">更 新</div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { storage } from '@/utils/storage'
const { proxy }: any = getCurrentInstance()
const route = useRoute()
const publicStore = proxy.publicStore()
const dictStore = proxy.dictStore()

let tabKey = $ref('key')
const checkPage = reactive({ page: 1, limit: 10, total: 0 })
const keyPage = reactive({ page: 1, limit: 10, total: 0 })

const createEmptyCheckRow = () => ({
  type: '',
  indicator: '',
  problem: '',
  range: '',
  content: '',
  indicatorOptions: [],
  problemOptions: []
})

if (!publicStore._public.checkTasks) publicStore._public.checkTasks = []
if (!publicStore._public.keyTasks) publicStore._public.keyTasks = [{ 
  task_type: '', 
  construct_content: '', 
  construct_scale: '', 
  t2026: '', 
  t2027: '',
  t2028: ''
}]
if (!publicStore._public.timelineRows) publicStore._public.timelineRows = [
  { year: '2026', desc: '', investment: '' },
  { year: '2027', desc: '', investment: '' },
  { year: '2028', desc: '', investment: '' },
]

const checkTasks = $ref(publicStore._public.checkTasks)
const keyTasks = $ref(publicStore._public.keyTasks)
const timelineRows = $ref(publicStore._public.timelineRows)

watch(() => checkTasks, (val) => { publicStore._public.checkTasks = val }, { deep: true })
watch(() => keyTasks, (val) => { publicStore._public.keyTasks = val }, { deep: true })
watch(() => timelineRows, (val) => { publicStore._public.timelineRows = val }, { deep: true })

let keySel = $ref([])
let checkSel = $ref([])

const cacheKey = 'actionApply:inspectionProblems'
const dimensionList = ref<any[]>([])
const problemItems = ref<any[]>([])
const taskProblems = ref<any[]>([])
const pickVisible = ref(false)
const keyword = ref('')
const pickSelection = ref<any[]>([])
let formRef = ref()
let ruleList = $ref({})

const state = reactive({
  ...publicStore.$state,
})

const props = defineProps({
  isReadonly: {
    type: Boolean,
    default: false
  },
  state: {
    type: [Object, Array],
    default: () => { return {} }
  },
  contents: {
    type: Array,
    default: []
  },
  plans: {
    type: Array,
    default: []
  },
  active: {
    type: [Object, Array],
    default: () => { return {} }
  }
})

const getProblemData = async () => {
  let queryItem: any = {
    model: 't_scheme_problem',
    limit: 1000
  }
  if (publicStore.form?.parent_id) {
    queryItem.args = `scheme_id='${publicStore.form.parent_id}'`
  }
  let queryTask = {
    model: 't_task_problem',
    limit: 2000
  }
  publicStore.http({ Api: queryItem, Api1: queryTask }).then((res: any) => {
    problemItems.value = Array.isArray(res.Api) ? res.Api : []
    taskProblems.value = Array.isArray(res.Api1) ? res.Api1 : []
    publicStore._public.problem_items = problemItems.value
    publicStore._public.task_problems = taskProblems.value
  })
}

const getDimensionList = async () => {
  let query = {
    model: 't_problem_type',
    args: "parent_id != '0' AND parent_id IS NOT NULL AND parent_id != ''",
    limit: 1000
  }
  publicStore.http({ Api: query }).then((res: any) => {
    dimensionList.value = Array.isArray(res) ? res : []
  })
}

const onDimensionChange = async (row: any) => {
  row.indicator = ''
  row.problem = ''
  row.indicatorOptions = []
  row.problemOptions = []
  const dim = dimensionList.value.find(d => d.name === row.type)
  if (!dim) return
  let query = {
    model: 't_task_problem',
    args: `parent_id = '${dim.id}'`,
    limit: 1000
  }
  publicStore.http({ Api: query }).then((res: any) => {
    row.indicatorOptions = Array.isArray(res) ? res : []
  })
}

const onIndicatorChange = async (row: any) => {
  row.problem = ''
  row.problemOptions = []
  const ind = row.indicatorOptions.find((i: any) => i.name === row.indicator)
  if (!ind) return
  let query = {
    model: 't_scheme_problem',
    args: `parent_id = '${ind.id}'`,
    limit: 1000
  }
  publicStore.http({ Api: query }).then((res: any) => {
    row.problemOptions = Array.isArray(res) ? res : []
  })
}

const onProblemChange = (row: any) => {
  const prob = row.problemOptions.find((p: any) => p.problem_content === row.problem)
  if (prob) {
    row.content = prob.rectify_content || ''
  }
}

const flatProblemList = computed(() => {
  const items = problemItems.value
  const tasks = taskProblems.value
  if (!items.length || !tasks.length) return []
  const taskMap = new Map(tasks.map((t: any) => [String(t.id), t]))
  return items.map((it: any) => {
    const indicatorTask = taskMap.get(String(it.parent_id))
    const dimensionTask = indicatorTask ? taskMap.get(String(indicatorTask.parent_id)) : null
    if (!indicatorTask || !dimensionTask) return null
    return {
      problemItemId: it.id,
      schemeId: it.scheme_id,
      indicatorId: indicatorTask.id,
      indicatorName: indicatorTask.name,
      dimensionId: dimensionTask.id,
      dimensionName: dimensionTask.name,
      problemContent: it.problem_content
    }
  }).filter(Boolean)
})

const filteredProblemList = computed(() => {
  const k = keyword.value.trim()
  if (!k) return flatProblemList.value
  return flatProblemList.value.filter((r: any) =>
    (r.dimensionName || '').includes(k) ||
    (r.indicatorName || '').includes(k) ||
    (r.problemContent || '').includes(k)
  )
})

const onPickSelectionChange = (rows: any[]) => {
  pickSelection.value = rows
}

const confirmPick = () => {
  const exists = new Set(checkTasks.map((r: any) => r.problemItemId))
  pickSelection.value.forEach((r: any) => {
    if (exists.has(r.problemItemId)) return
    checkTasks.push({
      type: r.dimensionName,
      indicator: r.indicatorName,
      problem: r.problemContent,
      content: '',
      problemItemId: r.problemItemId,
      scheme_id: r.schemeId,
      indicatorId: r.indicatorId,
      dimensionId: r.dimensionId,
    })
    exists.add(r.problemItemId)
  })
  pickVisible.value = false
}

const loadCachedProblems = () => {
  const cached = storage.get<any>(cacheKey)
  if (!cached || typeof cached !== 'object') return
  if (publicStore.form?.task_class && String(cached.taskClassId || '') !== String(publicStore.form.task_class)) {
    return
  }
  const list = Array.isArray(cached.list) ? cached.list : []
  const rows = list.map((item: any) => ({
    type: item.inspection_dimension || '',
    indicator: item.indicator_item || '',
    problem: item.problem_content || '',
    range: '',
    content: item.rectify_content || '',
    indicatorOptions: [],
    problemOptions: []
  }))
  const targetLen = Math.max(3, rows.length)
  while (rows.length < targetLen) rows.push(createEmptyCheckRow())
  checkTasks.splice(0, checkTasks.length, ...rows)
}

const ensureMinCheckRows = () => {
  const targetLen = Math.max(3, checkTasks.length || 0)
  const rows = [...checkTasks]
  while (rows.length < targetLen) rows.push(createEmptyCheckRow())
  if (rows.length !== checkTasks.length) {
    checkTasks.splice(0, checkTasks.length, ...rows)
  }
}

onMounted(async () => {
  getProblemData()
  getDimensionList()
  if (!checkTasks.length) {
    loadCachedProblems()
  }
  ensureMinCheckRows()
})

watch(() => publicStore.form.parent_id, () => {
  getProblemData()
})

const checkTasksPage = computed(() => checkTasks)
const keyTasksPage = computed(() => keyTasks)
const onKeySelChange = (val: any) => { keySel = val }
const onCheckSelChange = (val: any) => { checkSel = val }
const onCheckSelectAll = () => { checkSel = [...checkTasks] }
const onCheckDelete = () => { checkTasks.splice(0, checkTasks.length, ...checkTasks.filter((a: any) => !checkSel.includes(a))) }
const onKeySelectAll = () => { keySel = [...keyTasks] }
const onKeyDelete = () => { keyTasks.splice(0, keyTasks.length, ...keyTasks.filter((a: any) => !keySel.includes(a))) }
const onKeyImport = () => {
  keyTasks.push({ 
    task_type: '', 
    construct_content: '', 
    construct_scale: '', 
    t2026: '', 
    t2027: '',
    t2028: ''
  })
}
const onCheckImport = () => {
  checkTasks.push(createEmptyCheckRow())
}
const onTimelineOp = (row: any) => {}
const onAddYear = () => {
  const lastYear = timelineRows.length > 0 ? Number(timelineRows[timelineRows.length - 1].year) : 2025
  timelineRows.push({ year: String(lastYear + 1), desc: '', investment: '' })
}

const emit = defineEmits(['prev', 'next', 'save'])
const emitPrev = () => emit('prev')
const emitNext = () => emit('next')
const emitSave = (status?: string) => emit('save', status)

const validate = () => {
  return new Promise<boolean>((resolve) => {
    formRef.value?.validate((ok: boolean) => resolve(ok))
  })
}

const collect = () => {
  return {
    tables: {
      keyTasks,
      checkTasks,
      timelineRows
    }
  }
}

const apply = (data: any) => {
  if (data?.tables) {
    if (data.tables.keyTasks) keyTasks.splice(0, keyTasks.length, ...data.tables.keyTasks)
    if (data.tables.checkTasks) checkTasks.splice(0, checkTasks.length, ...data.tables.checkTasks)
    if (data.tables.timelineRows) timelineRows.splice(0, timelineRows.length, ...data.tables.timelineRows)
  }
}

defineExpose({ validate, collect, apply })
</script>

<style scoped lang="scss">
.bob-tt-2 { border-bottom: 2px solid transparent; }
.r-18{ right: -18px; }
.autoHeight{min-height: 100%; height: 3000px;}
</style>
