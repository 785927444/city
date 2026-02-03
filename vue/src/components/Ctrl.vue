<template>
  <div class="ctrlclass">
    <el-dialog modal-class="ctrlclass" v-model="state.isFalse" :title="state.active.name" :before-close="onVisable" :draggable="true" width="40%">
      <div class="layout-col" element-loading-background="rgba(0, 0, 0, 0.3)" v-loading="state.loading? true : false"  element-loading-text="遥控中...">
        <div class="flex-col ww100 overlay">
          <el-form class="ww100 hh100" ref="formRef" :model="state.form" :rules="state.ruleList" label-width="100">
            <div class="ww100 hh100 flex-bc warp">
              <el-form-item :class="state.list&&state.list.length<10?'ww100':'ww50'" :label="v.name" :prop="v.code" v-for="(v, i) in state.list" :key="i">
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
                <!-- <div v-if="v.type=='mode'&&state.active.type=='airconditioner'" class="flex-sc w50x7 relative">
                  <div class="ww100 h4" style="background: rgba(83, 100, 124, 0.2);"></div>
                  <div class="ww100 flex-bc absolute-cc">
                    <div class="flex-bc" @click.stop="state.form[v.code]=vv.action_code"
                        v-for="(vv, ii) in v.action?v.action:[]" ::key="ii">
                          <span class="tc f12 cursor rad100 relative" :class="vv.action_code == state.form[v.code]?'bgzdy w14 h14 lh14':'bg-white w10 h10 lh10'" >
                            <span class="absolute-cc w100 mt22 i15">{{ vv.action_name }}</span>
                          </span>
                    </div>
                  </div>
                </div>  -->
                <!-- 模式 -->
                <div v-if="v.type=='mode'" class="flex-sc ww100 relative">
                  <!-- <div class="ww100 h4" style="background: rgba(83, 100, 124, 0.2);"></div> -->
                  <div class="ww100 flex-sc absolute-cc">
                    <div class="flex-bc cursor mr20" @click.stop="state.form[v.code]=vv.action_code" v-for="(vv, ii) in v.action?v.action:[]" ::key="ii">
                      <span class="tc f12 rad100 relative mr10" :class="vv.action_code == state.form[v.code]?'bgzdy w14 h14 lh14':'bg-white w12 h12 lh12 m2'" ></span>
                      <span class="i15">{{ vv.action_name }}</span>
                    </div>
                  </div>
                </div> 
              </el-form-item> 
            </div>
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
  const state = reactive({
	  ...publicStore.$state,
    ruleList: {},
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
    state.form = {}
    state.active = {...val}
    console.log("state.active---", state.active)
    state.active["2022"] = state.active["2022"]  == '2'? '0' : state.active["2022"]  == '3'? '1' : state.active["2022"] 
    init()
  }

  const init = async(i?: any) => {
    state.loading = false
    let query1 = { model: "t_sensor_control_property", args: `sensor_id='${state.active.id}'`}
    let res1 = await publicStore.http({ Api: query1 })
    let query2 = { model: "t_sensor_template_control_point", args: `sensor_type='${state.active.type}'`}
    let res2 = await publicStore.http({ Api: query2 })
    let list = proxy.isNull(res2)? [] : res2.sort((a, b) => a.order - b.order)
    state.list = list.map(v => {
      state.form[v.code] = state.active[v.code]?state.active[v.code]:''
      let exist = res1.find(a=>a.code == v.code)
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
    // console.log("state.list---", state.list)
  }

  // 参数格式: {sensor_id: value.sensor_id, code: value.code, action: value.action}
  const handleSubmit = (formEl) => {
    formEl.validate(async valid =>{
      state.query = Object.entries(state.form).filter(([key, value]) => value && state.active[key] !== value).map(([key, value]) => ({ sensor_id: state.active.id, code: key, action: value }))
      if(proxy.isNull(state.query)) return ElNotification({ title: '提示', message: '无控制变化', type: 'warning' })
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
	  }).catch((err:any) =>{
			state.loading = false
		  console.log('表单错误信息：', err);
	  })
  }

  const setData = async(res, startTime, endTime) => {
    if(proxy.isNull(state.query)) return
    let addForm = state.query.map(v => {
      let oldData = state.active[v.code]
      let newData = v.action
      let code_name = v.code
      let action_name = '手动输入'
      let orther = `输入值由【${oldData}】调到【${newData}】`
      let control = state.list.find(a=>a.code == v.code)
      if(control){
        code_name = control.name
        if(!proxy.isNull(control.action)){
          if(control.type == 'count'){
            action_name = Number(newData) > Number(oldData)? '增加' : Number(newData) < Number(oldData) ? '减少' : ''
            orther = `${control.name}由【${Number(oldData)}】调到【${Number(newData)}】`
          }else{
            let newAction = control.action.find(a=>a.action_code == newData)
            let oldAction = control.action.find(a=>a.action_code == oldData)
            action_name = newAction? newAction.action_name : ''
            orther = `${control.name}由【${oldAction?oldAction.action_name:''}】调到【${newAction?newAction.action_name:''}】`
          }
        }
      }
      return {
        id: "",
        sensor_id: state.active.id, 
        sensor_name: state.active.name, 
        instlPos: state.active.instlPos,
        stationNum: state.active.stationNum,
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
