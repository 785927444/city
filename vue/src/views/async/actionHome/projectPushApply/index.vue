<template>
  <div class="layout-col plr15">
    <div class="layout-col white-rgba50 rad8">
      <div class="ww100 flex-bc f20 p15 mb20 bob-cd-1">
        <div class="fw">{{ route.query && route.query.id ? '创建项目' : '信息补充' }}</div>
        <div class="flex1 flex-ec">
          <div class="plr14 ptb5 rad4 mr15 cursor c9 bg-white bo-c9-1" @click.stop="onBack()">返 回</div>
        </div>
      </div>
      <div class="layout-col">
        <step-title />
        <step1 :state="state" :contents="state.contents1" :active="state.active1" v-show="publicStore.actIndex == 1" />
        <step2 :state="state" :contents="state.contents2" :active="state.active2" v-show="publicStore.actIndex == 2" />
        <step3 v-show="publicStore.actIndex == 3" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import stepTitle from './stepTitle'
  import step3 from './step3'
  import step2 from './step2'
  import step1 from '@/views/async/actionApply/step1.vue'
  const route = useRoute()
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const state = reactive({
	  ...publicStore.$state,
  })

  onBeforeMount(async() => {
    publicStore.actIndex = 1
    publicStore.form = {}
  })

  onMounted(async() => {
    init()
  })

  const init = async(key) => {
    let data: any = {}
    const isDemo = route.query && String(route.query.demo) === '1'
    if (isDemo) {
      const now = Date.now()
      data = {
        code: 'TY-2026-0001',
        name: route.query?.name ? String(route.query.name) : '龙城片区旧城改造项目',
        level: '1',
        area: ['140000', '140100', '140105'],
        parent_id: '1',
        parent_area: '1',
        construct_unit: '太原市城市更新中心',
        completion_status: '1',
        construct_main: '太原市住建局',
        construct_price: '12000',
        estimate_year: '2026',
        estimate_price: '2500',
        total_put_price: '5600',
        total_completion_price: '3200',
        estimated_start_time: '2025-12-12',
        estimated_end_time: '2028-12-30',
        stage: '1',
        total_income_price: '8000',
        task_type: '1',
        task_class: '1',
        construct_content: '1',
        construct_note: '以旧换新示范区改造',
        response_person: '王伟',
        contact_person: '张敏',
        contact_phone: '13800001234',
        vast_scheme: '新型城镇化',
        industrial_policy: '城市更新行动',
        gc_investmentd_irection: '民生改善',
        qu_stage_objective: '2028年前完成片区更新',
        mapdata: '龙城片区主干道及周边',
        plan_name: '龙城片区更新实施方案',
        plan_unit: '太原市城市更新中心',
        approval_time: '2026-01-15',
        plan_abstract: '围绕旧城片区综合更新，完善道路与公共配套',
        condition: '基础设施老旧，公共服务配套不足',
        fund_source: {value1: '3000', value2: '1200', value3: '800', value4: '600', value5: '400', value6: '900', value7: '500', value8: '200', value9: '300', value10: '100'},
        orther_text: {value1: '1', value2: '1', value3: '1', value4: '0', value5: '1', value6: '0', value7: '1', value8: '0', value9: '1', value10: '0', value11: '1', value12: '0', value13: '1', value14: '0', value15: '1'},
        attr: {
          value1: { status: 'success', type: '基础资料', time: now, name: '33fa95f0152e4543912b88c636b26f9f.pdf', data: '/static/uploads/33fa95f0152e4543912b88c636b26f9f.pdf' },
          value2: { status: 'success', type: '区位图', time: now, name: '879d409c37f94ed8bf5ad09fcb0240b7.png', data: '/static/uploads/879d409c37f94ed8bf5ad09fcb0240b7.png' }
        },
        plan_attr: {
          value1: { status: 'success', type: '实施方案正文', time: now, name: '4eaa30b8a7ab40a798cf5b98924fde30.pdf', data: '/static/uploads/4eaa30b8a7ab40a798cf5b98924fde30.pdf' },
          value2: { status: 'success', type: '实施方案附件', time: now, name: '3fe8234a9a194f0c9da7f477accfe2ec.docx', data: '/static/uploads/3fe8234a9a194f0c9da7f477accfe2ec.docx' }
        },
        task: [
          { id: 'demo-task-1', task_type: '1', task_class: '道路改造', construct_content: '主干道提升', year: '2026', value: '3' },
          { id: 'demo-task-2', task_type: '2', task_class: '环境整治', construct_content: '雨污分流', year: '2027', value: '2' }
        ],
        project_status: '实施中',
        invested_amount: '3500',
        constructed_scale: '道路提升8公里、雨污分流12公里',
        implementation_effect: '已完成主干道拓宽与雨污分流一期建设，居民出行效率显著提升。',
        progress_tasks: [
          { id: 'progress-1', task_type: '1', task_name: '城市更新示范片区建设', construction_content: '老旧片区基础设施提升', project_goal: '完善交通与公共配套', completed_goal: '完成主干道拓宽' },
          { id: 'progress-2', task_type: '1', task_name: '雨污分流改造', construction_content: '管网改造与错接改正', project_goal: '改善排水系统', completed_goal: '完成一期改造' },
          { id: 'progress-3', task_type: '2', task_name: '体检整改任务A', construction_content: '违建整治与环境提升', project_goal: '改善人居环境', completed_goal: '完成整改方案' }
        ],
        process_files: { process_file: { status: 'success', type: '过程材料', time: now, name: 'c9115ee8414a4d1c82f2ca0462ec4e28.pdf', data: '/static/uploads/c9115ee8414a4d1c82f2ca0462ec4e28.pdf' } },
        effect_files: { effect_file: { status: 'success', type: '实施成效', time: now, name: 'f6931994aa2a4e1194c5192f14aba60b.pdf', data: '/static/uploads/f6931994aa2a4e1194c5192f14aba60b.pdf' } },
        approval_opinion: '进度更新信息齐全，建议继续推进。'
      }
    } else if(route.query && route.query.id){
      let query = {model: 't_project_report', args: `id='${route.query.id}'`}
      let res = await publicStore.http({Api: query})
      data = !proxy.isNull(res)? {...res[0]} : {}
    }
    if(data.area) {
      if (typeof data.area === 'string') {
        try {
          data.area = JSON.parse(data.area)
        } catch (error) {
          console.error("解析失败:", error.message)
        }
      }
    }else{
      data.area = []
    }
    if(data.fund_source) {
      if (typeof data.fund_source === 'string') {
        try {
          data.fund_source = JSON.parse(data.fund_source)
        } catch (error) {
          console.error("解析失败:", error.message)
        }
      }
    }else{
      data.fund_source = {value1: '', value2: '', value3: '', value4: '', value5: '', value6: '', value7: '', value8: '', value9: '', value10: ''}
    }
    if(data.orther_text) {
      if (typeof data.orther_text === 'string') {
        try {
          data.orther_text = JSON.parse(data.orther_text)
        } catch (error) {
          console.error("解析失败:", error.message)
        }
      }
    }else{
      data.orther_text = {value1: '', value2: '', value3: '', value4: '', value5: '', value6: '', value7: '', value8: '', value9: '', value10: '', value11: '', value12: '', value13: '', value14: '', value15: ''}
    }
    if(data.attr) {
      if (typeof data.attr === 'string') {
        try {
          data.attr = JSON.parse(data.attr)
        } catch (error) {
          console.error("解析失败:", error.message)
        }
      }
    }else{
      data.attr = {}
    }
    if(data.plan_attr) {
      if (typeof data.plan_attr === 'string') {
        try {
          data.plan_attr = JSON.parse(data.plan_attr)
        } catch (error) {
          console.error("解析失败:", error.message)
        }
      }
    }else{
      data.plan_attr = {}
    }
    if(!data.process_files) data.process_files = {}
    if(!data.effect_files) data.effect_files = {}
    if(!data.progress_tasks) data.progress_tasks = []
    if(!data.project_status) data.project_status = ''
    if(!data.invested_amount) data.invested_amount = ''
    if(!data.constructed_scale) data.constructed_scale = ''
    if(!data.implementation_effect) data.implementation_effect = ''
    if(!data.approval_opinion) data.approval_opinion = ''
    publicStore.form = {...data}
    publicStore._public.form = JSON.parse(JSON.stringify(data))
    getPlan()
    getDesign()
    getTaskType()
    getTask()
    getFile()
    if (isDemo) {
      if (!state.contents1 || state.contents1.length === 0) {
        state.contents1 = [
          { id: 'demo-base-1', parent_id: 'demo-base', name: '基础资料', type: 'value1' },
          { id: 'demo-base-2', parent_id: 'demo-base', name: '区位图', type: 'value2' }
        ]
        publicStore._public.contents1 = state.contents1
        state.active1 = { id: 'demo-base', name: '基础资料' }
      }
      if (!state.contents2 || state.contents2.length === 0) {
        state.contents2 = [
          { id: 'demo-plan-1', parent_id: 'demo-plan', name: '实施方案正文', type: 'value1' },
          { id: 'demo-plan-2', parent_id: 'demo-plan', name: '实施方案附件', type: 'value2' }
        ]
        publicStore._public.contents2 = state.contents2
        state.active2 = { id: 'demo-plan', name: '实施方案' }
      }
    }
  }

  const getPlan = async() => {
    let query = {model: 't_scheme_plan', args: `release_status='1'`, field: `id, name`}
    publicStore.http({Api: query}).then(res=>{
      publicStore._public.schemePlans = proxy.isNull(res)? [] : res
    })
  }

  const getDesign = async() => {
    publicStore._public.schemeAreas = [
      {id: '1', name: '龙城片区'}
    ]
  }

  const getTaskType = async() => {
    let query1 = {model: 't_task_type'}
    let query2 = {model: 't_task_content'}
    publicStore.http({Api1: query1, Api2: query2}).then(res=>{
      let list1 = proxy.isNull(res.Api1)? [] : res.Api1
      let list2 = proxy.isNull(res.Api2)? [] : res.Api2
      const firstLevelIds = res.Api1.filter(item => item.parent_id === '0').map(item => item.id)
      const secondLayer = res.Api1.filter(item => firstLevelIds.includes(item.parent_id))
      const thirdLayer = res.Api1.filter(item => secondLayer.map(s => s.id).includes(item.parent_id))
      publicStore._public.task_types = secondLayer
      publicStore._public.task_classs = thirdLayer
      publicStore._public.construct_contents = list2
    })
  }

  const getTask = async() => {
   let query = {model: 't_scheme_task', args: `scheme_id='${publicStore.form.scheme_id}'`}
    publicStore.http({Api: query}).then(res=>{
      let tasks = proxy.isNull(res)? [] : res
      publicStore.form.tasks = [...res]
      publicStore._public.tasks = JSON.parse(JSON.stringify(tasks))
    })
  }

  const getFile = async() => {
    let query1 = {model: 't_file_type'}
    let query2 = {model: 't_file_content'}
    let res = await publicStore.http({Api1: query1, Api2: query2})
    let list1 = proxy.isNull(res.Api1)? [] : res.Api1.sort((a, b) => a.orderd - b.orderd)
    let list2 = proxy.isNull(res.Api2)? [] : res.Api2.sort((a, b) => a.orderd - b.orderd)
    getFileAttr1(list1, list2, "019c2c63-cf59-719f-b942-7c7bb535413d")
    getFileAttr2(list1, list2, "019c2cc4-d276-7805-9685-7a5dde449721")
  }

  const getFileAttr1 = (list1, list2, id) => {
    let plan = list1.find(a=>a.id==id)
    if(plan){
      let contents = []
      state.plans = list1.filter(a=>a.parent_id == id)
      state.plans.forEach(v => { 
        v.parent_type = `${plan.type}/${v.type}`
        let content = list2.filter(a=>a.parent_id == v.id)
        if(!proxy.isNull(content)){
          content.forEach(vv => {
            vv.parent_type = `${v.parent_type }/${vv.type}`
            contents.push(vv)
          })
        }
      })
      state.contents1 = contents
      publicStore._public.contents1 = contents
      state.active1 = proxy.isNull(state.plans)? {} : {...state.plans[0]}
    }
  }

  const getFileAttr2 = (list1, list2, id) => {
    let plan = list1.find(a=>a.id==id)
    if(plan){
      let contents = []
      state.plans = list1.filter(a=>a.parent_id == id)
      state.plans.forEach(v => { 
        v.parent_type = `${plan.type}/${v.type}`
        let content = list2.filter(a=>a.parent_id == v.id)
        if(!proxy.isNull(content)){
          content.forEach(vv => {
            vv.parent_type = `${v.parent_type }/${vv.type}`
            contents.push(vv)
          })
        }
      })
      state.contents2 = contents
      publicStore._public.contents2 = contents
      state.active2 = proxy.isNull(state.plans)? {} : {...state.plans[0]}
    }
  }

  const onBack = () => {
    let msg = publicStore.form.id? '正在编辑中,是否确定退出?' : '正在编辑中,信息未保存是否确定退出?'
    ElMessageBox.confirm(msg, '温馨提示', {confirmButtonText: '确定', cancelButtonText: '关闭', type: 'warn'}).then(() => { 
      proxy.toPath('/project-push')
    })
  }

</script>
  
<style scoped lang="scss">

</style>
