<template>
  <div class="layout-col">
    <!-- 面包屑 -->
    <div class="ww100 flex-sc bs9 h40 mb15">
      <div class="cursor hh100 ptb10 plr20 i21"></div>
      <div class="cursor hh100 ptb10 plr20 i21"></div>
      <div class="flex1 hh100 flex-ec">
        <img src="@/assets/imgs/uu1.png" />
        <span class="ml15 cc">数据查询</span>
        <span class="mlr10 cc">/</span>
        <span class="mr15">数据记录</span>
        <img src="@/assets/imgs/uu2.png" />
      </div>
    </div>
    <div class="layout-row plr15 pb15">
      <m1 />
      <m2 />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import m1 from './m1'
  import m2 from './m2'
</script>
  
<style scoped lang="scss">

</style>
  