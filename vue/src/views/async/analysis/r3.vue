<template>
  <div class="layout-col">
    <!-- 标题 -->
    <div class="h40 ww100 flex-sc relative mb10">
      <img class="hh100" src="@/assets/imgs/title.png" />
      <div class="ww100 hh100 flex-sc absolute pl35">
        <span class="fw flex1 ptb5">今日采集</span>
        <div class="flex-ec flex1"></div>
      </div>
    </div>
    <!-- 内容 -->
    <div class="layout-col ba1">
        <div class="row bgi22">
          <div :style="{textAlign: v.align}" v-for="(v, i) in state.content" :key="i" v-show="v.show" :class="typeof(v.key) == 'object'?v.width +' '+ 'mlr5':v.width">
            <span v-if="v.name">{{v.name}}</span>
            <div v-else class="w16 h16 rad2 m-auto cursor flex-cc" :class="state.click?'bgi21 white':'bg-white'" @click.stop="handleClick('selectAll', item)">
              <i-ep-select v-if="state.click" class="f10" />
            </div>
          </div>
        </div>
        <div class="table">
          <div class="row" :class="index%2 == 1?'bgi23':'bgi18'" v-for="(item, index) in state.list" :key="index" @click.stop="handleClick('active', item)">
            <div v-show="v.show" :class="v.width" :style="{textAlign: v.align}" v-for="(v, i) in state.content" :key="i">
              <span v-if="typeof(v.key) == 'object'" class="i21 cursor mlr5" :class="kk=='add'?'none':kk=='deal'&&item['clear_type']!=0?'none':''" v-for="(vv, kk, ii) in v.key" :key="ii" @click.stop="handleClick(kk, item)">{{vv}}</span>
              <div v-else-if="v.key=='-'" class="w16 h16 rad2 m-auto cursor flex-cc" :class="item['click']?'bgi21 white':'bg-white'" @click.stop="handleClick('active', item)">
                <i-ep-select v-if="item['click']" class="f10" />
              </div>
              <span v-else-if="v.key=='*'">{{(state.page-1)*state.limit + index+1}}</span>
              <span v-else-if="v.type == 'time'">{{item[v.key] == 0?'/':parseTime(item[v.key])}}</span>
              <span v-else-if="v.type == 'find'" :class="find(v.value[0], [v.value[1], item[v.key]], 'color')?find(v.value[0], [v.value[1], item[v.key]], 'color'):''">
                {{find(v.value[0], [v.value[1], item[v.key]], v.value[2])}}
              </span>
              <span v-else-if="v.type == 'range'" :class="findRange(v.value[0], [v.value[1], item[v.key]], 'color')?findRange(v.value[0], [v.value[1], item[v.key]], 'color'):''">
                {{findRange(v.value[0], [v.value[1], item[v.key]], v.value[2])}}
              </span>
              <span v-else-if="v.type == 'switch'">
                <el-switch v-model="item[v.key]" :active-text="v.value[1].name" :inactive-text="v.value[0].name" :active-value="v.value[1].value" :inactive-value="v.value[0].value" inline-prompt @change="handleClick('switch', item)"></el-switch>
              </span>
              <span v-else-if="v.type == 'input'"><el-input v-model="item[v.value]" placeholder="请输入" style="width: 150px;" size="small" /></span>
              <span v-else>{{isNull(item[v.key]) && v.key!=''? '/' : item[v.key]}}</span>
            </div>
          </div>
          <div v-if="state.empty" class="flex-cc ww100 tc ptb13 bgi18">没有数据</div>
        </div>
      
    </div>
  </div>
</template>

<script lang="ts" setup>
  const { proxy }: any = getCurrentInstance();
  const publicStore = proxy.publicStore();
  const configStore = proxy.configStore();
  const state = reactive({
    ...publicStore.$state,
    content: [
      { width: 'w70',   show: true, align: 'center', key: '*', name: '序号' },
      { width: 'w50x4', show: true, align: 'left',  key: 'timestamp', name: '采集时间', type: 'time' },
      { width: 'w50x3', show: true, align: 'left',  key: 'measurement_code', name: '采集类型', type: 'find', value: [[], 'code', 'name'] },
      { width: 'flex1', show: true, align: 'left',  key: 'value', name: '数据'},
    ],
  });

	onMounted(async() => {
    await getMea()
    getToday()
		init()
	})

	const getMea = async() => {
	  let query = {model: "t_sensor_template_measure_point"}
    let res = await publicStore.http({Api: query})
		publicStore._public.meas = proxy.isNull(res)? [] : res
    state.content.forEach(v => {
      if(v.key == 'measurement_code') v.value[0] = publicStore._public.meas
    })
	}

	const getToday = () => {
		const today = new Date();
		const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
		const endTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
		state.start = startTime.getTime();
		state.end = endTime.getTime();
	}

	const init= async() => {
		let query1 = {model: `t_sensor_measure_float`, args: `timestamp>='${state.start}' and timestamp<='${state.end}'`}
    let query2 = {model: `t_sensor_measure_int`, args: `timestamp>='${state.start}' and timestamp<='${state.end}'`}
    let res = await publicStore.http({Api1: query1, Api2: query2})
    let list1 = proxy.isNull(res.Api1)? [] : res.Api1
    let list2 = proxy.isNull(res.Api2)? [] : res.Api2
		let list = [...list1, ...list2]
    state.list = list.sort((a, b) => a.timestamp - b.timestamp).slice(0, 10)
    state.empty = proxy.isNull(state.list)? true : false
    console.log("state.list---", state.list)
	}
</script>

<style scoped lang="scss">

</style>
