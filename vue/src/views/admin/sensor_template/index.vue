<template>
  <div class="layout-row">
    <m1 />
    <m2 v-if="publicStore.actIndex == 2" />
    <m3 v-if="publicStore.actIndex == 3" />
    <m4 v-if="publicStore.actIndex == 4" />
    <m5 v-if="publicStore.actIndex == 5" />
  </div>
</template>

<script lang="ts" setup>
  import m1 from './m1'
  import m2 from './m2'
  import m3 from './m3'
  import m4 from './m4'
  import m5 from './m5'
  const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
</script>
  
<style scoped lang="scss">

</style>
  