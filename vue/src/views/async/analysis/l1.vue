<template>
  <div class="layout-col">
    <!-- 标题 -->
    <div class="h40 ww100 flex-sc relative mb5">
      <img class="hh100" src="@/assets/imgs/title3.png" />
      <div class="ww100 hh100 flex-sc absolute pl35">
        <span class="fw ptb5">模型训练</span>
        <div class="flex-ec flex1 hh100"></div>
      </div>
    </div>
    <!-- 内容 -->
    <div class="flex1 layout-row ba1 i15 warp overlay p8">
    </div>
  </div>
</template>

<script lang="ts" setup>
  const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const state = reactive({
    ...publicStore.$state,
  })

</script>

<style scoped lang="scss">

</style>
