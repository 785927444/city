<template>
  <div></div>
</template>

<script lang="ts" setup>
  import { parseTime } from '@/utils/common'

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

  const fillPlanInfo = (plan: any) => {
    if (!plan) return
    if (plan.datetime) {
      try {
        const dates = typeof plan.datetime === 'string' ? JSON.parse(plan.datetime) : plan.datetime
        if (Array.isArray(dates) && dates.length === 2) {
          props.draft.planned_start_date = `${dates[0]}-01-01`
          props.draft.expected_finish_date = `${dates[1]}-12-31`
          props.draft.plan_year = dates[0]
        }
      } catch (e) {}
    }
    if (plan.attr) {
      try {
        const attr = typeof plan.attr === 'string' ? JSON.parse(plan.attr) : plan.attr
        if (attr['规划说明']) {
          if (typeof attr['规划说明'] === 'string') {
            props.draft.step2.summary = attr['规划说明']
          } else if (attr['规划说明']?.name) {
            props.draft.step2.summary = `(自动导入) 详见：${attr['规划说明'].name}`
          }
        }
        if (attr['规划目标']) {
          if (typeof attr['规划目标'] === 'string') {
            props.draft.contacts.target_2030 = attr['规划目标']
          }
        }
        if (attr['编制单位']) props.draft.step2.compilation_unit = attr['编制单位']
        if (attr['批复时间']) props.draft.step2.approval_time = attr['批复时间']
        if (attr['基础建设条件']) props.draft.step2.conditions = attr['基础建设条件']
        const createEntry = (sourceFile: any, typeName: string) => {
          if (!sourceFile) return null
          return {
            id: proxy.uuid(),
            type: typeName,
            time: parseTime(new Date()),
            name: sourceFile.name || '未命名文件',
            path: sourceFile.data,
            status: 'success',
            statusText: '自动导入',
          }
        }
        if (attr['规划文本']) {
          const entry = createEntry(attr['规划文本'], '方案文本')
          if (entry) props.draft.step2.fileList.push(entry)
        }
        if (attr['规划图表']) {
          const entry = createEntry(attr['规划图表'], '重要图表')
          if (entry) props.draft.step2.chartsList.push(entry)
        }
        if (attr['支撑材料']) {
          const entry = createEntry(attr['支撑材料'], '支撑材料')
          if (entry) props.draft.step2.materialsList.push(entry)
        }
        if (attr['矢量文件']) {
          const entry = createEntry(attr['矢量文件'], '矢量文件')
          if (entry) props.draft.step2.materialsList.push(entry)
        }
      } catch (e) {}
    }
  }

  const fillProjectInfo = async () => {
    const schemeId = props.schemeId
    const areaVal = props.areaValue
    const taskType = props.taskType
    if (!schemeId || !areaVal || !taskType) return
    const areaObj = props.schemeAreas.find((v: any) => String(v.value) === String(areaVal))
    const areaName = areaObj ? areaObj.name : ''
    if (!areaName) return
    const query = {
      model: 't_scheme_project',
      args: `scheme_id='${schemeId}' AND aera='${areaName}' AND task_type='${taskType}'`,
    }
    const res = await publicStore.http({ Api: query })
    if (!proxy.isNull(res) && res.length > 0) {
      const project = res[0]
      if (project.name) props.draft.project_name = project.name
      if (project.num) props.draft.project_code = project.num
      if (project.code) props.draft.unified_project_code = project.code
      if (project.construct_scale) props.draft.build_stage = project.construct_scale
      if (project.construct_price) props.draft.total_invest = project.construct_price
      if (project.construct_datetime_start) props.draft.planned_start_date = project.construct_datetime_start
      if (project.construct_datetime_end) props.draft.expected_finish_date = project.construct_datetime_end
      if (project.completion_status) props.draft.project_stage = project.completion_status
      if (project.construct_unit) props.draft.build_unit = project.construct_unit
      if (project.construct_main) props.draft.supervisor_unit = project.construct_main
      if (project.class) props.draft.project_category_level1 = project.class
      if (project.construct_content) props.draft.build_content = project.construct_content
      if (project.construct_note) props.draft.remark = project.construct_note
      if (project.mapdata) props.draft.project_range = project.mapdata
      if (project.total_put_price) props.draft.cumulative_invest_issued = project.total_put_price
      if (project.total_completion_price) props.draft.cumulative_completed_invest = project.total_completion_price
      if (project.total_income_price) props.draft.project_benefit = project.total_income_price
      if (project.estimate_year) props.draft.plan_year = project.estimate_year
      if (project.estimate_price) props.draft.plan_year_amount = project.estimate_price
      if (project.response_person) props.draft.contacts.project_owner = project.response_person
      if (project.contact_phone) props.draft.contacts.project_owner_phone = project.contact_phone
      if (project.contact_person) props.draft.contacts.project_contact = project.contact_person
      if (project.vast_scheme) props.draft.contacts.major_strategy = project.vast_scheme
      if (project.industrial_policy) props.draft.contacts.industry_policy = project.industrial_policy
      if (project.gc_investmentd_irection) props.draft.contacts.government_invest_direction = project.gc_investmentd_irection
      if (project.qu_stage_objective) props.draft.contacts.target_2030 = project.qu_stage_objective
      if (project.fund_source) {
        try {
          const funds = typeof project.fund_source === 'string' ? JSON.parse(project.fund_source) : project.fund_source
          const map: any = {
            value1: 'central_budget',
            value2: 'credit_financing',
            value3: 'ultra_long_bond',
            value4: 'securitization_financing',
            value5: 'special_debt',
            value6: 'enterprise_financing',
            value7: 'fiscal',
            value8: 'resident_contribution',
            value9: 'other_channel',
            value10: 'tbd',
          }
          for (const key in funds) {
            if (map[key]) props.draft.funds[map[key]] = funds[key]
          }
        } catch (e) {}
      }
      if (project.orther_text) {
        try {
          const others = typeof project.orther_text === 'string' ? JSON.parse(project.orther_text) : project.orther_text
          const map: any = {
            value1: 'apply_special_bond',
            value2: 'apply_central_budget_fund',
            value3: 'need_land_support',
            value4: 'apply_policy_fin_tool',
            value5: 'is_medium_long_term_loan',
            value6: 'is_2023_bond_invest',
            value7: 'is_key_private_invest',
            value8: 'apply_upgrade_argument',
            value9: 'apply_major_project',
            value10: 'is_local_special_debt',
            value11: 'apply_14th_102_project',
            value12: 'apply_14th_energy_plan',
            value13: 'apply_tech_financing',
            value14: 'is_ultra_long_special_bond',
            value15: 'has_private_invest',
          }
          for (const key in others) {
            if (map[key]) props.draft.other_info[map[key]] = others[key] === '1' || others[key] === true
          }
        } catch (e) {}
      }
      ElNotification({ title: '提示', message: '已自动填充规划项目信息', type: 'success' })
    }
  }

  const fillTaskInfo = async () => {
    const schemeId = props.schemeId
    if (!schemeId) return
    let args = `scheme_id='${schemeId}'`
    if (props.taskType) {
      args += ` AND task_type='${props.taskType}'`
    }
    const query = {
      model: 't_scheme_task',
      args,
    }
    const res = await publicStore.http({ Api: query })
    if (proxy.isNull(res)) return
    const list = Array.isArray(res) ? res : []
    const years = props.draft.step2.task_years || []
    const keyTasks = list.map((v: any) => {
      const goals: any = {}
      years.forEach((y: any) => {
        goals[y] = ''
      })
      return {
        id: v.id,
        type: v.task_type || '',
        content: v.construct_content || '',
        scale: v.unit_target || 10,
        goals,
      }
    })
    if (keyTasks.length > 0) {
      props.draft.step2.key_tasks = keyTasks
    }
  }

  watch(
    () => props.schemeId,
    (val) => {
      if (!val) return
      const plan = props.schemePlans.find((v: any) => String(v.id || v.value) === String(val))
      if (plan) {
        fillPlanInfo(plan)
      }
      fillTaskInfo()
    },
    { immediate: true }
  )

  watch(
    () => [props.schemeId, props.areaValue, props.taskType],
    () => {
      fillProjectInfo()
    },
    { immediate: true }
  )
</script>
