<template>
  <div class="layout-col">
    <div v-if="state.empty && isNull(state.list)" class="absolute-cc flex-col-cc w50x10 h50x6 bod-i1-1 rad5 cursor f28 i1">
      <i-ep-plus />
      <span class="mt10">新建模拟器</span>
    </div>
    <div v-else class="layout-col">
      <div class="ww100 flex-bc plr12 ptb8 bs4">
        <div class="flex-sc">
          <span class="f15 fw">模拟器配置</span>
        </div>
        <div class="flex-ec flex1 h30">
          <div class="rad4 ptb6 plr10 flex-cc cursor bgi3 white ml10" @click.stop="state.list.push(Object.assign({}, simulator))">
            <i-ep-plus class="f12 fw" /><span class="f14 ml5">模拟</span>
          </div>
          <div class="rad4 ptb6 plr10 flex-cc cursor white ml10" :class="configStore.isMock?'bgi11':'bgi6'" @click.stop="configStore.isMock = !configStore.isMock">
            <i-ep-switchButton class="f12 fw" /><span class="f14 ml5">{{configStore.isMock?'已开启':'未开启'}}</span>
          </div>
          <div class="rad4 ptb6 plr10 flex-cc cursor bgi19 white ml10" @click.stop="init()">
            <i-ep-refresh class="f12 fw" /><span class="f14 ml5">刷新</span>
          </div>
        </div>
      </div>
      <div class="flex-ss ww100 flex1 warp overlay p10 white">
        <div class="flex-col ww25 p10 rad5 cursor" v-for="(item, index) in state.list" :key="index">
          <div class="flex-col ww100 ba1 p20">
            <div class="flex-sc ww100">
              <span class="w50x2 i15">模拟名称</span>
              <span class="flex1"><input placeholder="请输入" v-model.trim="item.title" /></span>
            </div>
            <div class="flex-sc ww100 mt12">
              <span class="w50x2 i15">全局地址</span>
              <span class="flex1"><input placeholder="请输入" v-model.trim="item.http" /></span>
            </div>
             <div class="flex-sc ww100 mt12">
              <span class="w50x2 i15">当前排序</span>
              <span class="flex1"><input placeholder="请输入" v-model.trim="item.order" /></span>
            </div>
            <div class="flex-sc ww100 mt12">
              <span class="w50x2 i15">可视情况</span>
              <span class="flex1">{{ item.show?'显示':'隐藏' }}</span>
            </div>
            <div class="flex-sc ww100 mt12">
              <div class="flex-sc flex1 h36">
                <div class="rad4 ptb6 plr10 flex-cc cursor white" :class="item.status?'bgi11':'bgi6'" @click.stop="item.status=!item.status">
                  <span class="f14 ml5">{{item.status?'已启用':'已禁用'}}</span>
                </div>
                <div class="rad4 ptb6 plr10 flex-cc cursor bgi3 white ml10" @click.stop="publicStore.active={...item}">
                  <span class="f14 ml5">查看</span>
                </div>
                <div class="rad4 ptb6 plr10 flex-cc cursor bgi3 white ml10" @click.stop="handleSubmit(item)">
                  <span class="f14 ml5">保存</span>
                </div>
                <div class="rad4 ptb6 plr10 flex-cc cursor bgi8 white ml10" @click.stop="handleDelete(item, index)">
                  <span class="f14 ml5">删除</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import api from '@/api'
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const state = reactive({
	  ...publicStore.$state,
    key: 'id',
    now: 0,
    model: 't_simulator',
  })
  const query = {key: '', type: 'string', valueType: '1', value: ''}
  const param1 = {json: ''}
  const param2 = {json: [query]} 
  const apii = {show: true, status: false, title: '',  http: '', path: '', time: 60, paramsType: '1', params1: [param1], params2: [param2]}
  const simulator = {show: true, status: true, title: '', http: '', apis: [apii]}
  const types = [
    {name: '字符串', value: 'string'}, 
    {name: '整型', value: 'int'}, 
    {name: '浮点型', value: 'float'}, 
  ]
  const valueTypes = [
    {name: '定值', value: '1'}, 
    {name: '时间', value: '2'}, 
    {name: '随机数', value: '3'}, 
    {name: '顺序数组', value: '4'}, 
    {name: '随机数组', value: '5'}, 
  ]
  const timeTypes = [ 
    {name: '时间擢(毫秒)', value: '1'},
    {name: '时间擢(秒)', value: '2'}, 
    {name: '年-月-日 时:分:秒', value: '3'}, 
  ]

  onMounted(async() => {
    init()
  })

  const init = async() =>{
    let query = {model: state.model}
    let res = await publicStore.http({Api: query})
    state.empty = proxy.isNull(res)? true : false
    let list = proxy.isNull(res)? [] : res.sort((a, b) => a.order - b.order)
    list.forEach(v => {v.apis = JSON.parse(v.apis)})
    state.list = list
    publicStore._public.list = state.list
  }

  const handleSubmit = (item) => {
    let ctx = checkItem(item)
    if(!ctx.status) return ElNotification({ title: '提示', message: ctx.msg, type: 'error' })
    let form = Object.assign({}, item)
    form.apis = JSON.stringify(form.apis)
    let params = {model: state.model, list: [form]}
    api[form[state.key]?'updApi':'addApi'](params).then((res:any) => {
      if(res.code == 200){
        ElNotification({ title: '提示', message: '操作成功', type: 'success' })
        publicStore.mockStatus = !publicStore.mockStatus
        init()
      }
    }).catch((err) => {
      ElNotification({ title: '提示', message: '操作失败', type: 'error' })
    })
  }

  const handleDelete = (form, index) => {
    ElMessageBox.confirm('是否确定删除?', '删除提示', {confirmButtonText: '确定', cancelButtonText: '关闭', type: 'error'}).then(() => {
      let params = {model: state.model, list: [form]}
      api.delApi(params).then((res:any) => {
        if(res.code == 200){
          ElNotification({ title: '提示', message: '操作成功', type: 'success' })
          publicStore.mockStatus = !publicStore.mockStatus
          init()
        }
      }).catch((err) => {
        ElNotification({ title: '提示', message: '操作失败', type: 'error' })
      })
    })
  }

  const checkItem = (item) => {
    let ctx = {status: true, msg: ''}
    if(item.apis.length != 0) {
      item.apis.forEach(v => {
        checkVal(item, v, ctx)
      })
    }
    return ctx
  }

  const checkVal = (item, val, ctx) => {
    // if(!item.http&&!val.http) {
    //   ctx.status = false 
    //   ctx.msg = '请输入请求地址'
    // }
    // if(!val.path) {
    //   ctx.status = false
    //   ctx.msg = '请输入请求路径'
    // }
    // if(!val.time) {
    //   ctx.status = false 
    //   ctx.msg = '请输入间隔'
    // }
    // if(!val.paramsType) {
    //   ctx.status = false 
    //   ctx.msg = '请选择请求体类型'
    // }
  }

  const getMock = (item, val) => {
    let ctx = {status: true, msg: ''}
    checkVal(item, val, ctx)
    if(!ctx.status) return ElNotification({ title: '提示', message: ctx.msg, type: 'error' })
    let params = getParams(val)
    console.log('params---', params)
    publicStore.http({Api: params}, val.path, {ip: val.http?val.http:item.http}).then(res=>{
      ElNotification({ title: '提示', message: '发送成功', type: 'success' })
    }).catch((err) => {
      ElNotification({ title: '提示', message: '发送失败', type: 'error' })
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

</script>
  
<style scoped lang="scss">
  input{  
    color: #ffffff;
    background:none;  
    outline:none;  
    border:none;
  }
  :deep(.el-input__inner){
    color: #545454 !important;
  }
  :deep(.el-input__wrapper){
    background: none !important;
    outline:none !important;  
    border:none !important;
    color: #545454 !important;
    box-shadow: 0 0 0 1px #dcdfe6 inset !important;
  }
  :deep(.el-textarea__inner){  
    background:none  !important;  
    outline:none !important;  
    border:none !important;
    color: #545454 !important;
    box-shadow: 0 0 0 0px #dcdfe6 inset !important;
    padding: 0;
  }
  :deep(.el-radio){
    color: #545454 !important;
  }
  :deep(.el-switch){
    height: auto !important;
  }
  :deep(.el-select__selected-item){
    color: #545454 !important;
  }
  :deep(.el-select__wrapper){
    color: inherit !important;
    background: inherit !important;
    box-shadow: 0 0 0 1px #dcdfe6 inset!important;
    border-radius: 5px !important;
    width: 100%;
    box-sizing: border-box;
    -moz-box-sizing: border-box;
  }
  :deep(.el-select .el-select-tags-wrapper.has-prefix){
    display: inline-block;
    white-space: nowrap;
    overflow: hidden;
  }
  :deep(.el-select .el-select__tags .el-tag--info){
    background: none !important;
  }
  :deep(.el-select__placeholder.is-transparent){
    color: #aaaaaa;
  }
  :deep(.el-select__placeholder){
    color: #666666;
  }
</style>
  