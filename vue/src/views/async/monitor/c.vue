<template>
  <div class="layout-col">
		<div class="ww100 flex-col-cc absolute z1">
			<div class="ww44 hh100 flex-col">
				<!-- 标签切换 -->
				<div class="ww100 flex-cc h42">
						<div class="flex1 i29">
							<div class="ww100 flex-sc" v-if="!isNull(publicStore.mapAdcodes)">
								<div class="ba2 w30 h30 p8 flex-cc rad4 mr5 cursor" @click.stop="publicStore.mapAdcodes.splice(publicStore.mapAdcodes.length - 1, 1)"><i-ep-arrowLeftBold /></div>
								<div class="flex-sc mlr5" v-for="(v, i) in publicStore.mapAdcodes" :key="i">
									<span class="mr10" v-if="i!=0">/</span>
									<span class="cursor" :class="i==publicStore.mapAdcodes.length-1?'i21':''">{{v.name}}</span>
									</div>
							</div>
						</div>
						<div class="flex-sc w50x5">
							<el-input v-model="state.text" placeholder="请输入查询内容" size="large" :prefix-icon="Search" class="ww100" />
							<!-- <div class="ptb5 plr10 bgi22 h40 flex-cc rad5 ml10">搜索</div> -->
						</div>
				</div>
				<!-- 数据展示 -->
				<div class="ww100 flex-cc h50x3" v-if="publicStore._public.baseData">
					<div class="flex1 hh100 flex-cc">
						<!-- <img class="hh50" src="@/assets/imgs/n1.png" /> -->
						<div class="flex-col-cs ml20">
							<div class="f16 i21 mb10">光伏区</div>
							<div class="f16 white">
									<span class="f16 fw white mr5">{{publicStore._public.baseData.photovoltaic}}</span>
									<span class="i15">MW</span>
							</div>
						</div>
					</div>
					<div class="flex1 hh100 flex-cc">
						<!-- <img class="hh50" src="@/assets/imgs/n2.png" /> -->
						<div class="flex-col-cs ml20">
							<div class="f16 i21 mb10">储能柜</div>
							<div class="f16 white">
									<span class="f16 fw white mr5">{{publicStore._public.baseData.energy}}</span>
									<span class="i15">MW</span>
							</div>
						</div>
					</div>
					<div class="flex1 hh100 flex-cc">
						<!-- <img class="hh50" src="@/assets/imgs/n3.png" /> -->
						<div class="flex-col-cs ml20">
							<div class="f16 i21 mb10">充电桩</div>
							<div class="f16 white">
									<span class="f16 fw white mr5">{{publicStore._public.baseData.charge}}</span>
									<span class="i15">MW</span>
							</div>
						</div>
					</div>
					<div class="flex1 hh100 flex-cc">
						<!-- <img class="hh50" src="@/assets/imgs/n4.png" /> -->
						<div class="flex-col-cs ml20">
							<div class="f16 i21 mb10">柔性负荷</div>
							<div class="f16 white">
									<span class="f16 fw white mr5">{{publicStore._public.baseData.load}}</span>
									<span class="i15">MW</span>
							</div>
						</div>
					</div>
				</div>
				<!-- 列表展示 -->
				<div class="ww100 flex-cc relative overlay tc warp hidden ptb1" v-if="publicStore.mapAdcodes.length > 2">
					<div class="tack list4-15 rad8 black-rgba20 flex-col-cc cursor ptb10 relative"
						style="border: 1px solid rgba(65, 255, 255, 0.2); box-sizing: border-box; height: auto;"
						v-for="(v, i) in isNull(publicStore._public.stations)? [] : publicStore._public.stations.filter((a:any)=> !publicStore._public.text || a.name.toLowerCase().indexOf(publicStore._public.text.toLowerCase()) != -1)" 
						:key="i" @click="configStore.$patch({ distributId: v.station_num })"
						element-loading-background="rgba(0, 0, 0, 0.4)"
						v-loading="v.loading">
						<div class="h90">
							<img :class="v.offline=='1'?'gray':v.offline=='0'?'':''" class="hh100" src="@/assets/imgs/distribut.png" alt="" />
						</div>
						<div class="mt5" :class="v.offline=='1'?'ca':v.offline=='0'?'i21':'i6'">{{v.station_name}}</div>
						<!-- <div class="mt5" :class="v.offline=='1'?'ca':v.offline=='0'?'i21':'i6'">{{v.offline=='1'?'离线':v.offline=='0'?'在线':'连接中..'}}</div>
						<div class="alarmLamp absolute t10 l10" v-if="v.alarm == '1'">
								<div class="lamp"></div>
						</div> -->
					</div>
				</div>
			</div>
		</div>
		<!-- 地图展示 -->
		<div class="ww100 hh100 absolute" :class="publicStore.mapAdcodes.length > 2?'none':''" id="container"></div>
  </div>
</template>

<script lang="ts" setup>
  import { Search } from '@element-plus/icons-vue'
	import map from '@/utils/three/Map'
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
