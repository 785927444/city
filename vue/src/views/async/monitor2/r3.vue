<template>
  <div class="layout-col">
    <!-- 标题 -->
    <div class="h40 ww100 flex-sc relative mb10">
      <img class="hh100" src="@/assets/imgs/title.png" />
      <div class="ww100 hh100 flex-sc absolute pl35">
        <span class="fw flex1 ptb5">工况统计</span>
        <div class="flex-ec flex1"></div>
      </div>
    </div>
    <!-- 内容 -->
    <div class="layout-row ba1 flex-cc">
      <div class="flex1"></div>
      <div class="ww100 flex4 relative flex-cc">
        <img class="w50x3" src="@/assets/imgs/tt2.png" />
        <div class="absolute-cc hh100" style="width: 100%" id="Pie_lineType"></div>
        <div class="absolute-cc cursor tc f14">
          <div class="mb2 fw f18">{{state.sum?state.sum:0}}</div>
          <div >总数</div>
        </div>
      </div>
      <div class="flex-col-cs flex4 relative ml20 hh100  ptb15 overlay">
        <div class="ww100 flex-sc tl p5 cursor" v-for="(v, i) in publicStore._public.lineType" :key="i">
          <div class="w8 h8 mr8 rad100" :style="{background: v.color}"></div>
          <div class="ww55">{{v.name}}</div>
          <div class="w80">{{v.value}}</div>
          <div class="flex1">{{v.rate}}</div>
        </div>
      </div>
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
    sum: 0
  });

  watch(() => publicStore._public.lineType, async (val, old) => {
    if(proxy.isNull(val)) return
    if(JSON.stringify(val) == JSON.stringify(old)) return
    await nextTick()
    setChart(JSON.parse(JSON.stringify(val)))
  },{ immediate: false, deep: true })

	const setChart = async(data) => {
    let chart = 'Pie'
    let id = 'Pie_lineType'
    let params = {
        colorList: [],
        radius: ['78%', '60%'],
        labelShow: false,
        internalDiameterRatio: 0.8, 
        distance: 200, 
        alpha: 30, 
        pieHeight: 20, 
        opacity: 0.8
    }
    state.sum = 0
    data.forEach((item:any)=>{
        state.sum+=item.value
    })
    // state.sum = state.sum.toFixed(2);
    drawChart(chart, id, {}, data, params)
	}
</script>

<style scoped lang="scss">

</style>
