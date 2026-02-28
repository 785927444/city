<template>
  <div class="layout-col plr15">
    <div class="layout-col white-rgba50 rad8">
      <div class="ww100 flex-bc f20 p15 mb20 bob-cd-1">
        <div class="fw">项目预览</div>
        <div class="flex1 flex-ec">
          <div class="plr14 ptb5 rad4 mr15 cursor c9 bg-white bo-c9-1" @click.stop="onBack()">返 回</div>
        </div>
      </div>
      <div class="layout-col">
        <div class="ww100 flex-cc f20 p40">
          <div class="flex-sc cursor" @click.stop="publicStore.actIndex=1">
            <div class="w28 h28 tc lh24 rad50" :class="publicStore.actIndex=='1'?'bgi1 white bo-i1-1':'bg-white c8 bo-c8-1'">1</div>
            <div class="ml10" :class="publicStore.actIndex=='1'?'i1':'c8'">基础数据</div>
          </div>
          <div class="w50x3 h2 bgi1 mlr20"></div>
          <div class="flex-sc cursor" @click.stop="publicStore.actIndex=2">
            <div class="w28 h28 tc lh24 rad50" :class="publicStore.actIndex=='2'?'bgi1 white bo-i1-1':'bg-white c8 bo-c8-1'">2</div>
            <div class="ml10" :class="publicStore.actIndex=='2'?'i1':'c8'">实施方案</div>
          </div>
          <div class="w50x3 h2 bgi1 mlr20"></div>
          <div class="flex-sc cursor" @click.stop="publicStore.actIndex=3">
            <div class="w28 h28 tc lh24 rad50" :class="publicStore.actIndex=='3'?'bgi1 white bo-i1-1':'bg-white c8 bo-c8-1'">3</div>
            <div class="ml10" :class="publicStore.actIndex=='3'?'i1':'c8'">项目进度</div>
          </div>
        </div>
        <previewStep1 :state="state" :contents="state.contents1" :active="state.active1" :plans="state.plans1" v-if="publicStore.actIndex == 1" is-readonly />
        <previewStep2 :state="state" :contents="state.contents2" :active="state.active2" :plans="state.plans2" v-if="publicStore.actIndex == 2" is-readonly @close="onBack" />
        <previewStep3 :state="state" :contents="state.contents3" :active="state.active3" :plans="state.plans3" v-if="publicStore.actIndex == 3" is-readonly @close="onBack" />
      </div>
      <!-- 预览审批意见悬浮窗 -->
      <previewStepFoot v-if="(publicStore.form.push_status && publicStore.form.push_status != '-1') || (publicStore.form.reserve_status && publicStore.form.reserve_status != '0')" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import previewStep1 from './previewStep1.vue'
  import previewStep2 from './previewStep2.vue'
  import previewStep3 from './previewStep3.vue'
  import previewStepFoot from './previewStepFoot.vue'
  import { setAreaLevel, areaOptions } from '@/utils/areaData'

  const route = useRoute()
  const router = useRouter()
  const { proxy }: any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const dictStore = proxy.dictStore()
  const stepTitles = ['基础数据', '实施方案', '项目进度']

  const state = reactive({
    ...publicStore.$state,
    users: [],
    contents1: [],
    plans1: [],
    active1: {},
    contents2: [],
    plans2: [],
    active2: {},
    contents3: [],
    plans3: [],
    active3: {},
  })

  // 根据条件判断总步数
  const totalSteps = computed(() => {
    return 3
  })

  onBeforeMount(async () => {
    publicStore.actIndex = 1
    publicStore.form = {}
  })

  onMounted(async () => {
    init()
  })

  const init = async () => {
    let data: any = {}
    const projectId = route.query?.id || route.query?.project_id
    if (projectId) {
      let query = { model: 't_project_report', args: `id='${projectId}'` }
      let res = await publicStore.http({ Api: query })
      data = !proxy.isNull(res) ? { ...res[0] } : {}
    } else {
      console.warn('previewIndex: Missing project id')
    }

    // 数据解析逻辑同步自 actionApply/index.vue
    const parseJSON = (val, defaultVal) => {
      if (!val) return defaultVal
      try {
        const parsed = JSON.parse(val)
        // 确保解析结果不是 null 或 undefined
        return parsed !== null && parsed !== undefined ? parsed : defaultVal
      } catch (e) {
        console.warn('JSON parse error for value:', val, e)
        return defaultVal
      }
    }

    data.task_content = parseJSON(data.task_content, [])
    // 确保 task_content 是数组
    if (!Array.isArray(data.task_content)) {
      data.task_content = data.task_content ? [data.task_content] : []
    }
    data.area = parseJSON(data.area, [])
    data.fund_source = parseJSON(data.fund_source, { value1: '', value2: '', value3: '', value4: '', value5: '', value6: '', value7: '', value8: '', value9: '', value10: '' })
    data.orther_text = parseJSON(data.orther_text, { value1: '', value2: '', value3: '', value4: '', value5: '', value6: '', value7: '', value8: '', value9: '', value10: '', value11: '', value12: '', value13: '', value14: '', value15: '' })
    data.attr = parseJSON(data.attr, {})
    data.plan_attr = parseJSON(data.plan_attr, {})
    data.has_attr = parseJSON(data.has_attr, {})
    data.effect_attr = parseJSON(data.effect_attr, {})
    
    data.completion_status = data.completion_status || ''
    data.has_construct_price = data.has_construct_price || ''
    data.has_construct_scale = data.has_construct_scale || ''
    data.has_construct_effect = data.has_construct_effect || ''
    data.reserve_res = data.reserve_res || ''
    data.init = true

    publicStore.form = { ...data }
    
    // 初始化公共数据
    getPlan()
    getDesign()
    getTaskType()
    getFile()
    getConstructMains() // 新增：加载主管单位字典
    if (data.id) {
      getTask()
    }
  }

  const getConstructMains = async () => {
    // 逻辑修正：主管单位实际上是系统用户（role_id <= 4），而不是 t_construct_main 表
    // 如果表单中有保存的主管单位ID，则直接查询该用户
    const userId = publicStore.form.construct_main
    if (!userId) {
       publicStore._public.construct_mains = []
       return
    }

    let query = { model: 't_user', args: `id='${userId}'` }
    publicStore.http({ Api: query }).then(res => {
      if (!proxy.isNull(res) && res.length > 0) {
        // 需要解密用户名
        const user = res[0]
        try {
           user.name = proxy.decrypt(user.name)
        } catch (e) {
           console.warn('解密主管单位名称失败', e)
        }
        publicStore._public.construct_mains = [user]
      } else {
        publicStore._public.construct_mains = []
      }
    })
  }

  const getPlan = async () => {
    let query = { model: 't_scheme_plan', args: `release_status='1'`, field: `id, name` }
    publicStore.http({ Api: query }).then(res => {
      publicStore._public.schemePlans = proxy.isNull(res) ? [] : res
    })
  }

  const getDesign = async () => {
    publicStore._public.schemeAreas = [{ id: '1', name: '龙城片区' }]
  }

  const getTaskType = async () => {
    let query1 = { model: 't_task_type' }
    let query2 = { model: 't_task_content' }
    publicStore.http({ Api1: query1, Api2: query2 }).then(res => {
      let list1 = proxy.isNull(res.Api1) ? [] : res.Api1
      let list2 = proxy.isNull(res.Api2) ? [] : res.Api2
      const firstLevelIds = list1.filter(item => item.parent_id === '0').map(item => item.id)
      const secondLayer = list1.filter(item => firstLevelIds.includes(item.parent_id))
      const thirdLayer = list1.filter(item => secondLayer.map(s => s.id).includes(item.parent_id))
      publicStore._public.task_types = secondLayer
      publicStore._public.task_classs = thirdLayer
      publicStore._public.construct_contents = list2
    })
  }

  const getTask = async () => {
    let query = { model: 't_scheme_task', args: `scheme_id='${publicStore.form.scheme_id}'` }
    publicStore.http({ Api: query }).then(res => {
      publicStore.form.tasks = proxy.isNull(res) ? [] : res
      publicStore._public.tasks = JSON.parse(JSON.stringify(publicStore.form.tasks))
    })
  }

  const getFile = async () => {
    let query1 = { model: 't_file_type' }
    let query2 = { model: 't_file_content' }
    let res = await publicStore.http({ Api1: query1, Api2: query2 })
    let list1 = proxy.isNull(res.Api1) ? [] : res.Api1.sort((a, b) => a.orderd - b.orderd)
    let list2 = proxy.isNull(res.Api2) ? [] : res.Api2.sort((a, b) => a.orderd - b.orderd)
    
    const getAttr = (id) => {
      let plan = list1.find(a => a.id == id)
      if (!plan) return { plans: [], contents: [], active: {} }
      let contents = []
      let plans = list1.filter(a => a.parent_id == id)
      plans.forEach(v => {
        v.parent_type = `${plan.type}/${v.type}`
        let content = list2.filter(a => a.parent_id == v.id)
        if (content) {
          content.forEach(vv => {
            vv.parent_type = `${v.parent_type}/${vv.type}`
            contents.push(vv)
          })
        }
      })
      return { plans, contents, active: plans[0] || {} }
    }

    const attr1 = getAttr("019c2c63-cf59-719f-b942-7c7bb535413d")
    state.plans1 = attr1.plans
    state.contents1 = attr1.contents
    state.active1 = attr1.active
    publicStore._public.contents1 = attr1.contents

    const attr2 = getAttr("019c2cc4-d276-7805-9685-7a5dde449721")
    state.plans2 = attr2.plans
    state.contents2 = attr2.contents
    state.active2 = attr2.active
    publicStore._public.contents2 = attr2.contents

    const attr3 = getAttr("019c385a-6706-7a8e-aafa-f4b68eb0a81f")
    state.plans3 = attr3.plans
    state.contents3 = attr3.contents
    state.active3 = attr3.active
    publicStore._public.contents3 = attr3.contents
  }

  const onBack = () => {
    router.back()
  }
</script>

<style scoped lang="scss">
.bg-i1 { background-color: var(--i1); }
.bo-i1-1 { border: 1px solid var(--i1); }
</style>
