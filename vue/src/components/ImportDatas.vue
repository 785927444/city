<template>
  <el-dialog v-model="state.isFalse" title="整站导入（Excel文件）（不包括日志）" :before-close="onVisable" :draggable="true" :width="700">
    <el-upload ref="upload" class="upload-demo" multiple action="/" :file-list="state.fileList" :on-change="fileChange" :auto-upload="false" accept=".xls, .xlsx">
      <el-button type="primary">选取文件</el-button>
    </el-upload>
    <div v-if="state.isStatus=='2'" class="i8">提示：{{state.isMsg}}</div>
    <div class="flex-col-ss flex1 white" v-if="state.isTrue">
      <el-button class="mtb10" :type="state.isTrue?'success':''" @click.stop="submitUpload">开始导入</el-button>
      <div class="row bgi22" style="border-radius: 6px 6px 0 0">
        <span class="flex3 pl10">名称</span>
        <span class="flex2 tc">导入数</span>
        <span class="flex2 tc">可导入</span>
        <span class="flex2 tc">已存在</span>
        <span class="flex2 tc">结果</span>
      </div>
      <div class="h100x5 ww100">
        <div class="table">
          <div class="row" :class="index%2 == 1?'bgi23':'bgi18'" v-for="(item, index) in state.form.tables" :key="index">
            <span class="flex3">【{{index+1}}】{{item.sheetName}}</span>
            <span class="flex2 cursor tc" @click.stop="state.view = true; state.viewList = item.addList; state.viewType = '1'"><span class="white">{{item.readExcelList.length}}</span></span>
            <span class="flex2 cursor tc" @click.stop="state.view = true; state.viewList = item.addList; state.viewType = '1'"><span class="i12">{{item.addList.length}}</span></span>
            <span class="flex2 cursor tc" @click.stop="state.view = true; state.viewList = item.errorList; state.viewType = '2'"><span class="i8">{{item.errorList.length}}</span></span>
            <span class="flex2 cursor tc" @click.stop="state.view = true; state.viewList = item.errorList; state.viewType = '2'">
              <span :class="item.result=='0'?'white':item.result=='1'?'i12':item.result=='2'?'i8':item.result=='3'?'i6':''">{{item.result=='0'?'未操作':item.result=='1'?'导入成功':item.result=='2'?'导入失败':item.result=='3'?'已跳过':''}}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
  <el-dialog v-model="state.view" title="查看列表" :before-close="closeView" :draggable="true" :width="800">
    <div class="h100x5 ww100">
      <div class="table">
        <div class="row" :class="index%2 == 1?'bgi23':'bgi18'" v-for="(item, index) in state.viewList" :key="index">
          <span class="flex1 tl line1 white" alt="1111">
            【{{index+1}}】{{item}}
          </span>
          <span v-if="state.viewType == '2'" class="i21 cursor" @click.stop="Updata(index)">强制导入</span>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button size="large" type="info" class="white bgi22" @click.stop="Updata(-1)">全部强制导入</el-button>
      </div>
    </template>
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
    isStatus: '0',
    isMsg: '',
    view: false,
    viewList: [],
    viewType: '',
  })
  const props = defineProps({
    state: { 
      type: [Object, Array],
      default: ()=>{return {}}
    },
  })
  const emit = defineEmits(['init'])
  const closeView = () => state.view = false

  const onVisable = async (val, type) => {
    state.isFalse = !state.isFalse
    if(!state.isFalse) return
    state.isStatus = '0'
    state.isMsg = ''
    state.view = false
    state.fileList = []
    state.isTrue = false
    state.form = Object.assign({}, val)
  }

  const fileChange = async(file, fileList) => {
    state.isStatus = '0'
    state.isMsg = ''
    state.view = false
    state.isTrue = false
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
    let tempArr = []
    let tempJson = {}
    await Promise.all(state.form.tables.map(async (v, i)=> {
      let params = {queryApi: v.query}
      let res = await publicStore.post(params)
      setReadExcelList(v, i, list)
      dealData(v, res)
    }))
    state.isTrue = true
  }

  const setReadExcelList = async(v, i, list) => {
    let readExcelList = []
    list[i].forEach((vv, ii)=>{
      let model = {}
      Object.keys(vv).forEach((kk:any)=> {
        let index = v.tHeader.findIndex(a=>a == kk)
        let key = v.filterVal[index]
        if(index != -1) model[key] = vv[kk]
      })
      readExcelList.push(model)
    })
    state.form.tables[i].readExcelList = readExcelList
  }

  const dealData = async(v, res) => {
    v.result = '0'
    v.isMsg = ''
    v.addList = []
    v.errorList = []
    v.readExcelList.forEach((item, index) => {
      let exceldata = Object.assign({}, item)
      exceldata[v.key] = exceldata[v.key]? exceldata[v.key] + '' : new Date().getTime() + index + ''
      let exist = res.find(a=>a[v.key] == exceldata[v.key])
      if(!exist) {
        let mark = {"o": v.query.o, "t": "add", "a": "新增"}
        let temp = Object.assign({}, exceldata, mark)
        v.addList.push(temp)
      }else{
        let mark = {"o": v.query.o, "t": "upd", "a": "修改"}
        let temp = Object.assign({}, exceldata, mark)
        v.errorList.push(temp)
      }
    })
  }

  const Updata = async(index) => {
    let datas =  index!=-1? [state.viewList[index]] : state.viewList
    api.updateApi(datas).then((res:any) => {
      if(res.errcode == 0){
        if(index!=-1){
          state.viewList.splice(index, 1)
        }else{
          state.viewList = []
        }
        if (state.viewList.length == 0) state.view = false
        ElNotification({ title: '提示', message: '导入成功', type: 'success' })
      }else{
        state.isStatus = '2'
        state.isMsg = `导入失败码111`
      }
    }).catch((err) => {
        state.isStatus = '2'
        state.isMsg = `导入失败码222`
    })
  }

  const submitUpload = async() => {
    console.log('state.form.tables', state.form.tables)
    await Promise.all(state.form.tables.map(async (v, i)=> {
      if(v.addList.length == 0){
        v.result = '3'
      }else{
        api.updateApi(v.addList).then((res:any) => {
          if(res.errcode == 0){
            state.form.tables[i].result = '1'
          }else{
            state.form.tables[i].result = '2'
          }
        }).catch((err) => {
            state.form.tables[i].result = '2'
        })
      }
    }))
    ElNotification({ title: '提示', message: '导入完成，请查看结果，确保无误后关闭弹窗！', type: 'success' })
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

