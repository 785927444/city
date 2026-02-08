<template>
  <el-dialog v-model="state.isFalse" title="系统配置" :before-close="onVisable" :draggable="true" :destroy-on-close="true" width="40%">
    <div class="layout-col white">
      <!-- 标题 -->
      <div class="ww100 flex-bc mb12">
        <div class="flex-sc">
          <span class="f15 fw"></span>
        </div>
        <div class="flex-ec flex1">
          <div class="rad4 ptb8 plr12 flex-cc cursor bgi3 white ml10" @click.stop="handleClick('submit')">
            <i-ep-pointer class="f12 fw" /><span class="f14 ml5">保存</span>
          </div>
          <div class="rad4 ptb8 plr12 flex-cc cursor bgi3 white ml10" @click.stop="handleClick('setlist')" v-if="configStore.user&&configStore.user.role_id=='1'">
            <i-ep-plus class="f12 fw" /><span class="f14 ml5">生成配置</span>
          </div> 
          <div class="rad4 ptb8 plr12 flex-cc cursor bgi3 white ml10" @click.stop="handleClick('reset')">
            <i-ep-refresh class="f12 fw" /><span class="f14 ml5">清除缓存</span>
          </div>
        </div>
      </div>
      <!-- 内容 -->
      <div class="layout-col">
        <el-descriptions :column="1" size="large" border>
          <el-descriptions-item :label="v.name" v-for="(v, i) in state.config.attr" :key="i"  v-if="!proxy.isNull(state.config) && !proxy.isNull(state.config.attr)"> 
            <div class="flex1" v-if="v.type=='input'">
              <el-input v-model="v.value" placeholder="请输入" style="width: 100%" size="large" border />
            </div>
            <div class="flex1" v-if="v.type=='select'">
              <el-select v-model="v.value" placeholder="暂无" style="width: 100%" size="large" filterable>
                <el-option v-for="sel in v.arr?v.arr:[]" :key="sel['value']" :value="sel['value']" :label="sel['name']" />
              </el-select>
            </div>
            <div class="flex1" v-if="v.type=='radio'">
              <el-radio-group v-model="v.value" size="large">
                <el-radio  v-for="sel in v.arr || []"  :key="sel.value" :label="sel.value">
                  {{ sel.name }}
                </el-radio>
              </el-radio-group>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="手动对时">
            <div class="flex-sc hh100">
              <!-- <el-input v-model="state.time" placeholder="请输入" style="width: 100%" size="large" border /> -->
              <el-date-picker class="flex1" size="large" v-model="state.time" placeholder="请选择" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" format="YYYY-MM-DD HH:mm:ss" />
              <div class="rad4 ptb6 plr10 flex-cc cursor bgi3 white w90 hh100 ml10" @click.stop="handleClick('settime')">
                <i-ep-clock class="f12 fw" /><span class="f14 ml5">对时</span>
              </div>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="重启服务">
            <div class="flex-sc hh100">
              <div class="rad4 ptb6 plr10 flex-cc cursor bgi3 white hh100 w90" @click.stop="handleClick('restart')">
                <i-ep-switchButton class="f12 fw" /><span class="f14 ml5">重启</span>
              </div>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="备份数据">
            <div class="flex-sc hh100">
              <div class="rad4 ptb6 plr10 flex-cc cursor bgi3 white hh100 w90" @click.stop="handleClick('backup')">
                <i-ep-connection class="f12 fw" /><span class="f14 ml5">备份</span>
              </div>
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <!-- <el-descriptions :column="1" size="large" border>
        <el-descriptions-item label="HTTP动态地址(一级)">
          <input class="ww100" v-model.trim="state.form.ip" placeholder="请输入" />
        </el-descriptions-item>
        <el-descriptions-item label="HTTP地址(二级)">
          <input class="ww100" v-model.trim="state.form.produrl" placeholder="请输入" />
        </el-descriptions-item>
        <el-descriptions-item label="HTTP主地址">
          <input class="ww100" v-model="state.form.main" placeholder="请输入" />
        </el-descriptions-item>
        <el-descriptions-item label="MQTT地址">
          <input class="ww100" v-model.trim="state.form.wsurl" placeholder="请输入" />
        </el-descriptions-item>
        <el-descriptions-item label="图片地址（默认是HTTP地址）">
          <input class="ww100" v-model.trim="state.form.imageurl" placeholder="请输入" />
        </el-descriptions-item>
      </el-descriptions> -->
    </div>
    <!-- 生成弹窗 -->
    <Setlist @init="init" :state="state" ref="setlistRef" />
    <!-- 备份弹窗 -->
    <Setback @init="init" :state="state" ref="setbackRef" />
  </el-dialog>
</template>

