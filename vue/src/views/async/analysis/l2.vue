<template>
  <div class="layout-col">
    <!-- 标题 -->
    <div class="h40 ww100 flex-sc relative mb5">
      <img class="hh100" src="@/assets/imgs/title3.png" />
      <div class="ww100 hh100 flex-sc absolute pl35">
        <span class="fw ptb5">工况预测</span>
        <div class="flex-ec flex1">
        </div>
      </div>
    </div>
    <!-- 内容 -->
    <div class="flex1 hh100 flex-col p20 ba1">
      <div class="hh100 ww100" id="Line_offline"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import ec from "@/utils/chart";
  const { drawChart } = ec();
  const { proxy }:any = getCurrentInstance()
  const configStore = proxy.configStore()
  const publicStore = proxy.publicStore()
  const dictStore = proxy.dictStore()
  const state = reactive({
	  ...publicStore.$state,
  })

	onMounted(async() => {
		setTimeout(() => {
      init()
    }, 100);
	})

  const init = async(key) => {
    let data = [
      ['2025-05-10', 20],
      ['2025-05-11', 12],
      ['2025-05-12', 12],
      ['2025-05-13', 18],
      ['2025-05-14', 14],
      ['2025-05-15', 10],
    ]
    state.lines = [
      {name: '工况预测', data: data}
    ]
  }

  watch(() => state.lines, async(val, old) => {
    if(proxy.isNull(val)) return
    if(JSON.stringify(val) == JSON.stringify(old)) return
    await nextTick();
    setChart(val);
  }, { immediate: false, deep: true });

	const setChart = async(data) => {
		let chart = 'Line'
		let id = 'Line_offline'
		let attr = {
			min: 0, 
			// max: 100,
			extent: 4, 
			colorList: [{color: '#60E7FF', start: 'rgba(96, 231, 255, 1)', end: 'rgba(96, 231, 255, 0)'}],
			legendArr: [],
			legendShow: true,
			labelShow: false,
			areaShow: true,
			y_name: '数值',
			tool_dw: '', 
			tool_name_x: '日期：', 
			tool_name_y: '数值：', 
		}
		let series = {data: []}
		series = data.map(v => {
			attr.legendArr.push(v.name)
			let data = v.data
			return {data}
		})
		drawChart(chart, id, attr, {series: series, xAxis: {}}, {});
	}
</script>
 
<style scoped lang="scss">

</style>

