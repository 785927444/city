<template>
  <!-- 标题 -->
  <div class="ww100 flex-cc f20 p20">
    <div class="flex-sc">
      <div class="w28 h28 tc lh24 rad50" :class="publicStore.actIndex>='1'?'bgi1 white bo-i1-1':'bg-white c8 bo-c8-1'">1</div>
      <div class="ml10" :class="publicStore.actIndex>='1'?'i1':'c8'">基础数据</div>
    </div>
    <div class="w50x3 h2 bgi1 mlr20"></div>
    <div class="flex-sc">
      <div class="w28 h28 tc lh24 rad50" :class="publicStore.actIndex>='2'?'bgi1 white bo-i1-1':'bg-white c8 bo-c8-1'">2</div>
      <div class="ml10" :class="publicStore.actIndex>='2'?'i1':'c8'">实施方案</div>
    </div>
    <!-- 审批 -->
    <div class="w50x3 h2 bgi1 mlr20" v-if="publicStore.title=='reserve'"></div>
    <div class="flex-sc" v-if="publicStore.title=='reserve'">
      <div class="w28 h28 tc lh24 rad50" :class="publicStore.actIndex>='3'?'bgi1 white bo-i1-1':'bg-white c8 bo-c8-1'">3</div>
      <div class="ml10" :class="publicStore.actIndex>='3'?'i1':'c8'">进度更新</div>
<<<<<<< Updated upstream
    </div>
    <div class="w50x3 h2 bgi1 mlr20" v-if="publicStore.title=='reserve'"></div>
    <div class="flex-sc" v-if="publicStore.title=='reserve'">
      <div class="w28 h28 tc lh24 rad50" :class="publicStore.actIndex=='3'?'bgi1 white bo-i1-1':'bg-white c8 bo-c8-1'">3</div>
      <div class="ml10" :class="publicStore.actIndex=='3'?'i1':'c8'">进度更新</div>
=======
>>>>>>> Stashed changes
    </div>
  </div>
</template>

<script lang="ts" setup>
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const state = reactive({
	  ...publicStore.$state,
  })

  onMounted(async() => {
    await getInit()
    init()
  })

  const getInit = async() => {}

  const init = async(key) => {}

  const handleClick = (remark, val) => {}
</script>
  
<style scoped lang="scss">

</style>
  
