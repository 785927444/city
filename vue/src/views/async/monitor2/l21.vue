<template>
  <div class="layout-col">
    <!-- 标题 -->
    <div class="h40 ww100 flex-sc relative mb10">
      <img class="hh100" src="@/assets/imgs/title.png" />
      <div class="ww100 hh100 flex-sc absolute pl35">
        <span class="fw flex1 ptb5">发电预测</span>
        <div class="flex-ec flex1 hh100">
          <div class="hh100 plr10 flex-cc cursor" :class="v.value == grain?'ba1 i21':''" @click.stop="grain = v.value; emit('getStar')" 
          v-for="(v, i) in state.grains" :key="i">{{ v.name }}</div>
        </div>
      </div>
    </div>
    <!-- 内容 -->
    <div class="layout-col p12 ba1">
      <div class="hh100 ww100" id="Line_DevicesOutputPower"></div>
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
    grains: [
      {name: '未来1天', value: 'day'},
      {name: '未来1小时', value: 'hour'},
    ]
  });

	// 父子双向绑定
  const grain = defineModel('grain')
	// 父子绑定方法
	const emit = defineEmits(['getStar']) 

  watch(() => publicStore._public.DevicesOutputPower, async(val, old) => {
    if(proxy.isNull(val)) return
    if(JSON.stringify(val) == JSON.stringify(old)) return
    await nextTick();
    setChart(val);
  }, { immediate: false, deep: true });

  const setChart = async(data) => {
    let chart = 'Line'
    let id = 'Line_DevicesOutputPower'
    let attr = {
        min: 0, 
        // max: 100,
        extent: 4, 
        colorList: [],
        legendArr: [],
        legendShow: true,
        labelShow: false,
        areaShow: true,
        y_name: 'kW',
        tool_dw: '', 
        tool_name_x: '日期：', 
        tool_name_y: '数值：', 
    }
    let datas = []
    let series = {data: []}
    series = data.map(v => {
      datas = [...datas, ...v.data]
      attr.legendArr.push(v.name)
      if(v.data.length>20) attr.symbol = true
      let data = v.data
      return {data}
    })
    let xAxis = []
    let tempDatas = datas.sort((a, b) => a[2] - b[2])
    tempDatas.forEach(v => {
      let x = xAxis.find(a=>a == v[0])
      if(!x) xAxis.push(v[0])
      if(v[1] < 0) delete attr.min
    })
    drawChart(chart, id, attr, {series: series, xAxis: {data: xAxis}}, {});
  }
</script>

<style scoped lang="scss">

</style>
