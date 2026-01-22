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
              :data="treeData" :props="state.defaultProps" :node-key="item.node_key?item.node_key:treeId" :disabled="item.editshow=='disabledAll'?true:title=='修改'&&item.editshow=='disabled'?true:false"/>
              <!-- 图片 -->
              <upload v-if="item.type=='image'" :fileList="file(dataForm[item.key])" v-model:model="dataForm[item.key]" />
              <!-- base64图片 -->
              <div v-if="item.type=='base64' || item.type=='base64'" class="ww100">
                <el-upload ref="refUpload" class="avatar-uploader" :show-file-list="false" :http-request="(options) => uploadImageFiles(options, item.key, item.type)">
                  <div class="ww100 hidden" v-if="!isNull(dataForm[item.key])">
                   <img :src="dataForm[item.key]" class="hh100">
                   <div class="absolute t10 r10 z1" @click.stop="dataForm[item.key]=''"><i-ep-circleCloseFilled /></div>
                  </div>
                  <i-ep-plus v-else />
                </el-upload>
              </div>
              <!-- json参数 -->
              <div v-if="item.type=='json'">
                <div class="rad4 ptb2 plr15 flex-cc cursor i2 bo-i2-1" style="background: rgba(5, 19, 67, 0.6)" @click.stop="jsonParams(item)" v-if="!isNull(dataForm[item.key])">编 辑</div>
                <div class="rad4 ptb2 plr15 flex-cc cursor i2 bo-i2-1" style="background: rgba(5, 19, 67, 0.6)" @click.stop="jsonParams(item)" v-else>配 置</div>
              </div>
              <!-- 详情图片 -->
              <div v-if="item.type=='imgs'">
                <div class="rad4 ptb2 plr15 flex-cc cursor i2 bo-i2-1" style="background: rgba(5, 19, 67, 0.6)" @click.stop="jsonParams(item)" v-if="!isNull(item.value)">编 辑</div>
                <div class="rad4 ptb2 plr15 flex-cc cursor i2 bo-i2-1" style="background: rgba(5, 19, 67, 0.6)" @click.stop="jsonParams(item)" v-else>配 置</div>
              </div>
              <span class="rad4 ptb2 plr15 flex-cc cursor i2 bo-i2-1 ml15" style="background: rgba(5, 19, 67, 0.6)" @click="handleSync('comm_params')" v-if="dataForm[state.key] && item.key == 'comm_params'">同 步</span>
              <!-- 额外 -->
              <div v-if="item.type=='attr'" class="ww100">
                <div class="flex-sc cursor bo-i16-1 plr10 ptb1 rad4 i16 w80" @click.stop="dataForm[item.key]?dataForm[item.key].push({name: '', value: '', color: ''}):dataForm[item.key]=[{name: '', value: '', color: ''}]"><i-ep-plus class="f12 mr2" />新增</div>
                <div class="flex-sc ww100 mt10" v-for="(v, i) in dataForm[item.key]?dataForm[item.key]:[]" :key="i">
                  <el-input class="flex2 mr10" size="large" v-model="v.name" placeholder="名称" />
                  <el-input class="flex2 mr10" size="large" v-model="v.value" placeholder="值" />
                  <el-select class="flex2 mr10" size="large" v-model="v.color" placeholder="颜色" clearable filterable>
                    <el-option v-for="sel in colorList" :key="sel['value']" :label="sel['name']" :value="sel['value']" />
                  </el-select>
                  <el-button size="large" type="info" class="white bgi23" @click.stop="dataForm[item.key].splice(i, 1)">删 除</el-button>
                </div>
              </div>
            </el-form-item>
          </div>
        </div>
      </div>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button size="large" class="bgc white" @click="onVisable">取 消</el-button>
        <el-button size="large" class="bgi1 white" @click.stop="handleSubmit(formRef)">确 定</el-button>
      </div>
    </template>
  </el-dialog>
  <ImgsParams ref="imgsRef" v-model="dataForm" />
  <DetailParams ref="detailRef" v-model="dataForm" />
</template>

