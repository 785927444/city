<template>
  <div class="layout-col">
    <c1 v-if="isNull(publicStore.active)" key="c1" />
    <c2 v-else key="c2" />
  </div>
</template>

<script lang="ts" setup>
	import c1 from './c1'
	import c2 from './c2'
  const { proxy }: any = getCurrentInstance();
  const configStore = proxy.configStore();
  const publicStore = proxy.publicStore();
  const state = reactive({
    ...publicStore.$state,
  });

</script>
  
<style scoped lang="scss">

</style>
  