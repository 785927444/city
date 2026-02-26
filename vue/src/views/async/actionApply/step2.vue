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
              <!-- <el-button type="primary" size="small" class="mr10" @click="openPicker">搜索选择体检问题</el-button> -->
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

      <!-- 选择体检问题弹窗 -->
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
        <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" @click.stop="publicStore.actIndex--">上一步</div>
        <template v-if="!props.isReadonly">
          <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" @click.stop="publicStore.actIndex++">下一步</div>  
          <!-- 新增项目 -->
          <!-- <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" @click.stop="onSave(formRef)" v-if="!publicStore.form.id">保 存</div> -->
          <!-- <div v-else> -->
            <!-- 已储备才有下一步 -->
            <!-- <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" @click.stop="publicStore.actIndex++" v-if="publicStore.form.reserve_status=='1' || route.query.action=='019c03f8-971e-72a5-8dc3-82f1a1fc2758'">下一步</div>   -->
            <!-- 企业申请储备 -->
            <!-- <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" @click.stop="onSave(formRef)" v-if="publicStore.form.id && publicStore.form.apply_status=='0' && publicStore.form.reserve_status=='0' && route.query.key == 'enterprise'">申请储备</div>
            <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" @click.stop="onSave(formRef)" v-if="publicStore.form.id && publicStore.form.apply_status=='1' && publicStore.form.reserve_status=='0' && route.query.key == 'enterprise' && route.query.action=='1f10502a-e388-6850-8aa3-265c92863865'">更 新</div>
            <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" @click.stop="onSave(formRef)" v-if="publicStore.form.id && publicStore.form.apply_status=='3' && publicStore.form.reserve_status=='2' && route.query.key == 'enterprise' && route.query.action=='1f1000c7-5def-66b0-bc96-dc4dc45fb99c'">重新申请</div> -->
            <!-- 部门开始储备 -->
           <!-- <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" @click.stop="onSave(formRef, '1')" v-if="publicStore.form.id && publicStore.form.reserve_status=='0' && route.query.key == 'department' && route.query.action=='019c041a-9f8c-7e9e-91eb-0ae051e6f324'">开始储备</div> -->
           <!-- <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" @click.stop="onSave(formRef)" v-if="publicStore.form.id && publicStore.form.reserve_status>'0' && route.query.key == 'department' && route.query.action=='1f10502a-e388-6850-8aa3-265c92863865'">更 新</div> -->
          <!-- </div> -->
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import api from '@/api'
  import { pinyin } from 'pinyin-pro'
  import { v6 as uuidv6 } from 'uuid'
  import { areaOptions } from '@/utils/areaData'
  import { storage } from '@/utils/storage'
  import router from '@/router'
	const { proxy }:any = getCurrentInstance()
  const route = useRoute()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const dictStore = proxy.dictStore()

  // 1. 先定义响应式数据 (提升到顶部)
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

  // 使用 publicStore._public 来共享数据，确保 step2 和 step3 数据同步
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

  // 监听并同步到 store
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
  let projectRef = $ref()
  let formRef = ref()
  let ruleList= $ref({})

  const activeTab = [
    {value: '1', name: '重点落实任务'},
    {value: '2', name: '体检整个任务'},
  ]
  const files = [
    {name: '基础条件', key: 'value1'},
    {name: '更新方式', key: 'value2'},
    {name: '设计方案', key: 'value3'},
  ]
  const state = reactive({
	  ...publicStore.$state,
  })

  // ... (保持原有的 getProblemData, getDimensionList 等函数)
  const props = defineProps({
    isReadonly: {
      type: Boolean,
      default: false
    },
    state: {
      type: [Object, Array],
      default: ()=>{return {}}
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
      default: ()=>{return {}}
    },
  })

  // 获取体检维度和指标项数据
  const getProblemData = async () => {
    // 移除 parent_id 校验，因为用户表示不需要规划ID
    
    let queryItem = {
      model: 't_scheme_problem',
      limit: 1000
    }
    
    // 如果有 parent_id 还是可以带上作为过滤，但不再是强制
    if (publicStore.form?.parent_id) {
      queryItem.args = `scheme_id='${publicStore.form.parent_id}'`
    }
    
    let queryTask = {
      model: 't_task_problem',
      limit: 2000
    }

    console.log('--- 开始请求体检问题数据 ---');
    console.log('查询条件 scheme_id:', publicStore.form.parent_id);

    publicStore.http({ Api: queryItem, Api1: queryTask }).then(res => {
      console.log('--- 体检问题数据返回 ---');
      problemItems.value = Array.isArray(res.Api) ? res.Api : []
      taskProblems.value = Array.isArray(res.Api1) ? res.Api1 : []
      
      console.log('t_scheme_problem_item 数量:', problemItems.value.length);
      console.log('t_task_problem 数量:', taskProblems.value.length);
      
      publicStore._public.problem_items = problemItems.value
      publicStore._public.task_problems = taskProblems.value
    }).catch(err => {
      console.error('请求体检数据失败:', err);
    })
  }

  // 获取维度列表 (第一级)
  const getDimensionList = async () => {
    console.log('--- 开始请求体检维度 (Dimension List) ---');
    let query = {
      model: 't_problem_type',
      args: "parent_id != '0' AND parent_id IS NOT NULL AND parent_id != ''",
      limit: 1000
    }
    console.log('查询参数:', query);
    
    publicStore.http({ Api: query }).then(res => {
      console.log('体检维度返回原始数据 (res):', res);
      // 因为 http 只传了一个 Api 键，返回的 res 直接就是数组数据
      dimensionList.value = Array.isArray(res) ? res : []
      console.log('解析后的体检维度列表 (dimensionList):', dimensionList.value);
    }).catch(err => {
      console.error('获取体检维度失败:', err);
    })
  }

  // 维度切换 (第一级变动 -> 加载第二级 指标项)
  const onDimensionChange = async (row) => {
    console.log('--- 维度切换 (onDimensionChange) ---', row.type);
    row.indicator = ''
    row.problem = ''
    row.indicatorOptions = []
    row.problemOptions = []
    
    const dim = dimensionList.value.find(d => d.name === row.type)
    if (!dim) {
      console.warn('未找到匹配的维度对象:', row.type);
      return
    }
    
    console.log('匹配到的维度对象:', dim);
    
    // 指标项：t_problem_type表的id就是t_task_problem的父id (parent_id)
    let query = {
      model: 't_task_problem',
      args: `parent_id = '${dim.id}'`,
      limit: 1000
    }
    console.log('请求指标项参数:', query);
    
    publicStore.http({ Api: query }).then(res => {
      console.log('指标项返回原始数据 (res):', res);
      row.indicatorOptions = Array.isArray(res) ? res : []
      console.log('更新后的指标项选项 (indicatorOptions):', row.indicatorOptions);
    }).catch(err => {
      console.error('获取指标项失败:', err);
    })
  }

  // 指标项切换 (第二级变动 -> 加载第三级 存在问题)
  const onIndicatorChange = async (row) => {
    console.log('--- 指标项切换 (onIndicatorChange) ---', row.indicator);
    row.problem = ''
    row.problemOptions = []
    
    const ind = row.indicatorOptions.find(i => i.name === row.indicator)
    if (!ind) {
      console.warn('未找到匹配的指标项对象:', row.indicator);
      return
    }
    
    console.log('匹配到的指标项对象:', ind);
    
    // 存在问题：t_task_problem的id就是t_scheme_problem的父父id (parents_id)
    let query = {
      model: 't_scheme_problem',
      args: `parent_id = '${ind.id}'`,
      limit: 1000
    }
    console.log('请求存在问题参数:', query);
    
    publicStore.http({ Api: query }).then(res => {
      console.log('存在问题返回原始数据 (res):', res);
      row.problemOptions = Array.isArray(res) ? res : []
      console.log('更新后的存在问题选项 (problemOptions):', row.problemOptions);
    }).catch(err => {
      console.error('获取存在问题失败:', err);
    })
  }

  // 存在问题切换 -> 自动填充整改内容
  const onProblemChange = (row) => {
    console.log('--- 存在问题切换 (onProblemChange) ---', row.problem);
    const prob = row.problemOptions.find(p => p.problem_content === row.problem)
    if (prob) {
      console.log('匹配到的问题对象:', prob);
      // 自动填充整改内容 (rectify_content)
      row.content = prob.rectify_content || ''
      console.log('自动填充整改内容:', row.content);
    }
  }

  // 把两数组 join 成“可搜索扁平列表”
  const flatProblemList = computed(() => {
    const items = problemItems.value
    const tasks = taskProblems.value
    if (!items.length || !tasks.length) return []

    const taskMap = new Map(tasks.map(t => [String(t.id), t]))

    return items.map(it => {
      const indicatorTask = taskMap.get(String(it.parent_id))
      const dimensionTask = indicatorTask ? taskMap.get(String(indicatorTask.parent_id)) : null
      if (!indicatorTask || !dimensionTask) return null

      return {
        problemItemId: it.id,                 // t_scheme_problem_item.id（唯一）
        schemeId: it.scheme_id,
        indicatorId: indicatorTask.id,
        indicatorName: indicatorTask.name,
        dimensionId: dimensionTask.id,
        dimensionName: dimensionTask.name,
        problemContent: it.problem_content
      }
    }).filter(Boolean)
  })

  // 搜索过滤后的体检问题列表
  const filteredProblemList = computed(() => {
    const k = keyword.value.trim()
    if (!k) return flatProblemList.value
    return flatProblemList.value.filter(r =>
      (r.dimensionName || '').includes(k) ||
      (r.indicatorName || '').includes(k) ||
      (r.problemContent || '').includes(k)
    )
  })

  // 打开搜索选择弹窗
  const openPicker = () => {
    pickVisible.value = true
    keyword.value = ''
    pickSelection.value = []
  }

  // 处理选择项变化
  const onPickSelectionChange = (rows) => {
    pickSelection.value = rows
  }

  // 确认选择并加入已选任务（去重）
  const confirmPick = () => {
    const exists = new Set(checkTasks.map(r => r.problemItemId))

    pickSelection.value.forEach(r => {
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
    console.log('[inspection-cache] load', { cached })
    if (!cached || typeof cached !== 'object') return
    if (publicStore.form?.task_class && String(cached.taskClassId || '') !== String(publicStore.form.task_class)) {
      console.warn('[inspection-cache] skip (task_class mismatch)', {
        cachedTaskClassId: String(cached.taskClassId || ''),
        formTaskClass: String(publicStore.form.task_class)
      })
      return
    }
    const list = Array.isArray(cached.list) ? cached.list : []
    console.log('[inspection-cache] list', { count: list.length, sample: list.slice(0, 3) })
    const rows = list.map(item => ({
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
    console.log('[inspection-cache] filled', { total: checkTasks.length })
  }

  const ensureMinCheckRows = () => {
    const targetLen = Math.max(3, checkTasks.length || 0)
    const rows = [...checkTasks]
    while (rows.length < targetLen) rows.push(createEmptyCheckRow())
    if (rows.length !== checkTasks.length) {
      checkTasks.splice(0, checkTasks.length, ...rows)
    }
    console.log('[inspection-cache] ensure-min', { total: checkTasks.length })
  }

  const hasMeaningfulCheckTasks = () => {
    try {
      return Array.isArray(checkTasks) && checkTasks.some(r => {
        const vals = [r?.type, r?.indicator, r?.problem, r?.range, r?.content]
        return vals.some(v => String(v ?? '').trim() !== '')
      })
    } catch (e) {
      return false
    }
  }

  // 获取明细数据 (初始化回填)
  const getDetailData = async (opts = { tag: 'unknown' }) => {
    const tag = opts?.tag || 'unknown'
    const pid = publicStore?.form?.id
    if (!pid) {
      console.log('[detail] skip (no project id)', { tag, pid })
      return { ok: false, reason: 'no-id', keyApplied: false, checkApplied: false, timeApplied: false }
    }

    const t0 = Date.now()
    console.groupCollapsed(`[detail] start tag=${tag} pid=${pid}`)
    console.log('[detail] before', {
      pid,
      keyTasksLen: keyTasks?.length ?? 0,
      checkTasksLen: checkTasks?.length ?? 0,
      timelineRowsLen: timelineRows?.length ?? 0
    })

    const query = {
      keyApi: { model: 't_project_task_key', args: `project_id='${pid}'`, limit: 1000 },
      checkApi: { model: 't_project_task_check', args: `project_id='${pid}'`, limit: 1000 },
      timeApi: { model: 't_project_task_timeline', args: `project_id='${pid}'`, limit: 1000 }
    }

    let res
    try {
      res = await publicStore.http(query)
    } catch (err) {
      console.error('[detail] request failed', { tag, pid, err })
      console.groupEnd()
      return { ok: false, reason: 'request-failed', keyApplied: false, checkApplied: false, timeApplied: false }
    }

    const keyLen = Array.isArray(res?.keyApi) ? res.keyApi.length : -1
    const checkLen = Array.isArray(res?.checkApi) ? res.checkApi.length : -1
    const timeLen = Array.isArray(res?.timeApi) ? res.timeApi.length : -1

    console.log('[detail] response lens', { keyLen, checkLen, timeLen })

    let keyApplied = false
    let checkApplied = false
    let timeApplied = false

    if (Array.isArray(res?.keyApi) && res.keyApi.length > 0) {
      keyTasks.splice(0, keyTasks.length, ...res.keyApi)
      keyApplied = true
      console.log('[detail] applied keyTasks', { len: keyTasks.length })
    }

    if (Array.isArray(res?.checkApi) && res.checkApi.length > 0) {
      checkTasks.splice(0, checkTasks.length, ...res.checkApi.map(item => ({
        ...item,
        type: item.dimension,
        range: item.rectify_range,
        content: item.rectify_content,
        indicatorOptions: [],
        problemOptions: []
      })))
      checkApplied = true
      console.log('[detail] applied checkTasks', { len: checkTasks.length })
    }

    if (Array.isArray(res?.timeApi) && res.timeApi.length > 0) {
      const sorted = [...res.timeApi].sort((a, b) => Number(a.year) - Number(b.year))
      timelineRows.splice(0, timelineRows.length, ...sorted.map(item => ({
        ...item,
        desc: item.construct_content
      })))
      timeApplied = true
      console.log('[detail] applied timelineRows', { len: timelineRows.length })
    }

    console.log('[detail] after', {
      duration: `${Date.now() - t0}ms`,
      keyTasksLen: keyTasks.length,
      checkTasksLen: checkTasks.length,
      timelineRowsLen: timelineRows.length
    })
    console.groupEnd()

    return { ok: true, keyApplied, checkApplied, timeApplied }
  }

  onMounted(async () => {
    // 1. 加载字典和维度 (同事原有逻辑)
    getProblemData()
    getDimensionList()

    // 2. 兜底：确保至少有 3 行显示
    ensureMinCheckRows()

    // 3. 加载明细数据 (逻辑升级：判断是否回填成功)
    const detail = await getDetailData({ tag: 'onMounted' })

    // 4. 如果明细没有体检任务数据，再尝试用缓存回填
    if (!detail?.checkApplied) {
      if (!hasMeaningfulCheckTasks()) {
        loadCachedProblems()
      }
    }
  })

  watch(() => publicStore.form.id, async (newId, oldId) => {
    ensureMinCheckRows()

    const detail = await getDetailData({ tag: 'watch:id' })

    if (!detail?.checkApplied) {
      if (!hasMeaningfulCheckTasks()) {
        loadCachedProblems()
      }
    }
  })

  watch(() => publicStore.form.parent_id, () => {
    getProblemData()
  })


  const onStepNext = (formEl) => {
    formEl.validate(async valid => {
      if (valid) {
        // 防干扰
        let form = JSON.parse(JSON.stringify(publicStore.form))
        // 当前时间
        let nowtime = Date.now() + ''
        // 更新时间
        form.update_time = nowtime
        // 判断新增与编辑
        let apikey = form.id ? 'updApi' : 'addApi'
        if (!form.project_id && route.query && route.query.project_id) {
          form.project_id = route.query.project_id
        }
        
        // 1.新建项目
        if (apikey == 'addApi') {
          form.user_id = configStore.user.id
          form.user_name = configStore.user.name
          form.user_role = configStore.user.role_id
          form.user_province = configStore.user.province
          form.user_city = configStore.user.city
          form.user_district = configStore.user.district
          form.type = route.query && route.query.key ? route.query.key : ''
          const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
          form.num_title = 'SX'
          form.num_date = today
          let query = { model: 't_project_report', args: `num_title='${form.num_title}' and num_date='${form.num_date}'`, field: `num_number`, order: `num_number asc` }
          let temp = await publicStore.http({ Api: query })
          form.num_number = proxy.isNull(temp) ? '000001' : String(parseInt(temp[0]['num_number'], 10) + 1).padStart(6, '0')
        }

        if (!form.id) form.id = uuidv6()

        // 序列化字段
        const fieldsToSerialize = ['area', 'task_content', 'fund_source', 'orther_text', 'attr', 'plan_attr']
        fieldsToSerialize.forEach(key => {
          if (!proxy.isNull(form[key])) {
            form[key] = typeof form[key] === 'string' ? form[key] : JSON.stringify(form[key])
          } else {
            form[key] = ''
          }
        })

        Object.keys(form).forEach((key: any) => {
          const value = form[key]
          if (value === null || value === undefined) return
          if (Array.isArray(value)) {
            form[key] = value.length > 0 ? JSON.stringify(value) : ''
          } else if (typeof value === 'object' && key !== 'attr' && key !== 'plan_attr') {
            form[key] = Object.keys(value).length > 0 ? JSON.stringify(value) : ''
          }
        })

        // 开始请求
        let params = { model: 't_project_report', list: [form] }
        api[apikey](params).then(async (res: any) => {
          if (res.code == 200) {
            const reportId = await resolveReportId(res, form.id)
            await saveThreeTables(form, reportId)
            publicStore.actIndex++
          } else {
            ElNotification({ title: '提示', message: res.msg || '保存失败', type: 'error' })
          }
        }).catch(() => {
          ElNotification({ title: '提示', message: '保存失败', type: 'error' })
        })
      }
    })
  }

  const onSave = (formEl, status) => {
    formEl.validate (async valid => {
      if (valid) {
        console.log("publicStore.form---2", publicStore.form)
        ElMessageBox.confirm('是否确定操作继续', '温馨提示', {confirmButtonText: '确定', cancelButtonText: '关闭', type: 'warn'}).then(async() => {
          // 防干扰
          let form = JSON.parse(JSON.stringify(publicStore.form)) 
          // 当前时间
          let nowtime = Date.now() + ''
          // 更新时间
          form.update_time = nowtime
          // 判断新增与编辑
          let apikey = form.id?'updApi':'addApi'
          if (!form.project_id && route.query && route.query.project_id) {
            form.project_id = route.query.project_id
          }
          //这里需要判断到哪一个步骤 
          // 1.新建项目
          if(apikey == 'addApi'){
            console.log("新增项目")
            // 设置所属
            form.user_id = configStore.user.id
            form.user_name = configStore.user.name
            form.user_role = configStore.user.role_id
            form.user_province = configStore.user.province
            form.user_city = configStore.user.city
            form.user_district = configStore.user.district
            // 默认类型
            form.type = route.query&&route.query.key? route.query.key : ''
            // 编号规则
            const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
            form.num_title = 'SX'
            form.num_date = today
            let query = {model: 't_project_report', args: `num_title='${form.num_title}' and num_date='${form.num_date}'`, field: `num_number`, order: `num_number asc`}
            let temp = await publicStore.http({Api: query})
            form.num_number = proxy.isNull(temp)? '000001': String(parseInt(temp[0]['num_number'], 10) + 1).padStart(6, '0')
          }else{
            if(proxy.isNull(route.query)) return console.log("传值缺失")
            // 2.申请储备 
            if(route.query.action == '1f1000c7-5def-66b0-bc96-dc4dc45fb98c'){
              if(form.apply_status == '0') {
                console.log("申请储备")
                form.apply_status = '1'
                form.apply_time = nowtime
              }else{
                console.log('状态错误2')
              }
            }
            // 3. 重新申请储备
            if(route.query.action == '1f1000c7-5def-66b0-bc96-dc4dc45fb99c'){
              if(form.apply_status == '3') {
                console.log("重新申请储备")
                form.apply_status = '1'
                form.apply_time = nowtime
                form.reserve_status = '0'
              }else{
                console.log('状态错误2')
              }
            }
            // 4.更新项目进度
            if(route.query.action == '1f10502a-e388-6850-8aa3-265c92863865'){
               if(form.apply_status == '1') {
                console.log("更新上报信息")
              }else{
                console.log('状态错误3')
              }
            }
            // 4储备审批操作
            if(route.query.action== '019c041a-9f8c-7e9e-91eb-0ae051e6f324'){
              if(form.reserve_status == '0' && form.push_status == '0'){
                console.log("审批储备")
                form.reserve_status = status
                form.reserve_time = nowtime
                if(status == '1') form.apply_status = '2'
                if(status == '2') form.apply_status = '3'
              }else{
                console.log('状态错误4')
              }
            }
          }
          // 生成带排序的uuid作为id
          if(!form.id) form.id=uuidv6()
          // 主管单位决定项目所属 *重要（非选择地区 非操作用户地区）
          if(form.construct_main && !proxy.isNull(publicStore._public.construct_mains)){
            let construct_main = publicStore._public.construct_mains.find(a=>a.id == form.construct_main)
            if(construct_main){
              form.construct_main_province = construct_main.province
              form.construct_main_city = construct_main.city
              form.construct_main_district = construct_main.district
            }
          }
          // 所属地区 省市区
          if(!proxy.isNull(form.area)){
            if(form.area.length>0){
              form.province = form.area.length>0? form.area[0] : ''
              let province = proxy.findNode(areaOptions, (node) => { return node.code == form.province })
              if(province) form.province_name = province.name
            }
            if(form.area.length>1){
              form.city = form.area.length>1? form.area[1] : ''
              let city = proxy.findNode(areaOptions, (node) => { return node.code == form.city })
              if(city) form.city_name = city.name
            }
            if(form.area.length>2){
              form.district = form.area.length>2? form.area[2] : ''
              let district = proxy.findNode(areaOptions, (node) => { return node.code == form.district })
              if(district) form.district_name = district.name
            }
            form.area = JSON.stringify(form.area)
          }else{
            form.area = ''
          }
          // 多选内容类型
          form.task_content = !proxy.isNull(form.task_content)? JSON.stringify(form.task_content) : ''
          // 资金来源 10个值
          form.fund_source = !proxy.isNull(form.fund_source)? JSON.stringify(form.fund_source) : ''
          // 其他信息 15个值
          form.orther_text = !proxy.isNull(form.orther_text)? JSON.stringify(form.orther_text) : ''
          // 基础文件
          let changeFile1 = []
          if(!proxy.isNull(form.attr)){
            form.attr.forEach(v => {
              if(v.data.indexOf('/uploads')!=-1){
                let content = publicStore._public.contents1.find(a=>a.type == v.type)
                let oldlData = v.data;
                v.data = `${content.parent_type}/${form.id}_${v.time}_${v.name}`
                changeFile1.push({oldfile: oldlData, newfile: v.data})
              }
            })
          }
          let addFile1 = []
          let delFile1 = []
          let updFile1 = []
          if(JSON.stringify(form.attr) != JSON.stringify(publicStore._public.attr)) {
            addFile1 = form.attr.filter(a=>!a.id).map(item => ({ ...item, parent_id: form.id }))
            delFile1 = publicStore._public.attr.filter(a => !form.attr.some(b => b.id === a.id))
            updFile1 = form.attr.filter(a => publicStore._public.attr.some(b => b.id === a.id && b.data !== a.data))
          }
          delete form.attr
          // 方案文件
          let changeFile2 = []
          if(!proxy.isNull(form.plan_attr)){
            form.plan_attr.forEach(v => {
              if(v.data.indexOf('/uploads')!=-1){
                let content = publicStore._public.contents2.find(a=>a.type == v.type)
                let oldlData = v.data;
                v.data = `${content.parent_type}/${form.id}_${v.time}_${v.name}`
                changeFile2.push({oldfile: oldlData, newfile: v.data})
              }
            })
          }
          let addFile2 = []
          let delFile2 = []
          let updFile2 = []
          if(JSON.stringify(form.plan_attr) != JSON.stringify(publicStore._public.plan_attr)) {
            addFile2 = form.plan_attr.filter(a=>!a.id).map(item => ({ ...item, parent_id: form.id }))
            delFile2 = publicStore._public.plan_attr.filter(a => !form.plan_attr.some(b => b.id === a.id))
            updFile2 = form.plan_attr.filter(a => publicStore._public.plan_attr.some(b => b.id === a.id && b.data !== a.data))
          }
          delete form.plan_attr
          // 组合
          let addFile = [...addFile1, ...addFile2]
          let delFile = [...delFile1, ...delFile2]
          let updFile = [...updFile1, ...updFile2]
          // console.log("addFile---", addFile)
          // console.log("delFile---", delFile)
          // console.log("updFile---", updFile)

          Object.keys(form).forEach((key:any) => {
            const value = form[key]
            if (value === null || value === undefined) return
            if (Array.isArray(value)) {
              form[key] = value.length > 0 ? JSON.stringify(value) : ''
              return
            }
            if (typeof value === 'object') {
              const hasKeys = Object.keys(value).length > 0
              form[key] = hasKeys ? JSON.stringify(value) : ''
            }
          })
          // 开始请求
          let params = {model: 't_project_report', list: [form]}
          console.log("params", params)
          console.log("changeFile1", changeFile1)
          console.log("changeFile2", changeFile2)
          api[apikey](params).then(async(res:any) => {
            if(res.code == 200){
              let message = apikey == 'updApi'? '操作成功' : '保存成功'
              ElNotification({ title: '提示', message: message, type: 'success' })
              // 转移基础文件
              if(!proxy.isNull(changeFile1)) setChangeFile(changeFile1)
              // 转移方案文件
              if(!proxy.isNull(changeFile2)) setChangeFile(changeFile2)
              // 文件保存
              if(!proxy.isNull(updFile) || !proxy.isNull(addFile) || !proxy.isNull(delFile)) {
                if(!proxy.isNull(addFile)) setAdd(addFile, form.id)
                if(!proxy.isNull(delFile)) setDel(delFile, form.id)
                if(!proxy.isNull(updFile)) setUpd(updFile, form.id)
              }
              // 三表保存逻辑
              const reportId = await resolveReportId(res, form.id)
              await saveThreeTables(form, reportId)
              // 刷新页面
              // emit('init', form.id)
              setTimeout(() => { router.back() }, 500)
            }else{
              ElNotification({ title: '提示', message: res.msg?res.msg:'保存失败(400)', type: 'error' })
            }
          }).catch((err) => {
            ElNotification({ title: '提示', message: '保存失败(500)', type: 'error' })
          })
        })
      }
    })
  }

  const resolveReportId = async (res, projectId) => {
    let reportId = res?.data?.id
    if (!reportId && res?.data?.list?.length) reportId = res.data.list[0]?.id
    if (!reportId && res?.data?.length) reportId = res.data[0]?.id
    if (!reportId && projectId) reportId = projectId
    return reportId
  }

  const saveThreeTables = async (form, projectId) => {
    if (!projectId) {
      console.warn('saveThreeTables: projectId is missing')
      return
    }

    const keyList = keyTasks.map(row => ({
      id: row.id || uuidv6(),
      project_id: projectId,
      task_type: row.task_type,
      construct_content: row.construct_content,
      construct_scale: row.construct_scale,
      t2026: row.t2026,
      t2027: row.t2027,
      t2028: row.t2028
    }))

    const checkList = checkTasks.map(row => ({
      id: row.id || uuidv6(),
      project_id: projectId,
      dimension: row.type,
      indicator: row.indicator,
      problem: row.problem,
      rectify_range: row.range,
      rectify_content: row.content
    }))

    const timelineList = timelineRows.filter(r => r.desc || r.investment).map(row => ({
      id: row.id || uuidv6(),
      project_id: projectId,
      year: row.year,
      construct_content: row.desc,
      investment: row.investment
    }))

    try {
      await Promise.all([
        api.delApi({ model: 't_project_task_key', args: `project_id='${projectId}'` }),
        api.delApi({ model: 't_project_task_check', args: `project_id='${projectId}'` }),
        api.delApi({ model: 't_project_task_timeline', args: `project_id='${projectId}'` })
      ])
      
      const addPromises = []
      if (keyList.length > 0) addPromises.push(api.addApi({ model: 't_project_task_key', list: keyList }))
      if (checkList.length > 0) addPromises.push(api.addApi({ model: 't_project_task_check', list: checkList }))
      if (timelineList.length > 0) addPromises.push(api.addApi({ model: 't_project_task_timeline', list: timelineList }))
      
      if (addPromises.length > 0) await Promise.all(addPromises)
    } catch (e) {
      console.error('三表保存失败:', e)
      ElNotification({ title: '错误', message: '保存任务数据失败', type: 'error' })
    }
  }

  const setAdd = async(addFile, scheme_id) => {
    let params = {}
    if(!proxy.isNull(addFile)) params.addApi = {model: 't_file', list: addFile}
    let res = await publicStore.http(params)
    console.log('新增res---', res)
  } 

  const setDel = async(delFile, scheme_id) => {
    let params = {}
    if(!proxy.isNull(delFile)) params.delApi = {model: 't_file', list: delFile}
    let res = await publicStore.http(params)
    console.log('删除res---', res)
  } 

  const setUpd = async(updFile, scheme_id) => {
    let params = {}
    if(!proxy.isNull(updFile)) params.updApi = {model: 't_file', list: updFile}
    let res = await publicStore.http(params)
    console.log('更新res---', res)
  } 

  const setChangeFile = async(changeFile) => {
    if(proxy.isNull(changeFile)) return
    let query = {list: changeFile}
    publicStore.http({changeFileApi: query})
  }

  const checkTasksPage = computed(() => checkTasks)
  const keyTasksPage = computed(() => keyTasks)
  const onKeySelChange = (val) => { keySel = val }
  const onCheckSelChange = (val) => { checkSel = val }
  const onCheckSelectAll = () => { checkSel = [...checkTasks] }
  const onCheckDelete = () => { checkTasks.splice(0, checkTasks.length, ...checkTasks.filter(a => !checkSel.includes(a))) }
  const onKeySelectAll = () => { keySel = [...keyTasks] }
  const onKeyDelete = () => { keyTasks.splice(0, keyTasks.length, ...keyTasks.filter(a => !keySel.includes(a))) }
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
  const onTimelineOp = (row) => {}
  const onAddYear = () => {
    // 动态添加年度列逻辑 (如果需要)
    const lastYear = timelineRows.length > 0 ? Number(timelineRows[timelineRows.length - 1].year) : 2025
    timelineRows.push({ year: String(lastYear + 1), desc: '', investment: '' })
  }
</script>
  
<style scoped lang="scss">
.bob-tt-2 { border-bottom: 2px solid transparent; }
.r-18{ right: -18px; }
.autoHeight{min-height: 100%; height: 3000px;}
</style>
  
