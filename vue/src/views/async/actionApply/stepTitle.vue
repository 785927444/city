<template>
  <!-- 标题 -->
  <div class="ww100 flex-cc f20 p20">
    <div class="flex-sc cursor" @click.stop="publicStore.actIndex='1'">
      <div class="w28 h28 tc lh24 rad50" :class="publicStore.actIndex>='1'?'bgi1 white bo-i1-1':'bg-white c8 bo-c8-1'">1</div>
      <div class="ml10" :class="publicStore.actIndex>='1'?'i1':'c8'">基础数据</div>
    </div>
    <div class="w50x3 h2 mlr20" :class="publicStore.actIndex>='2'?'bgi1':'bga'"></div>
    <div class="flex-sc cursor" @click.stop="publicStore.actIndex='2'">
      <div class="w28 h28 tc lh24 rad50" :class="publicStore.actIndex>='2'?'bgi1 white bo-i1-1':'bg-white c8 bo-c8-1'">2</div>
      <div class="ml10" :class="publicStore.actIndex>='2'?'i1':'c8'">实施方案</div>
    </div>
    <div class="w50x3 h2 mlr20" :class="publicStore.actIndex>='3'?'bgi1':'bga'"></div>
    <div class="flex-sc cursor" @click.stop="publicStore.actIndex='3'">
      <div class="w28 h28 tc lh24 rad50" :class="publicStore.actIndex>='3'?'bgi1 white bo-i1-1':'bg-white c8 bo-c8-1'">3</div>
      <div class="ml10" :class="publicStore.actIndex>='3'?'i1':'c8'">项目进度</div>
    </div>
    <!-- 储备通过后才会有进度 -->
    <!-- <template v-if="publicStore.form.id && publicStore.form.apply_status>='1' && (publicStore.form.reserve_status=='1' || route.query.action=='019c03f8-971e-72a5-8dc3-82f1a1fc2758')">
      <div class="w50x3 h2 mlr20" :class="publicStore.actIndex>='3'?'bgi1':'bga'"></div>
      <div class="flex-sc cursor" @click.stop="publicStore.actIndex='3'">
        <div class="w28 h28 tc lh24 rad50" :class="publicStore.actIndex>='3'?'bgi1 white bo-i1-1':'bg-white c8 bo-c8-1'">3</div>
        <div class="ml10" :class="publicStore.actIndex>='3'?'i1':'c8'">项目进度更新</div>
      </div>
    </template> -->
  </div>
</template>

<script lang="ts" setup>
  const route = useRoute()
  const props = defineProps({
    maxSteps: {
      type: Number,
      default: 3
    }
  })
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
  
