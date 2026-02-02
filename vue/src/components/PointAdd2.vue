<template>
  <el-dialog v-model="visible" :title="title" :before-close="onVisable" :draggable="true" width="40%">
    <el-form ref="formRef" :model="dataForm" :rules="ruleList" label-width="20%">
      <div class="flex-sc warp ww100">
        <!-- 模板选择 -->
        <el-form-item label="选择模板" class="ww100" prop="modbusTypeId">
          <el-select size="large" v-model="dataForm.modbusTypeId" placeholder="请选择"  style="width:100%" clearable filterable >
            <el-option v-for="sel in modbusTypes" :key="sel.id" :value="sel.id" :label="sel.name" >
              <template #default>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span>{{ sel.name  }}</span>
                  <el-icon @click.stop="delTemp(sel)"  style="font-size: 12px; cursor: pointer; margin-left: 8px;">
                    <Close />
                  </el-icon>
                </div>
              </template>
            </el-option>
          </el-select>
        </el-form-item>
        <!-- 点位地址 -->
        <el-form-item label="偏移序号" class="ww100" prop="pointOffset">
          <el-input size="large" v-model="dataForm.pointOffset" placeholder="请输入" />
        </el-form-item>
        <!-- 点位地址 -->
        <el-form-item label="偏移系数" class="ww100" prop="coefficient">
          <el-input size="large" v-model="dataForm.coefficient" placeholder="请输入" />
        </el-form-item>
        <!-- 点位地址 -->
        <el-form-item :label="props.state.model == 't_v_104_point' || props.state.model == 't_v_104_point_server'?'通道':'寄存器ID'" class="ww100" prop="address">
          <el-input size="large" v-model="dataForm.address" placeholder="请输入" />
        </el-form-item>
      </div>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button size="large" type="info" class="i23 bg-white" @click="onVisable">取 消</el-button>
        <el-button size="large" type="info" class="white bgi22" @click.stop="handleSubmit(formRef)">确 定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
  import api from '../api'
  import { Close } from '@element-plus/icons-vue'
  const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  let visible = $ref(false)
  let title = $ref('模板导入')
  let dataForm = $ref({})
  let ruleList= $ref({
    modbusTypeId: [{ required: true, message: '请选择', trigger:['blur','change']  }],
  })
  let formRef = ref()
  let modbusTypes = $ref([])
  const props = defineProps({
    state: {
      type: [Object, Array],
      default: ()=>{return {}}
    },
  })
  const emit = defineEmits(['init', 'changeSelect'])

  const getModbusTypes = async() => {
    let cla = props.state.model == 't_v_104_point_server'? '1' : '0'
    // 新增：获取当前节点的类型（从publicStore.active中获取）
    const nodeType = publicStore.active?.type
    // 修改查询条件：增加节点类型过滤
    let args = `qztype= '${publicStore.active.qztype}' and class=${cla}`
    if (nodeType) {
      args += ` and type='${nodeType}'` //添加类型过滤条件
    }
    let query = {model: props.state.modelType, args}
    let res = await publicStore.http({Api: query})
    modbusTypes = proxy.isNull(res)? [] : res
    console.log(modbusTypes, 'modbusTypes的值是什么?')
    if(!proxy.isNull(res)) {
      dataForm.modbusTypeId = modbusTypes[0].id
    }
    console.log("modbusTypes", modbusTypes)
  }

  const delTemp = (item) => {
    console.log(item, '打印item是什么')
  ElMessageBox.confirm(' 是否确定删除该模板?', '删除提示', {confirmButtonText: '确定', cancelButtonText: '关闭', type: 'error'}).then(async () => {
    // 构建参数：注意模板数据的模型是modelType
    let params = { model: props.state.modelType,  list: [item] }
    try {
      const res = await api.delApi(params) 
      if(res.code  == 200){
        ElNotification({ title: '提示', message: '删除模板成功', type: 'success' })
        // 如果当前选中的模板被删除，则清空选择
        if (dataForm.modbusTypeId  === item.id)  {
          dataForm.modbusTypeId  = null
        }
        // 重新加载模板列表
        await getModbusTypes()
      } else {
        ElNotification({ title: '提示', message: '删除模板失败', type: 'error' })
      }
    } catch (err) {
      ElNotification({ title: '提示', message: '删除模板失败', type: 'error' })
    }
  }).catch(() => {})
}

  // 打开关闭弹窗
  const onVisable = async (val?: any, type?:string) => {
    visible = !visible
    if (!visible) return
    getModbusTypes()
  }

  // 提交
  const handleSubmit = (formEl) => {
    formEl.validate (async valid => {
      if (valid) {
        const coefficient = Number(dataForm.coefficient);
        const offset = Number(dataForm.pointOffset);
        const actualOffset = coefficient * offset;
        let modbusType = modbusTypes.find(a=>a.id == dataForm.modbusTypeId)
        if(!modbusType.value) return
        let modbusValue = JSON.parse(modbusType.value)
        let params = {model: props.state.model, list: []}
        let pointOffset = dataForm.pointOffset? dataForm.pointOffset : 0
        params.list = modbusValue.map((v, i) => {
          let temp = {}
          Object.assign(temp, v)
          temp.id = ''
          temp.sensorid = publicStore.active.id+''
          if(v.point !== null && v.point !== undefined) temp.point = Number(v.point) + Number(actualOffset) + ''
          if(dataForm.address) temp.address = dataForm.address
          return temp
        })
        let check = await checkData(params.list)
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
        api['addApi'](params).then((res:any) => {
          if(res.code == 200){
            ElNotification({ title: '提示', message: '操作成功', type: 'success' })
            onVisable()
            emit('init')
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
    console.log("datas---", datas)
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

  watch(() => publicStore.active, async(val) => {
    let type = publicStore.active?.type
    // console.log(type, '打印什么类型')
    let comm_params = publicStore.active?.comm_params
    let parsedParams = {}
    if (typeof comm_params === 'string') {
      try {
        parsedParams = JSON.parse(comm_params) 
      } catch (e) {
        parsedParams = {}
      }
    } else if (typeof comm_params === 'object' && comm_params !== null) {
      parsedParams = comm_params
    }
    if (type == 'METER') {
      const dbNumValue = (parsedParams as any).DBNUM
      dataForm.pointOffset = dbNumValue || 1
      if(publicStore.active.qztype == 'lonwork') dataForm.coefficient = 50 
      if(publicStore.active.qztype == 'S645') dataForm.coefficient = 200 
    }
  }, {immediate: false, deep: true})

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
