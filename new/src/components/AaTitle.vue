<template>
  <div class="ww100  flex-sc bg-white rad8 p15 mb15 hidden">
    <div class="flex-sc">
      <span class="fw f15">{{ title?title:'' }}</span>
      <slot name="left-content"></slot>
    </div>
    <div class="flex-ec flex1">
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