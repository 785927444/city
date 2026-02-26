<template>
  <ActionApplyStep1 v-bind="props" />
</template>

<script lang="ts" setup>
import ActionApplyStep1 from '@/views/async/actionApply/step1.vue'

const props = defineProps({
  isReadonly: {
    type: Boolean,
    default: false
  },
  state: {
    type: [Object, Array],
    default: () => ({})
  },
  contents: {
    type: Array,
    default: () => []
  },
  plans: {
    type: Array,
    default: () => []
  },
  active: {
    type: [Object, Array],
    default: () => ({})
  }
})
</script>

<style scoped lang="scss">
</style>
