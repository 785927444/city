<template>
  <div class="layout-col flex4 ml16">
    <!-- 标题 -->
    <div class="h40 ww100 flex-sc relative mb5">
      <img class="hh100" src="@/assets/imgs/title4.png" />
      <div class="ww100 hh100 flex-sc absolute pl35">
        <span class="fw ptb5">数据 - {{!isNull(publicStore.active)?publicStore.active.name:''}}</span>
        <div class="flex-ec flex1">
          <div class="flex-sc ml20">
            <span class="plr10">时间</span>
            <span class="w50x8">
              <el-date-picker style="width:100%" v-model="state.datetime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
                type="datetimerange" range-separator="-" start-placeholder="开始时间" end-placeholder="结束时间" @change="init()" />
            </span>
          </div>
          <div class="flex-sc ml20">
            <span class="plr10">查询</span>
            <span class="w50x4">
              <el-select v-model="state.code" placeholder="请选择" style="width:100%" filterable @change="state.value_type = find(state.meas, ['code', state.code], 'value_type'); state.name = find(state.meas, ['code', state.code], 'name'); init()">
                <el-option v-for="(v, i) in state.meas" :key="v.code" :value="String(v.code)" :label="v.name" />
              </el-select>
            </span>
          </div>
          <div class="rad4 ptb5 plr8 flex-cc cursor bgi22 i21 ml10 bo-i21-1" 
            v-if="publicStore.active.class=='3'&&state.content.find(v=>{return typeof(v.key) == 'object'}) && state.content.find(v=>{return typeof(v.key) == 'object'})['key'].hasOwnProperty('add')" 
            @click.stop="handleClick('add', state.addItem)">
            <i-ep-plus class="f12 fw" /><span class="f14 ml4">{{state.content.find(v=>{return typeof(v.key) == 'object'})['key'].add}}</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 内容 -->
    <div class="row bgi22">
      <div :style="{textAlign: v.align}" v-for="(v, i) in state.content" :key="i" v-show="v.show" :class="typeof(v.key) == 'object'?v.width +' '+ 'mlr5':v.width">{{v.name}}</div>
    </div>
    <div class="layout-col hh100 bss">
      <div class="flex2 ww100 flex-col hidden">
        <div class="table">
          <div class="row cursor" :class="publicStore.active[state.key] == item[state.key]?'active':index%2 == 1?'bgi23':'bgi18'" v-for="(item, index) in state.list" :key="index" @click="handleClick('active', item)">
            <div v-show="v.show" :class="v.width" :style="{textAlign: v.align}" v-for="(v, i) in state.content" :key="i">
              <span v-if="typeof(v.key) == 'object'" class="i21 cursor mlr5" :class="kk=='add'||state.auth[kk] == false?'none':''" v-for="(vv, kk, ii) in v.key" :key="ii" @click.stop="handleClick(kk, item)">{{vv}}</span>
              <span v-else-if="v.key=='*'">{{(state.page-1)*state.limit + index+1}}</span>
              <span v-else-if="v.type == 'time'">{{item[v.key] == 0?'/':parseTime(item[v.key])}}</span>
              <span v-else-if="v.type == 'select'" :class="find(v.list, [v.value, item[v.key]], 'color')?find(v.list, [v.value, item[v.key]], 'color'):''">
                {{find(v.list, [v.value, item[v.key]], v.label)}}
              </span>
              <span v-else-if="v.type == 'switch'">
                <el-switch v-model="item[v.key]" :active-text="v.value[1].name" :inactive-text="v.value[0].name" :active-value="v.value[1].value" :inactive-value="v.value[0].value" inline-prompt @change="handleClick('switch', item)"></el-switch>
              </span>
              <span v-else-if="v.type == 'input'"><el-input v-model="item[v.value]" placeholder="请输入" style="width: 150px;" size="small" /></span>
              <span v-else-if="v.type == 'image'" class="flex-sc warp">
                <div class="flex-sc">
                  <el-image class="w25 h25 m2 rad3 cursor" v-if="item[v.key].length!=0" :src="item[v.key]" :preview-src-list="state.srcList" @click.stop="state.srcList= [];state.srcList.push(item[v.key])" />
                  <span class="w50 h25 ca flex-sc" v-else>暂无</span>
                </div>
              </span>
              <span v-else>{{isNull(item[v.key]) && v.key!=''? '/' : item[v.key]}}</span>
            </div>
          </div>
          <div v-if="state.empty" class="flex-cc ww100 tc ptb13 bgi18">没有数据</div>
        </div>
        <Pagination class="plr20 bgi22" v-show="state.total>0" :total="state.total" v-model:page.sync="state.page" v-model:limit.sync="state.limit" @pagination="init" />
      </div>
      <div class="flex1 hh100 flex-col p20">
        <div class="hh100 ww100" id="Line_meas"></div>
      </div>
    </div>
    <Add @init="init" :state="state" ref="addRef" />
  </div>
