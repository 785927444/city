<template>
  <div class="layout-col">
    <m1 class="ww100 rad8 hidden" />
    <m2 class="ww100 rad8 hidden flex1 ml15" />
  </div>
</template>

<script lang="ts" setup>
  import m1 from './m1'
  import m2 from './m2'
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const state = reactive({
	  ...publicStore.$state,
  })

  onMounted(async() => {
    init()
  })

  const init = async() => {
    let data = {project_all_num: 123, project_pre_num: 13, project_scheme_num: 14, project_examine_num: 15, project_effect_num: 15, investment_completion_rate: 85.55, examine_pass_rate: 90}
    setTimeout(() => {
      publicStore.active = data
    }, 50)
  }


</script>
  
<style scoped lang="scss">

</style>
  