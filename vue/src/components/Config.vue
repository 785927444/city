<template>
  <el-dialog v-model="state.isFalse" :title="state.form.name" :before-close="onVisable" :draggable="true" width="60%">
    <div class="ww100 flex-bc mb15 white">
      <div class="flex-sc">
        <span class="pb4 pt8 plr20 mr20 cursor" v-for="(v, i) in state.dictList" :key="i" :class="v.value == state.actId? 'tabStyle':''" @click="state.actId = v.value; init()">
          <span :class="v.value == state.actId? 'textStyle':''">{{v.name}}</span>
        </span>
      </div>
      <div class="flex-ec flex1 h30">
        <div class="rad4 ptb6 plr10 flex-cc cursor bgi3 white ml10" 
          v-if="state.content.find(v=>{return typeof(v.key) == 'object'}) && state.content.find(v=>{return typeof(v.key) == 'object'})['key'].hasOwnProperty('add')" 
          @click.stop="handleClick('add', state.addItem)">
          <i-ep-plus class="f12 fw" /><span class="f14 ml5">{{state.content.find(v=>{return typeof(v.key) == 'object'})['key'].add}}</span>
        </div>
      </div>
    </div>
    <div class="row bgi22 white">
      <div :style="{textAlign: v.align}" v-for="(v, i) in state.content" :key="i" v-show="v.show" :class="typeof(v.key) == 'object'?v.width +' '+ 'mlr5':v.width">{{v.name}}</div>
    </div>
    <div class="table white">
      <div class="row" :class="publicStore.active[state.key] == item[state.key]?'active':index%2 == 1?'bgi23':'bgi18'" v-for="(item, index) in state.list" :key="index" @click="handleClick('active', item)">
        <div v-show="v.show" :class="v.width" :style="{textAlign: v.align}" v-for="(v, i) in state.content" :key="i">
          <span v-if="typeof(v.key) == 'object'" class="i21 cursor mlr5" :class="kk=='add'?'none':''" v-for="(vv, kk, ii) in v.key" :key="ii" @click.stop="handleClick(kk, item)">{{vv}}</span>
           <span v-else-if="v.key=='*'">{{index+1}}</span>
          <span v-else-if="v.type == 'time'">{{item[v.key] == 0?'/':parseTime(item[v.key])}}</span>
          <span v-else-if="v.type == 'find'" :class="find(v.value[0], [v.value[1], item[v.key]], 'color')?find(v.value[0], [v.value[1], item[v.key]], 'color'):''">
            {{find(v.value[0], [v.value[1], item[v.key]], v.value[2])}}
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
    <Add @init="init" :state="state" ref="addRef" />
  </el-dialog>
</template>

