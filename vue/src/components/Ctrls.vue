<template>
  <div class="ctrlclass">
    <el-dialog modal-class="ctrlclass" v-model="state.isFalse" title="批量控制" :before-close="onVisable" :draggable="true" width="50%">
      <div class="layout-row" element-loading-background="rgba(0, 0, 0, 0.3)" v-loading="state.loading? true : false"  element-loading-text="遥控中...">
        <!-- 选择 -->
        <div class="flex-col flex1 hh100 p15 ba1" style="height: auto; max-height: 400px;">
          <!-- <div class="row bgi22 white">
            <div :style="{textAlign: v.align, paddingRight: v.name=='操作'?'10px': 'inherit'}" v-for="(v, i) in state.content" :key="i" v-show="v.show" :class="v.width">{{v.name}}</div>
          </div> -->
          <div class="table-col">
            <el-tree 
              :data="state.tree" 
              :props="defaultProps" 
              :default-expand-all="true"
              :node-key="state.key"
              ref="treeRef"
              class="ww100"
              highlight-current
              empty-text="暂无数据"
              show-checkbox>
              <template #default="{ node, data }">
                <span class="flex-bc">
                  <span>{{ node.label }}</span>
                </span>
              </template>
            </el-tree>
          </div>
        </div>
        <!-- 表单 -->
        <div class="flex-col flex2 hh100 p15 ba1 ml10" style="height: auto; max-height: 400px;">
          <el-form ref="formRef" :model="state.form" :rules="state.ruleList" label-width="20%">
            <el-form-item :label="v.name" :prop="v.code" v-for="(v, i) in state.list" :key="i">
              <!-- 开关 -->
              <div v-if="v.type=='kg'" class="flex-sc">
                <div class="w50 h30 lh30 tc f12 p2 rad2 cursor mr1" @click.stop="state.form[v.code]=vv.action_code"
                :class="vv.action_code == state.form[v.code]?'white':'i1'" 
                :style="{ background: vv.action_code == state.form[v.code]? 'linear-gradient(90deg, #6097FF 0%, rgba(38, 80, 158, 0.69) 97%)' : '#0a275b'}" 
                v-for="(vv, ii) in v.action?v.action:[]" ::key="ii">{{ vv.action_name }}</div>
              </div>
              <!-- 计数 -->
              <div v-if="v.type=='count'" class="flex-sc rad3" style="background: linear-gradient(90deg, #6097FF 0%, rgba(38, 80, 158, 0.69) 97%);">
                <div v-if="find(v.action, ['action_code', 'dec'])" class="w40 h30 lh30 tc i18 f12 p2 rad2 cursor" @click.stop="state.form[v.code]--"><i-ep-minus /></div>
                <div class="fw i21 w80 h26 lh26 bg1 tc">
                  <el-input class="hh100 ww100" :input-style="{ textAlign: 'center' }" v-model="state.form[v.code]" placeholder="" />
                </div>
                <div v-if="find(v.action, ['action_code', 'add'])" class="w40 h30 lh30 tc i18 f12 p2 rad2 cursor" @click.stop="state.form[v.code]++"><i-ep-plus /></div>
              </div>
              <!-- 模式 -->
              <div v-if="v.type=='mode'" class="flex-sc w50x7 relative">
                <div class="ww100 h4" style="background: rgba(83, 100, 124, 0.2);"></div>
                <div class="ww100 flex-bc absolute-cc">
                  <div class="flex-bc" @click.stop="state.form[v.code]=vv.action_code"
                      v-for="(vv, ii) in v.action?v.action:[]" ::key="ii">
                        <span class="tc f12 cursor rad100 relative" :class="vv.action_code == state.form[v.code]?'bgzdy w14 h14 lh14':'bg-white w10 h10 lh10'" >
                          <span class="absolute-cc w100 mt22 i15">{{ vv.action_name }}</span>
                        </span>
                  </div>
                </div>
              </div> 
            </el-form-item> 
          </el-form>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button size="large" type="info" class="i23 bg-white" @click="onVisable">取 消</el-button>
          <el-button size="large" type="info" class="white bgi22" @click.stop="handleSubmit(formRef)">确 认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
  import axios from 'axios'
  import api from '../api'
  const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  let formRef = $ref()
  let treeRef = $ref()
  let tree = $ref([])
  let defaultKeys = $ref()
  const defaultProps = {
    children: 'children',
    label: 'name',
  }
  const state = reactive({
	  ...publicStore.$state,
    ruleList: {},
    content: [
      { width: 'flex1', show: true, align: 'left', key: 'name', name: '名称'},   
    ],
  })
  const props = defineProps({
    state: {
      type: [Object, Array],
      default: ()=>{return {}}
    },
  })
  // const emit = defineEmits(['init'])

  const onVisable = async (val?: any) => {
    state.isFalse = !state.isFalse
    if(!state.isFalse) return
    state.active = Object.assign({}, val)
    init()
  }

  const init = async(i?: any) => {
    if(proxy.isNull(publicStore._public.homeDevices)) return console.log("无设备")
    console.log("!isNull(publicStore._public.homeDevices)", publicStore._public.homeDevices)
    let type = publicStore._public.homeDevices[0]['type']
    let query1 = { model: "t_station", args: `parent_id='${state.active.stationNum}'`}
    let query2 = { model: "t_sensor", args: `stationNum='${state.active.stationNum}' and type='${type}'`}
    let res = await publicStore.http({ Api1: query1, Api2: query2 })
    state.bays = proxy.isNull(res.Api1)? [] : res.Api1
    state.sensors = proxy.isNull(res.Api2)? [] : res.Api2
    state.tree = []
    if(!proxy.isNull(state.bays)){
      state.sensors.forEach(v => {
        if(v.bayNum){
          let exist = state.tree.find(a=>a.id == v.bayNum)
          if(!exist){
            let bay = state.bays.find(a=>a.id == v.bayNum)
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
    }
    getFrom()
  }

  const getFrom = async(i?: any) => {
    if(proxy.isNull(state.sensors)) return
    let sensor = state.sensors[0]
    let query1 = { model: "t_sensor_control_property", args: `sensor_id='${sensor.id}'`}
    let query2 = { model: "t_sensor_template_control_point", args: `sensor_type='${sensor.type}'`}
    let res = await publicStore.http({ Api1: query1, Api2: query2 })
    let list = proxy.isNull(res.Api2)? [] : res.Api2.sort((a, b) => a.order - b.order)
    state.list = list.map(v => {
      state.form[v.code] = sensor[v.code]?sensor[v.code]:''
      let exist = res.Api1.find(a=>a.code == v.code)
      if(exist && exist.value) v.calcRuleExpres = exist.value
      if(v.calcRuleExpres){
        try {
          v.calcRuleExpres = JSON.parse(v.calcRuleExpres)
          Object.assign(v, v.calcRuleExpres)
          delete v.calcRuleExpres
          if(!proxy.isNull(v.action) && proxy.isArray(v.action)){
            let type = v.action[0]['action_type']
            v.type = type
          }
        } catch (err) {
          console.error(err)
        }
      }
      return v
    })
    console.log("state.list---", state.list)
  }

  const handleSubmit = async(formEl) => {
    // 设备列表
    let list = treeRef.getCheckedKeys(false)
    list = addMissingParentIds(state.tree, list)
    list = list.filter(item => typeof item === 'number' || (typeof item === 'string' && !isNaN(item)))
    if(proxy.isNull(list)) return ElNotification({ title: '提示', message: '请选择一个或者多个设备', type: 'error' })
    // 控制列表
    let forms = []
    Object.keys(state.form).forEach((key:any)=>{
      if(state.form[key]){
        let temp = {sensor_id: '', code: key, action: state.form[key]+''}
        forms.push(temp)
      }
    })
    if(proxy.isNull(forms)) return ElNotification({ title: '提示', message: '请选择一个或者多个控制点', type: 'error' })
    // 组装请求
    state.query = list.flatMap(v => {
      return forms.map(vv => {
        return { ...vv, sensor_id: v + '' }
      })
    })
    // 发起请求
    if(proxy.isNull(state.query)) return ElNotification({ title: '提示', message: '参数不能为空', type: 'error' })
    const startTime = new Date().getTime()
    state.loading = true
    const params = {query: state.query, ip: proxy.getHttp('ip'), port: "9527", url: "/api/v1.0/p3000/monitorOnline/setparam"}
    api.httpApi(params).then((res:any) => {
      state.loading = false
      const endTime = new Date().getTime()
      if(res.code == 200 && res.data && (res.data.errcode == 0 || res.data.errcode == 1)){
        setData(1, startTime, endTime)
        ElNotification({ title: '提示', message: '控制成功', type: 'success' })
        onVisable()
      }else{
        setData(0, startTime, endTime)
        ElNotification({ title: '提示', message: '控制失败', type: 'error' })
      }
    }).catch((err) => {
      setData(0, startTime, new Date().getTime())
      state.loading = false
      ElNotification({ title: '提示', message: '控制失败', type: 'error' })
    })
  }

  const addMissingParentIds = (arr1: any[], arr2: number[]): number[] => {
    const parentIds: Set<number> = new Set();
    for (const item of arr1) {
      for (const child of item.children) {
        if (arr2.includes(child.id) && !arr2.includes(item.id)) {
          parentIds.add(item.id);
        }
      }
    }
    return Array.from(parentIds).concat(arr2);
  }

  const filterNode = (parentNode: Node, childNodeIds: number[]): Node => {
    parentNode.forEach(item => {
      if(item.parent_id == 0) {
        let index = childNodeIds.findIndex(a=>a == item.id)
        if(index!=-1 && item.children) {
          const arr1Set  = new Set(childNodeIds)
          if(!item.children.every(item => arr1Set.has(item.id))){
            childNodeIds.splice(index, 1)
          }
        }
      }
    })
    return childNodeIds
  }

  const setData = async(res, startTime, endTime) => {
    if(proxy.isNull(state.query)) return
    let addForm = state.query.map(v => {
      let oldData = state.active[v.code]
      let newData = v.action
      let code_name = v.code
      let action_name = '手动输入'
      let orther = `输入值由【批量控制】调到【${newData}】`
      let control = state.list.find(a=>a.code == v.code)
      if(control){
        code_name = control.name
        if(!proxy.isNull(control.action)){
          if(control.type == 'count'){
            action_name = Number(newData) > Number(oldData)? '增加' : Number(newData) < Number(oldData) ? '减少' : ''
            orther = `${control.name}由【批量控制】调到【${Number(newData)}】`
          }else{
            let newAction = control.action.find(a=>a.action_code == newData)
            let oldAction = control.action.find(a=>a.action_code == oldData)
            action_name = newAction? newAction.action_name : ''
            orther = `${control.name}由【批量控制】调到【${newAction?newAction.action_name:''}】`
          }
        }
      }
      let sensor = state.sensors.find(a=>a.id == v.sensor_id)
      return {
        id: "",
        sensor_id: sensor.id, 
        sensor_name: sensor.name, 
        instlPos: sensor.instlPos,
        stationNum: sensor.stationNum,
        result: res,
        code: v.code,
        code_name: code_name,
        action: v.action,
        action_name: action_name,
        orther: orther,
        startTime: startTime,
        endTime: endTime,
        userName: configStore.user?configStore.user.username:"",
      }
    })
    let params = {model: "t_sensor_control_log", list: addForm}
    api.addApi(params).then((res:any) => {
      if(res.code == 200){
        console.log("添加记录成功")
      }else{
        console.log("添加记录失败1")
      }
    }).catch((err) => {
      console.log("添加记录失败2")
    })
  }

  // 暴露给父组件
  defineExpose({
    onVisable
  })
</script>

<style lang="scss">
.el-notification__content {
  white-space: pre-line;
}
.bgzdy{
  background: #60E7FF;
  box-shadow: 0px 0px 4px 0px #74C7FA;
}
.ctrlclass .el-input__wrapper {
  min-height: auto;
  color: inherit;
  padding: 0;
  background: none;
  box-shadow: 0 0 0 0px #276dd6 inset !important;
}
:deep(.select_input .el-input__inner) {
  color: inherit;
}
</style>
