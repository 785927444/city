<template>
  <!-- 单个上传 -->
  <el-upload
    class="avatar-uploader"
    :show-file-list="false"
    :action="action"
    :headers="{'Authorization': configStore.token, 'X-CSRF-Token': configStore.csrfToken, 'AuthToken': 'xyz'+ encrypt('xyz'+configStore.secret_key)}"
    :before-upload="onBeforeUpload"
    :on-success="onSuccess"
    :on-error="onError"
    :on-remove="onRemove"
    :on-preview="handlePictureCardPreview">
    <span v-if="model">{{ model.name?model.name:'未知' }}</span>
    <span v-else>点击上传</span>
  </el-upload>
  <!-- <el-dialog title="图片" :width="810" v-model="state.dialogVisible" :destory-on-close="true">
    <img class="ww100" :src="state.dialogImageUrl" alt="Preview Image" />
  </el-dialog> -->
</template>

<script lang="ts" setup>
  const { proxy } = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const model = defineModel('model')
  const props = defineProps({
    action: {
      type: String,
      default: '/api/v1/terminal/base/uploadFile'
    },
    fileLimit: {
      type: Number,
      default: 5
    },
    fileSize: {
      type: Number,
      default: 2000
    },
    fileType: {
      type: Array,
      default: []
    },
     fileList: {
      type: [Array, String],
      default: []
    },
  })

  const state = reactive({
    dialogVisible: false,
    dialogImageUrl: '',
  })

  const handlePictureCardPreview = (uploadFile) => {
    state.dialogImageUrl = uploadFile.url
    state.dialogVisible = true
  }  

  const onBeforeUpload = (file) => {
    // 限制类型
    // const isType = props.fileType.indexOf(file.type) == -1? false : true
    // if (!isType) ElMessage({ type: 'error', message: "文件类型不合法，请上传" + props.fileType })
    // 限制大小
    // const isSize = file.size / 1024 / 1024 < props.fileSize;
    // if (!isSize) ElMessage({ type: 'error', message: '上传图片大小不能超过 '+props.fileSize+'MB!' })
    // return isType && isSize;
    const isSize = file.size / 1024 / 1024 < props.fileSize;
    if (!isSize) ElMessage({ type: 'error', message: '上传图片大小不能超过 '+props.fileSize+'MB!' })
    return isSize;
  }

  const onSuccess = (res, file, fileList) => {
    let data = file.response.data
    if(!data) return
    if (Object.prototype.hasOwnProperty.call(file,'response') && file.response.data){
      model.value = {data: data, name: file.name, time: file.uid, status: file.status, filetype: file.raw.type}
      ElNotification({ title: '提示', message: file.status=='success'?'上传成功':'上传失败', type: file.status=='success'?'success':'error' })
    }
  }

  const onRemove = (file, fileList) => {
    if(!file) return
    if(!Object.prototype.hasOwnProperty.call(file,'response')) return
    let data = file.response.data
    let index = model.value.findIndex(a=>a == data)
    if(index!=-1) model.value.splice(index, 1)
  }

  const onError = () => {
    state.loading = false
    ElMessage({ type: 'error', message: '上传失败' })
  }
</script>

<style lang="scss" scoped>
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
    font-size: 14px;
    color: #266fff;
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
    border: 1px dashed #266fff;
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
