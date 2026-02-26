<template>
  <div class="layout-col"></div>
</template>

<script lang="ts" setup>
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const route = useRoute()
  const state = reactive({
	  ...publicStore.$state,
  })

  onBeforeMount(() => {
    if(configStore.user.city != '' || configStore.user.district != '' ){
      console.log("企业")
      proxy.toPath('/actionRelease')
    } else {
      console.log("部门")
      proxy.toPath('/actionHome')
    }
  })



</script>
  
<style scoped lang="scss">

</style>
  