<script lang="ts" setup>
  const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  let addRef = $ref()
  const state = reactive({
	  ...publicStore.$state,
    key: 'code',
    content: [
      { width: 'w50x3', show: true, align: 'left', key: 'name', name: '名称' },
      { width: 'w50x3', show: true, align: 'left', key: 'code', name: '编码' },
      { width: 'w50x2', show: true, align: 'center', key: 'value_type', name: '数据类型', value: [[], 'id', 'name'] },
      { width: 'w50x2', show: true, align: 'center', key: 'type', name: '测点类型', type: 'find', value: [[], 'id', 'name'] },
      { width: 'w50x6', show: true, align: 'left', key: 'description', name: '描述' },
      { width: 'w50x2', show: true, align: 'center', key: 'ismapping2star', name: '映射统计', type: 'switch', value: [] },
      { width: 'flex1', show: true, align: 'right', key: {add: '新增', edit:'编辑', del: '删除'},  name: '操作' },
    ],
    editField: {},
    editFrom: [],
    editFrom1: [
      { required: true,  editshow: true, name: '编码', key: 'code',  type: ['input'] },
      { required: true,  editshow: true, name: '名称', key: 'name',  type: ['input'] },
      { required: false, editshow: true, name: '描述', key: 'description',  type: ['input'] },
      { required: true,  editshow: true, name: '数据类型', key: 'value_type', type: ['select', [], 'id', 'name']},
      { required: false, editshow: true, name: '测点类型', key: 'type', type: ['select', [], 'id', 'name']},
      { required: false, editshow: true, name: '计算表达式', key: 'calcRuleExpres',  type: ['input'], condit: ["type", "calc"] },
      { required: false, editshow: true, name: '映射统计', key: 'ismapping2star',  type: ['select', [], 'value', 'name'] }
    ],
    editFrom2: [
      { required: true,  editshow: true, name: '编码', key: 'code',  type: ['input'] },
      { required: true,  editshow: true, name: '名称', key: 'name',  type: ['input'] },
      { required: false, editshow: true, name: '描述', key: 'description',  type: ['input'] },
      { required: true,  editshow: true, name: '数据类型', key: 'value_type', type: ['select', [], 'id', 'name']},
      { required: false, editshow: true, name: '测点类型', key: 'type', type: ['select', [], 'id', 'name']},
      { required: false, editshow: true, name: '计算表达式', key: 'calcRuleExpres',  type: ['input'], condit: ["type", "calc"] },
    ],
    addItem: {},
    actId: -1,
    dictList: [
      {name: '测 量', value: 1, query: {"o":"o_sensor_template_measure_property","p":[]}},
      {name: '控 制', value: 2, query: {"o":"o_sensor_template_control_property","p":[]}},
      {name: '配 置', value: 3, query: {"o":"o_sensor_template_cfg_property","p":[], "i":0}},
    ],
    valueType: [
      {id: 'string', name: 'string'},
      {id: 'float', name: 'float'},
      {id: 'int', name: 'int'},
    ],
    measureType: [
      {id: 'physical', name: '物理'},
      {id: 'logic', name: '逻辑'},
      {id: 'calc', name: '计算'},
    ],
    controlType: [
      {id: 'physical', name: '物理'},
      {id: 'link', name: '联动'},
    ],
    labelType: [
      {value: '0', name: '否'},
      {value: '1', name: '是'},
    ],
  })
  const props = defineProps({
    state: {
      type: [Object, Array],
      default: ()=>{return {}}
    },
  })

  // 打开关闭弹窗
  const onVisable = async (val) => {
    state.isFalse = !state.isFalse
    if(!state.isFalse) return
    state.form = Object.assign({}, val)
    state.actId = 1
    init()
  }

  const setInit = () => {
    state.addItem = {sensor_type: state.form.type}
    state.editFrom = state.actId == 2? state.editFrom2 : state.editFrom1
    state.content.forEach(v => {
      if(v.key == 'value_type') v.value[0] = state.valueType
      if(v.key == 'ismapping2star') {
        v.show = state.actId == 2? false : true
        v.value = state.labelType
      }
      if(v.key == 'type') {
        if(state.actId == 1 || state.actId == 3){
          v.name = '测点类型'
          v.value[0] = state.measureType
        }
        if(state.actId == 2){
          v.name = '控点类型'
          v.value[0] = state.controlType
        }
      }
    })
    state.editFrom.forEach(v => {
      if(v.key == 'value_type') v.type[1] = state.valueType
      if(v.key == 'ismapping2star') v.type[1] = state.labelType
      if(v.key == 'type') {
        if(state.actId == 1 || state.actId == 3){
          v.type[1] = state.measureType
        }
        if(state.actId == 2){
          v.name = '控点类型'
          v.type[1] = state.controlType
        }
      }
    })
  }

  const init = async() => {
    state.query = proxy.find(state.dictList, ['value', state.actId], 'query')
    state.query.p = [state.form.type]
    state.params = {queryApi: state.query}
    let res = await publicStore.post(state.params)
    state.empty = proxy.isNull(res)? true : false
    state.list = proxy.isNull(res)? [] : res
    setInit()
  }

  const handleClick = (remark, val) => {
    if(remark == 'add' || remark == 'edit'){
      addRef.onVisable(val)
    }
    if(remark == 'del'){
      addRef.del(val, state.query, state.key)
    }
  }

  // 暴露给父组件
  defineExpose({
    onVisable
  })
</script>

<style scoped lang="scss">
:deep(.el-dialog__body){
  color: #ffffff !important;
}
.tabStyle{
  background: linear-gradient(0deg, #242DAB 1%, rgba(12,1,67,0.00) 100%);
  border-bottom: 1px solid rgba(65, 255, 255, 0.5);
}
.textStyle{
  background: linear-gradient(180deg, #ffffff 0%, #64DEFF 100%);
  background-clip: text;
  -webkit-text-fill-color: transparent;
  box-sizing: border-box;
}
</style>