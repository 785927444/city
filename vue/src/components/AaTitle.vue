<template>
  <div class="ww100 h40 flex-col relative mb5">
    <div class="ww100 hh100 flex-ss hidden">
      <img class="hh100" src="@/assets/imgs/title-l.png" />
      <img class="hh100 ww100" src="@/assets/imgs/title-r.png" />
    </div>
    <div class="ww100 hh100 flex-sc pl35 pr5 absolute">
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
.hh{height: 40px !important;}
</style>
