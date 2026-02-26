<template>
  <div class="layout-col plr15">
    <div class="layout-col white-rgba50 rad8">
      <div class="ww100 flex-bc f20 p15 mb20 bob-cd-1">
        <div class="fw">{{publicStore.form&&publicStore.form.id?'项目流程':'创建项目'}}</div>
        <div class="flex1 flex-ec">
          <div class="plr14 ptb5 rad4 mr15 cursor c9 bg-white bo-c9-1" @click.stop="onBack()">返 回</div>
        </div>
      </div>
      <div class="layout-col">
        <step-title />
        <step1 :state="state" :contents="state.contents1" :active="state.active1" :plans="state.plans1" v-show="publicStore.actIndex == 1" :is-readonly="isReadonly" />
        <step2 :state="state" :contents="state.contents2" :active="state.active2" :plans="state.plans2" v-show="publicStore.actIndex == 2" :is-readonly="isReadonly" />
        <step3 :state="state" :contents="state.contents3" :active="state.active3" :plans="state.plans3" :contents1="state.contents4" :active1="state.active4" :plans1="state.plans4" v-show="publicStore.actIndex == 3" :is-readonly="isReadonly" />
        <!-- 显示审核意见： 重新申请储备, 储备审批, 推送审批-->
        <step-foot v-if="(route.query.key == 'enterprise' || route.query.key == 'department') && (route.query.action=='1f1000c7-5def-66b0-bc96-dc4dc45fb99c' || route.query.action=='019c041a-9f8c-7e9e-91eb-0ae051e6f324'||route.query.action=='019c03f8-971e-72a5-8dc3-82f1a1fc2758')" :state="state" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import api from '@/api'
  import stepTitle from './stepTitle'
  import step1 from './step1'
  import step2 from './step2'
  import step3 from './step3'
  import stepFoot from './stepFoot'
  import router from '@/router'
  import { setAreaLevel, areaOptions } from '@/utils/areaData'
  const route = useRoute()
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const state = reactive({
	  ...publicStore.$state,
  })
  const isReadonly = computed(() => {
    return route.query && (route.query.mode === 'view' || route.query.readonly === 'true')
  })

  // 【1】企业/部门识别 key
  // 'enterprise' 
  // 'department'
  // 【2】自定义标识 action
  // 新增项目 空值
  // 申请储备    1f1000c7-5def-66b0-bc96-dc4dc45fb98c
  // 开始储备    1f1000c7-5def-66b0-bc96-dc4dc45fb98d
  // 重新申请储备 1f1000c7-5def-66b0-bc96-dc4dc45fb99c
  // 更新项目进度 1f10502a-e388-6850-8aa3-265c92863865
  // 储备审批    019c041a-9f8c-7e9e-91eb-0ae051e6f324
  // 推送审批    019c03f8-971e-72a5-8dc3-82f1a1fc2758
  // 更新审批    1f10502a-e388-6850-8aa3-265c92863866

  onBeforeMount(async() => {
    publicStore.actIndex = 1
    publicStore.form = {}
  })

  onMounted(async() => {
    init()
  })

  const init = async(key) => {
    let data = {}
    if(route.query && route.query.id){
      let query = {model: 't_project_report', args: `id='${route.query.id}'`}
      let res = await publicStore.http({Api: query})
      data = !proxy.isNull(res)? {...res[0]} : {}
    }
    // 多选内容类型
    if(data.task_content) {
      try {
        data.task_content = JSON.parse(data.task_content)
      } catch (error) {
        console.error("解析失败:", error.message)
      }
    }else{
      data.task_content = []
    }
    // 资金来源
    if(data.area) {
      try {
        data.area = JSON.parse(data.area)
      } catch (error) {
        console.error("解析失败:", error.message)
      }
    }else{
      data.area = []
    }
    // 资金来源
    if(data.fund_source) {
      try {
        data.fund_source = JSON.parse(data.fund_source)
      } catch (error) {
        console.error("解析失败:", error.message)
      }
    }else{
      data.fund_source = {value1: '', value2: '', value3: '', value4: '', value5: '', value6: '', value7: '', value8: '', value9: '', value10: ''}
    }
    // 其他信息
    if(data.orther_text) {
      try {
        data.orther_text = JSON.parse(data.orther_text)
      } catch (error) {
        console.error("解析失败:", error.message)
      }
    }else{
      data.orther_text = {value1: '', value2: '', value3: '', value4: '', value5: '', value6: '', value7: '', value8: '', value9: '', value10: '', value11: '', value12: '', value13: '', value14: '', value15: ''}
    }
    // 初始化 step3 特有字段
    data.completion_status = data.completion_status || ''
    data.has_construct_price = data.has_construct_price || ''
    data.has_construct_scale = data.has_construct_scale || ''
    data.has_construct_effect = data.has_construct_effect || ''
    data.reserve_res = data.reserve_res || ''
    // 初始化完成
    data.init = true
    publicStore.form = {...data}
    publicStore._public.form = JSON.parse(JSON.stringify(data))
    // 文件上传
    publicStore.form.attr = []
    publicStore._public.attr = []
    // 方案设计上传
    publicStore.form.plan_attr = []
    publicStore._public.plan_attr = []
    // 过程上传
    publicStore.form.has_attr = []
    publicStore._public.has_attr = []
    // 实施成效上传
    publicStore.form.effect_attr = []
    publicStore._public.effect_attr = []
    // 获取主管单位
    getConstructMain
    // 获取专项规划
    getPlan()
    // 获取片区策划
    getDesign()
    // 获取任务类型
    getTaskType()
    // 获取已选任务
    getTask()
    // 获取文件
    getFile()
    // 获取文件数据
    if(publicStore.form.id) getFileData(publicStore.form)
    // console.log("publicStore.form", publicStore.form)
  }

  // 获取主管单位(关联地区)
  watch(() => publicStore.form.area, async (val) => {
    if(proxy.isNull(val)) return publicStore._public.construct_mains = []
    await nextTick()
    if(configStore.user.role_id == '5') {
      getConstructMain()
    }else{
      let user = Object.assign({}, configStore.user)
      user.name = proxy.decrypt(user.name)
      publicStore._public.construct_mains = [user]
    }
  },{ immediate: false, deep: true })

  // 根据区域数组精确匹配用户
  const getConstructMain = async() => {
    if(proxy.isNull(publicStore.form.area)) return publicStore._public.construct_mains = []
    if(proxy.isNull(state.users)){
      let query = {model: 't_user', args: `role_id<=4`, field: `id, name, role_id, province, city, district`}
      let res = await publicStore.http({Api: query})
      let list = proxy.isNull(res)? [] : [...res]
      state.users = list.map(v => {
        v.name = proxy.decrypt(v.name)
        return v
      })
    }
    let construct_mains = []
    if(publicStore.form.area.length > 0) {
      let tempArr = state.users.filter(a => a.province == publicStore.form.area[0] && !a.city && !a.district)
      construct_mains = [...construct_mains, ...tempArr]
    }
    if(publicStore.form.area.length > 1) {
      let tempArr = state.users.filter(a => a.province == publicStore.form.area[0] && a.city ==  publicStore.form.area[1] && !a.district)
      construct_mains = [...construct_mains, ...tempArr]
    }
    if(publicStore.form.area.length > 2) {
      let tempArr = state.users.filter(a => a.province == publicStore.form.area[0] && a.city ==  publicStore.form.area[1] && a.district ==  publicStore.form.area[2])
      construct_mains = [...construct_mains, ...tempArr]
    }
    publicStore._public.construct_mains = [...construct_mains]
    console.log("publicStore._public.construct_mains---", publicStore._public.construct_mains)
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
      // console.log('publicStore._public.tasks---', publicStore._public.tasks)
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
    getFileAttr3(list1, list2, "019c385a-6706-7a8e-aafa-f4b68eb0a81f")
    getFileAttr4(list1, list2, "019c385a-6706-7a8e-aafa-f4b68eb0a81d")
  }

  const getFileAttr1 = (list1, list2, id) => {
    let plan = list1.find(a=>a.id==id)
    if(plan){
      let contents = []
      state.plans1 = list1.filter(a=>a.parent_id == id)
      state.plans1.forEach(v => { 
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
      state.active1 = proxy.isNull(state.plans1)? {} : {...state.plans1[0]}
    }
  }

  const getFileAttr2 = (list1, list2, id) => {
    let plan = list1.find(a=>a.id==id)
    if(plan){
      let contents = []
      state.plans2 = list1.filter(a=>a.parent_id == id)
      state.plans2.forEach(v => { 
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
      state.active2 = proxy.isNull(state.plans2)? {} : {...state.plans2[0]}
    }
  }

  const getFileAttr3 = (list1, list2, id) => {
    let plan = list1.find(a=>a.id==id)
    if(plan){
      let contents = []
      state.plans3 = list1.filter(a=>a.parent_id == id)
      state.plans3.forEach(v => { 
        v.parent_type = `${plan.type}/${v.type}`
        let content = list2.filter(a=>a.parent_id == v.id)
        if(!proxy.isNull(content)){
          content.forEach(vv => {
            vv.parent_type = `${v.parent_type }/${vv.type}`
            contents.push(vv)
          })
        }
      })
      state.contents3 = contents
      publicStore._public.contents3 = contents
      state.active3 = proxy.isNull(state.plans3)? {} : {...state.plans3[0]}
    }
  }

  const getFileAttr4 = (list1, list2, id) => {
    let plan = list1.find(a=>a.id==id)
    if(plan){
      let contents = []
      state.plans4 = list1.filter(a=>a.parent_id == id)
      state.plans4.forEach(v => { 
        v.parent_type = `${plan.type}/${v.type}`
        let content = list2.filter(a=>a.parent_id == v.id)
        if(!proxy.isNull(content)){
          content.forEach(vv => {
            vv.parent_type = `${v.parent_type }/${vv.type}`
            contents.push(vv)
          })
        }
      })
      state.contents4 = contents
      publicStore._public.contents4 = contents
      state.active4 = proxy.isNull(state.plans4)? {} : {...state.plans4[0]}
    }
  }

  const getFileData = (data) => {
    let query = {model: 't_file', args: `parent_id='${data.id}'`}
    publicStore.http({Api: query}).then(res=>{
      let attr = res.filter(a=>a.parent_field == 'attr')
      publicStore.form.attr = [...attr]
      publicStore._public.attr = [...attr]
      let plan_attr = res.filter(a=>a.parent_field == 'plan_attr')
      publicStore.form.plan_attr = [...plan_attr]
      publicStore._public.plan_attr = [...plan_attr]
      let has_attr = res.filter(a=>a.parent_field == 'has_attr')
      publicStore.form.has_attr = [...has_attr]
      publicStore._public.has_attr = [...has_attr]
      let effect_attr = res.filter(a=>a.parent_field == 'effect_attr')
      publicStore.form.effect_attr = [...effect_attr]
      publicStore._public.effect_attr = [...effect_attr]
    })
  }

  const onBack = () => {
    if (isReadonly.value) {
      router.back()
      return
    }
    let msg = publicStore.form.id? '正在编辑中,是否确定退出?' : '正在编辑中,信息未保存是否确定退出?'
    ElMessageBox.confirm(msg, '温馨提示', {confirmButtonText: '确定', cancelButtonText: '关闭', type: 'warn'}).then(() => { 
      router.back()
    })
  }
 

</script>
  
<style scoped lang="scss">

</style>
  
