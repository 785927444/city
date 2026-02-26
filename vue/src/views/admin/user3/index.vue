<template>
  <div class="layout-col">
    <!-- 标题 -->
    <aa-title title="系统用户">
      <template #left-content></template>
      <template #right-content>
        <div class="rad4 ptb5 plr8 flex-cc cursor bgi1 white ml10" 
          v-if="state.content.find(v=>{return typeof(v.key) == 'object'}) && state.content.find(v=>{return typeof(v.key) == 'object'})['key'].hasOwnProperty('add')" 
          @click.stop="handleClick('add', state.addItem)">
          <i-ep-plus class="f12 fw" /><span class="f14 ml4">{{state.content.find(v=>{return typeof(v.key) == 'object'})['key'].add}}</span>
        </div>
      </template>
    </aa-title>
    <!-- 内容 -->
    <div class="layout-col white-rgba50 rad8 p15">
      <List @handleClick="handleClick" :state="state"/>
    </div>
    <!-- 底部 -->
    <aa-foot></aa-foot>
    <Add @init="init" :state="state" ref="addRef" />
    <Password @init="init" :state="state" ref="passwordRef" />
  </div>
</template>

<script lang="ts" setup>
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const dictStore = proxy.dictStore()
  let asyncsRef = $ref()
  let addRef = $ref()
  let passwordRef = $ref()
  const locks = [
    {value: '0', name: '正常', color: 'i12'},
    {value: '1', name: '锁定', color: 'i8'},
  ]
  const statuss = [
    {value: '0', name: '正常', color: 'i12'},
    {value: '1', name: '禁用', color: 'i8'},
  ]
  const state = reactive({
	  ...publicStore.$state,
    content: [
      { width: 'w70',   show: true, align: 'center', key: '*', name: '序号' },
      { width: 'w50x4', show: true, align: 'left', key: 'username', name: '用户' },
      { width: 'w50x4', show: true, align: 'left', key: 'name', name: '名称' }, 
      { width: 'w50x4', show: true, align: 'left', key: 'phone', name: '电话' },  
      { width: 'w50x4', show: true, align: 'left', key: 'lock', name: '登录状态', type: 'select', list: locks, value: 'value', label: 'name' },
      { width: 'w50x4', show: true, align: 'left', key: 'status', name: '账户状态', type: 'select', list: statuss, value: 'value', label: 'name' },
      { width: 'w50x4', show: true, align: 'left', key: 'expire', name: '过期', type: 'time' },
      { width: 'flex1', show: true, align: 'right', key: {},  name: '操作' },
    ],
    editFrom: [
      { required: true,  editshow: true,  key: 'name', name: '名称', type: 'input', encrypt: true },
      { required: true,  editshow: true, key: 'username', name: '用户', type: 'input', encrypt: true },
      { required: true,  editshow: true, key: 'password', name: '密码', type: 'password' },
      { required: true,  editshow: true,  key: 'phone', name: '电话', type: 'input', encrypt: true },
      { required: false, editshow: true,  key: 'status', name: '状态', type: 'select', list: statuss, value: 'value', label: 'name' },
      { required: false, editshow: true, key: 'expire', name: '过期', type: 'time' },
    ],
    editFrom2: [
      { required: true, editshow: 'disabled', key: 'username', name: '账号', type: 'input' },
      { required: true, editshow: true,       key: 'Password',   name: '密码', type: 'password' }, 
    ],
    addItem: {},
  })

  onMounted(async() => {
    await publicStore.init({path: '/user'}, state)
    init()
  })

  const init = async() => {
    state.query = {model: state.model, args: `role_id='1'`, order: `CAST(id AS SIGNED) ASC`}
    state.params = {Api: state.query}
    let res = await publicStore.http(state.params)
    state.empty = proxy.isNull(res)? true : false
    let list = proxy.isNull(res)? [] : res
    let query = {model: "redis"}
    query.key = list.map(v => { return "errtime_" + v.username })
    let redis = await publicStore.http({getApi: query})
    state.list = list.map((v, i) => {
      v.lock = !proxy.isNull(redis) && !proxy.isNull(redis[i]) && redis[i] >=5? '1' : '0'
      v.name = v.name?proxy.decrypt(v.name):''
      v.username = v.username?proxy.decrypt(v.username):''
      v.phone = v.phone?proxy.decrypt(v.phone):''
      return v
    })
    setInit()
  }

  const setInit = async() => {
    state.addItem = {station_num: publicStore.active.id, type: 'system', role_id: '1', status: '0' }
  }

  const handleClick = async(remark, val) => {
    if(remark == 'add'){
      addRef.onVisable(val)
    }
    if(remark == 'upd'){
      let editshow = val.username? false :true
      delete val.password
      state.editFrom.forEach(v => { 
        if(v.key == 'username') v.editshow = editshow
        if(v.key == 'password') v.editshow = editshow
      })
      addRef.onVisable(val)
    }
    if(remark == 'del'){
      if(val.username == 'admin') return ElNotification({ title: '提示', message: '系统管理员无法删除', type: 'error' })
      addRef.del(val)
    }
    if(remark == 'setpd'){
      // addRef.onVisable(val, 2)
      passwordRef.onVisable({...val, ...{password: '', passwords: ''}})
    }
    if(remark == 'unlock'){
      if(val.lock == '1'){
        ElMessageBox.confirm('是否确定解锁?', '温馨提示', {confirmButtonText: '确定', cancelButtonText: '关闭', type: 'success'}).then(async() => {
          let query = {model: "redis", key: `errtime_${proxy.encrypt(val.username)}`, value: '0', time: 1}
          let redis = await publicStore.http({setApi: query})
          proxy.log([{level: 'info', type: '2', name: '解锁', msg: `${val.name}(${val.username}) - 解锁成功`, res: '1', user: configStore.user.name, username: configStore.user.username, stationnum: configStore.distributId}])
          init()
        })
      }
    }
    if(remark == 'asyncs'){
      let ctx = {data: state.list, title: '用户'}
      asyncsRef.onVisable(ctx)
    }
  }

</script>
  
<style scoped lang="scss">

</style>
  