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
              <FileList v-if="publicStore.form?.plan_attr" v-model:files="publicStore.form.plan_attr" :plans="props.plans" :contents="props.contents" :active="props.active"  />
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
            header-cell-class-name="bgi16 c3"
            :cell-style="{'background-color': '#FFFFFF', 'color': '#626366'}"
            border
            empty-text="暂无数据"
            :data="checkTasksPage"
            stripe
            @selection-change="onCheckSelChange">
            <el-table-column type="selection" width="60" />
            <el-table-column type="index" label="序号" align="center" width="60" />
            <el-table-column prop="type" label="体检维度" align="center" width="140" />
            <el-table-column prop="indicator" label="指标项" align="center" width="200" />
            <el-table-column prop="problem" label="存在问题" show-overflow-tooltip />
            <el-table-column label="内容" align="center" width="140">
              <template #default="scope">
                <el-input v-model="scope.row.content" size="small" />
              </template>
            </el-table-column>
          </el-table>
          <div class="ww100 flex-sb mt10">
            <div class="flex-sc" v-if="!props.isReadonly">
              <div class="rad4 ptb5 plr15 cursor bo-c8-1 c8 mr10" @click.stop="onCheckSelectAll">全选</div>
              <div class="rad4 ptb5 plr15 cursor bgi13 i15 mr10" @click.stop="onCheckDelete">删除</div>
              <el-button type="primary" size="small" class="mr10" @click="openPicker">搜索选择体检问题</el-button>
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
            header-cell-class-name="bgi16 c3"
            :cell-style="{'background-color': '#FFFFFF', 'color': '#626366'}"
            border
            empty-text="暂无数据"
            :data="keyTasksPage"
            stripe
            @selection-change="onKeySelChange">
            <el-table-column type="selection" width="60" />
            <el-table-column type="index" label="序号" align="center" width="60" />
            <el-table-column prop="task_type" label="任务类型" align="center" width="200">
              <template #default="scope">
                <el-select v-model="scope.row.task_type" size="small" placeholder="请选择" @change="scope.row.construct_content = ''">
                  <el-option 
                    v-for="v in (publicStore.form.task_type && publicStore._public.task_classs ? publicStore._public.task_classs.filter(a => a.parent_id == publicStore.form.task_type) : [])" 
                    :key="v.id" 
                    :label="v.name" 
                    :value="v.name" 
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="construct_content" label="建设内容">
              <template #default="scope">
                <el-select v-model="scope.row.construct_content" size="small" placeholder="请选择">
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
            <el-table-column prop="construct_scale" label="建设规模" align="center" width="120">
              <template #default="scope">
                <el-input v-model="scope.row.construct_scale" size="small" />
              </template>
            </el-table-column>
            <el-table-column prop="t2026" label="2026年目标" align="center" width="120">
              <template #default="scope">
                <el-input v-model="scope.row.t2026" size="small" />
              </template>
            </el-table-column>
            <el-table-column prop="t2027" label="2027年目标" align="center" width="120">
              <template #default="scope">
                <el-input v-model="scope.row.t2027" size="small" />
              </template>
            </el-table-column>
          </el-table>
          <div class="ww100 flex-se mt10" v-if="!props.isReadonly">
            <div></div>
            <div class="i1 cursor" @click.stop="onAddYear">添加年度</div>
          </div>
          <div class="ww100 flex-sb mt10">
            <div class="flex-sc" v-if="!props.isReadonly">
              <div class="rad4 ptb5 plr15 cursor bo-c8-1 c8 mr10" @click.stop="onKeySelectAll">全选</div>
              <div class="rad4 ptb5 plr15 cursor bgi13 i15 mr10" @click.stop="onKeyDelete">删除</div>
              <div class="rad4 ptb5 plr15 cursor bgi10 i12 mr10" @click.stop="onKeyImport">新增</div>
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

      <div class="ww100 flex-cc f18 p40 bot-i16-1 mt20">
        <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" @click.stop="publicStore.actIndex--">上一步</div>
        <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" @click.stop="onStepNext(formRef)">下一步</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import api from '@/api'
  import { pinyin } from 'pinyin-pro'
  import { v6 as uuidv6 } from 'uuid'
  import { areaOptions } from '@/utils/areaData'
  import router from '@/router'
	const { proxy }:any = getCurrentInstance()
  const route = useRoute()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const dictStore = proxy.dictStore()
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
    {value: '2', name: '体检整改任务'},
  ]
  const files = [
    {name: '基础条件', key: 'value1'},
    {name: '更新方式', key: 'value2'},
    {name: '设计方案', key: 'value3'},
  ]
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
    if (!publicStore.form.parent_id) return
    
    // 1. 获取指标项和存在问题 (t_scheme_problem_item)
    let queryItem = {
      model: 't_scheme_problem_item',
      args: `scheme_id='${publicStore.form.parent_id}'`
    }
    
    // 2. 获取体检维度 (t_task_problem)
    let queryTask = {
      model: 't_task_problem'
    }

    publicStore.http({ Api: queryItem, Api1: queryTask }).then(res => {
      problemItems.value = Array.isArray(res.Api) ? res.Api : []
      taskProblems.value = Array.isArray(res.Api1) ? res.Api1 : []
      
      publicStore._public.problem_items = problemItems.value
      publicStore._public.task_problems = taskProblems.value
    })
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

  onMounted(() => {
    getProblemData()
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

  const resolveReportId = async (res, projectId) => {
    let reportId = res?.data?.id
    if (!reportId && res?.data?.list?.length) reportId = res.data.list[0]?.id
    if (!reportId && res?.data?.length) reportId = res.data[0]?.id
    if (!reportId && projectId) reportId = projectId
    return reportId
  }

  const saveThreeTables = async (form, projectId) => {
    if (!form.scheme_id) {
      console.warn('saveThreeTables: scheme_id is missing')
      return
    }
    const schemeId = form.scheme_id
    const userId = configStore.user.id
    const userName = configStore.user.name
    const commonFields = {
      scheme_id: schemeId,
      user_id: userId,
      user_name: userName,
      province: form.province,
      city: form.city,
      district: form.district,
      province_name: form.province_name,
      city_name: form.city_name,
      district_name: form.district_name,
    }

    // 准备批量操作数组
    const ops = {
      schemeTask: { add: [], upd: [], del: [] },
      projectTask: { add: [], upd: [], del: [] }, // 年度目标 + 时序
      problemResult: { add: [], upd: [], del: [] },
      problemItem: { add: [], upd: [], del: [] },
      problemLog: { add: [], upd: [], del: [] },
    }

    // 按 op/id 分流
    const categorize = (target, row, data) => {
      if (row.op === 'delete') {
        if (row.id) target.del.push({ id: row.id })
      } else if (row.id || row.op === 'edit') {
        target.upd.push({ ...data, id: row.id })
      } else {
        target.add.push({ ...data, id: uuidv6() })
      }
    }

    // 1. 重点落实任务 + 年度目标
    if (keyTasks && keyTasks.length > 0) {
      keyTasks.forEach(row => {
        // 重点落实任务主表
        categorize(ops.schemeTask, row, {
          ...commonFields,
          task_type: row.task_type,
          construct_content: row.construct_content,
          unit_target: row.construct_scale,
          scheme_name: form.plan_name || '',
          type: '1'
        })

        // 年度目标明细
        if (projectId) {
          ['t2026', 't2027', 't2028'].forEach(key => {
            if (row[key]) {
              const year = key.replace('t', '')
              ops.projectTask.add.push({
                id: uuidv6(),
                project_id: projectId,
                task_type: row.task_type,
                construct_content: row.construct_content,
                year: year,
                value: row[key]
              })
            }
          })
        }
      })
    }

    // 2. 体检任务三表
    if (checkTasks && checkTasks.length > 0) {
      checkTasks.forEach(row => {
        // 生成关联ID
        const resultId = row.resultId || uuidv6()
        const itemId = row.itemId || uuidv6()
        const logId = row.logId || uuidv6()

        // 指标结果
        categorize(ops.problemResult, row, {
          ...commonFields,
          id: resultId,
          class: row.type,
          name: row.indicator
        })

        // 问题项
        categorize(ops.problemItem, row, {
          ...commonFields,
          id: itemId,
          problem_id: resultId,
          problem_content: row.problem
        })

        // 整改日志
        categorize(ops.problemLog, row, {
          ...commonFields,
          id: logId,
          parent_id: itemId,
          msg: row.content
        })
      })
    }

    // 3. 时序管理
    if (timelineRows && timelineRows.length > 0 && projectId) {
      timelineRows.forEach(row => {
        if (row.desc || row.investment) {
          categorize(ops.projectTask, row, {
            id: row.id,
            project_id: projectId,
            year: row.year,
            construct_content: row.desc,
            value: row.investment
          })
        }
      })
    }

    // 执行批量保存
    const runApi = async (model, opData) => {
      try {
        if (opData.add.length > 0) await api.addApi({ model, list: opData.add })
        if (opData.upd.length > 0) await api.updApi({ model, list: opData.upd })
        if (opData.del.length > 0) await api.delApi({ model, list: opData.del })
      } catch (e) {
        console.error(`Failed to save ${model}`, e)
        ElNotification({ title: '错误', message: `保存 ${model} 失败`, type: 'error' })
      }
    }

    await runApi('t_scheme_task', ops.schemeTask)
    await runApi('t_project_task', ops.projectTask)
    await runApi('t_scheme_problem_result', ops.problemResult)
    await runApi('t_scheme_problem_item', ops.problemItem)
    await runApi('t_scheme_problem_log', ops.problemLog)
  }

  const setChangeFile = async(changeFile) => {
    if(proxy.isNull(changeFile)) return console.log("无需转移")
    let query = {list: changeFile}
    publicStore.http({changeFileApi: query}).then(res=>{
      console.log("转移基础文件res", res)
    })
  }

  const handleClick = (remark, val) => {}
    let tabKey = $ref('key')
    const checkPage = reactive({ page: 2, limit: 10, total: 30 })
    const keyPage = reactive({ page: 2, limit: 10, total: 30 })
    const checkTasks = $ref([])
    const checkTasksPage = computed(() => checkTasks)
    const keyTasks = $ref([])
    const keyTasksPage = computed(() => keyTasks)
    let keySel = $ref([])
    let checkSel = $ref([])
    const onKeySelChange = (val) => { keySel = val }
    const onCheckSelChange = (val) => { checkSel = val }
    const onCheckSelectAll = () => { checkSel = [...checkTasks] }
    const onCheckDelete = () => { checkTasks.splice(0, checkTasks.length, ...checkTasks.filter(a => !checkSel.includes(a))) }
    const onViewRectify = (row) => {}
    const onAddYear = () => {}
    const onKeySelectAll = () => { keySel = [...keyTasks] }
    const onKeyDelete = () => { keyTasks.splice(0, keyTasks.length, ...keyTasks.filter(a => !keySel.includes(a))) }
    const onKeyImport = () => {
      keyTasks.push({ 
        task_type: '', 
        construct_content: '', 
        construct_scale: '', 
        t2026: '', 
        t2027: '' 
      })
    }
    const timelineRows = $ref([
      { year: '2026', desc: '', investment: '' },
      { year: '2027', desc: '', investment: '' },
      { year: '2028', desc: '', investment: '' },
    ])
    const onTimelineOp = (row) => {}
</script>

<style scoped lang="scss">
.bob-tt-2 { border-bottom: 2px solid transparent; }
.r-18{ right: -18px; }
.autoHeight{min-height: 100%; height: 3000px;}
</style>