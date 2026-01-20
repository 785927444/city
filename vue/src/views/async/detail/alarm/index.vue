<template>
    <div class="layout-row">
      <datachart class="hh100 hidden flex2 mr15" />
      <datalog class="hh100 hidden flex3" />
    </div>
</template>

<script lang="ts" setup>
  import datachart from './datachart'
  import datalog from './datalog'
  const router = useRouter()
  const { proxy }: any = getCurrentInstance();
  const publicStore = proxy.publicStore();
  const state = reactive({
    ...publicStore.$state,
  });
  let initRef = $ref()
</script>

<style lang="scss">

</style>
