<template>
  <el-dialog v-model="state.isFalse" title="备份数据" :draggable="true" width="40%">
    <div class="layout-col white p20">
      <!-- 标题 -->
      <div class="ww100 flex-bc mb15">
        <div class="flex-sc">
          <span class="f15 fw"></span>
        </div>
        <div class="flex-ec flex1 h30">
          <div class="rad4 ptb6 plr10 flex-cc cursor bgi3 white ml10" @click.stop="handleClick('set')">
            <i-ep-pointer class="f12 fw" /><span class="f14 ml5">设置</span>
          </div>
          <div class="rad4 ptb6 plr10 flex-cc cursor bgi3 white ml10" @click.stop="handleClick('back')">
            <i-ep-plus class="f12 fw" /><span class="f14 ml5">备份</span>
          </div> 
          <div class="rad4 ptb6 plr10 flex-cc cursor bgi3 white ml10" @click.stop="state.reset = {}, state.isFalse2 = true">
            <i-ep-refresh class="f12 fw" /><span class="f14 ml5">恢复</span>
          </div>
        </div>
      </div>
      <!-- 内容 -->
      <div class="ww100 flex-col">
        <div class="ww100 flex-sc mb15" v-for="(v, k, i) in state.bakconfig?Object.fromEntries(Object.entries(state.bakconfig).filter(([key, value]) => value && key !== 'restoreStarupList')):{}" :key = 'i'>
          <span class="ww28">{{ k }}</span>
          <el-input size="large" v-model="state.bakconfig[k]" placeholder="请输入" />
        </div>
      </div>
    </div>
    <!-- 恢复 -->
    <el-dialog v-model="state.isFalse2" title="数据恢复" :draggable="true" width="30%">
      <div class="layout-col white p20">
        <!-- 内容 -->
        <div class="ww100 flex-col">
          <div class="ww100 flex-sc mb15">
            <span class="w50x4">manger</span>
            <el-input size="large" v-model="state.reset['manger']" placeholder="请输入" />
          </div>
          <div class="ww100 flex-sc mb15">
            <span class="w50x4">bakFilePath</span>
            <el-input size="large" v-model="state.reset['bakFilePath']" placeholder="请输入" />
          </div>
          <div class="ww100 flex-sc mb15">
            <span class="w50x4">bakProgramPath</span>
            <el-input size="large" v-model="state.reset['bakProgramPath']" placeholder="请输入" />
          </div>
          <div class="ww100 flex-sc mb15">
            <span class="w50x4">bakSavePath</span>
            <el-input size="large" v-model="state.reset['bakSavePath']" placeholder="请输入" />
          </div>
        </div>
        <!-- 结尾 -->
        <div class="ww100 flex-bc mt15">
          <div class="flex-sc">
            <span class="f15 fw"></span>
          </div>
          <div class="flex-ec flex1 h30">
            <div class="rad4 ptb8 plr12 flex-cc cursor bgc white ml10" @click.stop="state.isFalse2 = false">
              <span class="f14 ml5">取 消</span>
            </div>
            <div class="rad4 ptb8 plr12 flex-cc cursor bgi3 white ml10" @click.stop="handleClick('reset')">
              <span class="f14 ml5">确 定</span>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </el-dialog>
</template>

<script lang="ts" setup>
  import api from '@/api'
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const state = reactive({
	  ...publicStore.$state,
  })

  // 弹窗
  const onVisable = async (val?: any) => {
    state.isFalse = !state.isFalse
    if(!state.isFalse) return
    init()
  }
  
  const init = async() => {
    // 获取配置
    await getConfig()
  }

  const getConfig = async() => {
    const query = {}
    let params = {query: query, ip: proxy.getHttp('ip'), port: "8808", url: "/api/v1.0/p3000/monitorOnline/commFrontEndProcessor/sensor/c/backup/getconfig"}
    let res = await publicStore.http({httpApi: params})
    state.bakconfig = proxy.isNull(res)? {} : res.data.bakconfig
    console.log("state.bakconfig", state.bakconfig)
  }

  // 事件
  const handleClick = (remark, val) => {
    if(remark == 'set'){
      ElMessageBox.confirm('是否确定设置?', '温馨提示', {confirmButtonText: '确定', cancelButtonText: '关闭', type: 'success'}).then(async() => {
        await setConfig()
      })
    }
    if(remark == 'back'){
      ElMessageBox.confirm('是否确定备份?', '温馨提示', {confirmButtonText: '确定', cancelButtonText: '关闭', type: 'success'}).then(async() => {
        await setBack()
      })
    }
    if(remark == 'reset'){
      ElMessageBox.confirm('是否确定恢复?', '温馨提示', {confirmButtonText: '确定', cancelButtonText: '关闭', type: 'success'}).then(async() => {
        await setReset()
      })
    }
  }

  // 配置
  const setConfig = async() => {
    const query = {...state.bakconfig}
    let params = {query: query, ip: proxy.getHttp('ip'), port: "8808", url: "/api/v1.0/p3000/monitorOnline/commFrontEndProcessor/sensor/c/backup/setconfig"}
    // let res = await publicStore.http({httpApi: params})
    api.httpApi(params).then((res:any) => {
      if(res.code == 200 && res.data && res.data.errcode == 0){
        ElNotification({ title: '提示', message: '配置成功', type: 'success' })
      }else{
        ElNotification({ title: '提示', message: '配置失败', type: 'error' })
      }
    }).catch((err) => {
      ElNotification({ title: '提示', message: '配置失败', type: 'error' })
    })
  }

  // 备份
  const setBack = async() => {
    const query = {}
    let params = {query: query, ip: proxy.getHttp('ip'), port: "8808", url: "/api/v1.0/p3000/monitorOnline/commFrontEndProcessor/sensor/c/backup/startbackup"}
    // let res = await publicStore.http({httpApi: params})
    api.httpApi(params).then((res:any) => {
      if(res.code == 200 && res.data && res.data.errcode == 0){
        ElNotification({ title: '提示', message: '备份成功', type: 'success' })
      }else{
        ElNotification({ title: '提示', message: '备份失败', type: 'error' })
      }
    }).catch((err) => {
      ElNotification({ title: '提示', message: '备份失败', type: 'error' })
    })
  }

  // 恢复
  const setReset = async() => {
    const query = {...state.reset}
    let params = {query: query, ip: proxy.getHttp('ip'), port: "8808", url: "/api/v1.0/p3000/monitorOnline/commFrontEndProcessor/sensor/c/backup/rebackup"}
    // let res = await publicStore.http({httpApi: params})
    api.httpApi(params).then((res:any) => {
      if(res.code == 200 && res.data && res.data.errcode == 0){
        ElNotification({ title: '提示', message: '恢复成功', type: 'success' })
      }else{
        ElNotification({ title: '提示', message: '恢复失败', type: 'error' })
      }
    }).catch((err) => {
      ElNotification({ title: '提示', message: '恢复失败', type: 'error' })
    })
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