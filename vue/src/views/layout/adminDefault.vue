<template>
  <el-container class="window flex-col">
    <admin-title />
    <admin-crumb />
    <div class="layout-row">
      <admin-aside />
      <div class="layout-col">
        <router-view class="p15"/>
      </div>
    </div>
  </el-container>
</template>

<script lang="ts" setup>
  import adminTitle from '@/views/layout/adminTitle'
  import adminAside from '@/views/layout/adminAside.vue'
  import adminCrumb from '@/views/layout/adminCrumb.vue'
</script>

<style lang="scss" scoped>

</style>
