<template>
  <el-container class="window flex-col">
    <admin-title />
    <div class="layout-row p15">
      <admin-aside />
      <div class="layout-col">
        <admin-crumb />
        <router-view class="plr15"/>
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
