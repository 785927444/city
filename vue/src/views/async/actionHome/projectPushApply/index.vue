<template>
  <div class="layout-col plr15">
    <div class="layout-col white-rgba50 rad8">
      <div class="ww100 flex-bc f20 p15 mb20 bob-cd-1">
        <div class="fw">{{ route.query && route.query.id ? '信息补充' : '创建项目' }}</div>
        <div class="flex1 flex-ec">
          <div class="plr14 ptb5 rad4 mr15 cursor c9 bg-white bo-c9-1" @click.stop="onBack()">返 回</div>
        </div>
      </div>
      <div class="layout-col">
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { getAreaDataByCode } from '@/utils/areaData'
  const route = useRoute()
  const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const isDemo = proxy.isDemo
  const state = reactive({
	  ...publicStore.$state,
    code: ''
  })

  const isReadonly = computed(() => {
    return route.query && (route.query.mode === 'view' || route.query.readonly === 'true')
  })

  onBeforeMount(async() => {
    publicStore.actIndex = Number(route.query.steps) || 1
    publicStore.form = {}
    
    // 设置区域限制代码
    if (configStore.user) {
      // 省级部门
      if(configStore.user.role_id == '2') state.code = configStore.user.province
      // 市级部门
      if(configStore.user.role_id == '3') state.code = configStore.user.city
      // 区级部门
      if(configStore.user.role_id == '4') state.code = configStore.user.district
      
      // 将受限的区域数据存入 publicStore 供 Step1 使用
      publicStore._public.areaOptions = getAreaDataByCode(state.code)
    }
  })

  onMounted(async() => {
    init()
  })

  const init = async(key) => {
    let data: any = {}
    if(route.query && route.query.id){
      // 这里的 args 同步 actionDepartment 的逻辑：增加层级区域过滤
      // 增加 push_status 过滤，只允许已发起推送的项目进入
      let args = `id='${route.query.id}' and push_status in ('0', '1', '2')`
      
      // 省级部门
      if(configStore.user.role_id == '2') args += ` and construct_main_province='${configStore.user.province}'`
      // 市级部门
      if(configStore.user.role_id == '3') args += ` and construct_main_province='${configStore.user.province}' and construct_main_city='${configStore.user.city}'`
      // 区级部门
      if(configStore.user.role_id == '4') args += ` and construct_main_province='${configStore.user.province}' and construct_main_city='${configStore.user.city}' and construct_main_district='${configStore.user.district}'`
      
      let query = {model: 't_project_report', args: args}
      let res = await publicStore.http({Api: query})
      data = !proxy.isNull(res)? {...res[0]} : {}
      
      // 如果没查到数据（可能是因为权限过滤），则跳转回列表
      if (proxy.isNull(data)) {
        proxy.toPath('/project-push')
        return
      }
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
