<template>
  <div class="layout-col flex1">
    <!-- 标题 -->
    <div class="h40 ww100 flex-sc relative mb5">
      <img class="hh100" src="@/assets/imgs/title2.png" />
      <div class="ww100 hh100 flex-sc absolute pl35">
        <span class="fw ptb5">设备选择</span>
        <div class="flex-ec flex1 hh100"></div>
      </div>
    </div>
    <!-- 内容 -->
    <div class="row bgi22">
      <div :style="{textAlign: v.align}" v-for="(v, i) in isNull(state.tree)?state.content1:state.content2" :key="i" v-show="v.show" :class="typeof(v.key) == 'object'?v.width +' '+ 'mlr5':v.width">{{v.name}}</div>
    </div>
    <div v-if="isNull(state.tree)" class="layout-col hh100 ba1">
      <div class="flex2 ww100 flex-col hidden">
        <div class="table">
          <div class="row cursor" :class="publicStore.active[state.key] == item[state.key]?'active':index%2 == 1?'bgi23':'bgi18'" v-for="(item, index) in !isNull(publicStore._public.sensors)?publicStore._public.sensors:[]" :key="index" @click="handleClick('active', item)">
            <div v-show="v.show" :class="v.width" :style="{textAlign: v.align}" v-for="(v, i) in state.content1" :key="i">
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
        <!-- <Pagination class="plr20" v-show="state.total>0" :layout="state.layout" :total="state.total" v-model:page.sync="state.page" v-model:limit.sync="state.limit" @pagination="init" /> -->
      </div>
    </div>
    <div v-if="!isNull(state.tree)" class="table-col ba1">
      <el-tree 
      class="ww100" 
      ref="treeRef" 
      :data="state.tree"
      :node-key="state.key" 
      :current-node-key="defaultId"
      :props="defaultProps"
      highlight-current    
      @node-click="handleNodeClick"
      empty-text="暂无数据">
        <template #default="{ node, data }">
          <span class="row">
            <div v-show="v.show" :class="v.width" :style="{textAlign: v.align}" v-for="(v, i) in state.content2" :key="i">
              <span v-if="typeof(v.key) == 'object'" class="cursor mlr5" v-for="(vv, kk, ii) in v.key" :key="ii" 
              :class="(kk=='add' || state.auth[kk] == false)?'none':kk=='del'?'i8':'i21'" @click.stop="handleClick(kk, data)">{{vv}}</span>
              <span v-else-if="v.type == 'select'" :class="find(v.list, [v.value, data[v.key]], 'color')?find(v.list, [v.value, data[v.key]], 'color'):''">
                {{find(v.list, [v.value, data[v.key]], v.label)}}
              </span>
              <span v-else-if="v.type == 'icon5'" class="flex-sc">
                <img v-if="data.parent_id == 0" class="mr5" src="@/assets/imgs/ic8.png" />
                {{data[v.key]}}
              </span>
              <span v-else>{{isNull(data[v.key]) && v.key!=''? '/' : data[v.key]}}</span>
            </div>
          </span>
        </template>
      </el-tree>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { Search } from '@element-plus/icons-vue'
	import scheduled from "@/utils/scheduled"
	const { createScheduled } = scheduled()
  const router = useRouter();
  const route = useRoute();
  const { proxy }: any = getCurrentInstance();
  const publicStore = proxy.publicStore();
  const configStore = proxy.configStore();
  const state = reactive({
    ...publicStore.$state,
    content1: [
      { width: 'w70',   show: true, align: 'center', key: '*', name: '序号' },
      { width: 'flex1', show: true, align: 'left', key: 'name', name: '名称' },  
    ],
    content2: [
      { width: 'flex1', show: true, align: 'left', key: 'name', name: '名称'},   
    ],
  });
  const defaultProps = {
    children: 'children',
    label: 'name',
  }
  let treeRef = $ref()
  let defaultId = $ref()

  // 初始化
  onMounted(async () => {
    // 路由参数
    state.route = Object.assign({}, route.query)
    // 默认编码
    if(state.route.code&&!publicStore.text) publicStore.text = state.route.code
    // 获取资源
    await getInit()
    // 实时请求
    init()
    createScheduled('datas', 5*1000, () => { if(proxy.isNull(publicStore.datetime)) init() })
  });

  // 获取资源
  const getInit = async() => {
    let query1 = {model: "t_sensor", args: `stationNum='${state.route.stationNum}' and type='${state.route.type}'`}
    let query2 = {model: "t_station", args: `parent_id='${state.route.stationNum}'`, field: "id, parent_id, station_name, `order`, mark, instlPos"}
    let query3 = {model: "t_sensor_template_measure_point", args: `sensor_type='${state.route.type}' and value_type!='string'`}
    let query4 = {model: "t_sensor_template_cfg_point", args: `sensor_type='${state.route.type}' and type='1'`}
    let query5 = {model: "t_sensor_alarm_type", args: `alarm_class='${state.route.type}'`}
    let res = await publicStore.http({Api1: query1, Api2: query2, Api3: query3, Api4: query4, Api5: query5})
    publicStore._public.sensors = proxy.isNull(res.Api1)? [] : res.Api1
    publicStore._public.bays = proxy.isNull(res.Api2)? [] : res.Api2
    publicStore._public.meas = proxy.isNull(res.Api3)? [] : res.Api3
    publicStore._public.cfgs = proxy.isNull(res.Api4)? [] : res.Api4
    publicStore._public.alarmTypes = proxy.isNull(res.Api5)? [] : res.Api5
    await setMeas()
    await setTree()
  }

  // 设置参数
  const setMeas = async() => {
    if(!proxy.isNull(publicStore._public.meas)) {
      publicStore._public.meas.forEach(v => {
        let exist = publicStore._public.cfgs.find(a=>a.code == v.code)
        if(exist && !proxy.isNull(exist.calcRuleExpres)){
          v.calcRuleExpres = proxy.resolveJSON(exist.calcRuleExpres)
        }
      })
    }
  }

  // 设置树结构
  const setTree = async() => {
    state.tree = []
    if(!proxy.isNull(publicStore._public.bays)){
      publicStore._public.sensors.forEach(v => {
        if(v.bayNum){
          let exist = state.tree.find(a=>a.id == v.bayNum)
          if(!exist){
            let bay = publicStore._public.bays.find(a=>a.id == v.bayNum)
            if(bay) {
              bay.name = bay.station_name
              bay.parent_id = 0
              v.parent_id = bay.id
              bay.children = [v]
              state.tree.push(bay)
            }
          }else{
            v.parent_id = exist.id
            exist.children.push(v)
          }
        }
      })
      if(!proxy.isNull(state.tree)){
        await nextTick()
        let node = proxy.findNode(state.tree, (node) => { return node[state.key] == state.route.id })
        defaultId = node[state.key]
        treeRef.setCurrentKey(defaultId, true)
        publicStore.active = {...node}
      }
    }else{
      let sensor = publicStore._public.sensors.find(a=>a.id == state.route.id)
      if(sensor) publicStore.active = {...sensor}
    }
  }

  // 点击数据点
  watch(() => publicStore.chartDot, async(val, old) => {
    if(proxy.isNull(val)) return
    publicStore.status = true
    publicStore.model = {timestamp: val[2]+''}
  }, { immediate: false, deep: true });

  // 实时请求
  const init = async(key) => {
    // 禁止更新
    if(publicStore.status) return
    // 获取数据类型
    if(!proxy.isNull(publicStore._public.meas)) {
      if(!proxy.isNull(publicStore.text)) {
        state.value_type = proxy.find(publicStore._public.meas, ['code', publicStore.text], 'value_type')
      }else{
        publicStore.text = publicStore._public.meas[0].code
        state.value_type = publicStore._public.meas[0].value_type
      }
    }
    // 历史数据
    if(!proxy.isNull(publicStore.datetime)){
      console.log("历史---")
      let start = Date.parse(publicStore.datetime[0]) + ''
      let end = Date.parse(publicStore.datetime[1]) + ''
      let args = `sensor_id='${publicStore.active.id}' and measurement_code='${publicStore.text}' and timestamp>='${start}' and timestamp<='${end}'`
      let query1 = {model: `t_sensor_measure_${state.value_type}`, args: args, order: 'timestamp desc', limit: 1}
      let res = await publicStore.http({Api1: query1})
      publicStore.model = !proxy.isNull(res)? {...res[0], ...{start: start, end: end}} : {}
    } 
    // 实时数据
    else {
      console.log("实时---")
      let args = `sensor_id='${publicStore.active.id}' and measurement_code='${publicStore.text}'`
      let query1 = {model: `t_sensor_measure_${state.value_type}`, args: args, order: 'timestamp desc', limit: 1}
      let query2 = {model: "redis", key: ["mo:Hash:sensor:" + publicStore.active.id]}
      let res = await publicStore.http({Api1: query1, getApi: query2})
      let redis = proxy.isNull(res.getApi)? [] : res.getApi
      let datas = proxy.isNull(res.Api1)? [] : res.Api1
      if(!proxy.isNull(redis) && !proxy.isNull(redis[0]['timestamp'])) return publicStore.model = {...redis[0], ...{code: publicStore.text}}
      if(!proxy.isNull(datas) && !proxy.isNull(datas[0]['timestamp'])) return publicStore.model = {...datas[0], ...{code: publicStore.text}}
      publicStore.model = {}
    }
  }

  const handleClick = async(remark, val) => {
    if(remark == 'active'){
      publicStore.active = { ...val }
      init()
    }
  }

  const handleNodeClick = async(node) => {
    if(node.parent_id == 0) return
    defaultId = node[state.key]
    publicStore.active = {...node}
    init()
  }

  // 暴露给父组件
  defineExpose({
    init,
  })
