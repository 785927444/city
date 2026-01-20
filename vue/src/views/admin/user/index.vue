<template>
  <div class="layout-col">
    <!-- 标题 -->
    <aa-title title="用户">
      <template #right-content>
        <div class="flex-ec flex1">
          <div class="rad4 ptb5 plr8 flex-cc cursor bgi22 i21 ml10 bo-i21-1" 
            v-if="state.content.find(v=>{return typeof(v.key) == 'object'}) && state.content.find(v=>{return typeof(v.key) == 'object'})['key'].hasOwnProperty('add')" 
            @click.stop="handleClick('add', state.addItem)">
            <i-ep-plus class="f12 fw" /><span class="f14 ml4">{{state.content.find(v=>{return typeof(v.key) == 'object'})['key'].add}}</span>
          </div>
        </div>
      </template>
    </aa-title> 
    <!-- 内容 -->
    <div class="layout-col ba1">
      <div class="row bgi22">
        <div :style="{textAlign: v.align}" v-for="(v, i) in state.content" :key="i" v-show="v.show" :class="typeof(v.key) == 'object'?v.width +' '+ 'mlr5':v.width">{{v.name}}</div>
      </div>
      <div class="table">
        <div class="row cursor" :class="publicStore.active[state.key] == item[state.key]?'active':index%2 == 1?'bgi23':'bgi18'" v-for="(item, index) in state.list" :key="index" @click="handleClick('active', item)">
          <div v-show="v.show" :class="v.width" :style="{textAlign: v.align}" v-for="(v, i) in state.content" :key="i">
            <span v-if="typeof(v.key) == 'object'" class="cursor mlr5" :class="kk=='add'||state.auth[kk] == false?'none':kk=='del'?item['username']=='admin'?'ca':'i8':'i21'" v-for="(vv, kk, ii) in v.key" :key="ii" @click.stop="handleClick(kk, item)">{{vv}}</span>
            <span v-else-if="v.key=='*'">{{(state.page-1)*state.limit + index+1}}</span>
            <span v-else-if="v.type == 'time'">{{item[v.key] == 0?'/':parseTime(item[v.key])}}</span>
            <span v-else-if="v.type == 'select'" :class="find(v.list, [v.value, item[v.key]], 'color')?find(v.list, [v.value, item[v.key]], 'color'):''">
              {{find(v.list, [v.value, item[v.key]], v.label)}}
            </span>
            <span v-else-if="v.type == 'switch'">
              <el-switch v-model="item[v.key]" :active-text="v.value[1].name" :inactive-text="v.value[0].name" :active-value="v.value[1].value" :inactive-value="v.value[0].value" inline-prompt @change="handleClick('switch', item)"></el-switch>
            </span>
            <span v-else-if="v.type == 'input'"><el-input v-model="item[v.value]" placeholder="请输入" style="width: 150px;" size="small" /></span>
            <span v-else-if="v.type == 'preload'&&v.filed">{{item[v.key]?item[v.key][v.filed]:''}}</span>
            <span v-else-if="v.type == 'image'" class="flex-sc warp">
              <div class="flex-sc" v-if="typeof(item[v.key]) == 'string'">
                <el-image class="w25 h25 m2 rad3 cursor" v-if="item[v.key].length!=0" :src="I(item[v.key])" :preview-src-list="state.srcList" @click.stop="state.srcList= [];state.srcList.push(I(item[v.key]))" />
                <span class="w50 h25 ca flex-sc" v-else>暂无</span>
              </div>
              <div class="flex-sc" v-else v-for="(img, ii) in item[v.key]" :key="ii">
                <el-image :class="ii==0?'':'ml5'" class="w25 h25 rad3 cursor" :src="I(img)" :preview-src-list="state.srcList" @click.stop="state.srcList= [];state.srcList.push(I(img))" />
              </div>
            </span>
            <span v-else-if="v.key == 'phone'">{{isNull(item[v.key]) && v.key!=''? '/' : encryptPhone(item[v.key])}}</span>
            <span v-else-if="v.type == 'decrypt'">{{isNull(item[v.key]) && v.key!=''? '/' : decrypt(item[v.key])}}</span>
            <span v-else>{{isNull(item[v.key]) && v.key!=''? '/' : item[v.key]}}</span>
          </div>
        </div>
        <div v-if="state.empty" class="flex-cc ww100 tc ptb13 bgi18">没有数据</div>
      </div>
    </div>
		<!-- 底部 -->
		<aa-foot></aa-foot>
    <Add @init="init" :state="state" ref="addRef" />
    <Password @init="init" :state="state" ref="passwordRef" />
  </div>
