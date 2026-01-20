<template>
  <div class="layout-col">
    <!-- 标题 -->
    <div class="h40 ww100 flex-sc relative mb10">
      <img class="hh100" src="@/assets/imgs/title.png" />
      <div class="ww100 hh100 flex-sc absolute pl35">
        <span class="fw flex1 ptb5">今日设备比率</span>
        <div class="flex-ec flex1"></div>
      </div>
    </div>
    <!-- 内容 -->
    <div class="layout-row ba1 flex-bc">
      <div class="flex1 hh100 flex-col-cc tc">
        <div class="ww50 hh50"id="Liquidfill_liqu1"></div>
        <div class="i1 f20 mt15">离线率</div>
      </div>
      <div class="flex1 hh100 flex-col-cc tc">
        <div class="ww50 hh50"id="Liquidfill_liqu2"></div>
        <div class="i19 f20 mt15">告警率</div>
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

  watch(() => publicStore._public.offlineCount, async (val, old) => {
    if(proxy.isNull(val)) return
    if(JSON.stringify(val) == JSON.stringify(old)) return
    await nextTick()
    let data = {name: '离线率', status: 1, value: Math.floor((val/publicStore._public.list.length*1000))/1000}
    setChart1(JSON.parse(JSON.stringify(data)))
  },{ immediate: false, deep: true })

  watch(() => publicStore._public.alarmCount, async (val, old) => {
    if(proxy.isNull(val)) return
    if(JSON.stringify(val) == JSON.stringify(old)) return
    await nextTick()
    let data = {name: '告警率', status: 2, value: Math.floor((val/publicStore._public.list.length*1000))/1000}
    setChart2(JSON.parse(JSON.stringify(data)))
  },{ immediate: false, deep: true })

	const setChart1 = async(data) => {
    let chart = 'Liquidfill'
    let id = 'Liquidfill_liqu1'
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
    drawChart(chart, id, {}, data, params)
	}

	const setChart2 = async(data) => {
    let chart = 'Liquidfill'
    let id = 'Liquidfill_liqu2'
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
    drawChart(chart, id, {}, data, params)
	}
</script>

<style scoped lang="scss">

</style>
