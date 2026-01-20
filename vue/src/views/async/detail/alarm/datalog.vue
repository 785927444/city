<template>
  <div class="layout-col">
    <!-- 标题 -->
    <div class="ww100 flex-bc pl5 pr15 i15 ba1 mb4">  
        <span class="flex-sc h46 f16"><img class="w30" src="@/assets/imgs/title-dot.png"/><span>告警记录</span></span>
        <span class="flex-sc ml20">
          <div class="ml15 mr10">处理状态</div>
          <div class="flex w50x3">
            <el-select v-model="state.clear_type" placeholder="请选择" style="width: 100%" clearable filterable>
              <el-option label="全部" value="" />
              <el-option v-for="(v, i) in logType" :key="v.value" :label="v.name" :value="v.value" />
            </el-select>
          </div>
          <el-button class="rad4 ptb5 plr8 flex-cc cursor bgi22 i21 ml10 bo-i21-1 ml15" @click.stop="state.page = 1; init()" :icon="Search">搜索</el-button>
          <el-button class="rad4 ptb5 plr8 flex-cc cursor bgi22 i21 ml10 bo-i21-1" @click.stop="exports()" :icon="Filter">导出</el-button>
          <el-button class="rad4 ptb5 plr8 flex-cc cursor bgi22 i21 ml10 bo-i21-1" @click.stop="handleClick('deals')" :icon="Edit">批量处理</el-button>
        </span>
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
      <Pagination class="plr20" v-show="state.total>0" :layout="state.layout" :total="state.total" v-model:page.sync="state.page" v-model:limit.sync="state.limit" @pagination="init" />
      <Deal @init="init" title="告警处理" ref="exposeRef" />
      <!-- <Alarm @init="init" title="告警分析" ref="alarmRef" /> -->
      <!-- <AlarmView ref="alarmViewRef" /> -->
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { Refresh, Search, Filter, Connection, Edit, Operation } from '@element-plus/icons-vue'
  const { proxy }: any = getCurrentInstance();
  const publicStore = proxy.publicStore();
  const configStore = proxy.configStore();
  let logType = $ref([
    {value: '0', name: '未处理',   color: 'i21'},
    {value: '1', name: '已处理',   color: 'i8'},
    {value: '2', name: '自动消除', color: 'ca'},
  ])
  const state = reactive({
    ...publicStore.$state,
    content: [
      { width: 'w50',   show: true, align: 'center', key: '-', name: '' },
      // { width: 'w70',   show: true, align: 'center', key: '*', name: '序号' },
      { width: 'w50x4', show: true, align: 'left',  key: 'alarm_time', name: '时间', type: 'time' },
      { width: 'w80', show: true, align: 'left',  key: 'activation_count', name: '次数' },
      { width: 'w50x3', show: true, align: 'left',  key: 'alarm_name', name: '类型' },
      { width: 'w80', show: true, align: 'left',  key: 'clear_type', name: '状态', type: 'find', value: [logType, 'value', 'name'] },
      { width: 'flex1', show: true, align: 'right', key: {deal: '处理'},  name: '操作' },
    ],
    clear_type: '',
    click: false,
    clickArr: [],
    model: 't_sensor_alarm_log',
    layout: 'total, prev, next',
    // page: 10
  });
  let exposeRef = $ref()
  let alarmRef = $ref()
  let alarmViewRef = $ref()

  watch(() => publicStore.active, async(val, old) => {
    if(proxy.isNull(val)) return
    if(JSON.stringify(val) == JSON.stringify(old)) return
    await nextTick();
    if(!proxy.isNull(state.list)) state.list = []
  }, { immediate: false, deep: true });

  watch(() => publicStore.model, async(val, old) => {
    if(JSON.stringify(val) == JSON.stringify(old)) return
    await nextTick();
    init() 
  }, { immediate: false, deep: true });

  const init = async () => {
    let args = `sensor_id='${publicStore.active.id}' and `
    if(!proxy.isNull(publicStore.datetime)){
      let start = Date.parse(publicStore.datetime[0]) + ''
      let end = Date.parse(publicStore.datetime[1]) + ''
      args = `sensor_id='${publicStore.active.id}' and alarm_time>='${start}' and alarm_time<='${end}' and `
    }
    if(state.clear_type) args += `clear_type='${state.clear_type}' and `
    let q1 = {limit: state.limit, page: state.page}
    let q2 = {field: `COUNT(*)`}
    let qs = args? {model: `t_sensor_alarm_log`, args: args.slice(0, -4), order: 'clear_type asc, alarm_time desc'} : {model: `t_sensor_alarm_log`, order: 'clear_type asc, alarm_time desc'}
    let query1 = {}
    let query2 = {}
    Object.assign(query1, qs, q1)
    Object.assign(query2, qs, q2)
    state.parmas = {Api1: query1, Api2: query2}
    let res = await publicStore.http(state.parmas)
    state.empty = proxy.isNull(res.Api1)? true : false
    state.list = proxy.isNull(res.Api1)? [] : res.Api1
    state.total = proxy.isNull(res.Api2)? 0 : res.Api2[0]['COUNT(*)']
  }

  const handleClick = (remark, val) => {
    if(remark == 'deal'){
      exposeRef.onVisable(val)
    }
    if(remark == 'deals'){
      if (state.clickArr.length == 0) return ElNotification({ title: '提示', message: '至少选中一条', type: 'error' })
      exposeRef.onVisable(state.clickArr)
    }
    // if(remark == 'viewdata'){
    //   alarmRef.onVisable(val)
    // }
    if(remark == 'active'){
      let clickIndex = state.clickArr.findIndex(a=>a[state.key] == val[state.key])
      if(clickIndex != -1){
        val.click = false
        state.clickArr.splice(clickIndex, 1)
      }else{
        if(val.clear_type == '0'){
          val.click = true
          state.clickArr.push(val)
        }
      }
    }
    if(remark == 'selectAll'){
      let clickIndex = state.list.findIndex(a=>{ return a['click'] })
      if(clickIndex == -1){
        state.click = true
        state.list.forEach(item => {
          if(item.clear_type == '0') {
            item.click = true
            state.clickArr.push(item)
          }
        })
      }else{
        state.click = false
        state.clickArr = []
        state.list.forEach(item => {delete item['click']})
      }
    }
    if(remark == 'view'){
      alarmViewRef.onVisable(val)
    }
  }

  const exports = async() => {
    let query = Object.assign({}, state.parmas.Api1)
    delete query.limit
    delete query.page
    let tempData = await publicStore.http({Api: query})
    import('@/utils/Export2Excel').then(async excel => {
      const tHeader   = []
      const filterVal = []
      state.content.forEach(item => {
        if(item.show && item.key != '-' && item.key != '*' && typeof(item.key) != 'object'){
          tHeader.push(item.name)
          filterVal.push(item.key)
        }
      })
      const data = formatJsons(filterVal, tempData)
      excel.export_json_to_excel({
        header: tHeader,
        data,
        filename: proxy.parseTime(new Date()) + '导出'
      })
    })
  }

  const formatJsons = (filterVal, data) => {
    let list = data? data : state.list
    return list.map(v => filterVal.map(j => {
      if(j=="alarm_time" || j=="clear_time"){
        return v[j]&&v[j]!='0'? proxy.parseTime(v[j]) : ''
      }else if(j=="clear_type"){
        return proxy.find(logType, ['value', v[j]], 'name')
      }else{
        return v[j]
      }
    }))
  }
</script>

<style scoped lang="scss">

</style>
