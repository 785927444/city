<template>
  <div class="ctrlclass">
    <el-dialog modal-class="ctrlclass" v-model="state.isFalse" title="控制" :before-close="onVisable" :draggable="true" :destroy-on-close="true" width="30%">
      <div class="layout-col" element-loading-background="rgba(0, 0, 0, 0.3)" v-loading="state.loading? true : false"  element-loading-text="遥控中...">
        <el-form ref="formRef" :model="state.from" :rules="state.ruleList" label-width="80px">
          <el-form-item label="动作" prop="action">
            <el-input v-if="isNull(state.form.control)" class="ww100 rad5 pl12" style="box-shadow: 0 0 0 1px #276dd6 inset !important;" size="large" v-model="state.form.value" placeholder="请输入"/>
            <!-- 开关 -->
            <div v-if="!isNull(state.form.control) && state.form.action_type=='kg'" class="flex-sc">
              <div class="w50 h30 lh30 tc f12 p2 rad2 cursor mr1" @click.stop="state.form.value=vv.action_code"
              :class="vv.action_code == state.form.value?'white':'i1'" 
              :style="{ background: vv.action_code == state.form.value? 'linear-gradient(90deg, #6097FF 0%, rgba(38, 80, 158, 0.69) 97%)' : '#0a275b'}" 
              v-for="(vv, ii) in state.form.control.action?state.form.control.action:[]" ::key="ii">{{ vv.action_name }}</div>
            </div>
            <!-- 计数 -->
            <div v-if="!isNull(state.form.control) && state.form.action_type=='count'" class="flex-sc rad3" style="background: linear-gradient(90deg, #6097FF 0%, rgba(38, 80, 158, 0.69) 97%);">
              <div v-if="find(state.form.control.action, ['action_code', 'dec'])" class="w40 h30 lh30 tc i18 f12 p2 rad2 cursor" @click.stop="state.form.value--"><i-ep-minus /></div>
                <div class="fw i21 w80 h26 lh26 bg1 tc">
                  <el-input class="hh100 ww100" :input-style="{ textAlign: 'center' }" v-model="state.form.value" placeholder="" />
                </div>              
              <div v-if="find(state.form.control.action, ['action_code', 'add'])" class="w40 h30 lh30 tc i18 f12 p2 rad2 cursor" @click.stop="state.form.value++"><i-ep-plus /></div>
            </div>
            <!-- 模式 -->
            <div v-if="!isNull(state.form.control) && state.form.action_type=='mode'" class="flex-sc w50x7 relative">
              <div class="ww100 h4" style="background: rgba(83, 100, 124, 0.2);"></div>
              <div class="ww100 flex-bc absolute-cc">
                <div class="flex-bc" @click.stop="state.form.value=vv.action_code"
                    v-for="(vv, ii) in state.form.control.action?state.form.control.action:[]" ::key="ii">
                      <span class="tc f12 cursor rad100 relative" :class="vv.action_code == state.form.value?'bgzdy w14 h14 lh14':'bg-white w10 h10 lh10'" >
                        <span class="absolute-cc w100 mt22 i15">{{ vv.action_name }}</span>
                      </span>
                </div>
              </div>
            </div> 
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button size="large" type="info" class="i23 bg-white" @click="onVisable">取 消</el-button>
          <el-button size="large" type="info" class="white bgi22" @click.stop="handleSubmit(formRef)">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
  import api from '@/api'
  import CryptoJS from 'crypto-js'
  const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  let formRef = $ref()
  const state = reactive({
	  ...publicStore.$state,
  })

  const onVisable = async (val?: any) => {
    state.isFalse = !state.isFalse
    if(!state.isFalse) return
    state.loading = false
    state.old = {...val}
    state.form = {...val}
    let control = publicStore._public.controls.find(a=>a.code == state.form.code)
    if(control) state.form.control = control
    if(control && control.action) state.form.action_type = control.action[0]['action_type']
  }

  const handleSubmit = async(formEl) => {
    let startTime = new Date().getTime()
    state.loading = true
    let query = [{sensor_id: state.form.sensorid, code: state.form.code, action: state.form.value+'' }]
    let params = {query: query, ip: proxy.getHttp('ip'), port: "8808", url: "/api/v1.0/p3000/monitorOnline/commFrontEndProcessor/sensor/remoteCtrl"}
    api.httpApi(params).then((res:any) => {
      state.loading = false
      let endTime = new Date().getTime()
      if(res.code == 200 && res.data && res.data.errcode == 0){
        setData([{res: '1'}], startTime, endTime)
        ElNotification({ title: '提示', message: '控制成功', type: 'success' })
        onVisable()
      }else{
        setData([{res: '0'}], startTime, endTime)
        ElNotification({ title: '提示', message: '控制失败', type: 'error' })
      }
    }).catch((err) => {
      state.loading = false
      ElNotification({ title: '提示', message: '控制失败', type: 'error' })
    })
  }

  const setData = async(respond, startTime, endTime) => {
    let addForm = respond.map(v => {
      let action_name = '手动输入'
      let orther = `输入值由【${state.old.value}】调到【${state.form.value}】`
      if(!proxy.isNull(state.form.control)){
        if(state.form.action_type=='count'){
          action_name = Number(state.form.value) > Number(state.old.value)? '增加' : Number(state.form.value) < Number(state.old.value) ? '减少' : ''
          orther = `${state.form.control.name}由【${Number(state.old.value)}】调到【${Number(state.form.value)}】`
        }else{
          let action = state.form.control.action.find(a=>a.action_code == state.form.value)
          let action_old = state.form.control.action.find(a=>a.action_code == state.old.value)
          action_name = action? action.action_name : ''
          orther = `${state.form.control.name}由【${action_old?action_old.action_name:''}】调到【${action?action.action_name:''}】`
        }
      }
      return {
        id: "",
        sensor_id: publicStore.active.id, 
        sensor_name: publicStore.active.name, 
        instlPos: publicStore.active.instlPos,
        stationNum: publicStore.active.stationNum,
        result: v.res,
        code: state.form.code,
        code_name: state.form.control?state.form.control.name:'',
        action: state.form.value,
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
        // ElNotification({ title: '提示', message: '添加记录成功', type: 'success' })
      }else{
        ElNotification({ title: '提示', message: '添加记录失败', type: 'error' })
      }
    }).catch((err) => {
      ElNotification({ title: '提示', message: '添加记录失败', type: 'error' })
    })
  }

  // 暴露给父组件
  defineExpose({
    onVisable
  })
</script>

<style scoped lang="scss">
  :deep(input:-webkit-autofill) {
    -webkit-text-fill-color: #f5f5f5 !important;
  }
  .el-notification__content {
    white-space: pre-line;
  }
  .bgzdy{
    background: #60E7FF;
    box-shadow: 0px 0px 4px 0px #74C7FA;
  }
  :deep(.ctrlclass .el-input__wrapper) {
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