</template>

<script lang="ts" setup>
  import ec from "@/utils/chart";
  const { drawChart } = ec();
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  let addRef = $ref()
  const state = reactive({
	  ...publicStore.$state,
    content: [
      { width: 'w70',   show: true, align: 'center', key: '*', name: '序号' },
      { width: 'w50x8', show: true, align: 'left', key: 'timestamp', name: '采样时间', type: 'time' },  
      { width: 'w50x8', show: true, align: 'left', key: 'value', name: '采样值' },
    ],
    page: 1,
    limit: 10,
  })

  watch(() => publicStore.active, async(val) => {
    if(proxy.isNull(val)) return
    await nextTick()
    await getMeas()
    init()
  }, {immediate: false, deep: true})

  const getMeas = async() => {
    let query = {model: "t_sensor_template_measure_point", args: `sensor_type='${publicStore.active.type}'`}
    let res = await publicStore.http({Api: query})
    state.meas = proxy.isNull(res)? [] : res
    if(!proxy.isNull(state.meas)) {
      state.code = state.meas[0].code
      state.value_type = state.meas[0].value_type
      state.name = state.meas[0].name
    }
  }

  const init = async(key) => {
    let args = ''
    if(!proxy.isNull(state.datetime)){
      let start = Date.parse(state.datetime[0]) + ''
      let end = Date.parse(state.datetime[1]) + ''
      args = `sensor_id='${publicStore.active.id}' and measurement_code='${state.code}' and timestamp>='${start}' and timestamp<='${end}'`
    }else{
      args = `sensor_id='${publicStore.active.id}' and measurement_code='${state.code}'`
    }
    let q1 = {limit: state.limit, page: state.page}
    let q2 = {field: `COUNT(*)`}
    let qs = {model: `t_sensor_measure_${state.value_type}`, args: args, order: 'timestamp desc'}
    let query1 = {}
    let query2 = {}
    Object.assign(query1, qs, q1)
    Object.assign(query2, qs, q2)
    let res = await publicStore.http({Api1: query1, Api2: query2})
    state.empty = proxy.isNull(res.Api1)? true : false
    state.list = proxy.isNull(res.Api1)? [] : res.Api1
    state.total = proxy.isNull(res.Api2)? 0 : res.Api2[0]['COUNT(*)']
    let meaChart = {name: state.name, data: []}
    state.list.forEach(v => {
      let x = proxy.parseTime(v.timestamp, '{m}-{d} {h}:{i}:{s}')
      meaChart.data.unshift([x, v.value])
    })
    state.meaChart = [meaChart]
  }

  watch(() => state.meaChart, async(val, old) => {
    if(state.active==2) return
    if(proxy.isNull(val)) return
    if(JSON.stringify(val) == JSON.stringify(old)) return
    await nextTick();
    setChart(val);
  }, { immediate: false, deep: true });

	const setChart = async(data) => {
		let chart = 'Line'
		let id = 'Line_meas'
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

  const handleClick = async(remark, val) => {
    if(remark == 'add' || remark == 'upd'){
      val.bayNum = publicStore.active.bayNum
      addRef.onVisable(val)
    }
    if(remark == 'del'){
      addRef.del(val)
    }
  }
</script>
  
<style scoped lang="scss">

</style>
  