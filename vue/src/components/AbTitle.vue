<template>
  <div class="ww100 h50 flex-col relative bg-white plr15 hidden">
    <div class="ww100 hh100 flex-sc">
      <span class="fw f15">{{ title }}</span>
      <div class="flex-ec flex1">
        <slot name="right-content"></slot>
      </div>
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
