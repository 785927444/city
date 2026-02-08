<template>
  <div class="layout-col plr15">
    <div class="layout-col white-rgba50 rad8">
      <div class="ww100 flex-bc f20 p15 mb20 bob-cd-1">
        <div class="fw">片区规划上报</div>
        <div class="flex1 flex-ec">
          <div class="plr14 ptb5 rad4 mr15 cursor c9 bg-white bo-c9-1" v-if="!publicStore.form.id">上 报</div>
          <div class="plr14 ptb5 rad4 mr15 cursor white bgi1" v-if="publicStore.form.id" @click.stop="onRelease()">{{ publicStore.form.release_status!='1'?'上报':'重新上报' }}</div>
          <div class="plr14 ptb5 rad4 mr15 cursor c9 bg-white bo-c9-1" @click.stop="onBack()">返 回</div>
        </div>
      </div>
      <div class="layout-col">
        <step-title />
        <Step1 :state="state" v-show="publicStore.actIndex == 1" />
        <Step2 :state="state" v-show="publicStore.actIndex == 2" />
        <StepFoot :state="state" @init="init" />
      </div>
    </div>
    <!-- 上报提醒 -->
    <el-dialog v-model="state.isFalse" title="提示" :draggable="true" width="30%">
      <div class="f20 ww100 tc ptb30">你有专项规划需要上报，完成上报后可新增</div>
      <template #footer>
        <div class="dialog-footer">
          <el-button size="large" class="bgi1 white" @click.stop="state.isFalse = !state.isFalse">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
  import api from '@/api'
  import stepTitle from './stepTitle'
  import router from '@/router'
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const state = reactive({
	  ...publicStore.$state,
    model: 't_scheme_plan',
    type: 'design',
  })

  onMounted(async() => {
    publicStore.actIndex = 1
    publicStore.form = {attr:{}, project: [], task: []}
    publicStore._public.project = []
    publicStore._public.task = []
    let query = {model: 't_scheme_plan', args: `user_id='${configStore.user.id}' and release_status='0' and type='${state.type}'`}
    let res = await publicStore.http({Api: query})
    if(!proxy.isNull(res)) {
      init(res[0]['id'])
      state.name = res[0]['name']
      state.isFalse = !state.isFalse
    }
    // init()
  })

  const init = async(key) => {
    let query = key? {model: state.model, args: `id='${key}'`} : {model: state.model, args: `user_id='${configStore.user.id}' and type='${state.type}'`}
    let res = await publicStore.http({Api: query})
    if(!proxy.isNull(res)){
      let data = res[0]
      // 获取关联项目
      getProject(data)
      // 获取关联任务
      getTask(data)
      try {
        data.datetime = data.datetime? JSON.parse(data.datetime) : ''
        data.attr = data.attr? JSON.parse(data.attr) : {}
      } catch (error) {
        console.error("解析失败:", error.message)
      }
      publicStore.form = {...data}
    }else{
      publicStore.form = {attr:{}, project: [], task: []}
      publicStore._public.project = []
      publicStore._public.task = []
    }
    console.log("publicStore.form", publicStore.form)
  }

  const getProject = (data) => {
    let query = {model: 't_scheme_project', args: `scheme_id='${data.id}'`}
    publicStore.http({Api: query}).then(res=>{
      data.project = !proxy.isNull(res)? [...res] : []
      data.project.forEach(v => { v.construct_datetime = `${v.construct_datetime_start||''} ~ ${v.construct_datetime_end||''}` })
      publicStore.form.project = [...data.project]
      publicStore._public.project = JSON.parse(JSON.stringify(data.project))
    })
  }

  const getTask = (data) => {
    let query = {model: 't_scheme_task', args: `scheme_id='${data.id}'`}
    publicStore.http({Api: query}).then(res=>{
      data.task = !proxy.isNull(res)? [...res] : []
      publicStore.form.task = [...data.task]
      publicStore._public.task = JSON.parse(JSON.stringify(data.task))
    })
  }

  const onBack = () => {
    let msg = publicStore.form.id? '正在编辑中,是否确定退出?' : '正在编辑中,信息未保存是否确定退出?'
    ElMessageBox.confirm(msg, '温馨提示', {confirmButtonText: '确定', cancelButtonText: '关闭', type: 'warn'}).then(() => { 
      proxy.toPath('/schemePlansManagerCity')
    })
  }

  const onRelease = async() => {
    if(!publicStore.form.id) return ElNotification({ title: '提示', message: '请先保存数据(440)', type: 'error' })
    ElMessageBox.confirm('上报需等待审核!', '温馨提示', {confirmButtonText: '确定', cancelButtonText: '关闭', type: 'warn'}).then(() => {
      const now = new Date().getTime()
      let form = {id: publicStore.form.id, release_status: '1', release_time: now, examine_status: '0'}
      let params = {model: 't_scheme_plan', list: [form]}
      api['updApi'](params).then((res:any) => {
        if(res.code == 200){
          ElNotification({ title: '提示', message: '上报成功', type: 'success' })
          init()
        }else{
          ElNotification({ title: '提示', message: res.msg?res.msg:'上报失败(400)', type: 'error' })
        }
      }).catch((err) => {
        ElNotification({ title: '提示', message: '上报失败(500)', type: 'error' })
      })
    })
  }

</script>
  
<style scoped lang="scss">

</style>
  