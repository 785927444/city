import { nextTick, watch } from 'vue'

export const useWizardActions = (options: {
  wizardState: any
  stepRefs: any[]
  service: any
}) => {
  const { wizardState, stepRefs, service } = options
  const { proxy }: any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const route = useRoute()
  const router = useRouter()

  const getConstructMain = async () => {
    if (proxy.isNull(publicStore.form.area)) return publicStore._public.construct_mains = []
    if (proxy.isNull(wizardState.state.users)) {
      let query = { model: 't_user', args: `role_id<=4`, field: `id, name, role_id, province, city, district` }
      let res = await publicStore.http({ Api: query })
      let list = proxy.isNull(res) ? [] : [...res]
      wizardState.state.users = list.map((v: any) => {
        v.name = proxy.decrypt(v.name)
        return v
      })
    }
    let construct_mains: any[] = []
    if (publicStore.form.area.length > 0) {
      let tempArr = wizardState.state.users.filter((a: any) => a.province == publicStore.form.area[0] && !a.city && !a.district)
      construct_mains = [...construct_mains, ...tempArr]
    }
    if (publicStore.form.area.length > 1) {
      let tempArr = wizardState.state.users.filter((a: any) => a.province == publicStore.form.area[0] && a.city == publicStore.form.area[1] && !a.district)
      construct_mains = [...construct_mains, ...tempArr]
    }
    if (publicStore.form.area.length > 2) {
      let tempArr = wizardState.state.users.filter((a: any) => a.province == publicStore.form.area[0] && a.city == publicStore.form.area[1] && a.district == publicStore.form.area[2])
      construct_mains = [...construct_mains, ...tempArr]
    }
    publicStore._public.construct_mains = [...construct_mains]
  }

  const getPlan = async () => {
    let query = { model: 't_scheme_plan', args: `release_status='1'`, field: `id, name` }
    publicStore.http({ Api: query }).then((res: any) => {
      publicStore._public.schemePlans = proxy.isNull(res) ? [] : res
    })
  }

  const getDesign = async () => {
    publicStore._public.schemeAreas = [
      { id: '1', name: '龙城片区' }
    ]
  }

  const getTaskType = async () => {
    let query1 = { model: 't_task_type' }
    let query2 = { model: 't_task_content' }
    publicStore.http({ Api1: query1, Api2: query2 }).then((res: any) => {
      let list2 = proxy.isNull(res.Api2) ? [] : res.Api2
      const firstLevelIds = res.Api1.filter((item: any) => item.parent_id === '0').map((item: any) => item.id)
      const secondLayer = res.Api1.filter((item: any) => firstLevelIds.includes(item.parent_id))
      const thirdLayer = res.Api1.filter((item: any) => secondLayer.map((s: any) => s.id).includes(item.parent_id))
      publicStore._public.task_types = secondLayer
      publicStore._public.task_classs = thirdLayer
      publicStore._public.construct_contents = list2
    })
  }

  const getTask = async () => {
    let query = { model: 't_scheme_task', args: `scheme_id='${publicStore.form.scheme_id}'` }
    publicStore.http({ Api: query }).then((res: any) => {
      let tasks = proxy.isNull(res) ? [] : res
      publicStore.form.tasks = [...res]
      publicStore._public.tasks = JSON.parse(JSON.stringify(tasks))
    })
  }

  const getFileAttr1 = (list1: any[], list2: any[], id: string) => {
    let plan = list1.find((a: any) => a.id == id)
    if (plan) {
      let contents: any[] = []
      wizardState.state.plans1 = list1.filter((a: any) => a.parent_id == id)
      wizardState.state.plans1.forEach((v: any) => {
        v.parent_type = `${plan.type}/${v.type}`
        let content = list2.filter((a: any) => a.parent_id == v.id)
        if (!proxy.isNull(content)) {
          content.forEach((vv: any) => {
            vv.parent_type = `${v.parent_type}/${vv.type}`
            contents.push(vv)
          })
        }
      })
      wizardState.state.contents1 = contents
      publicStore._public.contents1 = contents
      wizardState.state.active1 = proxy.isNull(wizardState.state.plans1) ? {} : { ...wizardState.state.plans1[0] }
    }
  }

  const getFileAttr2 = (list1: any[], list2: any[], id: string) => {
    let plan = list1.find((a: any) => a.id == id)
    if (plan) {
      let contents: any[] = []
      wizardState.state.plans2 = list1.filter((a: any) => a.parent_id == id)
      wizardState.state.plans2.forEach((v: any) => {
        v.parent_type = `${plan.type}/${v.type}`
        let content = list2.filter((a: any) => a.parent_id == v.id)
        if (!proxy.isNull(content)) {
          content.forEach((vv: any) => {
            vv.parent_type = `${v.parent_type}/${vv.type}`
            contents.push(vv)
          })
        }
      })
      wizardState.state.contents2 = contents
      publicStore._public.contents2 = contents
      wizardState.state.active2 = proxy.isNull(wizardState.state.plans2) ? {} : { ...wizardState.state.plans2[0] }
    }
  }

  const getFileAttr3 = (list1: any[], list2: any[], id: string) => {
    let plan = list1.find((a: any) => a.id == id)
    if (plan) {
      let contents: any[] = []
      wizardState.state.plans3 = list1.filter((a: any) => a.parent_id == id)
      wizardState.state.plans3.forEach((v: any) => {
        v.parent_type = `${plan.type}/${v.type}`
        let content = list2.filter((a: any) => a.parent_id == v.id)
        if (!proxy.isNull(content)) {
          content.forEach((vv: any) => {
            vv.parent_type = `${v.parent_type}/${vv.type}`
            contents.push(vv)
          })
        }
      })
      wizardState.state.contents3 = contents
      publicStore._public.contents3 = contents
      wizardState.state.active3 = proxy.isNull(wizardState.state.plans3) ? {} : { ...wizardState.state.plans3[0] }
    }
  }

  const getFileAttr4 = (list1: any[], list2: any[], id: string) => {
    let plan = list1.find((a: any) => a.id == id)
    if (plan) {
      let contents: any[] = []
      wizardState.state.plans4 = list1.filter((a: any) => a.parent_id == id)
      wizardState.state.plans4.forEach((v: any) => {
        v.parent_type = `${plan.type}/${v.type}`
        let content = list2.filter((a: any) => a.parent_id == v.id)
        if (!proxy.isNull(content)) {
          content.forEach((vv: any) => {
            vv.parent_type = `${v.parent_type}/${vv.type}`
            contents.push(vv)
          })
        }
      })
      wizardState.state.contents4 = contents
      publicStore._public.contents4 = contents
      wizardState.state.active4 = proxy.isNull(wizardState.state.plans4) ? {} : { ...wizardState.state.plans4[0] }
    }
  }

  const getFile = async () => {
    let query1 = { model: 't_file_type' }
    let query2 = { model: 't_file_content' }
    let res = await publicStore.http({ Api1: query1, Api2: query2 })
    let list1 = proxy.isNull(res.Api1) ? [] : res.Api1.sort((a: any, b: any) => a.orderd - b.orderd)
    let list2 = proxy.isNull(res.Api2) ? [] : res.Api2.sort((a: any, b: any) => a.orderd - b.orderd)
    getFileAttr1(list1, list2, '019c2c63-cf59-719f-b942-7c7bb535413d')
    getFileAttr2(list1, list2, '019c2cc4-d276-7805-9685-7a5dde449721')
    getFileAttr3(list1, list2, '019c385a-6706-7a8e-aafa-f4b68eb0a81f')
    getFileAttr4(list1, list2, '019c385a-6706-7a8e-aafa-f4b68eb0a81d')
  }

  const getFileData = (data: any) => {
    let query = { model: 't_file', args: `parent_id='${data.id}'` }
    publicStore.http({ Api: query }).then((res: any) => {
      let attr = res.filter((a: any) => a.parent_field == 'attr')
      publicStore.form.attr = [...attr]
      publicStore._public.attr = [...attr]
      let plan_attr = res.filter((a: any) => a.parent_field == 'plan_attr')
      publicStore.form.plan_attr = [...plan_attr]
      publicStore._public.plan_attr = [...plan_attr]
      let has_attr = res.filter((a: any) => a.parent_field == 'has_attr')
      publicStore.form.has_attr = [...has_attr]
      publicStore._public.has_attr = [...has_attr]
      let effect_attr = res.filter((a: any) => a.parent_field == 'effect_attr')
      publicStore.form.effect_attr = [...effect_attr]
      publicStore._public.effect_attr = [...effect_attr]
    })
  }

  const init = async (payload?: any) => {
    wizardState.reset()
    wizardState.applyInitPayload(payload || {})
    let data: any = {}
    const id = payload?.id || route.query?.id
    if (id) {
      let query = { model: 't_project_report', args: `id='${id}'` }
      let res = await publicStore.http({ Api: query })
      data = !proxy.isNull(res) ? { ...res[0] } : {}
    }
    if (data.task_content) {
      try {
        data.task_content = JSON.parse(data.task_content)
      } catch (error: any) {
      }
    } else {
      data.task_content = []
    }
    if (data.area) {
      try {
        data.area = JSON.parse(data.area)
      } catch (error: any) {
      }
    } else {
      data.area = []
    }
    if (data.fund_source) {
      try {
        data.fund_source = JSON.parse(data.fund_source)
      } catch (error: any) {
      }
    } else {
      data.fund_source = { value1: '', value2: '', value3: '', value4: '', value5: '', value6: '', value7: '', value8: '', value9: '', value10: '' }
    }
    if (data.orther_text) {
      try {
        data.orther_text = JSON.parse(data.orther_text)
      } catch (error: any) {
      }
    } else {
      data.orther_text = { value1: '', value2: '', value3: '', value4: '', value5: '', value6: '', value7: '', value8: '', value9: '', value10: '', value11: '', value12: '', value13: '', value14: '', value15: '' }
    }
    data.completion_status = data.completion_status || ''
    data.has_construct_price = data.has_construct_price || ''
    data.has_construct_scale = data.has_construct_scale || ''
    data.has_construct_effect = data.has_construct_effect || ''
    data.reserve_res = data.reserve_res || ''
    data.init = true
    publicStore.form = { ...data }
    publicStore._public.form = JSON.parse(JSON.stringify(data))
    publicStore.form.attr = []
    publicStore._public.attr = []
    publicStore.form.plan_attr = []
    publicStore._public.plan_attr = []
    publicStore.form.has_attr = []
    publicStore._public.has_attr = []
    publicStore.form.effect_attr = []
    publicStore._public.effect_attr = []
    await getConstructMain()
    await getPlan()
    await getDesign()
    await getTaskType()
    await getTask()
    await getFile()
    if (publicStore.form.id) getFileData(publicStore.form)
    if (publicStore.form.id) {
      const detail = await service.fetchDetailData(publicStore.form.id, publicStore)
      wizardState.setTables(detail)
    }
  }

  watch(() => publicStore.form.area, async (val: any) => {
    if (proxy.isNull(val)) return publicStore._public.construct_mains = []
    await nextTick()
    getConstructMain()
  }, { immediate: false, deep: true })

  const validate = async (stepIndex?: number) => {
    const idx = stepIndex ?? wizardState.actIndex.value
    const refIndex = Math.max(0, Math.min(stepRefs.length - 1, idx - 1))
    const ref = stepRefs[refIndex]?.value
    if (!ref?.validate) return true
    return await ref.validate()
  }

  const validateAll = async () => {
    for (let i = 0; i < stepRefs.length; i++) {
      const ok = await validate(i + 1)
      if (!ok) {
        wizardState.actIndex.value = i + 1
        return false
      }
    }
    return true
  }

  const next = async () => {
    const ok = await validate()
    if (!ok) return false
    if (wizardState.actIndex.value === 1) {
      await service.ensureInspectionCache(publicStore.form, publicStore)
    }
    wizardState.actIndex.value = Math.min(wizardState.actIndex.value + 1, 3)
    return true
  }

  const prev = () => {
    wizardState.actIndex.value = Math.max(wizardState.actIndex.value - 1, 1)
  }

  const getData = () => {
    return wizardState.snapshot()
  }

  const setData = (data: any) => {
    wizardState.applyAll(data)
    stepRefs.forEach((r: any) => r.value?.apply?.(data))
  }

  const saveInternal = async (status?: string, validateAllSteps?: boolean) => {
    const ok = validateAllSteps ? await validateAll() : await validate()
    if (!ok) return false
    try {
      await ElMessageBox.confirm('是否确定操作继续', '温馨提示', { confirmButtonText: '确定', cancelButtonText: '关闭', type: 'warn' })
    } catch (e) {
      return false
    }
    const result = await service.saveMainForm({ publicStore, configStore, route, proxy, status })
    if (!result?.ok) return false
    await service.saveThreeTables(result.projectId, wizardState.tables)
    if (validateAllSteps) {
      await service.clearInspectionCache()
    }
    setTimeout(() => { router.back() }, 500)
    return result.projectId
  }

  const saveDraft = async (status?: string) => {
    return await saveInternal(status, false)
  }

  const submit = async (status?: string) => {
    return await saveInternal(status, true)
  }

  const reset = () => {
    wizardState.reset()
  }

  return { init, validate, next, prev, saveDraft, submit, getData, setData, reset }
}