</script>

<style scoped lang="scss">
.table .thead {
  position: sticky;
  top: 0;
  z-index: 11;
}
.table:first-child, span:first-child {
  position: sticky;
  left: 0;
  z-index: 10;
}
.newbox{
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(65, 255, 255, 0.2);
  box-sizing: border-box;
  height: auto;
}
.newbox:hover{
  background: linear-gradient(270deg, rgba(17, 0, 120, 0.5) 0%, rgba(0, 46, 196, 0.3) 50%); 
  box-sizing: border-box; 
  border: 1px solid rgba(65, 255, 255, 0.5) !important; 
  box-shadow: inset 0px 0px 0.625vw 0px #4187FF;
}
.alarmcbox{
  background: rgba(106, 70, 10, 0.4);
  border: 1px solid rgba(249, 183, 74, 0.5);
  box-sizing: border-box;
  height: auto;
}
.alarmcbox:hover{
  background: rgba(106, 70, 10, 0.4); 
  box-sizing: border-box; 
  border: 1px solid rgba(249, 183, 74, 0.5) !important; 
  box-shadow: inset 0px 0px 0.625vw 0px #f5cc16;
}
.alarmdbox{
  background: rgba(255, 86, 86, 0.2);
  border: 1px solid rgba(255, 86, 86, 0.4);
  box-sizing: border-box;
  height: auto;
}
.alarmdbox:hover{
  background: rgba(100, 4, 4, 0.4); 
  box-sizing: border-box; 
  border: 1px solid rgba(255, 86, 86, 0.4) !important; 
  box-shadow: inset 0px 0px 0.625vw 0px #f1053c;
}
:deep(.el-input__wrapper){
	color: #ffffff ;
	background: rgba(17, 8, 73, 0.3);
	box-shadow: 0 0 0 1px #2663AA inset;
	border-radius: 5px;
	width: 100%;
  box-sizing: border-box;
	-moz-box-sizing: border-box;
}
:deep(.el-input__inner){
	color: #ffffff ;
}
</style>