</template>

<script lang="ts" setup>
import { tr } from 'element-plus/es/locales.mjs'

	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const dictStore = proxy.dictStore()
  let asyncsRef = $ref()
  let addRef = $ref()
  let passwordRef = $ref()
  const locks = [
    {value: '0', name: '正常', color: 'i11'},
    {value: '1', name: '锁定', color: 'i8'},
  ]
  const statuss = [
    {value: '0', name: '正常', color: 'i11'},
    {value: '1', name: '禁用', color: 'i8'},
  ]
  const state = reactive({
	  ...publicStore.$state,
    key: 'id',
    content: [
      { width: 'w70',   show: true, align: 'center', key: '*', name: '序号' },
      { width: 'w50x3', show: true, align: 'left', key: 'username', name: '用户' },
      { width: 'w50x3', show: true, align: 'left', key: 'name', name: '名称' }, 
      { width: 'w50x3', show: true, align: 'left', key: 'role_id', name: '角色', type: 'select', list: [], value: 'id', label: 'name' },
      { width: 'w50x4', show: true, align: 'left', key: 'phone', name: '电话' },  
      { width: 'w50x3', show: true, align: 'left', key: 'lock', name: '登录状态', type: 'select', list: locks, value: 'value', label: 'name' },
      { width: 'w50x3', show: true, align: 'left', key: 'status', name: '账户状态', type: 'select', list: statuss, value: 'value', label: 'name' },
      { width: 'w50x4', show: true, align: 'left', key: 'expire', name: '过期', type: 'time' },
      { width: 'flex1', show: true, align: 'right', key: {},  name: '操作' },
    ],
    editFrom: [
      { required: false, editshow: true, name: '所属', key: 'station_num', type: 'select', list: [], value: 'id', label: 'station_name' },
      { required: true,  editshow: true,  key: 'role_id', name: '角色', type: 'select', list: [], value: 'id', label: 'name' },
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
    publicStore.init({path: '/user'}, state)
    if(!configStore.distributId) configStore.distributId = '0'
    let query1 = {model: "t_station", args: `parent_id='0'`}
    let query2 = {model: 't_role', args: `id!=1`, order: `CAST(id AS SIGNED) ASC`}
    let params = {Api1: query1, Api2: query2}
    let res = await publicStore.http(params)
    publicStore._public.stations = proxy.isNull(res.Api1)? [] : res.Api1.sort((a, b) => a.order - b.order)
    publicStore._public.roles = proxy.isNull(res.Api2)? [] : res.Api2
    init()
  })

  watch(() => configStore.distributId, async(val, old) => {
    await nextTick()
    if(proxy.isNull(val)) return
    init()
  }, {immediate: false, deep: true})

  watch(() => publicStore.isTrue, async(val) => {
    await nextTick()
    init(publicStore.active.id)
  }, {immediate: false, deep: true})

  const init = async() => {
    state.query = !configStore.distributId || configStore.distributId=='0'? {model: state.model, order: `CAST(id AS SIGNED) ASC`} : {model: state.model, args: `station_num='${configStore.distributId}'`, order: `CAST(id AS SIGNED) ASC`}
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
    state.addItem = {station_num: configStore.distributId&&configStore.distributId!="0"?configStore.distributId:'', status: '0'}
    state.editFrom.forEach(v => { 
      if(v.key == 'station_num') v.list = [...[{id: '', station_name: '无'}], ...publicStore._public.stations]
      if(v.key == 'role_id') v.list = publicStore._public.roles 
    })
    state.content.forEach(v => { if(v.key == 'role_id') v.list = publicStore._public.roles })

  }

  const handleClick = async(remark, val) => {
    if(remark == 'add'){
      addRef.onVisable(val)
    }
    if(remark == 'upd'){
      let editshow = val.username? false :true
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
  