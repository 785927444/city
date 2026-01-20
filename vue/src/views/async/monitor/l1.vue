<template>
  <div class="layout-col flex1">
      <!-- 标题 -->
    <div class="h40 ww100 flex-sc relative mb5">
      <img class="hh100" src="@/assets/imgs/title.png" />
      <div class="ww100 hh100 flex-sc absolute pl35">
        <span class="fw flex1 ptb5">碳排放</span>
        <div class="flex-ec flex1"></div>
      </div>
    </div>
    <!-- 内容 -->
    <div class="flex1 layout-col p20 ba1">
      <div class="flex-sc f18 p10 i15 bs9 ww50">
        <span class="i21">排放值</span>
        <span class="i15 ml20">{{publicStore._public.laserData?publicStore._public.laserData.totle : 0}}</span>
        <span class="ml6 mt2 f14">tCO2e</span>
      </div>
      <div class="flex1 ww100 flex-sc">
        <div class="flex1 table flex-col">
           <div class="ww100 flex-sc mt15 i15" v-for="(v, i) in publicStore._public.laserData?publicStore._public.laserData.data:[]" :key="i">
             <span class="flex1 i21">{{v.name}}</span>
             <span class="flex1 flex-sc">{{v.value}}<span class="flex1 ml10 f12 mt2">tCO2e</span></span>
           </div>
        </div>
        <div class="flex1 hh100">
          <div class="ww100 hh100" id="Laser_laserData"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import ec from "@/utils/chart";
  const { drawChart } = ec();
  const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const state = reactive({
	  ...publicStore.$state,
  })
  watch(() => publicStore._public.laserData, async (val, old) => {
    if(proxy.isNull(val)) return
    if(JSON.stringify(val) == JSON.stringify(old)) return
    await nextTick();
    setChart();
  },{ immediate: false, deep: true });

	const setChart = async() => {
		let chart = 'Laser'
		let id = 'Laser_laserData'
		let attr = {min: 0, max: 100, colorList: [], legendArr: [],legendShow: true, labelShow: false,	areaShow: true,	y_name: 'kw', tool_dw: 'kw', tool_name_x: '日期：', tool_name_y: '数值：'}
    let data = publicStore._public.laserData.data
    attr.legendArr = data.map(v => { return v.name })
    let value = data.map(v => { return v.value })
    let series = [{value: value, name: '统计一'}]
		drawChart(chart, id, attr, series, {});
	}
</script>

<style scoped lang="scss">

</style>
