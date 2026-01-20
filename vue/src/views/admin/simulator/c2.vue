<template>
  <div class="layout-col">
    <div v-if="state.empty && isNull(state.list)" class="absolute-cc flex-col-cc w50x10 h50x6 bod-i1-1 rad5 cursor f28 i1" @click.stop="state.list.push(Object.assign({}, simulator))">
      <i-ep-plus />
      <span class="mt10">新建模拟器</span>
    </div>
    <div v-else class="layout-col">
      <div class="ww100 flex-bc plr12 ptb8 bs4">
        <div class="flex-sc">
          <span class="f15 fw">模拟器配置</span>
        </div>
        <div v-if="isNull(publicStore.active)" class="flex-ec flex1 h30">
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
        <div v-if="!isNull(publicStore.active)" class="flex-ec flex1 h30">
          <div class="rad4 ptb6 plr10 flex-cc cursor bgi3 white ml10" @click.stop="publicStore.active = {}">
            <i-ep-plus class="f12 fw" /><span class="f14 ml5">返回</span>
          </div>
        </div>
      </div>
      <div class="flex-col ww100 flex1 overlay">
        <div class="flex-col ww100 mb20" v-for="(item, index) in state.list" :key="index">
          <div class="ww100 flex-bc plr12 ptb8 bgc">
            <div class="flex-sc c3">
              <div class="f16 fw flex-sc cursor" @click.stop="item.show=!item.show">
                <i-ep-caretTop v-if="item.show" />
                <i-ep-caretBottom v-else />
                <span class="ml5">模拟器</span>
              </div>
              <input class="w50x3 f16 fw pb5 i1 mlr10" style="border-bottom: 2px #333 dashed" placeholder="请输入名称" v-model.trim="item.title" />
              <span class="f16 fw">全局地址</span>
              <input class="w50x4 f16 fw pb5 i1 mlr10" style="border-bottom: 2px #333 dashed" placeholder="(例：127.0.0.1:8808)" v-model.trim="item.http" />
              <span class="f16 fw">当前排序</span>
              <input class="w50x4 f16 fw pb5 i1 mlr10" style="border-bottom: 2px #333 dashed" placeholder="数字越小排名越前" v-model.trim="item.order" />
            </div>
            <div class="flex-ec flex1 h36">
              <div class="rad4 ptb6 plr10 flex-cc cursor bgi3 white ml10" @click.stop="handleSubmit(item)">
                <i-ep-refresh class="f12 fw" /><span class="f14 ml5">保存</span>
              </div>
              <div class="rad4 ptb6 plr10 flex-cc cursor bgi3 white ml10" @click.stop="item.apis.push(Object.assign({}, apii))">
                <i-ep-plus class="f12 fw" /><span class="f14 ml5">接口</span>
              </div>
              <div class="rad4 ptb6 plr10 flex-cc cursor white ml10" :class="item.status?'bgi11':'bgi6'" @click.stop="item.status=!item.status">
                <i-ep-muteNotification class="f12 fw" v-if="item.status" />
                <i-ep-bell class="f12 fw" v-else />
                <span class="f14 ml5">{{item.status?'已启用':'已禁用'}}</span>
              </div>
              <div class="rad4 ptb6 plr10 flex-cc cursor bgi8 white ml10" @click.stop="handleDelete(item, index)">
                <i-ep-delete class="f12 fw" /><span class="f14 ml5">删除</span>
              </div>
            </div>
          </div>
          <div v-show="item.show" class="flex-col hh100 ww100" v-for="(v, i) in item.apis" :key="i">
            <div class="flex-sc c4">
              <div class="hh100 plr12 ptb14 bo-ce-1 flex1 bgi13 flex-sc cursor" @click.stop="v.show=!v.show">
                <span class="pl20"></span>
                <i-ep-caretTop v-if="v.show" />
                <i-ep-caretBottom v-else />
                <span class="ml5">名称(选填)</span>
              </div>
              <div class="hh100 plr12 ptb14 bo-ce-1 flex4 bgi13 flex-bc relative">
                <input class="flex1" v-model.trim="v.title" placeholder="(例：模拟数据)" />
                <div class="flex-ec">
                  <div class="cursor i6 flex-cc mr12" @click.stop="item.apis.splice(i, 0, JSON.parse(JSON.stringify(v)))">
                    <i-ep-connection class="f12 fw" /><span class="f14 ml2">复制</span>
                  </div>
                  <div class="cursor i8 flex-cc mr15" @click.stop="item.apis.splice(i, 1)">
                    <i-ep-delete class="f12 fw" /><span class="f14 ml2">删除</span>
                  </div>
                  <div class="cursor i1 flex-cc" @click.stop="getMock(item, v)">
                    <i-ep-pointer class="f12 fw" /><span class="f14 ml2">模拟</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex-col ww100 flex1" v-show="v.show">
              <div class="flex-sc c4">
                <div class="hh100 plr12 ptb14 bo-ce-1 flex1 bgi13 flex-sc"><span class="i12 mr2 pl32">*</span>地址</div>
                <div class="hh100 plr12 ptb14 bo-ce-1 flex4 bg-white flex-bc">
                  <input class="flex1" v-model.trim="v.http" placeholder="(例：127.0.0.1:8808)" />
                </div>
              </div>
              <div class="flex-sc c4">
                <div class="hh100 plr12 ptb14 bo-ce-1 flex1 bgi13 flex-sc"><span class="i9 mr2 pl32">*</span>路径</div>
                <div class="hh100 plr12 ptb14 bo-ce-1 flex4 bg-white flex-bc">
                  <input class="flex1" v-model.trim="v.path" placeholder="(例：/api/admin/index)" />
                </div>
              </div>
              <div class="flex-sc c4">
                <div class="hh100 plr12 ptb14 bo-ce-1 flex1 bgi13 flex-sc"><span class="pl40"></span>状态</div>
                <div class="hh100 plr12 ptb14 bo-ce-1 flex4 bg-white flex-bc">
                  <el-switch v-model="v.status" inline-prompt active-text="已启用" inactive-text="已禁用" />
                </div>
              </div>
              <div class="flex-sc c4">
                <div class="hh100 plr12 ptb14 bo-ce-1 flex1 bgi13 flex-sc"><span class="pl40"></span>间隔</div>
                <div class="hh100 plr12 ptb14 bo-ce-1 flex4 bg-white flex-bc">
                  <input class="flex1" v-model.trim="v.time" placeholder="(例：10)" />
                  <span>秒(s)</span>
                </div>
              </div>
              <div class="flex-sc c4">
                <div class="hh100 plr12 ptb14 bo-ce-1 flex1 bgi13 flex-sc"><span class="pl40"></span>请求体类型</div>
                <div class="hh100 plr12 ptb14 bo-ce-1 flex4 bg-white flex-bc">
                  <el-radio-group v-model="v.paramsType" @change="v.params1=[Object.assign({}, param1)];v.params2=[Object.assign({}, param2)]">
                    <el-radio label="1" value="1" size="large">json</el-radio>
                    <el-radio label="2" value="2" size="large">自定义</el-radio>
                  </el-radio-group>
                  <div class="cursor bgi1 white flex-cc plr5 ptb4 rad5 " @click.stop="v.paramsType==1?v.params1.push(Object.assign({}, param1)):v.params2.push(Object.assign({}, param2))"><i-ep-plus class="f12 mr2" />请求体</div>
                </div>
              </div>
              <div class="flex-sc c4" v-for="(vv, ii) in v.paramsType==1?v.params1:v.params2" :key="ii">
                <div class="hh100 plr12 ptb14 bo-ce-1 flex1 bgi13 flex-bs">
                  <span><span class="pl40"></span>请求体({{ii+1}})</span>
                  <div class="flex-ec">
                    <div class="cursor i1 flex-cc mr12" @click.stop="vv.json.push(JSON.parse(JSON.stringify(query)))" v-if="v.paramsType==2">
                      <i-ep-plus class="f12 fw" /><span class="f14 ml2">参数</span>
                    </div>
                    <div class="cursor i1 flex-cc mr12" @click.stop="v.paramsType==1? v.params1.splice(ii, 0, JSON.parse(JSON.stringify(vv))) : v.params2.splice(ii, 0, JSON.parse(JSON.stringify(vv)))">
                      <i-ep-connection class="f12 fw" /><span class="f14 ml2">复制</span>
                    </div>
                    <div class="cursor i1 flex-cc" @click.stop="v.paramsType==1?v.params1.splice(ii, 1):v.params2.splice(ii, 1)">
                      <i-ep-delete class="f12 fw" /><span class="f14 ml2">删除</span>
                    </div>
                  </div>
                </div>
                <div class="hh100 plr12 ptb14 bo-ce-1 flex4 bg-white flex-bs" v-if="v.paramsType==1">
                  <el-input class="flex1" type="textarea" :autosize="{ minRows: 10, maxRows: 30 }" v-model.trim="vv.json" placeholder='(例：{"a": 1, "b": 2}' />
                </div>
                <div class="hh100 plr12 ptb14 bo-ce-1 flex4 bg-white flex-bc" v-if="v.paramsType==2">
                  <div class="flex-col-ss flex1">
                    <div class="flex-ss ww100" :class="iii!=0?'mt14 pt14 bot-ce-1':''" v-for="(vvv, iii) in vv.json" :key="iii">
                        <div class="flex-sc">
                          <span>键值</span>
                          <el-input style="width: 150px" class="mlr10" v-model.trim="vvv.key" placeholder="(例：a)" />
                        </div>
                        <div class="flex-sc">
                          <span>类型</span>
                          <div class="aselect mlr10">
                            <select style="width: 150px" v-model="vvv.type" placeholder="请选择">
                              <option v-for="item in types" :key="item.value"  :value="item.value">{{ item.name }}</option>
                            </select>
                          </div>
                        </div>
                        <div class="flex-sc">
                          <span>值类型</span>
                          <div class="aselect mlr10">
                            <select style="width: 150px" v-model="vvv.valueType" placeholder="请选择"
                            @change="vvv.value=vvv.valueType==1||vvv.valueType==2?'': vvv.valueType==3?['','']:vvv.valueType==4||vvv.valueType==5?[{val: '', status: false}]:''">
                              <option v-for="item in valueTypes" :key="item.value"  :value="item.value">{{ item.name }}</option>
                            </select>
                          </div>
                        </div>
                        <div class="flex-sc flex1">
                          <span class="h32 lh32">数值</span>
                          <div class="flex1 flex-sc" v-if="vvv.valueType==1">
                            <el-input style="width: 100%" class="ml10" v-model.trim="vvv.value" placeholder="(例：1)" />
                          </div>
                          <div class="flex1 flex-sc" v-if="vvv.valueType==2">
                            <div class="aselect mlr10">
                              <select style="width: 150px" v-model="vvv.value" placeholder="请选择">
                                <option v-for="item in timeTypes" :key="item.value" :value="item.value">{{ item.name }}</option>
                              </select>
                            </div>
                          </div>
                          <div class="flex1 flex-sc" v-if="vvv.valueType==3">
                            <el-input style="width: 100%" class="ml10" v-model.trim="vvv.value[0]" placeholder="最小值(例：1)" />
                            <el-input style="width: 100%" class="ml10" v-model.trim="vvv.value[1]" placeholder="最大值(例：10)" />
                          </div>
                          <div class="flex1 flex-col" v-if="vvv.valueType==4||vvv.valueType==5">
                            <div class="cursor i1 flex-sc ml10" @click.stop="vvv.value.push({val: '', status: false})">
                                <i-ep-plus class="f12 fw" /><span class="f14 ml2">值</span>
                            </div>
                            <div class="flex-sc ww100 mt14" v-for="(vvvv, iiii) in vvv.value" :key="iiii">
                              <el-input style="width: 100%" class="ml10" v-model.trim="vvvv.val" placeholder="(例：1)" />
                              <div class="cursor i1 flex-cc ml15" @click.stop="vvv.value.splice(iiii, 1)">
                                <i-ep-delete class="f12 fw" />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="cursor i1 flex-cc ml15" @click.stop="vv.json.splice(iii, 1)">
                          <i-ep-delete class="f12 fw" /><span class="f14 ml2">删除键值</span>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="ww100 ptb20 bg-white ca tc fw f16">--- 我是有底线的 ---</div>
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
    let query = proxy.isNull(publicStore.active)? {model: state.model} : {model: state.model, args: `id='${publicStore.active.id}'`} 
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
    if(!item.http&&!val.http) {
      ctx.status = false 
      ctx.msg = '请输入请求地址'
    }
    if(!val.path) {
      ctx.status = false
      ctx.msg = '请输入请求路径'
    }
    if(!val.time) {
      ctx.status = false 
      ctx.msg = '请输入间隔'
    }
    if(!val.paramsType) {
      ctx.status = false 
      ctx.msg = '请选择请求体类型'
    }
  }

  const getMock = (item, val) => {
    let ctx = {status: true, msg: ''}
    checkVal(item, val, ctx)
    if(!ctx.status) return ElNotification({ title: '提示', message: ctx.msg, type: 'error' })
    let params = getParams(val)
    console.log('开始模拟', val.title, params)
    // publicStore.http({Api: params}, val.path, {ip: val.http?val.http:item.http}).then(res=>{
    //   ElNotification({ title: '提示', message: '发送成功', type: 'success' })
    // }).catch((err) => {
    //   ElNotification({ title: '提示', message: '发送失败', type: 'error' })
    // })
    publicStore.http({httpApi: {query: params, ip: val.http?val.http:item.http, url: val.path}}).then(res=>{
      console.log('模拟结果', res)
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
    background:none;  
    outline:none;  
    border:none;
  }
  .aselect{
    color: #545454 !important;
    box-shadow: 0 0 0 1px #dcdfe6 inset !important;
    border-radius: 5px;
    height: 32px;
    line-height: 32px;
    padding: 0 8px;
  }
  .aselect select{
    background: none !important;
    outline: none !important;
    border: none !important;
    color: #545454 !important;
    height: 100%;
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
  