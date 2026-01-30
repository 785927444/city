<template>
  <div class="layout-col">
    <!-- 体检诊断情况情况 -->
    <div class="ww100 bg-white rad8 p15 mb15">
      <div class="c9 f16 fw mb10">体检诊断情况情况</div>
      <div class="ww100 flex-bc i2 f12">
        <div class="flex1 flex-col-cs">
          <span>共<span class="mlr4 i1 fw f20">{{ publicStore._public?.data1?.sum ?? '0' }}</span>地市</span>
          <span class="mt10">共<span class="mlr4 i1 fw f20">1</span>地市完成体检</span>
        </div>
        <div class="w90 h90 bg-white bo-i1-8 rad50 p8 relative">
          <div class="absolute-cc z1">
            <div class="w60 h60" id="Liquidfill_liqu"></div> 
          </div>
        </div>
        <div class="flex1 flex-col-ce">
          <span>共<span class="mlr4 i1 fw f20">{{ publicStore._public?.data1?.sum ?? '0' }}</span>区县</span>
          <span class="mt10">共<span class="mlr4 i1 fw f20">{{ publicStore._public?.data1?.sum ?? '0' }}</span>去向完成体检</span>
        </div>
      </div>
    </div>
    <!-- 规划内容 -->
    <div class="layout-col bg-white rad8 p15">
      <div class="c9 f16 fw mb10">体检诊断情况情况</div>
      <div class="hh100 ww100" id="Bar_responses"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import ec from "@/utils/chart"
  const { drawChart } = ec()
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const state = reactive({
	  ...publicStore.$state,
  })

  onMounted(async() => {
    await getInit()
    init()
  })

  const getInit = async() => {}

  const init = async(key) => {
    // setTimeout(() => {
    //   state.percent = 0.5
    //   state.responses = [
    //     {name: '片区数量',   data: [['太原六城区','10'],['太原','2'],['六城区','3']]}, 
    //     {name: '实施中项目', data: [['太原六城区','20'],['太原','2'],['六城区','3']]},
    //     {name: '项目数量',   data: [['太原六城区','30'],['太原','2'],['六城区','3']]},
    //   ]
    // }, 50)
  }

  watch(() => publicStore._public.percent, async (val, old) => {
    if(proxy.isNull(val)) return
    if(JSON.stringify(val) == JSON.stringify(old)) return
    await nextTick()
    let data = {name: '比例', status: 1, value: val}
    setChart1(JSON.parse(JSON.stringify(data)))
  },{ immediate: false, deep: true })

  const setChart1 = async(data) => {
    let chart = 'Liquidfill'
    let id = 'Liquidfill_liqu'
    let params = {
        colorList: [],
        radius: ['78%', '60%'],
        labelShow: true,
    }
    drawChart(chart, id, {}, data, params)
	}

  watch(() => publicStore._public.responses, async(val, old) => {
    if(proxy.isNull(val)) return
    if(JSON.stringify(val) == JSON.stringify(old)) return
    await nextTick();
    setChart2(val);
  }, { immediate: false, deep: true });

	const setChart2 = async(data) => {
		let chart = 'Barsx'
		let id = 'Bar_responses'
    let attr = {
			min: 0,
			// max: 100,
			colorList: [],
			legendArr: [],
			legendX: 'center',
			legendShow: true,
			labelShow: true,
			areaShow: false,
      smooth: true,
      tooltip: true,
			y_name: '数量',
			tool_name_x: '地区：',
			tool_name_y: '数值：',
		}
	  let series = {data: []}
		series = data.map(v => {
			attr.legendArr.push(v.name)
			// 横向柱状图：数据格式需要是 [[数值, 类别名]]
			let data = v.data.map(item => [Number(item[1]), item[0]])
      if(v.data.length>20) attr.symbol = true
			return {data}
		})
		drawChart(chart, id, attr, {series: series}, {});
	}

  
  const handleClick = async(remark, val) => {
    if(remark == 'add' || remark == 'upd'){
      addRef.onVisable(val)
    }
    if(remark == 'del'){
      addRef.del(val)
    }
  }

</script>
  
<style scoped lang="scss">

</style>
  