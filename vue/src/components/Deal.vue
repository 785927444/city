<template>
  <div class="topclass">
    <el-dialog v-model="state.isFalse" :title="title" :before-close="onVisable" :draggable="true" :width="650">
      <el-form ref="formRef" :model="state.form" :rules="proxy.isNull(configStore.user)?state.ruleList:{}" label-width="85px">
        <el-form-item label="账号" prop="login_name" v-if="proxy.isNull(configStore.user)">
          <el-input size="large" v-model="state.form.login_name" placeholder="登录账号" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="proxy.isNull(configStore.user)">
          <el-input size="large" v-model="state.form.password" placeholder="登录密码" type="password" show-password/>
        </el-form-item>
        <el-form-item label="方案" prop="operatorContent">
          <el-input size="large" v-model="state.form.clear_description" placeholder="请输入" :autosize="{ minRows: 3, maxRows: 5 }" type="textarea"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button size="large" type="info" class="i23 bg-white" @click="onVisable">取 消</el-button>
          <el-button size="large" type="info" class="white bgi22" @click.stop="handleSubmit(formRef)">提 交</el-button>
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
  const state = reactive({
	  ...publicStore.$state,
    ruleList: {
      login_name: [{ required: true, message: '请选择', trigger:['blur','change']  }],
      password: [{ required: true, message: '请输入', trigger: 'blur' }],
    },
    clickArr: [],
    mark: '',
  })
  const props = defineProps({
    title: {
      type: String,
      default: ()=>{return {}}
    },
  })
  const emit = defineEmits(['init'])
  let formRef = $ref()

  // 打开关闭弹窗
  const onVisable = async (val, mark) => {
    state.isFalse = !state.isFalse
    state.mark = ''
    if(!state.isFalse) return
    state.mark = mark
    state.clickArr = val.constructor === Object? [val] : val
    state.form.login_name = proxy.isNull(configStore.user)? '' : configStore.user.username
    state.form.password = ''
    state.form.clear_description = ''
  }

  const handleSubmit =(formEl) => {
    formEl.validate(async valid =>{
      let form = Object.assign({}, state.form)
      let user = {}
      if(proxy.isNull(configStore.user)){
        form.password = CryptoJS.MD5([form.password].toString().trim()).toString().toUpperCase();
        let query = {model: "t_user", args: `username='${form.login_name}' and password='${form.password}'`}
        let res = await publicStore.http({Api: query})
        if(proxy.isNull(res)) return ElNotification({ title: '提示', message: '操作失败', type: 'error' })
        user = res[0]
      }else{
        user = configStore.user
      }
      if(proxy.isNull(user)) return ElNotification({ title: '提示', message: '用户不存在', type: 'error' })
      if(configStore.distributId && user.station_num && configStore.distributId != user.station_num) return ElNotification({ title: '提示', message: '操作失败(不属于此站)', type: 'error' })
      let parmas = {model: 't_sensor_alarm_log', list: []}
      state.clickArr.forEach(item => {
        delete item['click']
        delete item['device_name']
        item.clear_by_login_name = user.username
        item.clear_by_name = user.name
        item.clear_type = '1'
        item.clear_time = new Date().getTime() + ''
        item.clear_description = form.clear_description
        parmas.list.push(item)
      })
      api.updApi(parmas).then((res) => {
        if(res.code == 200){
          ElNotification({ title: '提示', message: '操作成功', type: 'success' })
          emit('init')
          onVisable()
        }
      }).catch((err) => {
        ElNotification({ title: '提示', message: '操作失败', type: 'error' })
      })
    })
  }

  // 暴露
  defineExpose({
    onVisable
  })
</script>

<style scoped lang="scss">
  :deep(input:-webkit-autofill) {
    -webkit-text-fill-color: #f5f5f5;
  }
  :deep(.el-dialog__body){
    padding: 20px !important;
  }
</style>