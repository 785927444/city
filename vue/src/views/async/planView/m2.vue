<template>
  <div class="layout-col bg-white plr20 pb20">
    <div class="ww100 flex-sc mb20 bob-i16-1 pb20">
      <span class="fw f16 bob-ca-3 pb10">详情信息</span>
      <div class="flex-sc rad5 hidden ml40">
        <span class="w100 tc ptb8 cursor mr1" :class="state.actIndex == v.value ? 'bgi1 white' : 'bgi16'" v-for="(v, i) in actives" :key="'i'" @click.stop="state.actIndex = v.value">{{ v.name }}</span>
      </div>
    </div>
    <div class="layout-col" v-if="!isNull(publicStore.active)">
      <m21 v-if="state.actIndex == '1'" />
      <m22 v-if="state.actIndex == '2'" />
      <m23 v-if="state.actIndex == '3'" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import m21 from './m21'
  import m22 from './m22'
  import m23 from './m23'
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const actives = [
    {value: '1', name: '规划成果'},
    {value: '2', name: '项目库'},
    {value: '3', name: '规划目标'},
  ]
  const state = reactive({
	  ...publicStore.$state,
    actIndex: '1',
  })
</script>
  
<style scoped lang="scss">
.w110 { width: 110px; }
</style>
  