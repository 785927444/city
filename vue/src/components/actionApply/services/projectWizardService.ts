import api from '@/api'
import { storage } from '@/utils/storage'
import { v6 as uuidv6 } from 'uuid'
import { areaOptions } from '@/utils/areaData'

const cacheKey = 'actionApply:inspectionProblems'

const clearInspectionCache = () => {
  storage.remove(cacheKey)
}

const saveInspectionCache = (taskClassId: any, list: any[]) => {
  storage.set(cacheKey, { taskClassId: String(taskClassId || ''), list })
}

const fetchInspectionProblems = async (taskClassId: any, publicStore: any) => {
  if (!taskClassId || taskClassId === '暂无') {
    clearInspectionCache()
    return []
  }
  let relQuery = {
    model: 't_task_type_scheme_problem',
    args: `task_type_id='${taskClassId}'`,
    limit: 1000
  }
  const relRes = await publicStore.http({ Api: relQuery })
  const relList = Array.isArray(relRes) ? relRes : []
  const ids = relList.map((r: any) => r.task_problem_id).filter(Boolean)
  if (ids.length === 0) {
    saveInspectionCache(taskClassId, [])
    return []
  }
  let problemQuery = {
    model: 't_scheme_problem',
    args: `parent_id in (${ids.map((id: any) => `'${id}'`).join(',')})`,
    limit: 1000
  }
  const problemRes = await publicStore.http({ Api: problemQuery })
  const list = Array.isArray(problemRes) ? problemRes : []
  saveInspectionCache(taskClassId, list)
  return list
}

const ensureInspectionCache = async (form: any, publicStore: any) => {
  const taskClassId = form?.task_class
  if (!taskClassId || taskClassId === '暂无') return
  const cached = storage.get(cacheKey)
  if (cached && String(cached.taskClassId) === String(taskClassId)) return
  await fetchInspectionProblems(taskClassId, publicStore)
}

const fetchDetailData = async (projectId: string, publicStore: any) => {
  if (!projectId) return { keyTasks: [], checkTasks: [], timelineRows: [] }
  const query = {
    keyApi: { model: 't_project_task_key', args: `project_id='${projectId}'`, limit: 1000 },
    checkApi: { model: 't_project_task_check', args: `project_id='${projectId}'`, limit: 1000 },
    timeApi: { model: 't_project_task_timeline', args: `project_id='${projectId}'`, limit: 1000 }
  }
  const res = await publicStore.http(query)
  const keyTasks = Array.isArray(res?.keyApi) ? res.keyApi : []
  const checkTasks = Array.isArray(res?.checkApi)
    ? res.checkApi.map((item: any) => ({
        ...item,
        type: item.dimension,
        range: item.rectify_range,
        content: item.rectify_content,
        indicatorOptions: [],
        problemOptions: []
      }))
    : []
  const timelineRows = Array.isArray(res?.timeApi)
    ? [...res.timeApi].sort((a: any, b: any) => Number(a.year) - Number(b.year)).map((item: any) => ({
        ...item,
        desc: item.construct_content
      }))
    : []
  return { keyTasks, checkTasks, timelineRows }
}

const resolveReportId = (res: any, projectId: string) => {
  let reportId = res?.data?.id
  if (!reportId && res?.data?.list?.length) reportId = res.data.list[0]?.id
  if (!reportId && res?.data?.length) reportId = res.data[0]?.id
  if (!reportId && projectId) reportId = projectId
  return reportId
}

const setAdd = async (publicStore: any, proxy: any, addFile: any[]) => {
  let params: any = {}
  if (!proxy.isNull(addFile)) params.addApi = { model: 't_file', list: addFile }
  await publicStore.http(params)
}

const setDel = async (publicStore: any, proxy: any, delFile: any[]) => {
  let params: any = {}
  if (!proxy.isNull(delFile)) params.delApi = { model: 't_file', list: delFile }
  await publicStore.http(params)
}

