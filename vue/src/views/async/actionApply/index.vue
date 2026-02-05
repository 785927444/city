<template>
  <div class="layout-col plr15">
    <div class="layout-col white-rgba50 rad8">
      <div class="ww100 flex-bc f20 p15 mb20 bob-cd-1">
        <div class="fw">信息补充</div>
        <div class="flex1 flex-ec">
          <div class="plr14 ptb5 rad4 mr15 cursor c9 bg-white bo-c9-1" @click.stop="onBack()">返 回</div>
        </div>
      </div>
      <div class="layout-col">
        <step-title />
        <step1 :state="state" v-show="publicStore.actIndex == 1" />
        <step2 :state="state" v-show="publicStore.actIndex == 2" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import api from '@/api'
  import stepTitle from './stepTitle'
  import step1 from './step1'
  import step2 from './step2'
  import router from '@/router'
  const route = useRoute()
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
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
    let query = {model: 't_project_report', args: `id='${route.query.id}'`}
    let res = await publicStore.http({Api: query})
    let data = !proxy.isNull(res)? {...res[0]} : {}
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
    // 图片上传
    if(data.attr) {
      try {
        data.attr = JSON.parse(data.attr)
      } catch (error) {
        console.error("解析失败:", error.message)
      }
    }else{
      data.attr = {value1: '', value2: '', value3: ''}
    }
    // 方案上传
    if(data.plan_attr) {
      try {
        data.plan_attr = JSON.parse(data.plan_attr)
      } catch (error) {
        console.error("解析失败:", error.message)
      }
    }else{
      data.plan_attr = {value1: '', value2: '', value3: ''}
    }
    publicStore.form = {...data}
    // 获取专项规划
    getPlan()
    // 获取片区策划
    getDesign()
    // 获取任务类型
    getTaskType()
    // 获取已选任务
    getTask()
    // console.log("publicStore.form", publicStore.form)
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

  const onBack = () => {
    let msg = publicStore.form.id? '正在编辑中,是否确定退出?' : '正在编辑中,信息未保存是否确定退出?'
    ElMessageBox.confirm(msg, '温馨提示', {confirmButtonText: '确定', cancelButtonText: '关闭', type: 'warn'}).then(() => { 
      proxy.toPath('/actionRelease')
    })
  }

</script>
  
<style scoped lang="scss">

</style>
  