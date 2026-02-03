<template>
  <el-dialog v-model="visible" :title="title" :before-close="onVisable" :draggable="true" width="40%">
    <el-form ref="formRef" :model="dataForm" :rules="ruleList" label-width="20%">
      <div class="flex-sc warp ww100">
        <!-- 主键 -->
        <el-form-item label="主键" class="ww100" v-if="props.state.editKey&&title=='修改'">
          <el-input size="large" v-model="dataForm[props.state.key]" placeholder="请输入" :disabled="true"/>
        </el-form-item>
        <div v-for="(item, index) in editFromInfo" :key="index" :style="{width: props.state.editCol? (100/props.state.editCol) + '%' : 100 + '%' }" >
          <div v-if="!item.condit || dataForm[item.condit[0]]==item.condit[1]">
            <el-form-item :label="item.name" :prop="item.key" v-if="item.editshow != 'none' && (title == '创建' || item.editshow)">
              <!-- 输入框 -->
              <el-input size="large" v-model="dataForm[item.key]" placeholder="请输入" v-if="item.type=='input'"  :type="item.class?item.class:'text'"  :maxlength="item.maxlength?item.maxlength:''" :disabled="item.editshow=='disabledAll'?true:title=='修改'&&item.editshow=='disabled'?true:false"/>
              <!-- 密码框 -->
              <el-input size="large" v-model="dataForm[item.key]" placeholder="请输入" v-if="item.type=='password'" :maxlength="item.maxlength?item.maxlength:''" :disabled="item.editshow=='disabledAll'?true:title=='修改'&&item.editshow=='disabled'?true:false" type="password" show-password />
              <!-- 文本框 -->
              <el-input size="large" v-model="dataForm[item.key]" placeholder="请输入" v-if="item.type=='textarea'" :maxlength="item.maxlength?item.maxlength:''" :disabled="item.editshow=='disabledAll'?true:title=='修改'&&item.editshow=='disabled'?true:false"
              type="textarea" :autosize="{ minRows: item.class?item.minRows:3, maxRows: item.class?item.maxRows:5 }" />
              <!-- 下拉框 -->
              <el-select size="large" v-model="dataForm[item.key]" placeholder="请选择" v-if="item.type=='select'" :multiple="item.multiple?true:false" style="width:100%" clearable filterable :disabled="item.editshow=='disabledAll'?true:title=='修改'&&item.editshow=='disabled'?true:false" @change="changeFiled(item, dataForm[item.key])" >
                <el-option v-for="sel in item.filt?item.list.filter(a=>a[item.filt[0]] == dataForm[item.filt[1]]) : item.list" :key="sel[item.value]" :value="sel[item.value]" :label="sel[item.label]" />
              </el-select>
              <!-- 时间 -->
              <el-date-picker size="large" v-model="dataForm[item.key]" placeholder="请选择" v-if="item.type=='time'" style="width: 100%;"  type="datetime" value-format="YYYY-MM-DD HH:mm:ss" format="YYYY-MM-DD HH:mm:ss" :disabled="item.editshow=='disabledAll'?true:title=='修改'&&item.editshow=='disabled'?true:false"/>
              <!-- 树结构 -->
              <el-tree-select size="large" v-model="dataForm[item.key]" placeholder="请选择" v-if="item.type=='tree'" @change="changeSelect(item, dataForm[item.key])"
              ref="treeRef" class="ww100 c8" :default-expand-all="true" highlight-current accordion clearable filterable check-strictly :render-after-expand="false"
              :data="treeData" :props="defaultProps" :node-key="item.node_key?item.node_key:treeId" :disabled="item.editshow=='disabledAll'?true:title=='修改'&&item.editshow=='disabled'?true:false"/>
              <!-- json参数 -->
              <div v-if="item.type=='json'">
                <div class="rad4 ptb2 plr15 flex-cc cursor i2 bo-i2-1" style="background: rgba(5, 19, 67, 0.6)" @click.stop="jsonParams(item)" v-if="!isNull(dataForm[item.key])">编 辑</div>
                <div class="rad4 ptb2 plr15 flex-cc cursor i2 bo-i2-1" style="background: rgba(5, 19, 67, 0.6)" @click.stop="jsonParams(item)" v-else>配 置</div>
              </div>
            </el-form-item>
          </div>
        </div>
      </div>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button size="large" type="info" class="i23 bg-white" @click="onVisable">取 消</el-button>
        <el-button size="large" type="info" class="white bgi22" @click.stop="handleSubmit(formRef)">确 定</el-button>
      </div>
    </template>
  </el-dialog>
  <ImgsParams ref="imgsRef" v-model="dataForm" />
  <DetailParams ref="detailRef" v-model="dataForm" />
  <CommParams ref="commRef" v-model="dataForm" />
</template>

