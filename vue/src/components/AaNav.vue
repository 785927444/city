<template>
  <div class="ww100 flex-sc bs9 h40 mb15">
    <div :class="$route.path == v.value?'white ba2':'i1'" class="cursor hh100 ptb10 plr20 relative" v-for="(v, i) in state.types" :key="i" @click.stop="toPath(v.value)">
      <!-- <img :class="$route.path == v.value?'':'none'" class="absolute-cc z1 tt80" src="@/assets/imgs/title-bg.png" /> -->
      <span>{{ v.name }}</span>
    </div>
    <div class="flex1 hh100 flex-ec">
      <img src="@/assets/imgs/uu1.png" />
      <span class="ml15 cb cursor" @click.stop="toPath('/home')">首页</span>
      <span class="mlr10 cc">/</span>
      <span class="mr10 cursor fontStyle">
        {{ find(state.types, ['value', $route.path], 'name') }}
      </span>
      <img src="@/assets/imgs/uu2.png" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  const route = useRoute();
	const { proxy }:any = getCurrentInstance()
	const publicStore = proxy.publicStore()
	const state = reactive({
		...publicStore.$state,
    types: [
      {name: '光伏监测',   value: '/devices2/photovoltaic'},
      {name: '储能监测',   value: '/devices2/energy'},
      {name: '充电桩监测', value: '/devices2/charge'},
      {name: '风机监测',   value: '/devices2/wind'},
      {name: '空调监测',   value: '/devices2/airconditioner'},
      {name: '中央空调', value: '/devices2/centralair'},
      // {name: 'RLC负载监测', value: '6'},
      // {name: '风光模拟', value: '/devices2/mock'},
    ]
	})
</script>

<style scoped lang="scss">
.hh{height: 40px !important;}
</style>
