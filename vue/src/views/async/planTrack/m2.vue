<template>
  <div class="layout-row">
    <div class="flex3 hh100 hidden flex-ss warp">
      <div class="ww50 hh50 hidden p10">
        <div class="ww100 hh100 flex-col rad5 hidden p15 bgi16">
          <div class="fw mb10">更新项目推讲时序图</div>
          <div class="ww100 hh100 bg-white rad5"></div>
        </div>
      </div>
      <div class="ww50 hh50 hidden p10">
        <div class="ww100 hh100 flex-col rad5 hidden p15 bgi16">
          <div class="fw mb10">规划目标完成图</div>
          <div class="ww100 hh100 bg-white rad5"></div>
        </div>
      </div>
      <div class="ww50 hh50 hidden p10">
        <div class="ww100 hh100 flex-col rad5 hidden p15 bgi16">
          <div class="fw mb10">规划审核通过率排行榜</div>
          <div class="ww100 hh100 bg-white rad5"></div>
        </div>
      </div>
      <div class="ww50 hh50 hidden p10">
        <!-- <div class="ww100 hh100 flex-col rad5 hidden p15 bgi16">
          <div class="fw mb10">更新项目推讲时序图</div>
          <div class="ww100 hh100 bg-white rad5"></div>
        </div> -->
      </div>
    </div>
    <div class="flex2 hh100 hidden flex-col ml15 rad5 p15 bgi16">
      <!-- 标题 -->
      <div class="fw mb10">数据清单</div>
      <!-- 内容 -->
      <List @handleClick="handleClick" :state="state"/>
      <Pagination class="" style="padding-bottom: 0;" v-show="state.total>0" :total="state.total" v-model:page.sync="state.page" v-model:limit.sync="state.limit" @pagination="init" />
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
    content: [
      { width: 'w60',   show: true, align: 'center', key: '*', name: '序号' },
      { width: 'w50x3', show: true, align: 'center', key: 'name', name: '项目名称' }, 
      { width: 'w50x3', show: true, align: 'center', key: 'stage', name: '项目阶段' },
      { width: 'w50x3', show: true, align: 'center', key: 'area', name: '项目地区' }, 
      { width: 'w50x3', show: true, align: 'center', key: 'construct_scale', name: '项目规模' },
      { width: 'flex1', show: true, align: 'right', key: {detail: '详情', position: '定位'}, name: '操作' },
    ],
  })

  watch(() => publicStore.actIndex, async(val) => {
    if(proxy.isNull(val)) return
    await nextTick()
    init()
  }, {immediate: false, deep: true})

  const init = async() => {
    let query = {model: 't_scheme_project', args: `province='${publicStore.actIndex}'`}
  }

  watch(() => state.percent, async (val, old) => {
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

  watch(() => state.responses, async(val, old) => {
    // if(proxy.isNull(val)) return
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
  