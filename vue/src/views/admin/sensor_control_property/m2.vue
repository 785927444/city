<template>
  <div class="layout-col flex4 ml16">
    <!-- 标题 -->
    <div class="h40 ww100 flex-sc relative mb10">
      <img class="hh100" src="@/assets/imgs/title4.png" />
      <div class="ww100 hh100 flex-sc absolute pl35">
        <span class="fw flex1 ptb5">控制 - {{!isNull(publicStore.active)?publicStore.active.name:''}}</span>
        <div class="flex-ec flex1">
          <div class="rad4 ptb5 plr8 flex-cc cursor bgi22 i21 ml10 bo-i21-1" 
            v-if="state.content.find(v=>{return typeof(v.key) == 'object'}) && state.content.find(v=>{return typeof(v.key) == 'object'})['key'].hasOwnProperty('setup')" 
            @click.stop="handleClick('setup')">
            <i-ep-starFilled class="f12 fw" /><span class="f14 ml4">{{state.content.find(v=>{return typeof(v.key) == 'object'})['key'].setup}}</span>
          </div>
          <div class="rad4 ptb5 plr8 flex-cc cursor bgi22 i21 ml10 bo-i21-1" 
            v-if="state.content.find(v=>{return typeof(v.key) == 'object'}) && state.content.find(v=>{return typeof(v.key) == 'object'})['key'].hasOwnProperty('sync')" 
            @click.stop="handleClick('sync')">
            <i-ep-helpFilled class="f12 fw" /><span class="f14 ml4">{{state.content.find(v=>{return typeof(v.key) == 'object'})['key'].sync}}</span>
          </div>
          <div class="rad4 ptb5 plr8 flex-cc cursor bgi22 i21 ml10 bo-i21-1" @click.stop="router.go(-1)" v-if="route.query&&route.query.sensorid">
            <i-ep-promotion class="f12 fw" /><span class="f14 ml4">返回</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 内容 -->
    <div class="row bgi22">
      <div :style="{textAlign: v.align}" v-for="(v, i) in state.content" :key="i" v-show="v.show" :class="typeof(v.key) == 'object'?v.width +' '+ 'mlr5':v.width">{{v.name}}</div>
    </div>
    <div class="table bss">
      <div class="row cursor" :class="publicStore.active[state.key] == item[state.key]?'active':index%2 == 1?'bgi23':'bgi18'" v-for="(item, index) in state.list" :key="index" @click="handleClick('active', item)">
        <div v-show="v.show" :class="v.width" :style="{textAlign: v.align}" v-for="(v, i) in state.content" :key="i">
          <span v-if="typeof(v.key) == 'object'" class="cursor mlr5" :class="kk=='setup'||kk=='sync'||state.auth[kk] == false?'none':kk=='del'?'i8':'i21'" v-for="(vv, kk, ii) in v.key" :key="ii" @click.stop="handleClick(kk, item)">{{vv}}</span>
          <span v-else-if="v.key=='*'">{{(state.page-1)*state.limit + index+1}}</span>
          <span v-else-if="v.type == 'time'">{{item[v.key] == 0?'/':parseTime(item[v.key])}}</span>
          <span v-else-if="v.type == 'select'" :class="find(v.list, [v.value, item[v.key]], 'color')?find(v.list, [v.value, item[v.key]], 'color'):''">
            {{find(v.list, [v.value, item[v.key]], v.label)}}
          </span>
          <span v-else-if="v.type == 'switch'">
            <el-switch v-model="item[v.key]" :active-text="v.value[1].name" :inactive-text="v.value[0].name" :active-value="v.value[1].value" :inactive-value="v.value[0].value" inline-prompt @change="handleClick('switch', item)"></el-switch>
          </span>
          <span v-else-if="v.type == 'input'"><el-input v-model="item[v.value]" placeholder="请输入" style="width: 150px;" size="small" /></span>
          <span v-else-if="v.type == 'image'" class="flex-sc warp">
            <div class="flex-sc">
              <el-image class="w25 h25 m2 rad3 cursor" v-if="item[v.key].length!=0" :src="item[v.key]" :preview-src-list="state.srcList" @click.stop="state.srcList= [];state.srcList.push(item[v.key])" />
              <span class="w50 h25 ca flex-sc" v-else>暂无</span>
            </div>
          </span>
          <span v-else>{{isNull(item[v.key]) && v.key!=''? '/' : item[v.key]}}</span>
        </div>
      </div>
      <div v-if="state.empty" class="flex-cc ww100 tc ptb13 bgi18">没有数据</div>
    </div>
    <Add @init="init" :state="state" ref="addRef" />
  </div>
</template>