const setUpd = async (publicStore: any, proxy: any, updFile: any[]) => {
  let params: any = {}
  if (!proxy.isNull(updFile)) params.updApi = { model: 't_file', list: updFile }
  await publicStore.http(params)
}

const setChangeFile = async (publicStore: any, proxy: any, changeFile: any[]) => {
  if (proxy.isNull(changeFile)) return
  let query = { list: changeFile }
  await publicStore.http({ changeFileApi: query })
}

const saveMainForm = async (options: {
  publicStore: any
  configStore: any
  route: any
  proxy: any
  status?: string
}) => {
  const { publicStore, configStore, route, proxy, status } = options
  let form = JSON.parse(JSON.stringify(publicStore.form))
  let nowtime = Date.now() + ''
  form.update_time = nowtime
  let apikey = form.id ? 'updApi' : 'addApi'
  if (!form.project_id && route.query && route.query.project_id) {
    form.project_id = route.query.project_id
  }
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
  } else {
    if (proxy.isNull(route.query)) return { ok: false }
    if (route.query.action == '1f1000c7-5def-66b0-bc96-dc4dc45fb98c') {
      if (form.apply_status == '0') {
        form.apply_status = '1'
        form.apply_time = nowtime
      }
    }
    if (route.query.action == '1f10502a-e388-6850-8aa3-265c92863865') {
      if (form.apply_status == '1') {
      }
    }
    if (route.query.action == '1f10502a-e388-6850-8aa3-265c92863866') {
      if (form.apply_status > '1') {
      }
    }
    if (route.query.action == '019c041a-9f8c-7e9e-91eb-0ae051e6f324') {
      if (form.reserve_status == '0' && form.push_status == '0') {
        form.reserve_status = status
        form.reserve_time = nowtime
        if (status == '1') form.apply_status = '2'
        if (status == '2') form.apply_status = '3'
      }
    }
    if (route.query.action == '019c03f8-971e-72a5-8dc3-82f1a1fc2758') {
      if (form.reserve_status == '1' && form.push_status == '0') {
        form.push_status = status
        form.push_time = nowtime
      }
    }
  }
  if (!form.id) form.id = uuidv6()
  if (form.construct_main && !proxy.isNull(publicStore._public.construct_mains)) {
    let construct_main = publicStore._public.construct_mains.find((a: any) => a.id == form.construct_main)
    if (construct_main) {
      form.construct_main_province = construct_main.province
      form.construct_main_city = construct_main.city
      form.construct_main_district = construct_main.district
    }
  }
  if (!proxy.isNull(form.area)) {
    if (form.area.length > 0) {
      form.province = form.area.length > 0 ? form.area[0] : ''
      let province = proxy.findNode(areaOptions, (node: any) => { return node.code == form.province })
      if (province) form.province_name = province.name
    }
    if (form.area.length > 1) {
      form.city = form.area.length > 1 ? form.area[1] : ''
      let city = proxy.findNode(areaOptions, (node: any) => { return node.code == form.city })
      if (city) form.city_name = city.name
    }
    if (form.area.length > 2) {
      form.district = form.area.length > 2 ? form.area[2] : ''
      let district = proxy.findNode(areaOptions, (node: any) => { return node.code == form.district })
      if (district) form.district_name = district.name
    }
    form.area = JSON.stringify(form.area)
  } else {
    form.area = ''
  }
  form.task_content = !proxy.isNull(form.task_content) ? JSON.stringify(form.task_content) : ''
  form.fund_source = !proxy.isNull(form.fund_source) ? JSON.stringify(form.fund_source) : ''
  form.orther_text = !proxy.isNull(form.orther_text) ? JSON.stringify(form.orther_text) : ''
  let changeFile1: any[] = []
  if (!proxy.isNull(form.attr)) {
    form.attr.forEach((v: any) => {
      if (v.data.indexOf('/uploads') != -1) {
        let content = publicStore._public.contents1.find((a: any) => a.type == v.type)
        let oldlData = v.data
        v.data = `${content.parent_type}/${form.id}_${v.time}_${v.name}`
        changeFile1.push({ oldfile: oldlData, newfile: v.data })
      }
    })
  }
  let addFile1: any[] = []
  let delFile1: any[] = []
  let updFile1: any[] = []
  if (JSON.stringify(form.attr) != JSON.stringify(publicStore._public.attr)) {
    addFile1 = form.attr.filter((a: any) => !a.id).map((item: any) => ({ ...item, parent_id: form.id }))
    delFile1 = publicStore._public.attr.filter((a: any) => !form.attr.some((b: any) => b.id === a.id))
    updFile1 = form.attr.filter((a: any) => publicStore._public.attr.some((b: any) => b.id === a.id && b.data !== a.data))
  }
  delete form.attr
  let changeFile2: any[] = []
  if (!proxy.isNull(form.plan_attr)) {
    form.plan_attr.forEach((v: any) => {
      if (v.data.indexOf('/uploads') != -1) {
        let content = publicStore._public.contents2.find((a: any) => a.type == v.type)
        let oldlData = v.data
        v.data = `${content.parent_type}/${form.id}_${v.time}_${v.name}`
        changeFile2.push({ oldfile: oldlData, newfile: v.data })
      }
    })
  }
  let addFile2: any[] = []
  let delFile2: any[] = []
  let updFile2: any[] = []
  if (JSON.stringify(form.plan_attr) != JSON.stringify(publicStore._public.plan_attr)) {
    addFile2 = form.plan_attr.filter((a: any) => !a.id).map((item: any) => ({ ...item, parent_id: form.id }))
    delFile2 = publicStore._public.plan_attr.filter((a: any) => !form.plan_attr.some((b: any) => b.id === a.id))
    updFile2 = form.plan_attr.filter((a: any) => publicStore._public.plan_attr.some((b: any) => b.id === a.id && b.data !== a.data))
  }
  delete form.plan_attr
  let changeFile3: any[] = []
  if (!proxy.isNull(form.has_attr)) {
    form.has_attr.forEach((v: any) => {
      if (v.data.indexOf('/uploads') != -1) {
        let content = publicStore._public.contents3.find((a: any) => a.type == v.type)
        let oldlData = v.data
        v.data = `${content.parent_type}/${form.id}_${v.time}_${v.name}`
        changeFile3.push({ oldfile: oldlData, newfile: v.data })
      }
    })
  }
  let addFile3: any[] = []
  let delFile3: any[] = []
  let updFile3: any[] = []
  if (JSON.stringify(form.has_attr) != JSON.stringify(publicStore._public.has_attr)) {
    addFile3 = form.has_attr.filter((a: any) => !a.id).map((item: any) => ({ ...item, parent_id: form.id }))
    delFile3 = publicStore._public.has_attr.filter((a: any) => !form.has_attr.some((b: any) => b.id === a.id))
    updFile3 = form.has_attr.filter((a: any) => publicStore._public.has_attr.some((b: any) => b.id === a.id && b.data !== a.data))
  }
  delete form.has_attr
  let changeFile4: any[] = []
  if (!proxy.isNull(form.effect_attr)) {
    form.effect_attr.forEach((v: any) => {
      if (v.data.indexOf('/uploads') != -1) {
        let content = publicStore._public.contents4.find((a: any) => a.type == v.type)
        let oldlData = v.data
        v.data = `${content.parent_type}/${form.id}_${v.time}_${v.name}`
        changeFile4.push({ oldfile: oldlData, newfile: v.data })
      }
    })
  }
  let addFile4: any[] = []
  let delFile4: any[] = []
  let updFile4: any[] = []
  if (JSON.stringify(form.effect_attr) != JSON.stringify(publicStore._public.effect_attr)) {
    addFile4 = form.effect_attr.filter((a: any) => !a.id).map((item: any) => ({ ...item, parent_id: form.id }))
    delFile4 = publicStore._public.effect_attr.filter((a: any) => !form.effect_attr.some((b: any) => b.id === a.id))
    updFile4 = form.effect_attr.filter((a: any) => publicStore._public.effect_attr.some((b: any) => b.id === a.id && b.data !== a.data))
  }
  delete form.effect_attr
  Object.keys(form).forEach((key: any) => {
    const value = form[key]
    if (value === null || value === undefined) return
    if (Array.isArray(value)) {
      form[key] = value.length > 0 ? JSON.stringify(value) : ''
      return
    }
    if (typeof value === 'object' && key !== 'attr' && key !== 'plan_attr' && key !== 'has_attr' && key !== 'effect_attr') {
      const hasKeys = Object.keys(value).length > 0
      form[key] = hasKeys ? JSON.stringify(value) : ''
    }
  })
  let params = { model: 't_project_report', list: [form] }
  try {
    const res: any = await api[apikey](params)
    if (res.code == 200) {
      let message = apikey == 'updApi' ? '操作成功' : '保存成功'
      ElNotification({ title: '提示', message: message, type: 'success' })
      if (!proxy.isNull(changeFile1)) await setChangeFile(publicStore, proxy, changeFile1)
      if (!proxy.isNull(changeFile2)) await setChangeFile(publicStore, proxy, changeFile2)
      if (!proxy.isNull(changeFile3)) await setChangeFile(publicStore, proxy, changeFile3)
      if (!proxy.isNull(changeFile4)) await setChangeFile(publicStore, proxy, changeFile4)
      let addFile = [...addFile1, ...addFile2, ...addFile3, ...addFile4]
      let delFile = [...delFile1, ...delFile2, ...delFile3, ...delFile4]
      let updFile = [...updFile1, ...updFile2, ...updFile3, ...updFile4]
      if (!proxy.isNull(updFile) || !proxy.isNull(addFile) || !proxy.isNull(delFile)) {
        if (!proxy.isNull(addFile)) await setAdd(publicStore, proxy, addFile)
        if (!proxy.isNull(delFile)) await setDel(publicStore, proxy, delFile)
        if (!proxy.isNull(updFile)) await setUpd(publicStore, proxy, updFile)
      }
      const reportId = resolveReportId(res, form.id)
      return { ok: true, projectId: reportId }
    } else {
      ElNotification({ title: '提示', message: res.msg || '保存失败(400)', type: 'error' })
    }
  } catch (err) {
    ElNotification({ title: '提示', message: '保存失败(500)', type: 'error' })
  }
  return { ok: false }
}

