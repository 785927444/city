<template>
  <div class="ww100 flex-cc f20 p40">
    <div class="flex-sc cursor" @click.stop="setStep(1)">
      <div class="w28 h28 tc lh24 rad50" :class="publicStore.actIndex=='1'?'bgi1 white bo-i1-1':'bg-white c8 bo-c8-1'">1</div>
      <div class="ml10" :class="publicStore.actIndex=='1'?'i1':'c8'">基础数据更新</div>
    </div>
    <div class="w50x3 h2 bgi1 mlr20"></div>
    <div class="flex-sc cursor" @click.stop="setStep(2)">
      <div class="w28 h28 tc lh24 rad50" :class="publicStore.actIndex=='2'?'bgi1 white bo-i1-1':'bg-white c8 bo-c8-1'">2</div>
      <div class="ml10" :class="publicStore.actIndex=='2'?'i1':'c8'">实施方案更新</div>
    </div>
    <div class="w50x3 h2 bgi1 mlr20"></div>
    <div class="flex-sc cursor" @click.stop="setStep(3)">
      <div class="w28 h28 tc lh24 rad50" :class="publicStore.actIndex=='3'?'bgi1 white bo-i1-1':'bg-white c8 bo-c8-1'">3</div>
      <div class="ml10" :class="publicStore.actIndex=='3'?'i1':'c8'">项目进度更新</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()

  const setStep = (val: number) => {
    publicStore.actIndex = val
  }
</script>
  
<style scoped lang="scss">

</style>
