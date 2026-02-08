<template>
  <div class="topclass">
    <el-dialog modal-class="topclass" v-model="state.isFalse" :title="state.active.name" :before-close="onVisable" :draggable="true" width="62%">
      <div class="ww100 h100x5 flex-bc white">
        <div class="flex1 layout-col">
          <!-- 搜索 -->
          <div class="ww100 flex-bc plr15 pb15">
            <div class="flex-sc"></div>
            <div class="flex-ec cursor flex1">
              <!-- <div class="ml15 mr10">查询设备</div>
              <div class="flex w50x4">
                <el-select v-model="state.sensor_id" placeholder="请选择" style="width: 100%" clearable filterable>
                  <el-option label="全部" value="" />
                  <el-option v-for="(v, i) in state.device_id?state.sensorList.filter(a=>a.parent_id==state.device_id):state.sensorList" :key="v.id" :label="v.name" :value="v.id" />
                </el-select>
              </div> -->
              <div class="ml15 mr10">结果状态</div>
              <div class="flex w50x2">
                <el-select v-model="state.res_type" placeholder="请选择" style="width: 100%" clearable filterable>
                  <el-option label="全部" value="" />
                  <el-option v-for="(v, i) in res" :key="v.value" :label="v.name" :value="v.value" />
                </el-select>
              </div>
              <div class="ml15 mr10">时间范围</div>
              <div class="flex w50x8">
                <el-date-picker v-model="state.datetime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
                  type="datetimerange" range-separator="-" start-placeholder="开始时间" end-placeholder="结束时间" />
              </div>
              <el-button class="rad4 ptb5 plr12 flex-cc cursor bgi22 i21 ml10 bo-i21-1 ml15" @click.stop="state.page = 1; init()" :icon="Search">搜索</el-button>
              <el-button class="rad4 ptb5 plr12 flex-cc cursor bgi22 i21 ml10 bo-i21-1" @click.stop="exports()" :icon="Filter">导出</el-button>
            </div>
          </div> 
          <div class="layout-col plr15 pb15">
            <div class="layout-col ba1">
              <div class="table">
                <div class="row bgi22 mb1">
                  <div :style="{textAlign: v.align}" v-for="(v, i) in state.content" :key="i" v-show="v.show" :class="typeof(v.key) == 'object'?v.width +' '+ 'mlr5':v.width">{{v.name}}</div>
                </div>
                <div class="ww100 flex-col" v-for="(items, indexs) in state.list" :key="indexs">
                  <!-- <div class="ww100 flex-sc fw i21 ptb12 plr20 mb1">
                    <span>操作时间：</span>
                    <span>{{parseTime(items.startTime)}}</span>
                  </div> -->
                  <div class="ww100 flex-col" :class="indexs%2 == 1?'bgi23':'bgi18'">
                    <div class="table">
                      <div class="row" v-for="(item, index) in items.list" :key="index" @click="handleClick('active', item)">
                        <div v-show="v.show" :class="v.width" :style="{textAlign: v.align}" v-for="(v, i) in state.content" :key="i">
                          <span v-if="typeof(v.key) == 'object'" class="cursor mlr5" :class="kk=='add'||state.auth[kk] == false?'none':kk=='del'?'i8':'i21'" 
                          v-for="(vv, kk, ii) in v.key" :key="ii" @click.stop="handleClick(kk, item)">{{vv}}</span>            
                          <span v-else-if="v.key=='*'">{{(state.page-1)*state.limit + index+1}}</span>
                          <span v-else-if="v.type == 'time'">{{item[v.key] == 0?'/':parseTime(item[v.key])}}</span>
                          <span v-else-if="v.type == 'select'" :class="find(v.list, [v.value, item[v.key]], 'color')?find(v.list, [v.value, item[v.key]], 'color'):''">
                            {{find(v.list, [v.value, item[v.key]], v.label)}}
                          </span>
                          <span v-else-if="v.type == 'switch'">
                            <el-switch v-model="item[v.key]" :active-text="v.value[1].name" :inactive-text="v.value[0].name" :active-value="v.value[1].value" :inactive-value="v.value[0].value" inline-prompt @change="handleClick('switch', item)"></el-switch>
                          </span>
                          <span v-else-if="v.type == 'input'"><el-input v-model="item[v.value]" placeholder="请输入" style="width: 150px;" size="small" /></span>
                          <span v-else-if="v.type == 'preload'">{{item[v.filed]}}</span>
                          <span v-else>{{isNull(item[v.key]) && v.key!=''? '/' : item[v.key]}}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-if="state.empty" class="flex-cc ww100 tc ptb13 bgi18">没有数据</div>
              </div>
              <Pagination class="plr20" v-show="state.total>0" :total="state.total" v-model:page.sync="state.page" v-model:limit.sync="state.limit" @pagination="init" />
            </div>
          </div> 
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
  import axios from 'axios'
  import api from '../api'
  const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  let res = $ref([
    {name:"失败0",  value:"0", color: 'i8'},
    {name:"成功", value:"1", color: 'i11'},
    {name:"失败2", value:"2", color: 'i8'}, 
    {name:"失败3", value:"3", color: 'i8'}, 
  ])
  const state = reactive({
	  ...publicStore.$state,
    content: [
      { width: 'w70',   show: true, align: 'center', key: '*', name: '序号' },
      // { width: 'w50x3', show: true, align: 'left', key: 'sensor_name', name: '设备名称' },
      { width: 'w50x2', show: true, align: 'left', key: 'userName', name: '操作人员' },
      { width: 'w50x3', show: true, align: 'left', key: 'code_name', name: '控制名称' },
      { width: 'w50x3', show: true, align: 'left', key: 'action_name', name: '动作名称' },
      { width: 'w50x6', show: true, align: 'left', key: 'orther', name: '操作详情' },
      { width: 'w50x4', show: true, align: 'left', key: 'startTime', name: '操作时间', type: 'time' },
      { width: 'w50x4', show: true, align: 'left', key: 'endTime', name: '操作结束', type: 'time' },
      { width: 'w50x2', show: true, align: 'left', key: 'result', name: '结果', type: 'select', list: res, value: 'value', label: 'name' },
      // { width: 'w50x4', show: true, align: 'left', key: 'type', name: '类型' }, 
      // { width: 'w50x4', show: true, align: 'left', key: 'order', name: '排序' }, 
    ],
  })

  const props = defineProps({
    state: {
      type: [Object, Array],
      default: ()=>{return {}}
    },
  })

  const onVisable = async (val?: any) => {
    state.isFalse = !state.isFalse
    if(!state.isFalse) return state.datetime = ""
    state.active = Object.assign({}, val)
    init()
  }

  watch(() => state.datetime, async(val, old) => {
    console.log("val---", val)
    init()
  }, { immediate: false, deep: true });

  const init = async(key?: any) => {
    let args = `sensor_id='${state.active.id}' and `
    if(state.res_type) args += `result='${state.res_type}' and `
    if(!proxy.isNull(state.datetime)){
      let start = Date.parse(state.datetime[0]) + ''
      let end = Date.parse(state.datetime[1]) + ''
      args += `startTime>='${start}' and startTime<='${end}' and `
    }
    let q1 = {limit: state.limit, page: state.page}
    let q2 = {field: `COUNT(*)`}
    let qs = args? {model: `t_sensor_control_log`, args: args.slice(0, -4), order: 'startTime desc'} : {model: `t_sensor_control_log`, order: 'startTime desc'}
    let query1 = {}
    let query2 = {}
    Object.assign(query1, qs, q1)
    Object.assign(query2, qs, q2)
    state.parmas = {Api1: query1, Api2: query2}
    let res = await publicStore.http(state.parmas)
    state.total = proxy.isNull(res.Api2)? 0 : res.Api2[0]['COUNT(*)']
    state.empty = proxy.isNull(res.Api1)? true : false
    let listRes = proxy.isNull(res.Api1)? [] : res.Api1
    let list = []
    listRes.forEach(v => {
      v.userName = v.userName?proxy.decrypt(v.userName):''
      let data = list.find(a=>a.startTime == v.startTime)
      if(data){
        data.list.push(v)
      }else{
        list.push({startTime: v.startTime, list: [v]})
      }
    })
    state.list = list
    console.log("state.list --- ", state.list )
  }

  const handleClick = (remark, val) => {
    if(remark == 'add' || remark == 'upd'){
      addRef.onVisable(val)
    }
    if(remark == 'child'){
      let vall = proxy.varObj(state.parent, val[state.key])
      addRef.onVisable(vall)
    }
    if(remark == 'del'){
      addRef.del(val)
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
      if(j=="startTime" || j=="endTime"){
        return v[j]&&v[j]!='0'? proxy.parseTime(v[j]) : ''
      }else if(j=="result"){
        return proxy.find(res, ['value', v[j]], 'name')
      }else{
        return v[j]
      }
    }))
  }

  // 暴露给父组件
  defineExpose({
    onVisable
  })
</script>

<style scoped lang="scss">
// :deep(.el-dialog__body){
//   padding: 0;
// }
</style>
