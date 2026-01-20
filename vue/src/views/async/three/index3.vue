<template>
  <div class="layout-col">
		<div class="absolute t0 l0 cursor" @click="toPath('/home')">返回</div>
		<div class="ww100 hh100" id="container"></div>
  </div>
</template>

<script lang="ts" setup>
	import map from '@/utils/three/Map'
	import scheduled from "@/utils/scheduled"
	const { createScheduled } = scheduled()
  const { drawMap } = map()
	const { proxy }:any = getCurrentInstance()
	const configStore = proxy.configStore()
	const publicStore = proxy.publicStore()
	const state = reactive({
		...configStore.$state,
		...publicStore.$state,
	})

	onMounted(async() => {
		drawMap()
	})

</script>

<style scoped lang="scss">

</style>
