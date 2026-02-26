<template>
  <div class="layout-row">
    <m1 class="flex4 hh100 rad8 hidden" />
    <!-- <m2 class="flex1 hh100 rad8 hidden ml15" /> -->
  </div>
</template>

<script lang="ts" setup>
  import m1 from './m1'
  // import m2 from './m2'
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const state = reactive({
	  ...publicStore.$state,
  })

</script>
  
<style scoped lang="scss">

</style>
  