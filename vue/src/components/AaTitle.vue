<template>
  <div class="ww100 h60 flex-sc white-rgba50 rad8 plr15 mb15">
    <div class="flex-sc">
      <span>{{ title?title:'' }}</span>
      <slot name="left-content"></slot>
    </div>
    <div class="flex-ec flex1 hidden">
      <slot name="right-content"></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
  const props = defineProps({
    title: {
      type: String,
      default: ''
    }
  })
</script>

<style scoped lang="scss">

</style>