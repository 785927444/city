<template>
  <div></div>
</template>

<script lang="ts" setup>
  import { parseTime } from '@/utils/common'
  import { v6 as uuidv6 } from 'uuid'

  const props = defineProps({
    schemeId: {
      type: [String, Number],
      default: '',
    },
    areaValue: {
      type: [String, Number],
      default: '',
    },
    taskType: {
      type: [String, Number],
      default: '',
    },
    draft: {
      type: Object as any,
      required: true,
    },
    schemePlans: {
      type: Array as any,
      default: () => [],
    },
    schemeAreas: {
      type: Array as any,
      default: () => [],
    },
  })

  const { proxy }: any = getCurrentInstance()
  const publicStore = proxy.publicStore()

  const DEBUG_KEY = '__SCHEME_AUTOFILL_DEBUG__'

  const getDebug = () => {
    const g: any = globalThis as any
    if (!g[DEBUG_KEY]) g[DEBUG_KEY] = { events: [], last: null, mountedCount: 0 }
    return g[DEBUG_KEY]
  }

  const safeClone = (val: any) => {
    try {
      return JSON.parse(JSON.stringify(val))
    } catch {
      return val
    }
  }

  const pickDraft = () => {
    const d: any = props.draft || {}
    const keys = [
      'parent_id',
      'parent_area',
      'task_type',
      'estimate_year',
      'estimated_start_time',
      'estimated_end_time',
      'plan_abstract',
      'plan_unit',
      'approval_time',
      'condition',
      'qu_stage_objective',
      'name',
      'num',
      'code',
      'construct_unit',
      'construct_main',
      'construct_price',
      'construct_content',
      'construct_note',
      'completion_status',
      'response_person',
      'contact_person',
      'contact_phone',
      'vast_scheme',
      'industrial_policy',
      'gc_investmentd_irection',
      'mapdata',
      'total_put_price',
      'total_completion_price',
      'total_income_price',
      'estimate_price',
      'fund_source',
      'orther_text',
    ]
    const out: any = {}
    keys.forEach((k) => {
      out[k] = safeClone(d[k])
    })
    return out
  }

  const pushEvent = (type: string, payload: any) => {
    const dbg = getDebug()
    const event = { t: Date.now(), type, payload: safeClone(payload) }
    dbg.last = event
    dbg.events.push(event)
    if (dbg.events.length > 80) dbg.events.splice(0, dbg.events.length - 80)
  }

  pushEvent('moduleLoaded', { href: (globalThis as any)?.location?.href })

  onMounted(() => {
    const dbg = getDebug()
    dbg.mountedCount = (dbg.mountedCount || 0) + 1
    pushEvent('mounted', {
      schemeId: props.schemeId,
      areaValue: props.areaValue,
      taskType: props.taskType,
      schemePlansLen: Array.isArray(props.schemePlans) ? props.schemePlans.length : 0,
      schemeAreasLen: Array.isArray(props.schemeAreas) ? props.schemeAreas.length : 0,
    })
  })

  const fillPlanInfo = (plan: any) => {
    if (!plan) return
    const before = pickDraft()
    console.log('[SchemeAutoFill] fillPlanInfo plan:', plan)
    if (plan.datetime) {
      try {
        const dates = typeof plan.datetime === 'string' ? JSON.parse(plan.datetime) : plan.datetime
        console.log('[SchemeAutoFill] plan.datetime parsed:', dates)
        if (Array.isArray(dates) && dates.length === 2) {
          props.draft.estimate_year = dates[0]
          props.draft.estimated_start_time = `${dates[0]}-01-01`
          props.draft.estimated_end_time = `${dates[1]}-12-31`
        }
      } catch (e) {
        console.log('[SchemeAutoFill] plan.datetime parse error:', e)
      }
    }
    if (plan.attr) {
      try {
        const attr = typeof plan.attr === 'string' ? JSON.parse(plan.attr) : plan.attr
        console.log('[SchemeAutoFill] plan.attr parsed:', attr)
        if (attr['规划说明']) {
          const val = typeof attr['规划说明'] === 'string' ? attr['规划说明'] : attr['规划说明']?.name
          if (val) props.draft.plan_abstract = val
        }
        if (attr['编制单位']) props.draft.plan_unit = attr['编制单位']
        if (attr['批复时间']) props.draft.approval_time = attr['批复时间']
        if (attr['基础建设条件']) props.draft.condition = attr['基础建设条件']
        if (attr['规划目标']) {
          const val = typeof attr['规划目标'] === 'string' ? attr['规划目标'] : ''
          if (val) props.draft.qu_stage_objective = val
        }
      } catch (e) {
        console.log('[SchemeAutoFill] plan.attr parse error:', e)
      }
    }
    pushEvent('fillPlanInfo.applied', { before, after: pickDraft(), plan })
  }

  const fillProjectInfo = async () => {
    const schemeId = props.schemeId
    const areaVal = props.areaValue
    const taskType = props.taskType
    pushEvent('fillProjectInfo.input', { schemeId, areaVal, taskType })
    if (!schemeId || !areaVal || !taskType) return
    const areaObj = props.schemeAreas.find((v: any) => String(v.value ?? v.id) === String(areaVal))
    const areaName = areaObj ? areaObj.name : ''
    pushEvent('fillProjectInfo.areaResolved', { areaVal, areaObj, areaName })
    if (!areaName) return
    const query = {
      model: 't_scheme_project',
      args: `scheme_id='${schemeId}' AND aera='${areaName}' AND task_type='${taskType}'`,
    }
    pushEvent('fillProjectInfo.query', query)
    console.log('[SchemeAutoFill] fillProjectInfo query:', query)
    const res = await publicStore.http({ Api: query })
    pushEvent('fillProjectInfo.result', res)
    console.log('[SchemeAutoFill] fillProjectInfo result:', res)
    if (!proxy.isNull(res) && res.length > 0) {
      const project = res[0]
      console.log('[SchemeAutoFill] fillProjectInfo use first project:', project)
      const before = pickDraft()
      
      // 字段映射 (Strict mapping based on user request)
      if (project.name) props.draft.name = project.name
      if (project.num) props.draft.num = project.num
      // construct_price -> construct_price
      if (project.construct_price) props.draft.construct_price = project.construct_price
      // construct_datetime_start -> estimated_start_time
      if (project.construct_datetime_start) props.draft.estimated_start_time = project.construct_datetime_start
      // construct_datetime_end -> estimated_end_time
      if (project.construct_datetime_end) props.draft.estimated_end_time = project.construct_datetime_end
      // completion_status -> completion_status
      if (project.completion_status) props.draft.completion_status = project.completion_status
      
      // province, city, district -> area
      if (project.province || project.city || project.district) {
        props.draft.area = [
          project.province || '',
          project.city || '',
          project.district || ''
        ]
      }

      pushEvent('fillProjectInfo.applied', { before, after: pickDraft(), project })
      ElNotification({ title: '提示', message: '已自动填充规划项目信息', type: 'success' })
    }
  }

  const fillTaskInfo = async () => {
    const schemeId = props.schemeId
    pushEvent('fillTaskInfo.input', { schemeId, taskType: props.taskType })
    if (!schemeId) return
    let args = `scheme_id='${schemeId}'`
    if (props.taskType) {
      args += ` AND task_type='${props.taskType}'`
    }
    const query = {
      model: 't_scheme_task',
      args,
    }
    pushEvent('fillTaskInfo.query', query)
    console.log('[SchemeAutoFill] fillTaskInfo query:', query)
    const res = await publicStore.http({ Api: query })
    pushEvent('fillTaskInfo.result', res)
    console.log('[SchemeAutoFill] fillTaskInfo result:', res)

    if (Array.isArray(res) && res.length > 0) {
       // 映射 t_scheme_task -> form.task
       // 目标: { id, task_type, task_class, construct_content, year, value }
       const newTasks = res.map((item: any) => ({
         id: uuidv6(),
         task_type: item.task_type || props.taskType, 
         task_class: item.task_class || '',
         construct_content: item.construct_content || '',
         year: '', // 源表无 year
         value: item.unit_target || '' // unit_target -> value
       }))
       
       if (!Array.isArray(props.draft.task)) props.draft.task = []
       // 保留其他 task_type 的数据, 覆盖当前 task_type 的数据
       const otherTasks = props.draft.task.filter((t: any) => String(t.task_type) !== String(props.taskType))
       props.draft.task = [...otherTasks, ...newTasks]
       
       ElNotification({ title: '提示', message: `已自动填充 ${res.length} 条任务信息`, type: 'success' })
    }
  }

  watch(
    () => [props.schemeId, Array.isArray(props.schemePlans) ? props.schemePlans.length : 0],
    ([val, schemePlansLen]) => {
      pushEvent('watch.schemeIdOrPlans', {
        val,
        schemePlansLen,
        schemeAreasLen: Array.isArray(props.schemeAreas) ? props.schemeAreas.length : 0,
      })
      if (!val) return
      console.log('[SchemeAutoFill] schemeId changed:', val)
      console.log('[SchemeAutoFill] schemePlans:', props.schemePlans)
      const plan = props.schemePlans.find((v: any) => String(v.id || v.value) === String(val))
      console.log('[SchemeAutoFill] matched plan:', plan)
      if (plan) {
        fillPlanInfo(plan)
      }
      fillTaskInfo()
    },
    { immediate: true }
  )

  watch(
    () => [props.schemeId, props.areaValue, props.taskType],
    (vals) => {
      pushEvent('watch.schemeId/areaValue/taskType', vals)
      console.log('[SchemeAutoFill] schemeId/areaValue/taskType changed:', vals)
      fillProjectInfo()
    },
    { immediate: true }
  )
</script>
