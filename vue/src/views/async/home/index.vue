<template>
  <Monitor key="Monitor" v-if="configStore.config.level.length != 4 && (isNull(configStore.distributId) || configStore.distributId=='0')" />
	<Monitor2 key="Monitor2" v-else />
</template>

<script lang="ts" setup>
  import Monitor from '@/views/async/monitor/index.vue';
	import Monitor2 from '@/views/async/monitor2/index.vue';
	const { proxy }:any = getCurrentInstance()
	const configStore = proxy.configStore()
	const publicStore = proxy.publicStore()
	const state = reactive({
		...publicStore.$state,
	})  
</script>

<style scoped lang="scss">
 
</style>