<script lang="ts" setup>
  import api from '@/api'
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  let setlistRef = $ref()
  let setbackRef = $ref()
  const state = reactive({
	  ...publicStore.$state,
  })

  // 弹窗
  const onVisable = async (val?: any) => {
    state.isFalse = !state.isFalse
    if(!state.isFalse) return
    // state.form = {...state.form, ...configStore}
    state.time = ''
    init()
  }

  const init = async() => {
    let query = {model: 't_config', args: `name='${configStore.key}'`}
    let res = await publicStore.http({Api: query})
    state.config = proxy.isNull(res)? [] : res
    if(proxy.isNull(state.config)) return
    if(proxy.isNull(state.config[0]['attr'])) return
    try {
      state.config.attr = JSON.parse(res[0]['attr'])
      configStore.configs = state.config.attr.reduce((acc, {code, value}) => ({...acc, [code]: value}), {})
    } catch (err) {
      console.error(err)
    }
    console.log("res", res)
  }

  // 事件
  const handleClick = (remark, val) => {
    if(remark == 'submit'){
      if(proxy.isNull(state.config)) return
      let form = {id: state.config.id, attr: JSON.stringify(state.config.attr)}
      let params = {model: 't_config', list: [form]}
      api['updApi'](params).then((res:any) => {
        if(res.code == 200){
          ElNotification({ title: '提示', message: '配置成功', type: 'success' })
          onVisable()
          init()
        }else{
          ElNotification({ title: '提示', message: '配置失败1', type: 'error' })
        }
      }).catch((err) => {
        ElNotification({ title: '提示', message: '配置失败2', type: 'error' })
      })
    }
    if(remark == 'reset'){
      configStore.$reset()
    }
    if(remark == 'setlist'){
      setlistRef.onVisable(val)
    }
    if(remark == 'settime'){
      ElMessageBox.confirm('是否确定对时?', '温馨提示', {confirmButtonText: '确定', cancelButtonText: '关闭', type: 'success'}).then(async() => {
        await setTime()
      })
    }
    if(remark == 'restart'){
      ElMessageBox.confirm('是否确定重启?', '温馨提示', {confirmButtonText: '确定', cancelButtonText: '关闭', type: 'success'}).then(async() => {
        await reBoot()
      })
    }
    if(remark == 'backup'){
      setbackRef.onVisable(val)
      // ElMessageBox.confirm('是否确定备份?', '温馨提示', {confirmButtonText: '确定', cancelButtonText: '关闭', type: 'success'}).then(async() => {
      //   await backUp()
      // })
    }
  }

  // 重启
  const reBoot = async() => {
    const query = {
      uuid: '', 
      addlist: [], 
      dellist: [], 
      rebootlist: [{"srvName": ""}]
    }
        
    let params = {query: query, ip: proxy.getHttp('ip'), port: "8808", url: "/api/v1.0/p3000/watchdog/rebootServer"}
    let res = await publicStore.http({httpApi: params})
    query.uuid = proxy.isNull(res)? '' : res.data.uuid
    if(query.uuid) {
      console.log("params", params)
      api.httpApi(params).then((res:any) => {
        console.log("res", res)
        if(res.code == 200 && res.data && res.data.errcode == 0){
          ElNotification({ title: '提示', message: '重启成功', type: 'success' })
        }else{
          ElNotification({ title: '提示', message: '重启成功', type: 'success' })
        }
      }).catch((err) => {
        ElNotification({ title: '提示', message: '重启成功', type: 'success' })
      })
    }
  }
  // 对时
  const setTime = async() => {
    if(!state.time) return ElNotification({ title: '提示', message: '不能为空', type: 'error' })
    const query = {uuid: '', timestr: state.time, timestamp: ""}
    let params = {query: query, ip: proxy.getHttp('ip'), port: "8808", url: "/api/v1.0/p3000/monitorOnline/commFrontEndProcessor/sensor/c/ntp"}
    let res = await publicStore.http({httpApi: params})
    query.uuid = proxy.isNull(res)? '' : res.data.uuid
    if(query.uuid) {
      api.httpApi(params).then((res:any) => {
        if(res.code == 200 && res.data && res.data.errcode == 0){
          ElNotification({ title: '提示', message: '对时成功', type: 'success' })
        }else{
          ElNotification({ title: '提示', message: '对时失败', type: 'error' })
        }
      }).catch((err) => {
        ElNotification({ title: '提示', message: '对时失败', type: 'error' })
      })
    }
  }

  // 暴露
  defineExpose({
    onVisable
  })
</script>

<style scoped lang="scss">
input{  
  background:none;  
  outline:none;  
  border:none;
}
:deep(.el-dialog__body){
  color: #ffffff !important;
  padding: 0 !important;
}
// :deep(.el-descriptions__body){
//   border-right: 1px solid #5290bf !important;
//   border-top: 1px solid #5290bf !important;
//   background: rgba(0, 10, 51, 0.3);
//   backdrop-filter: blur(1px); 
// }
// :deep(.el-descriptions__title){
//   color: #5290bf;
// }
:deep(.el-descriptions__body .el-descriptions__table tr){
  display: flex;
}
:deep(.el-descriptions__label.el-descriptions__cell.is-bordered-label) {
  flex: 2;
  display: flex;
  align-items: center;
  background: #103379;
  color: white;
//   border-left: 1px solid #5290bf !important;
//   border-bottom: 1px solid #5290bf !important;
}
:deep(.el-descriptions__content.el-descriptions__cell.is-bordered-content){
  flex: 4;
    background: #093A83;
//   display: flex;
//   align-items: center;
//   color: #3dc8ee;
//   border-left: 1px solid #5290bf !important;
//   border-bottom: 1px solid #5290bf !important;
}
:deep(.el-descriptions__body .el-descriptions__table.is-bordered .el-descriptions__cell){
  border: 1px solid #276dd6;
}
</style>