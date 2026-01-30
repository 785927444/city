<template>
  <!-- 弹窗 -->
  <div class="topclass">
    <el-dialog v-model="state.isFalse" title="预览" :draggable="true" :fullscreen="true" :destroy-on-close="true" :before-close="onClose">
      <div class="window hidden relative">
        <iframe class="ww100 hh100" style="border: none; overflow: hidden;" :src="I(state.filePath)" frameborder="0" 
          scrolling="no" >
        </iframe> 
      </div>
    </el-dialog> 
  </div>
</template>

<script lang="ts" setup>
  const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const state = reactive({
	  ...publicStore.$state,
  })

  // 打开关闭弹窗
  const onVisable = async (val) => {
    state.isFalse = !state.isFalse
    if(!state.isFalse) return
    console.log("xxx", val)
    state.filePath = val
  }

  const onClose = () => { state.isFalse = !state.isFalse }

  // 暴露给父组件
  defineExpose({
    onVisable
  })
</script>

<style scoped lang="scss">
:deep(.el-dialog__body){padding: 0 !important;}
</style>