const saveThreeTables = async (projectId: string, tables: any) => {
  if (!projectId) return
  const keyTasks = tables?.keyTasks || []
  const checkTasks = tables?.checkTasks || []
  const timelineRows = tables?.timelineRows || []
  const keyList = keyTasks.map((row: any) => ({
    id: row.id || uuidv6(),
    project_id: projectId,
    task_type: row.task_type,
    construct_content: row.construct_content,
    construct_scale: row.construct_scale,
    t2026: row.t2026,
    t2027: row.t2027,
    t2028: row.t2028
  }))
  const checkList = checkTasks.map((row: any) => ({
    id: row.id || uuidv6(),
    project_id: projectId,
    dimension: row.type,
    indicator: row.indicator,
    problem: row.problem,
    rectify_range: row.range,
    rectify_content: row.content
  }))
  const timelineList = timelineRows.filter((r: any) => r.desc || r.investment).map((row: any) => ({
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
    const addPromises: any[] = []
    if (keyList.length > 0) addPromises.push(api.addApi({ model: 't_project_task_key', list: keyList }))
    if (checkList.length > 0) addPromises.push(api.addApi({ model: 't_project_task_check', list: checkList }))
    if (timelineList.length > 0) addPromises.push(api.addApi({ model: 't_project_task_timeline', list: timelineList }))
    if (addPromises.length > 0) await Promise.all(addPromises)
  } catch (e) {
    ElNotification({ title: '错误', message: '保存任务数据失败', type: 'error' })
  }
}

export const projectWizardService = {
  clearInspectionCache,
  saveInspectionCache,
  fetchInspectionProblems,
  ensureInspectionCache,
  fetchDetailData,
  saveMainForm,
  saveThreeTables
}
