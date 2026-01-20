<template>
  <div class="layout-col">
    <!-- 标题 -->
	<div class="h40 ww100 flex-sc relative mb5">
		<img class="hh100" src="@/assets/imgs/title.png" />
		<div class="ww100 hh100 flex-sc absolute pl35">
			<span class="fw flex1 ptb5">当日负荷运行情况</span>
			<div class="flex-ec flex1"></div>
		</div>
	</div>
    <!-- 内容 -->
    <div class="layout-col p20 ba1">
      <div class="hh100 ww100" id="Line_loadData"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import ec from "@/utils/chart";
  const { drawChart } = ec();
  const { proxy }: any = getCurrentInstance();
  const publicStore = proxy.publicStore();
  const configStore = proxy.configStore();
  const state = reactive({
    ...publicStore.$state,
  });

  watch(() => publicStore._public.loadData, async (val, old) => {
    if(proxy.isNull(val)) return
    // if(JSON.stringify(val) == JSON.stringify(old)) return
    await nextTick();
    setChart();
  },{ immediate: false, deep: true });

	const setChart = async() => {
		let chart = 'Line'
		let id = 'Line_loadData'
		let attr = {min: 0, /*max: 100,*/ extent: 4, colorList: [], legendArr: [],legendShow: true, labelShow: false,	areaShow: true,	y_name: 'kw', tool_dw: 'kw', tool_name_x: '日期：', tool_name_y: '数值：'}
		let data = publicStore._public.loadData
		let series = {data: []}
		series = data.map(v => {
			attr.legendArr.push(v.name)
			let data = [...v.data]
			return {data}
		})
		drawChart(chart, id, attr, {series: series}, {});
	}
</script>

<style scoped lang="scss">

</style>
