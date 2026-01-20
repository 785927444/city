<template>
  <el-dialog v-model="state.isFalse" title="批量导入（Excel文件）" :before-close="onVisable" :draggable="true" :width="800">
    <el-upload ref="upload" class="upload-demo" multiple action="/" :file-list="state.fileList" :on-change="fileChange" :on-success="uploadSuccess" :auto-upload="false" accept=".xls, .xlsx">
      <el-button type="primary">选取文件</el-button>
      <el-button :type="state.isTrue?'success':''" @click.stop="submitUpload">开始导入</el-button>
    </el-upload>
    <div class="flex-col-ss flex1 white" v-if="state.isStatus!='0'">
      <div v-if="state.isStatus=='2'" class="i8">提示：{{state.isMsg}}</div>
      <div v-if="state.isStatus=='1'" class="flex-sc mt10">
        <div class="ml10">导入总数：<span class="i12 mr10">{{state.dataList.length}} 条</span></div>
        <div class="ml10">新增成功：<span class="i12 mr5">{{state.addData.length}} 条</span><span :class="state.showStatus=='0'?'bga':'bgi1'" class="mr10 f12 rad2 ptb2 plr5 cursor" @click.stop="state.showStatus='0'">显示</span></div>
<div class="ml10">更新成功：<span class="i12 mr5">{{state.updData.length}} 条</span><span :class="state.showStatus=='2'?'bga':'bgi1'" class="mr10 f12 rad2 ptb2 plr5 cursor" @click.stop="state.showStatus='2'">显示</span></div>
        <div class="ml10">导入失败：<span class="i8 mr5">{{state.errorList.length}} 条</span><span :class="state.showStatus=='1'?'bga':'bgi1'" class="mr10 f12 rad2 ptb2 plr5 cursor" @click.stop="state.showStatus='1'">显示</span></div>
      </div>
      <div v-if="state.isStatus=='1' && state.showStatus=='0'" class="ww100">
        <div class="ml10 mt10 i12">新增列表：</div>
        <div class="h100x3 ww100">
          <div class="table">
            <div class="row" :class="index%2 == 1?'bgi23':'bgi18'" v-for="(item, index) in state.addData" :key="index">
              <span class="tl line1">【{{index+1}}】{{item}}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="state.isStatus=='2' && state.showStatus=='0'" class="ww100">
        <div class="ml10 mt10 i12">更新列表：</div>
        <div class="h100x3 ww100">
          <div class="table">
            <div class="row" :class="index%2 == 1?'bgi23':'bgi18'" v-for="(item, index) in state.updData" :key="index">
              <span class="tl line1">【{{index+1}}】{{item}}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="state.isStatus=='1' && state.showStatus=='1'" class="ww100">
        <div class="ml10 mt10 i8">失败列表：(原因-已存在键值)</div>
        <div class="h100x3 ww100">
          <div class="table">
            <div class="row" :class="index%2 == 1?'bgi23':'bgi18'" v-for="(item, index) in state.errorList" :key="index">
              <span class="tl line1">【{{index+1}}】{{item}}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script lang="ts" setup>
  import { readExcel, readExcel2, excelDateToDate, checkFile } from '@/utils/excelTools'
  import api from '../api'
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const state = reactive({
	  ...publicStore.$state,
    form: [],
    fileList: [],
    dataList: [],
    isStatus: '0',
    isMsg: '',
    addData: [],
    updData: [],
    errorList: [],
    showStatus: '0'
  })
  const props = defineProps({
    state: { 
      type: [Object, Array],
      default: ()=>{return {}}
    },
  })
  const emit = defineEmits(['init'])

  const onVisable = async (val, type, fn) => {
    state.isFalse = !state.isFalse
    if(!state.isFalse) return
    state.isStatus = '0'
    state.isMsg = ''
    state.addData = []
    state.updData = []
    state.errorList = []
    state.showStatus = '0'
    state.fileList = []
    state.dataList = []
    state.isTrue = false
    state.form = Object.assign({}, val)
    state.fn = fn
  }

  const fileChange = async(file, fileList) => {
    state.isStatus = '0'
    state.isMsg = ''
    state.addData = []
    state.updData = []
    state.errorList = []
    state.showStatus = '0'
    const isXls = /\.xls[x]*$/.test(file.name)
    if (!isXls) {
      state.isStatus = '2'
      state.isMsg = '上传文件只能是 .xls/.xlsx 格式!'
      return removeFile(file, fileList)
    }
    const isLt10M = file.size / 1024 / 1024  < 10;
    if (!isLt10M) {
      state.isStatus = '2'
      state.isMsg = '上传文件大小不能超过 10MB!'
      return removeFile(file, fileList)
    }
    for (const f of fileList) {
      if (f.name === file.name && f.uid !== file.uid) {
        state.isStatus = '2'
        state.isMsg = '该文件已在列表!'
        return removeFile(file, fileList)
      }
    }
    state.fileList = fileList
    let list = []
    // 过滤
    state.fileList.forEach(file=>{
      readExcel2(file).then((res)=>{
        list = [...list, ...res]
        return dealExcelData(list)
      })
    })
  }

  const removeFile = async(file, fileList) => {
    for (const i in fileList) {
      if (fileList[i].name === file.name && fileList[i].uid === file.uid) {
        fileList.splice(i, 1)
      }
    }
  }

  const dealExcelData = async(list) => {
    return new Promise((resolve,reject)=>{
      state.dataList = []
      list.forEach(v=>{
        v.forEach(vv=>{
          let model = {}
          state.form.content.forEach((vvv:any)=> {
            model[vvv.key] = vv[vvv.name] != null ? vv[vvv.name] + '' : ''
          })
          // Object.keys(vv).forEach((key:any)=> {
          //   let exist = state.form.content.find(a=>a.name == key)
          //   if(exist) model[exist.key] = vv[key]
          // })
          state.dataList.push(model)
        })
      })
      state.isTrue = true
      resolve()
    })
  }

  const uploadSuccess = (response, file, fileList) => {}

  const uploadError = (err, file, fileList) => {}

  const submitUpload = async() => {
    if (!state.isTrue) return
    let query = state.form.query
    let params = {Api: query}
    let res = await publicStore.http(params)
    let addData = []
    let updData = []
    let errorList = []
    state.dataList.forEach((item, index) => {
      item[state.form.key] = item[state.form.key]? item[state.form.key] + '' : ''
      let e = item[state.form.key]?res.find(a=>a[state.form.key] == item[state.form.key]) : item[state.form.unique]?res.find(a=>a[state.form.unique] == item[state.form.unique]) : ''
      if(!e) {
        let temp = Object.assign({}, item)
        addData.push(temp)
      }else{
        if(item[state.form.key]){
          let temp = Object.assign({}, item)
          updData.push(temp)
        }else{
          let temp = Object.fromEntries(Object.entries(item).slice(0, 8))
          errorList.push(temp)
        }
      }
    })
    state.addData = [...addData]
    state.updData = [...updData]
    state.errorList = [...errorList]
    if(addData.length == 0 && updData.length == 0) {
      state.isStatus = '2'
      state.isMsg = '无新数据导入!'
      return false
    }else{
      if(state.fn) state.fn(state.addData)
    }
    let forms = {model: props.state.model, list: addData}
    let forms2 = {model: props.state.model, list: updData}
    if(props.state.model == 't_v_104_point' || props.state.model == 't_v_modbus_point' || props.state.model == 't_v_104_point_server') {
      let check = await checkData(forms.list)
      if(!check.status) {
        if(!proxy.isNull(check.list)){
          check.list.forEach(v => {
            setTimeout(() => {
              ElNotification({ title: '提示', message: `点位重复【${v.point}】`, type: 'error' })
            }, 500)
          })
        }else{
          ElNotification({ title: '提示', message: '点位错误', type: 'error' })
        }
        return false
      }
    }
    if(addData.length != 0){
      api.addApi(forms).then((res:any) => {
        if(res.code == 200){
          state.isStatus = '1'
          state.isMsg = addData.length
          if(updData.length != 0){
            api.updApi(forms2).then((res:any) => {
              if(res.code == 200){
                state.isStatus = '1'
                state.isMsg = state.isMsg + updData.length
                // onVisable()
                emit('init')
              }
            })
          }else{
            // onVisable()
            emit('init')
          }
        }else{
          state.isStatus = '2'
          state.isMsg = `导入失败码111`
        }
      }).catch((err) => {
          state.isStatus = '2'
          state.isMsg = `导入失败码222`
      })
    }
    if(addData.length == 0 && updData.length != 0){
      api.updApi(forms2).then((res:any) => {
        if(res.code == 200){
          state.isStatus = '1'
          state.isMsg = updData.length
          // onVisable()
          emit('init')
        }else{
          state.isStatus = '2'
          state.isMsg = `导入失败码111`
        }
      }).catch((err) => {
          state.isStatus = '2'
          state.isMsg = `导入失败码222`
      })
    }
  }

  const checkData = async(datas) => {
    if(proxy.isNull(datas)) return {status: false, list: []}
    let data = datas[0]
    let point = ''
    datas.forEach((v,i)=> {
      point+=(i==0?'':`,`)+`'`+v.point+`'`
    })
    let args = data.address?`sensorparents='${data.sensorparents}' and address='${data.address}' and point IN (${point})`:
    props.state.model == 't_v_104_point'?`sensorparents='${data.sensorparents}' and point IN (${point})` : `point IN (${point})`
    let query = {model: props.state.model, args: args}
    let res = await publicStore.http({Api: query})
    let list = proxy.isNull(res)? [] : res
    return {status: proxy.isNull(res), list: list}
  }

  defineExpose({
    onVisable
  })
</script>

<style lang="scss" scoped>
  :deep(.el-upload-list__item-file-name){
    color: #fff;
  }
  :deep(.el-icon--document){
    color: #fff;
  }
</style>

