<template>
  <el-container class="window flex-col">
    <async-title />
    <div class="layout-col">
      <async-crumb />
      <router-view class="plr15 pb15"/>
    </div>
  </el-container>
</template>

<script lang="ts" setup>
  import asyncTitle from '@/views/layout/asyncTitle'
  import asyncCrumb from '@/views/layout/asyncCrumb.vue'
</script>

<style lang="scss" scoped>

</style>