<script lang="ts" setup>
  import api from '@/api'
  const router = useRouter()
  const route = useRoute()
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const dictStore = proxy.dictStore()
  let addRef = $ref()
  let statuss = $ref([
    {name: '未配置', value: 0, color: 'i8'},
    {name: '已配置', value: 1, color: 'i12'},
  ])
  const state = reactive({
	  ...publicStore.$state,
    ...dictStore.$state,
    content: [
      { width: 'w70',   show: true, align: 'center', key: '*', name: '序号' },  
      { width: 'w50x4', show: true, align: 'left', key: 'name', name: '名称' },
      { width: 'w50x4',   show: true, align: 'left', key: 'code', name: '控制点' },
      { width: 'w50x4', show: true, align: 'left', key: 'status', name: '状态', type: 'select', list: statuss, value: 'value', label: 'name' },
      { width: 'flex1', show: true, align: 'right', key: {setup: '默认', sync: '同步', upd:'编辑', del: '删除'}, name: '操作' },
    ],
    editFrom: [
      { required: false, editshow: 'none', name: 'json', key: 'value', type: 'josnstr' },
      { required: true,  editshow: 'none', name: '关联', key: 'code', type: 'select', list: [], value: 'code', label: 'name' }, 
      { required: true,  editshow: true,  name: '名称', key: 'name',  type: 'input' },
      { required: false, editshow: true,  name: '描述', key: 'description',  type: 'input' },
      // 动作
      { required: false, editshow: true, name: '动作', key: 'action', type: ['action'], list: dictStore.actionType}, 
    ],
    addItem: {},
    imgs: [],
  })

  watch(() => publicStore.active, async(val) => {
    await nextTick()
    if(proxy.isNull(val)){
      state.empty = true
      state.list = []
      return
    }
    state.addItem = {sensor_id: publicStore.active.id}
    init()
  }, {immediate: false, deep: true})

  const init = async(key) => {
    let query1 = {model: 't_sensor_template_control_point', args: `sensor_type='${publicStore.active.type}'`}
    let query2 = {model: 't_sensor_control_property', args: `sensor_id='${publicStore.active.id}'`}
    let params = {Api1: query1, Api2: query2}
    let res = await publicStore.http(params)
    state.empty = proxy.isNull(res.Api1)? true : false
    let list = proxy.isNull(res.Api1)? [] : res.Api1.sort((a, b) => a.order - b.order)
    state.list = list.map(v => {
      delete v.id
      if(v.calcRuleExpres){
        try {
          v.calcRuleExpres = JSON.parse(v.calcRuleExpres)
          Object.assign(v, v.calcRuleExpres)
          delete v.calcRuleExpres
        } catch (err) {
          console.error(err)
        }
      }
      return v
    })
    state.list.forEach(v => {
      if(proxy.isNull(res.Api2)){
        v.status = 0
      }else{
        let exist = res.Api2.find(a=>a.code == v.code)
        if(exist){
          v.status = 1
          if(exist.value){
              try {
                exist.value = JSON.parse(exist.value)
                exist.value.id = exist.id
                Object.assign(v, exist.value)
              } catch (err) {
                console.error(err)
              }
            }
        }else{
          v.status = 0
        }
      }
    })
    // console.log("state.list---", state.list)
  }

  const handleClick = async(remark, val) => {
    if(remark == 'add' || remark == 'upd'){
      addRef.onVisable(val)
    }
    if(remark == 'del'){
      addRef.del(val)
    }
    if(remark == 'setup'){
      handleSetup()
    }
    if(remark == 'sync'){
      handleSync()
    }
  }

  const handleSetup = async() => {
     ElMessageBox.confirm('【未配置】设置成模板默认值?', '提示', {confirmButtonText: '确定', cancelButtonText: '关闭', type: 'error'}).then(() => {
        let params = {model: state.model, list: []}
        let list = state.list.filter(a=>a.status == 0)
        params.list = list.map(v => {
          let temp = Object.assign({}, v) 
          delete temp.status
          temp.id = ""
          temp.value = JSON.stringify(temp)
          Object.assign(temp, state.addItem) 
          return temp
        })
        console.log("params---", params)
        api.addApi(params).then((res:any) => {
          if(res.code == 200){
            ElNotification({ title: '提示', message: '操作成功', type: 'success' })
            init()
          }else{
            ElNotification({ title: '提示', message: '操作失败', type: 'error' })
          }
        }).catch((err) => {
          ElNotification({ title: '提示', message: '操作失败', type: 'error' })
        })
      })
  }

  const handleSync = async() => {
    let list = state.list.filter(a=>a.status == 1)
    if(proxy.isNull(list)) return ElNotification({ title: '提示', message: '请先配置至少一个', type: 'error' })
    ElMessageBox.confirm('是否同步【已配置】到同类型设备?', '提示', {confirmButtonText: '确定', cancelButtonText: '关闭', type: 'error'}).then(async() => {
      let query = {model: 't_sensor', args: `type='${publicStore.active.type}'`}
      let res = await publicStore.http({Api: query})
      if(!proxy.isNull(res)){
          await delList()
          await addList(res)
      }
      
    })
  }

  const delList = async() => {
    let params = {model: state.model, list: []}
    let query = {
      model: 't_sensor_control_property', 
      join: 't_sensor ON t_sensor.id = t_sensor_control_property.sensor_id', 
      field: `t_sensor_control_property.id`, 
      args: `t_sensor.type='${publicStore.active.type}'`
    }
    let res = await publicStore.http({Api: query})
    if(!proxy.isNull(res)) {
      params.list = [...res]
      console.log("params---", params)
      api.delApi(params).then((res:any) => {
        if(res.code == 200){
          ElNotification({ title: '提示', message: '删除成功', type: 'success' })
        }else{
          ElNotification({ title: '提示', message: '删除失败', type: 'error' })
        }
      }).catch((err) => {
        ElNotification({ title: '提示', message: '删除失败', type: 'error' })
      })
    }
  }

  const addList = async(res) => {
    let params = {model: state.model, list: []}
    let list = state.list.filter(a=>a.status == 1)
    res.forEach(item => {
      let aynclist = list.map(v => {
        let temp = Object.assign({}, v) 
        delete temp.status
        temp.id = ""
        temp.value = JSON.stringify(temp)
        Object.assign(temp, {sensor_id: item.id}) 
        return temp
      })
      params.list = [...params.list, ...aynclist]
    })
    console.log("params---", params)
    api.addApi(params).then((res:any) => {
      if(res.code == 200){
        ElNotification({ title: '提示', message: '添加成功', type: 'success' })
        init()
      }else{
        ElNotification({ title: '提示', message: '添加失败', type: 'error' })
      }
    }).catch((err) => {
      ElNotification({ title: '提示', message: '添加失败', type: 'error' })
    })
  }
</script>
  
<style scoped lang="scss">

</style>
  