<template>
  <el-dialog v-model="state.isFalse" title="详细信息" :before-close="onVisable" :draggable="true" width="38%">
    <!-- 电机 start -->
    <el-form v-if="state.type == 'Motorsensor'" ref="formRef" :model="state.form" :rules="state.ruleList" label-width="22%">
      <el-form-item label="休眠时长" prop="sleep">
        <el-input size="large" v-model="state.form.sleep" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="典型数据周期" prop="qw1">
        <el-input size="large" v-model="state.form.qw1" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="原始数据周期" prop="qw2">
        <el-input size="large" v-model="state.form.qw2" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="采样频率" prop="hz">
        <el-input size="large" v-model="state.form.hz" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="点数" prop="dot">
        <el-input size="large" v-model="state.form.dot" placeholder="请输入" />
      </el-form-item>
      <!-- <el-form-item label="图片" prop="picture">
        <el-upload ref="refUpload" class="avatar-uploader" :show-file-list="false" :http-request="(options) => uploadImageFile(options, 'picture')">
          <img v-if="!isNull(state.form.picture)" :src="state.form.picture" class="avatar">
          <i-ep-plus v-else />
        </el-upload>
      </el-form-item> -->
    </el-form>
    <!-- 电机 end -->
    <div v-if="state.empty" class="f20 fw tc white">请配置</div>
    <template #footer>
      <div class="dialog-footer">
        <el-button size="large" type="info" class="i23 bg-white" @click="onVisable">取 消</el-button>
        <el-button size="large" type="info" class="white bgi22" @click.stop="handleSubmit(formRef)">确 定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const state = reactive({
	  ...publicStore.$state,
    ruleList: [],
    form: [],
    type: '',
    code: '',
  })
  let formRef = ref()
  const model = defineModel()

  // 打开关闭弹窗
  const onVisable = async (val) => {
    state.type = model.value.type
    state.isFalse = !state.isFalse
    if(!state.isFalse) return state.form = {}
    state.code = val
    state.form = proxy.isNull(model.value[state.code])? {} : JSON.parse(model.value[state.code])
  }

  // const uploadImageFile = async(options, key) => {
  //   if (options.file) {
  //     const reader = new FileReader()
  //     reader.readAsDataURL(options.file)
  //     reader.onload = async () => {
  //       const base64Data = reader.result
  //       state.form [key] = base64Data
  //     }
  //   }
  // }

  const handleSubmit = (formEl) => {
    formEl.validate (async valid => {
      if (valid) {
        console.log('state.form---------------', state.form)
        if (Object.values(state.form).every(a => a === '')) {
          model.value[state.code] = ''
        }else{
          model.value[state.code] = JSON.stringify(state.form)
        }
        onVisable()
      }
    })
  }

  // 暴露给父组件
  defineExpose({
    onVisable
  })
</script>

<style scoped lang="scss">
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