<script lang="ts" setup>
  import api from '../api'
  import CryptoJS from 'crypto-js'
  const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  let editFromInfo = $ref([])
  let visible = $ref(false)
  let title = $ref('')
  let ctx = $ref({})
  let dataForm = $ref({})
  let formRef = ref()
  let imgsRef = $ref()
  let detailRef = $ref()
  let commRef = $ref()
  let ruleList= $ref({})
  let treeRef = $ref(null)
  let treeData = $ref([])
  let treeId = $ref('id')
  let tree = $ref([])
  const refUpload = $ref()
  let colorList = $ref([{name: '绿色', value: 'i21'},{name: '红色', value: 'i26'},{name: '黄色', value: 'i6'}])
  let codeList = $ref([]) 
  const defaultProps = {
    children: 'children',
    label: 'name',
  }   
  const props = defineProps({
    state: {
      type: [Object, Array],
      default: ()=>{return {}}
    },
  })
  const emit = defineEmits(['init', 'changeSelect'])
  const setImg = (val) => {
    return val
  }

  // 打开关闭弹窗
  const onVisable = async (val?: any, type?:string) => {
    visible = !visible
    if (!visible) return
    // 多个
    editFromInfo = type?props.state['editFrom'+type]:props.state.editFrom
    // 标题
    title = val && val.hasOwnProperty(props.state.key)? '修改':'创建'
    // 表单
    if(title == '修改' && !proxy.isNull(props.state.editField)){
      Object.keys(props.state.editField).forEach(key=>{props.state.editField[key]=val[key]})
    }
    dataForm = {}
    dataForm = Object.assign({}, !proxy.isNull(props.state.editField)&&title == '修改'? props.state.editField : val)
    // 规则
    ruleList = {}
    // 获取属性
    editAttr(props.state.editFrom)
  }

  // 获取属性
  const editAttr = async(editFrom) => { 
    if(!editFrom) return false
    editFrom.forEach(item => {
      if(Array.isArray(item)){
         return editAttr(item)
      }else{
        // 获取规则
        if(item.required){
          if(item.editshow != 'none' && (title == '创建' || item.editshow)){
            let rule = proxy.varObj(item.key, [
              {
                required: true, 
                message: item.type=='input'||item.type=='textarea'?'请输入':'请选择', 
                trigger: item.type=='input'||item.type=='textarea'?['blur']:['blur','change'], 
                // pattern: item.pattern?item.pattern:''
              }])
            Object.assign(ruleList, rule)
          }
        }
        // 时间转化
        if(item.type=='time'){
          dataForm[item.key] = title == '修改'? proxy.parseTime(dataForm[item.key]) : proxy.parseTime(new Date())
        }
        // 获取树结构
        if(item.type=='tree'){
          if(!item.node_key || !item.parent_key) return false
          treeData = proxy.treeData(item.list, item.node_key, item.parent_key, 'children')
          if (item.top_name) {
            let json = proxy.varObj(item.node_key, '0')
            let json2 = proxy.varObj(item.key, '0')
            json.name = item.top_name
            Object.assign(json, json2)
            treeData.unshift(json)
          }
        }
      }
    })
  }

  const jsonParams = async(item) => {
    if(item.key == 'comm_params') commRef.onVisable(item.key)
    if(item.key == 'description') detailRef.onVisable(item.key)
    if(item.key == 'imgs') imgsRef.onVisable(item)
  }

  const changeFiled = async(val, value) => {
    if(!val.relation) return
    val.relation.forEach(key => {
      let item = val.list.find(a=>{ return a[val.key] == value})
      if(item) dataForm[key] = item[key]
    })
  }
  
  const changeSelect = async(val, value) => {
    if(!val.relation) return
    emit('changeSelect', value)
  }

  // 获取提交data
  const getForm = () => {
    // 待更新字段
    let form = {}
    // 已编辑字段
    let copyFrom = Object.assign({}, dataForm)
    // 需编辑字段
    let editFrom = props.state.editFrom.filter(a=>!a.condit || copyFrom[a.condit[0]]==a.condit[1])
    // 没有主键 默认主键字段为""
    if(!editFrom.hasOwnProperty(props.state.key)) form[props.state.key] = ""
    // 设置主键值
    if(copyFrom[props.state.key]) form[props.state.key] = copyFrom[props.state.key]
    // 创建添加默认字段
    if(title == '创建') Object.assign(form, props.state.addItem)
    // 匹配字段
    editFrom.forEach(item => {
      let value
      let data = copyFrom[item.key]
      if(item.type == 'time') {
        value = new Date(data).getTime()
      }else if(item.type== 'password'){
        if(item.editshow || title == '创建'){
          value = CryptoJS.MD5(data.toString().trim()).toString().toUpperCase()
        }
      }else if(item.type == 'image' && typeof(data) != 'string'){
        value = JSON.stringify(data)
      }else if(item.multiple && proxy.isArray(data)){
        value = data.join(',')
      }else{
        value = data
      }
      form[item.key] = value
    })
    // 保存全局 json转换str
    let josnstr = editFrom.find(a=>a.type == 'josnstr')
    if(josnstr) {
      let json = JSON.parse(JSON.stringify(form))
      delete json[props.state.key]
      form[josnstr.key] = JSON.stringify(json)
    }
    return form
  }

  // 提交
  const handleSubmit = (formEl) => {
    formEl.validate (async valid => {
      if (valid) {
        let form = getForm()
        let datas = []
        for (let i = 0;  i < form.pointNum; i++) {
          let point = Number(form.point) + i*Number(form.pointScale) + ''
          let temp = {}
          Object.assign(temp, form)
          delete temp.pointNum
          delete temp.pointScale
          temp.point = point
          temp.mode = temp.mode || 1
          datas.push(temp)
        }
        // console.log("datas---", datas)
        let params = {model: props.state.model, list: datas}
        let check = await checkData(datas)
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
        api[title == '修改'?'updApi':'addApi'](params).then((res:any) => {
          if(res.code == 200){
            ElNotification({ title: '提示', message: '操作成功', type: 'success' })
            onVisable()
            emit('init', form[props.state.key])
          }else{
            ElNotification({ title: '提示', message: '操作失败', type: 'error' })
          }
        }).catch((err) => {
          ElNotification({ title: '提示', message: '操作失败', type: 'error' })
        })
      }
    })
  }

  const checkData = async(datas) => {
    if(proxy.isNull(datas)) return {status: false, list: []}
    let data = datas[0]
    let point = ''
    datas.forEach((v,i)=> {
      point+=(i==0?'':`,`)+`'`+v.point+`'`
    })
    let args = data.address?`sensorparents='${data.sensorparents}' and address='${data.address}' and point IN (${point}) and type='${publicStore.active.type}'`:
    props.state.model == 't_v_104_point'?`sensorparents='${data.sensorparents}' and point IN (${point}) and type='${publicStore.active.type}'` : `point IN (${point}) and type='${publicStore.active.type}'`  
    let query = {model: props.state.model, args: args}
    let res = await publicStore.http({Api: query})
    let list = proxy.isNull(res)? [] : res
    return {status: proxy.isNull(res), list: list}
  }

  // 删除
  const del = (form:any) => {
    if(form.hasOwnProperty('children')&&!proxy.isNull(form.children)) return ElNotification({ title: '提示', message: '请删除子节点', type: 'error' })
    ElMessageBox.confirm('是否确定删除?', '删除提示', {confirmButtonText: '确定', cancelButtonText: '关闭', type: 'error'}).then(() => {
      let params = {model: props.state.model, list: [form]}
      api.delApi(params).then((res:any) => {
        if(res.code == 200){
          ElNotification({ title: '提示', message: '操作成功', type: 'success' })
          emit('init', form[props.state.key])
        }else{
          ElNotification({ title: '提示', message: '操作失败', type: 'error' })
        }
      }).catch((err) => {
        ElNotification({ title: '提示', message: '操作失败', type: 'error' })
      })
    })
  }

  // 删除多个
  const dels = (form:any) => {
    // if(form.hasOwnProperty('children')&&!proxy.isNull(form.children)) return ElNotification({ title: '提示', message: '请删除子节点', type: 'error' })
    ElMessageBox.confirm('是否确定删除全部?', '删除提示', {confirmButtonText: '确定', cancelButtonText: '关闭', type: 'error'}).then(() => {
      let params = {model: props.state.model, list: form}
      api.delApi(params).then((res:any) => {
        if(res.code == 200){
          ElNotification({ title: '提示', message: '操作成功', type: 'success' })
          emit('init')
        }else{
          ElNotification({ title: '提示', message: '操作失败', type: 'error' })
        }
      }).catch((err) => {
        ElNotification({ title: '提示', message: '操作失败', type: 'error' })
      })
    })
  }

  // 暴露给父组件
  defineExpose({
    onVisable,
    del,
    dels,
  })
</script>

<style scoped lang="scss">
  :deep(input:-webkit-autofill) {
    -webkit-text-fill-color: #f5f5f5 !important;
  }
  .avatar-uploader {
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-wrap: wrap;
  }
  :deep(.el-upload){
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    color: rgb(38, 99, 170);
    width: 120px;
    height: 120px;
    border: 1px dashed rgb(38, 99, 170);
    border-radius: 8px;
    overflow: hidden;
  }
  :deep(.el-upload--picture-card){
    background: none;
  }
  :deep(.el-upload-list__item){
    transition: all 0s cubic-bezier(.55,0,.1,1);
    background: none;
    width: 120px;
    height: 120px;
    border: 1px dashed rgb(38, 99, 170);
    border-radius: 8px;
    overflow: hidden;
  }
  :deep(.el-upload-list__item.is-ready) {
    display: none;
  }
  :deep(.el-image__error){
    font-size: 12px;
    line-height: 16px;
  }
  .avatar {
    width: 120px;
    height: 120px;
    display: block;
  }
</style>
