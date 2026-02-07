<template>
  <el-container class="window flex-col">
    <async-title />
    <div class="layout-col">
      <async-crumb />
      <div class="page-scroll">
        <router-view class="plr15 pb15"/>
      </div>
    </div>
  </el-container>
</template>

<script lang="ts" setup>
  import asyncTitle from '@/views/layout/asyncTitle'
  import asyncCrumb from '@/views/layout/asyncCrumb.vue'
</script>

<style lang="scss" scoped>
.layout-col {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}

.page-scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
}
</style>

