<template>
  <div class="flex-sc plr15 h60 f16 ww100 ml1">
    <svg class="w18 h18 mr5" style="color: #2b2a2a;" viewBox="0 0 48 48" width="18" height="18">
      <g>
        <path d="M7 17L24 7L41 17V41H7V17Z" stroke="#2b2a2a" fill="transparent" stroke-width="4"></path>
        <path d="M20 28H28V41H20V28Z" stroke="#2b2a2a" fill="#2b2a2a" stroke-width="4"></path>
      </g>
    </svg>
    <span class="flex1">
      <span class="i2">城市更新</span>
      <span class="i2 mlr4">{{ route.name?'/':'' }}</span>
      <span class="i1">{{ route.name?route.name:'' }}</span>
    </span>
  </div>
</template>

<script lang="ts" setup>
  const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const state = reactive({
	  ...publicStore.$state,
  })
  const route = useRoute()

  // 在这里使用 watch 监听路由变化
  // watch(() => route.path, (to, from) => {
 
  // }, {immediate: true, deep: true});
  
</script>

<style lang="scss" scoped>

</style>
