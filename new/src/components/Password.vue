<template>
  <el-dialog v-model="state.isFalse" title="密码重置" center :before-close="onVisable" :draggable="true" width="30%">
    <el-form ref="formRef" :model="state.form" :rules="state.ruleList" label-width="85px">
      <el-form-item label="新密码" prop="password">
        <el-input size="large" v-model="state.form.password" placeholder="请输入" type="password" show-password/>
      </el-form-item>
      <el-form-item label="确定密码" prop="passwords">
        <el-input size="large" v-model="state.form.passwords" placeholder="请输入" type="password" show-password/>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button size="large" type="info" class="i23 bg-white" @click="onVisable">取 消</el-button>
        <el-button size="large" type="info" class="white bgi22" @click.stop="handleSubmit(formRef)">修 改</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
  import api from '../api'
  import CryptoJS from 'crypto-js'
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  // 自定义密码验证规则
  const validatePassword = (rule, value, callback) => {
    // 1. 必填验证（空值、空白字符串）
    if (!value || value.trim() === '') {
      return callback(new Error('密码为必填项'))
    }
    // 2. 去除首尾空格后验证长度
    const trimmedValue = value.trim()
    if (trimmedValue.length <= 8) {
      return callback(new Error('密码长度必须大于8位'))
    }
    // 3. 复杂度验证
    const hasLetter = /[a-zA-Z]/.test(trimmedValue)  // 包含字母
    const hasNumber = /\d/.test(trimmedValue)        // 包含数字
    const hasSymbol = /[~`!@#$%^&*()_+\-=\[\]{}|;':",.<>\/?\\]/.test(trimmedValue) // 包含符号
    if (!hasLetter || !hasNumber || !hasSymbol) {
      return callback(new Error('密码必须同时包含字母、数字和特殊符号'))
    }
  }
  const state = reactive({
	  ...publicStore.$state,
    ruleList: {
      password: [{ required: true, message: '请输入', trigger:['blur'] }],
      passwords: [{ required: true, message: '请输入', trigger: ['blur'] }],
    }
  })
  let formRef = $ref()
  const emit = defineEmits(['init', 'changeSelect'])
  const props = defineProps({
    state: {
      type: [Object, Array],
      default: ()=>{return {}}
    },
  })

  // 弹窗
  const onVisable = async (val?: any) => {
    state.isFalse = !state.isFalse
    if(!state.isFalse) return
    state.form = {...val}
  }

  // 提交
  const handleSubmit = async(formEl) => {
    formEl.validate(async valid =>{
      if(valid) {
        let msg1 = proxy.checkPassword(state.form.password)
        if(msg1) return ElNotification({ title: '提示', message: msg1, type: 'error' })
        let msg2 = proxy.checkPassword(state.form.passwords)
        if(msg2) return ElNotification({ title: '提示', message: msg2, type: 'error' })
        if(state.form.password != state.form.passwords) return ElNotification({ title: '提示', message: '密码不一致', type: 'error' })
        // 用户密码
        let password = CryptoJS.MD5([state.form.password].toString().trim()).toString().toUpperCase();
        let passwords = CryptoJS.MD5([state.form.passwords].toString().trim()).toString().toUpperCase();
        let form = {id: state.form[props.state.key]?state.form[props.state.key]:configStore.user.id, password: proxy.generateRandomString(5) + password + proxy.generateRandomString(5)}
        let params = {model: "t_user", list: [form]}
        api['updApi'](params).then((res:any) => {
          if(res.code == 200){
            ElNotification({ title: '提示', message: '重置成功', type: 'success' })
            onVisable()
            if(state.form[props.state.key]){
              emit('init', state.form[props.state.key])
            }else{
              configStore.password = 'false'
            }
            proxy.log([{level: 'info', type: '2', name: '密码重置', msg: `${state.form.name}(${state.form.username}) - 重置密码成功`, res: '1', user: configStore.user.name, username: configStore.user.username, stationnum: configStore.distributId}])
          }else{
            ElNotification({ title: '提示', message: '操作失败1', type: 'error' })
          }
        }).catch((err) => {
          ElNotification({ title: '提示', message: '操作失败2', type: 'error' })
        })
      }
	  }).catch((err:any) =>{
		  console.log('表单错误信息：', err);
	  })
  }

  // 暴露
  defineExpose({
    onVisable
  })
</script>

<style scoped lang="scss">

</style>