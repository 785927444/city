<template>
  <div class="layout-col plr15">
    <div class="layout-col white-rgba50 rad8">
      <div class="ww100 flex-bc f20 p15 mb20 bob-cd-1">
        <div class="fw">专项规划上报</div>
        <div class="flex1 flex-ec">
          <div class="plr14 ptb5 rad4 mr15 cursor c9 bg-white bo-c9-1" v-if="!publicStore.form.id">上 报</div>
          <div class="plr14 ptb5 rad4 mr15 cursor white bgi1" v-if="publicStore.form.id" @click.stop="onRelease()">{{ publicStore.form.release_status!='1'?'上报':'重新上报' }}</div>
          <div class="plr14 ptb5 rad4 mr15 cursor c9 bg-white bo-c9-1" @click.stop="onBack()">返 回</div>
        </div>
      </div>
      <div class="layout-col">
        <step-title />
        <step1 v-show="publicStore.actIndex == 1" />
        <step2 v-show="publicStore.actIndex == 2" />
        <step-foot @init="init" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import api from '@/api'
  import stepTitle from './stepTitle'
  import stepFoot from './stepFoot'
  import step1 from './step1'
  import step2 from './step2'
  import router from '@/router'
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const state = reactive({
	  ...publicStore.$state,
  })

  onMounted(async() => {
    publicStore.actIndex = 1
    init()
  })

  const init = async() => {
    let query = {model: 't_scheme_plan', args: `user_id='${configStore.user.id}'`}
    let res = await publicStore.http({Api: query})
    if(!proxy.isNull(res)){
      let data = res[0]
				try {
          data.datetime = JSON.parse(data.datetime)
          data.attr = data.attr? JSON.parse(data.attr) : {}
          data.project = data.project? JSON.parse(data.project) : []
          data.task = data.task? JSON.parse(data.task) : []
				} catch (error) {
					console.error("解析失败:", error.message)
				}
      publicStore.form = {...data}
      publicStore._public.project = data.project
      publicStore._public.task = data.task
    }else{
      publicStore.form = {attr:{}, project: [], task: []}
      publicStore._public.project = []
      publicStore._public.task = []
    }
    // console.log("publicStore.form", publicStore.form)
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
  