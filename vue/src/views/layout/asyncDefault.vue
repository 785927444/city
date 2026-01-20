<template>
  <el-container class="window flex-col relative">
    <div class="relative ww100 mb5">
      <img class="ww100" src="@/assets/imgs/top-cebg.png"/>
    </div>
    <async-title />
    <router-view/>
  </el-container>
</template>

<script lang="ts" setup>
  import asyncTitle from '@/views/layout/asyncTitle'
	const { proxy }:any = getCurrentInstance()
  const configStore = proxy.configStore()
  const route = useRoute()
</script>

<style lang="scss" scoped>

</style>
