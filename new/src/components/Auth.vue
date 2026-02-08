<template>
  <el-dialog v-model="state.isFalse" :title="title" :before-close="onVisable" :draggable="true" width="30%">
    <el-form ref="formRef" :model="state.form" :rules="state[`ruleList_${state.tab}`]" label-width="85px">
      <!-- 选择方式 -->
      <el-form-item label="" prop="">
        <div class="ww100 flex-sc white f20 i15">
          <div class="flex-sc pr20 cursor" :class="state.tab=='phone'?'':'white'" @click.stop="state.tab = 'username'; getCode()">账密登录</div>
          <div class="flex-sc pr20 cursor" :class="state.tab=='phone'?'white':''" @click.stop="state.tab = 'phone'">手机登录</div>
        </div>
      </el-form-item>
      <!-- 手机登录 -->
      <div class="ww100" v-if="state.tab=='phone'">
        <el-form-item label="手机号" prop="phone">
          <el-input size="large" v-model="state.form.phone" placeholder="手机号" maxlength="11" />
        </el-form-item>
        <el-form-item label="验证码" prop="phonecode">
          <div class="flex-sc ww100">
            <el-input size="large" v-model="state.form.phonecode" placeholder="短信验证" autocomplete="off"/>
            <el-button size="large" type="info" class="white bgi22 ml15" @click.stop="sendCode()" v-if="!state.times">发送验证码</el-button>
            <el-button size="large" type="info" class="white bgca ml15 w100" v-if="state.times">{{ state.times + 's' }}</el-button>
          </div>
        </el-form-item>
      </div>
      <!-- 密码登录 -->
      <div class="ww100" v-if="state.tab=='username'">
        <el-form-item label="账号" prop="username">
          <el-input size="large" v-model="state.form.username" placeholder="登录账号" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input size="large" v-model="state.form.password" placeholder="登录密码" type="password" show-password/>
        </el-form-item>
        <el-form-item prop="code" label="验证" :rules="[{required: true, message: '图片验证必须', trigger: 'blur'}]" v-if="state.identifyCode">
          <div class="flex-sc ww100 hidden">
            <el-input size="large" v-model="state.form.code" placeholder="请输入验证" autocomplete="off"/>
            <Identify class="ml15" :identifyCode="state.identifyCode" @click.stop="getCode()"></Identify>
          </div>
        </el-form-item>
      </div>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button size="large" type="info" class="i23 bg-white" @click="onVisable">取 消</el-button>
        <el-button size="large" type="info" class="white bgi22" @click.stop="handleSubmit()">提 交</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
  import api from '@/api'
  import CryptoJS from 'crypto-js'
  const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  // const route = useRoute()
  let formRef = $ref()
  const state = reactive({
	  ...publicStore.$state,
    tab: 'username',
    ruleList_username: {
      username: [{ required: true, message: '请选择', trigger:['blur','change']  }],
      password: [{ required: true, message: '请输入', trigger: 'blur' }],
    },
    ruleList_phone: {
      phone: [{ required: true, message: '请选择', trigger:['blur','change']  }],
      phonecode: [{ required: true, message: '请输入', trigger: 'blur' }],
    },
    times: 0,
    timesMark: '',
  })
  const props = defineProps({
    title: {
      type: String,
      default: ()=>{return {}}
    },
  })

  onMounted(async() => {
    window.addEventListener('keydown', handleEnter)
	})

  // 打开关闭弹窗
  const onVisable = async(val?:any) => {
    state.isFalse = !state.isFalse
    if(!state.isFalse) return
    state.form = Object.assign({}, val)
    state.form.username = proxy.isNull(configStore.user)? '' : configStore.user.username
    state.form.phone = proxy.isNull(configStore.user)? '' : configStore.user.phone
    state.form.password = ''
    if(configStore.config && !configStore.config.identifyCode && state.tab == 'username') getCode()
  }

  // 监控Enter
  const handleEnter = async(event: KeyboardEvent) => {
    // if(!state.isFalse) return
    if(event.key == 'Enter') {
      handleSubmit()
    }
  }

  // 获取图片验证
  let codeStatus = false
  const getCode = async() => {
    if(codeStatus) return
    codeStatus = true
    let time = new Date().getTime() + ''
    publicStore.http({codeApi: {time: time+''}}).then(res=>{
      codeStatus = false
      if(!proxy.isNull(res)) {
        state.time = time
        state.identifyCode = res
      }
    }).catch((err:any) =>{
      codeStatus = false
		  state.time = ''
      state.identifyCode = ''
	  })
  }

  // 获发送手机验证
  let phoneStatus = false
  const sendCode = async() => {
    if(phoneStatus) return
    if(!state.form.phone) return ElNotification({ title: '提示', message: '请输入手机号码', type: 'error' })
    if(!/^1[3-9]\d{9}$/.test(state.form.phone)) return ElNotification({ title: '提示', message: '请输入正确手机号码', type: 'error' })
    phoneStatus = true
    api.sendCodeApi({time: state.form.phone+''}).then(res=>{
      if(res.code == 200) {
        phoneStatus = false
        state.times = 60
        if(state.timesMark) clearInterval(state.timesMark)
        state.timesMark = setInterval(() => {
          if(state.times > 0) {
            state.times--
          }else{
            clearInterval(state.timesMark)
          }
        }, 1000)
        return ElNotification({ title: '提示', message: res.msg, type: 'success' })
      }else{
        phoneStatus = false
        state.times = 0
        return ElNotification({ title: '提示', message: res.msg, type: 'error' })
      }
    }).catch((err:any) =>{
      phoneStatus = false
      state.times = 0
      return ElNotification({ title: '提示', message: res.msg, type: 'error' })
    })
  }

  // 登录
  let submitStatus = false
  const handleSubmit =() => {
    formRef.validate(async valid =>{
      // 验证通行
      if(!valid) return
      if(state.tab == 'username' && state.identifyCode && state.form.code != state.identifyCode){
        getCode()
        return ElNotification({ title: '提示', message: '验证输入有误', type: 'error' })
      }
      // 开始请求
      getQuery()
      if(submitStatus) return
      submitStatus = true
      state.loading = true
      api.loginApi(state.query).then((result:any) => {  
        // 结束请求
        submitStatus = false
				state.loading = false
        if(result.code == 200) {
          let res = result.data
          if(!proxy.isNull(res) && !proxy.isNull(res.user)){
            // 处理解密
            // if(!proxy.isNull(res.user.username)) res.user.username = proxy.decrypt(res.user.username)
            // if(!proxy.isNull(res.user.name)) res.user.name = proxy.decrypt(res.user.name)
            // if(!proxy.isNull(res.user.phone)) res.user.phone = proxy.decrypt(res.user.phone)
            configStore.$patch({token: res.token, user: res.user, distributId: res.user.station_num?res.user.station_num:configStore.distributId?configStore.distributId:'', password: 'false'})
            ElNotification({ title: '提示', message: '登录成功', type: 'success' })
            onVisable()
            proxy.toPath('/admin')
          }else{
            return ElNotification({ title: '提示', message: '获取用户信息失败', type: 'error' })
          }
        }else{
          return ElNotification({ title: '提示', message: result.msg, type: 'error' })
        }
			}).catch((err:any) =>{
        submitStatus = false
        state.loading = false
        console.log('响应错误信息：', err);
      })
	  }).catch((err:any) =>{
      submitStatus = false
			state.loading = false
		  console.log('表单错误信息：', err);
	  })
  }

  // 获取请求参数
  const getQuery = () => {
    // 账密登录
    if(state.tab == 'username'){
      let username = state.form.username? proxy.encrypt(state.form.username.trim()) : ''
      let password = state.form.password? proxy.generateRandomString(5) + CryptoJS.MD5([state.form.password].toString().trim()).toString().toUpperCase() + proxy.generateRandomString(5) :''      
      let code = state.form.code? state.form.code.trim() : ''
      if(state.identifyCode){
        let identify = {code: code, time: state.time+''}
        state.query = {model: "t_user", args: `username='${username}' and password='${password}'`, identify: identify}
      }else{
        state.query = {model: "t_user", args: `username='${username}' and password='${password}'`}
      }
    }
    // 手机登录
    if(state.tab == 'phone'){
      let phone = state.form.phone? proxy.encrypt(state.form.phone.trim()) : ''
      let phonecode = state.form.phonecode? state.form.phonecode.trim() : ''
      let identify = {code: phonecode, time: phone}
      state.query = {model: "t_user", args: `phone='${phone}'`, identify: identify}
    }
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
</style>