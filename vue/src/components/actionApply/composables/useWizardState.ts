import { computed, reactive, ref } from 'vue'

export const useWizardState = () => {
  const { proxy }: any = getCurrentInstance()
  const publicStore = proxy.publicStore()

  if (!publicStore._public.checkTasks) publicStore._public.checkTasks = []
  if (!publicStore._public.keyTasks) publicStore._public.keyTasks = []
  if (!publicStore._public.timelineRows) publicStore._public.timelineRows = []

  const actIndex = computed({
    get: () => publicStore.actIndex,
    set: (val) => { publicStore.actIndex = val }
  })
  const readonly = ref(false)
  const state = reactive({ ...publicStore.$state })
  const tables = reactive({
    keyTasks: publicStore._public.keyTasks,
    checkTasks: publicStore._public.checkTasks,
    timelineRows: publicStore._public.timelineRows
  })

  const setTables = (detail: any) => {
    const keyTasks = detail?.keyTasks ?? []
    const checkTasks = detail?.checkTasks ?? []
    const timelineRows = detail?.timelineRows ?? []
    if (!publicStore._public.keyTasks) publicStore._public.keyTasks = []
    if (!publicStore._public.checkTasks) publicStore._public.checkTasks = []
    if (!publicStore._public.timelineRows) publicStore._public.timelineRows = []
    publicStore._public.keyTasks.splice(0, publicStore._public.keyTasks.length, ...keyTasks)
    publicStore._public.checkTasks.splice(0, publicStore._public.checkTasks.length, ...checkTasks)
    publicStore._public.timelineRows.splice(0, publicStore._public.timelineRows.length, ...timelineRows)
    tables.keyTasks = publicStore._public.keyTasks
    tables.checkTasks = publicStore._public.checkTasks
    tables.timelineRows = publicStore._public.timelineRows
  }

  const snapshot = () => {
    return {
      actIndex: actIndex.value,
      readonly: readonly.value,
      form: JSON.parse(JSON.stringify(publicStore.form || {})),
      tables: {
        keyTasks: JSON.parse(JSON.stringify(tables.keyTasks || [])),
        checkTasks: JSON.parse(JSON.stringify(tables.checkTasks || [])),
        timelineRows: JSON.parse(JSON.stringify(tables.timelineRows || []))
      }
    }
  }

  const reset = () => {
    actIndex.value = 1
    readonly.value = false
    publicStore.form = {}
    if (!publicStore._public.keyTasks) publicStore._public.keyTasks = []
    if (!publicStore._public.checkTasks) publicStore._public.checkTasks = []
    if (!publicStore._public.timelineRows) publicStore._public.timelineRows = []
    publicStore._public.keyTasks.splice(0, publicStore._public.keyTasks.length)
    publicStore._public.checkTasks.splice(0, publicStore._public.checkTasks.length)
    publicStore._public.timelineRows.splice(0, publicStore._public.timelineRows.length)
    tables.keyTasks = publicStore._public.keyTasks
    tables.checkTasks = publicStore._public.checkTasks
    tables.timelineRows = publicStore._public.timelineRows
  }

  const applyInitPayload = (payload: any) => {
    if (payload && Object.prototype.hasOwnProperty.call(payload, 'readonly')) {
      readonly.value = payload.readonly
    }
  }

  const applyAll = (data: any) => {
    if (data?.form) {
      publicStore.form = { ...data.form }
    }
    if (data?.tables) {
      setTables(data.tables)
    }
  }

  return { actIndex, readonly, state, tables, setTables, snapshot, reset, applyInitPayload, applyAll }
}
