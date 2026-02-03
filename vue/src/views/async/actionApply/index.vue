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
        <!-- <Step2 :state="state" v-show="publicStore.actIndex == 2" /> -->
        <StepFoot :state="state" @init="init" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import api from '@/api'
  import stepTitle from './stepTitle'
  import step1 from './step1'
  import router from '@/router'
  const route = useRoute()
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const state = reactive({
	  ...publicStore.$state,
  })

  onMounted(async() => {
    publicStore.actIndex = 1
    publicStore.form = {}
    init()
  })

  const init = async(key) => {
    let query = {model: 't_scheme_project', args: `id='${route.query.id}'`}
    let res = await publicStore.http({Api: query})
    publicStore.form = !proxy.isNull(res)? {...res[0]} : {}
    console.log("publicStore.form", publicStore.form)
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
  