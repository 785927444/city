<template>
  <el-config-provider :locale="state.locale">
    <router-view v-if="state.isRouterActive" />
  </el-config-provider>
</template>

<script setup lang="ts">
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import useMqtt from '@/utils/useMqtt'
import scheduled from "@/utils/scheduled"
const { createScheduled } = scheduled()
const { startMqtt } = useMqtt()
const { proxy }:any = getCurrentInstance()
const publicStore = proxy.publicStore()
const configStore = proxy.configStore()
const state = reactive({
	...publicStore.$state,
	locale: zhCn,
	isRouterActive: true,
  timerArr: [],
  now: 0,
})
configStore.init = 'true'

provide('reload', () => {
	state.isRouterActive = false
	nextTick(() => {
		state.isRouterActive = true
	})
})

if(configStore.isMqtt && configStore.isMqtt != 'false'){
  startMqtt('testtopic', (topic, message) => {
    const msg = JSON.parse(message.toString());
    console.log('mqtt--', msg)
  })
}

onMounted(async() => {
  document.addEventListener('contextmenu', handleContextMenu)
  document.addEventListener('keydown', handleKeyDown)
  createScheduled('detectDevTools', 1000, () =>  detectDevTools())
  createScheduled('checkLgoin', 10000, () =>  checkLgoin())
})

onUnmounted(() => {
  delTimer()
})

// 禁止右键菜单
const handleContextMenu = (e) => {
  if(!configStore.debugger) e.preventDefault()
}
// 禁止键盘输入
const handleKeyDown = (e) => {
  // 检测 Ctrl+Shift+F11
  if (e.ctrlKey && e.shiftKey && e.key === 'F11') {
    configStore.debugapi = !configStore.debugapi
    let msg = configStore.debugapi?`已开启`:`已关闭`
    alert(msg)
  }
  // 检测 Ctrl+Shift+F12
  if (e.ctrlKey && e.shiftKey && e.key === 'F12') {
    configStore.debugger = !configStore.debugger
    let msg = configStore.debugger?`已开启`:`已关闭`
    alert(msg)
  }
  if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') ||  (e.ctrlKey && e.shiftKey && e.key === 'J') || (e.ctrlKey && e.key === 'U')) {
    if(!configStore.debugger) e.preventDefault()
  }
}
// 检查登录
const checkLgoin = async() => {
  if(configStore.config && configStore.config.checkLogin){
    if(proxy.isNull(configStore.tourist)) return
    let query = {model: "t_user", args: `username='${configStore.tourist.username}'`}
    let res = await publicStore.http({Api: query})
    console.log("登录检查结果res---", res)
  }
}
// 综合检测
const detectDevTools = () => {
  if(configStore.debugger) return true
  // 方法1: debugger时间差检测
  const start = performance.now();
  (function(){}).constructor("debugger")()
  if (performance.now() - start > 100) {
    return true
  }
  // 方法2: 窗口大小检测
  const widthThreshold = window.outerWidth - window.innerWidth > 160
  const heightThreshold = window.outerHeight - window.innerHeight > 160
  if (widthThreshold || heightThreshold) {
    return true
  }
  // 方法3: 特殊属性检测
  try {
    if (window.Firebug && window.Firebug.chrome && window.Firebug.chrome.isInitialized) {
      return true
    }
  } catch(e) {}
  return false
}

const mock = async() => {
  delTimer()
  if(!configStore.isMock) return
  console.log('触发模拟器')
  let query = {model: "t_simulator"}
  let res = await publicStore.http({Api: query})
  let list = proxy.isNull(res)? [] : res.sort((a, b) => a.order - b.order)
  if(list.length == 0) return
  list.forEach(v => {v.apis = JSON.parse(v.apis)})
  state.list = list
  state.list.forEach(item => {
    if(item.status){
      item.apis.forEach(v => {
        setTimer(item, v)
      })
    }
  })
}

const setTimer = (item, val) => {
  if(!item.status) return
  if(!item.http&&val.http) return
  if(!val.status) return
  if(!val.path) return
  if(!val.time) return
  getMock(item, val)
  if(val.time <= 0) return
  let timeid = setInterval(() => {
    if(!item.status) return
    if(!item.http&&val.http) return
    if(!val.status) return
    if(!val.path) return
    if(!val.time) return
    getMock(item, val)
  }, 1000*val.time)
  let timer = {id: item.id, timeid: timeid}
  state.timerArr.push(timer)
}

const getMock = async(item, val) => {
  let params = getParams(val)
  console.log('开始模拟', val.title, params)
  // publicStore.http({Api: params}, val.path, {ip: val.http?val.http:item.http}).then(res=>{
  //   console.log('模拟结果', res)
  // })
  publicStore.http({httpApi: {query: params, ip: val.http?val.http:item.http, url: val.path}}).then(res=>{
    console.log('模拟结果', res)
  })
}

const getParams = (v) => {
  state.now = parseInt(Date.now())
  let params = {}
  if(v.paramsType == 1) {
    if(v.params1.length == 0){
      params = {}
    }else if(v.params1.length == 1){
      if(!v.params1[0].json){
        params = {}
      }else{
        params = JSON.parse(v.params1[0].json)
      }
    }else{
      params = v.params1.map(item => JSON.parse(item.json))
    }
  }
  if(v.paramsType == 2){
    if(v.params2.length == 0){
      params = {}
    }else if(v.params2.length == 1){
      if(v.params2[0].json.length == 0){
        params = {}
      }else{
        params = getQuery(v.params2[0])
      }
    }else{
      let paramArr = []
      v.params2.map(item => {
        let query = getQuery(item)
        paramArr.push(query)
      })
      params = paramArr
    }
  }
  return params
}

const getQuery = (val) => {
  let query = {}
  let value = '-.-'
  val.json.map(v => {
    // 定值
    if(v.valueType == 1){
      value = v.value
    }
    // 时间
    if(v.valueType == 2){
      value = v.value == 1? state.now : v.value == 2? Math.floor(state.now / 1000) : proxy.parseTime(new Date())
    }
    // 随机
    if(v.valueType == 3){
      if(v.value[1] && v.value[0] && Number(v.value[1]) > Number(v.value[0])){
          let rand = (Math.random() * (Number(v.value[1]) - Number(v.value[0]))) + Number(v.value[0])
          value = Math.floor(rand*100)/100
      }
    }
    // 顺序数组
    if(v.valueType == 4){
      if(v.value.length != 0 && v.value[0].val){
        let l = v.value.length
        let i = v.value.findIndex(a=>a.status)
        if(i == -1) {
          value = v.value[0].val
          if(l!=1) v.value[1].status = true
        }else{
          value = v.value[i].val
          v.value[i].status = false
          if(l!=i+1) {
            v.value[i+1].status = true
          }else{
            v.value[0].status = true
          }
        }
      }
    }
    // 随机数组
    if(v.valueType == 5){
      if(v.value.length != 0 && v.value[0].val){
        let l = v.value.length
        let i = Math.floor(Math.random() * l)
        value = v.value[i].val
      }
    }
    query[v.key] = v.type == 'int'? parseInt(value) : v.type == 'float'? parseFloat(value) : value + ''
  })
  return query
}

const delTimer = () => {
  if(state.timerArr.length != 0){
    state.timerArr.forEach((item, index) => {
      clearInterval(item.timeid)
    })
    state.timerArr = []
  }
}

watch(() => configStore.isMock, async(val) => {
  mock()
}, {immediate: true, deep: true})

</script>

<style lang="scss" scoped>

</style>