<script lang="ts" setup>
  import api from '../api'
  import CryptoJS from 'crypto-js'
  import router from '@/router'
  const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const route = useRoute()
  const refUpload = $ref()
  let editFromInfo = $ref([])
  let visible = $ref(false)
  let title = $ref('')
  let ctx = $ref({})
  let dataForm = $ref({})
  let formRef = ref()
  let imgsRef = $ref()
  let detailRef = $ref()
  let ruleList= $ref({})
  let treeRef = $ref(null)
  let treeData = $ref([])
  let treeId = $ref('id')
  let tree = $ref([])
  let colorList = $ref([{name: '绿色', value: 'i21'},{name: '红色', value: 'i26'},{name: '黄色', value: 'i6'}])
  let codeList = $ref([]) 
  const defaultProps = {
    children: 'children',
    label: 'station_name',
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
          // dataForm[item.key] = title == '修改'? proxy.parseTime(dataForm[item.key]) : proxy.parseTime(new Date())
          dataForm[item.key] = title == '修改'? proxy.parseTime(dataForm[item.key]) : ''
        }
        // 获取树结构
        if(item.type=='tree'){
          if(!item.node_key || !item.parent_key) return false
          treeData = proxy.treeData(item.list, item.node_key, item.parent_key, 'children')
          if (item.top_name) {
            let json = proxy.varObj(item.node_key, '0')
            let json2 = proxy.varObj(item.key, '0')
            json[item.top_key? item.top_key : 'name'] = item.top_name
            Object.assign(json, json2)
            treeData.unshift(json)
          }
        }
      }
    })
  }

  const jsonParams = async(item) => {
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

  // 提交验证
  const check = (val) => {
    let res = {status: true, msg: ''}
    // 用户验证
    if(props.state.model == 't_user') {
      // 密码验证
      if(res.status && val.Password) res = validatePassword(val.Password)
      if(res.status && val.password) res = validatePassword(val.password)
      // 手机验证
      if(res.status &&val.phone){
        res.status = /^1(3\d|4[5-9]|5[0-35-9]|6[2567]|7[0-8]|8\d|9[0-35-9])\d{8}$/.test(val.phone)
        if(!res.status) res.msg = "手机号码有误"
      }
     }
    if(!res.status) ElNotification({ title: '提示', message: res.msg, type: 'error' })
    return res.status
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
    let now = Date.now().toString()
    editFrom.forEach(item => {
      let value
      let data = copyFrom[item.key]
      if(item.type == 'time') {
        value = data?new Date(data).getTime()+'':''
      }else if(item.type== 'password'){
        if(item.editshow || title == '创建'){
          value = proxy.generateRandomString(5) + CryptoJS.MD5(data.toString().trim()).toString().toUpperCase() + proxy.generateRandomString(5)
        }
      }else if(item.type == 'image' && typeof(data) != 'string'){
        value = JSON.stringify(data)
      }else if(item.multiple && proxy.isArray(data)){
        value = data.join(',')
      }else if(item.type == 'update') {
        value = now
      }else if(item.type == 'input' && item.class == 'update_key' && !form[props.state.key]) {
        value = now
      }else{
        value = data
      }
      // 加密数据
      if(item.encrypt && data) value = proxy.encrypt(data)
      // 更新数据
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
        if(!check(dataForm)) return
        let form = getForm()
        // console.log("form---", form)
        let params = {model: props.state.model, list: [form]}
        api[title == '修改'?'updApi':'addApi'](params).then((res:any) => {
          if(res.code == 200){
            setForm(form)
            ElNotification({ title: '提示', message: '操作成功', type: 'success' })
            onVisable()
            emit('init', form[props.state.key])
          }else{
            ElNotification({ title: '提示', message: res.msg?res.msg:'操作失败1', type: 'error' })
          }
        }).catch((err) => {
          ElNotification({ title: '提示', message: '操作失败2', type: 'error' })
        })
      }
    })
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
          ElNotification({ title: '提示', message: res.msg?res.msg:'操作失败', type: 'error' })
        }
      }).catch((err) => {
        ElNotification({ title: '提示', message: '操作失败', type: 'error' })
      })
    })
  }

  // 附加操作
  const setForm = async(from) => {
    // 用户登出
    if(props.state.model == 't_user' && title == '修改') {
      let query = {model: "redis", key: `${from.username}`, value: '0', time: 1}
      let redis = await publicStore.http({setApi: query})
      console.log("退出成功redis", redis)
      if(!proxy.isNull(configStore.user) && configStore.user.username && configStore.user.username ==from.username){
        const timeoutId = setTimeout(() => {
          router.push({path: configStore.loginRoute})
          clearTimeout(timeoutId)
        }, 1000)
      }
    }
  }

  const uploadImageFile = async(options, key) => {
    if (options.file) {
      const reader = new FileReader()
      reader.readAsDataURL(options.file)
      reader.onload = async () => {
        const base64Data = reader.result
        dataForm[key] = base64Data
      }
    }
  }

  const uploadImageFiles = async (options, key, type, maxWidth = 800, maxHeight = 800) => {
    if (!options.file) return;
    if (options.file.size < 500 * 1024) {
      const reader = new FileReader()
      reader.readAsDataURL(options.file)
      reader.onload = async () => {
        const base64Data = reader.result
        if(type == 'base64'){
          dataForm[key] = base64Data
        }else{
          if(!dataForm[key]) dataForm[key] = []
          dataForm[key].push(base64Data)
        }
      }
    }else{
      console.log('大于500KB开始压缩----------');
      console.log(`压缩前-: ${(options.file.size / 1024).toFixed(2)} KB`);
      try {
        const base64Data = await readFileAsDataURL(options.file);
        const compressedImage = await resizeImage(base64Data, maxWidth, maxHeight);
        const compressedSize = (compressedImage.length * (3 / 4)) / 1024
        console.log(`压缩后-: ${compressedSize.toFixed(2)} KB`);
        // 更新 Vue 的状态
        if(type == 'base64'){
          dataForm[key] = compressedImage
        }else{
          if(!dataForm[key]) dataForm[key] = []
          dataForm[key].push(compressedImage)
        }
      } catch (error) {
        console.error('Image upload error:', error);
      }
    }
  }

  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
      reader.readAsDataURL(file)
    })
  }

  const resizeImage = (base64Data, maxWidth, maxHeight) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.src = base64Data
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        // 计算新的宽高
        let width = img.width;
        let height = img.height;
        // 计算新的大小，保持纵横比
        if (width > height) {
          if (width > maxWidth) {
            height *= (maxWidth / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= (maxHeight / height);
            height = maxHeight;
          }
        }
        // 设置画布的宽高
        canvas.width = width
        canvas.height = height
        // 将图片绘制到画布上
        ctx.drawImage(img, 0, 0, width, height)
        // 获取压缩后的 Base64 数据 控制质量，这里使用 0.8
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8)
        resolve(compressedBase64)
      }
      img.onerror = (error) => reject(error)
    })
  }

  // 密码验证
  const validatePassword = (password) => {
    let res = {status: true, msg: ''}
    // 1. 必填验证
    if (!password || password.trim() === '') {
      res.msg = '密码为必填项'
      res.status = false
    }
    // 2. 去除首尾空格
    const trimmedValue = password.trim();
    
    // 3. 长度验证
    if (trimmedValue.length <= 8) {
      res.msg = '密码长度必须大于8位'
      res.status = false
    }
    // 4. 复杂度验证
    const hasLetter = /[a-zA-Z]/.test(trimmedValue);  // 包含字母
    const hasNumber = /\d/.test(trimmedValue);        // 包含数字
    const hasSymbol = /[~`!@#$%^&*()_+\-=\[\]{}|;':",.<>\/?\\]/.test(trimmedValue); // 包含符号
    
    if (!hasLetter || !hasNumber || !hasSymbol) {
      res.msg = '密码必须同时包含字母、数字和特殊符号'
      res.status = false
    }
    return res;
  };

  // 暴露给父组件
  defineExpose({
    onVisable,
    del,
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
    min-width: 120px;
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
