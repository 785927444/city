<template>
  <!-- 弹窗 -->
  <div class="topclass">
    <el-dialog v-model="state.isFalse" title="绘制" :draggable="true" :fullscreen="true" :destroy-on-close="true" :before-close="onClose" :show-close="false">
      <!-- 自定义头部 -->
      <template #header="{ close, titleId, titleClass }">
        <div class="ww100 flex-sc">
          <span>绘制区域</span>
          <div class="flex1 flex-ec">
            <el-button type="primary" @click="handleDraw" v-if="state.active.mapdata">完成绘制</el-button>
             <el-button type="info" v-else>完成绘制</el-button>
            <el-button type="info" @click="onClose">取消</el-button>
          </div>
        </div>
      </template>
      <div class="window hidden relative">
        <GisShow class="ww100 hh100" v-if="publicStore.check" v-model:mapdata="state.active.mapdata" />
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
    state.active = {...val}
  }

  const onClose = () => { 
    state.isFalse = !state.isFalse; 
     setTimeout(() => {
      publicStore.check=!publicStore.check;
    }, 1000);
  }
  const handleDraw = () => { 
    publicStore.form.mapdata = state.active.mapdata
    onClose()
  }

  // 暴露给父组件
  defineExpose({
    onVisable
  })
</script>

<style scoped lang="scss">
:deep(.el-dialog__body){padding: 0 !important;}
</style>