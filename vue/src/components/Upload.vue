<template>
  <!-- 单个头像上传 -->
  <el-upload v-if="typeof(model)=='string'"
    class="avatar-uploader"
    :show-file-list="false"
    :action="action"
    :headers="{Authorization: configStore.token}"
    :before-upload="onBeforeUpload"
    :on-success="onSuccess"
    :on-error="onError"
    :on-remove="onRemove"
    :on-preview="handlePictureCardPreview">
    <img v-if="model" :src="I(model)" class="avatar">
    <i-ep-plus v-else />
  </el-upload>
  <!-- 列表上传 -->
  <el-upload v-else
    class="avatar-uploader"
    :show-file-list="true"
    :action="action"
    :headers="{Authorization: configStore.token}"
    :before-upload="onBeforeUpload"
    :on-success="onSuccess"
    :on-error="onError"
    :on-remove="onRemove"
    :on-preview="handlePictureCardPreview"
    :limit="fileLimit"
    multiple
    list-type="picture-card"
    v-model:file-list="props.fileList">
    <i-ep-plus />
  </el-upload>
  <el-dialog title="图片" :width="810" v-model="state.dialogVisible" :destory-on-close="true">
    <img class="ww100" :src="state.dialogImageUrl" alt="Preview Image" />
  </el-dialog>
</template>

<script lang="ts" setup>
  const { proxy } = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const model = defineModel('model')
  const props = defineProps({
    action: {
      type: String,
      default: '/api/v1/admin/upload'
    },
    fileLimit: {
      type: Number,
      default: 5
    },
    fileSize: {
      type: Number,
      default: 20
    },
    fileType: {
      type: Array,
      default: ['image/jpg', 'image/jpeg', 'image/png']
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
    const isType = props.fileType.indexOf(file.type) == -1? false : true
    if (!isType) ElMessage({ type: 'error', message: "文件类型不合法，请上传" + props.fileType })
    // 限制大小
    const isSize = file.size / 1024 / 1024 < props.fileSize;
    if (!isSize) ElMessage({ type: 'error', message: '上传图片大小不能超过 '+props.fileSize+'MB!' })
    return isType && isSize;
  }

  const onSuccess = (res, file, fileList) => {
    let data = file.response.data
    if(!data) return
    if (Object.prototype.hasOwnProperty.call(file,'response') && file.response.data){
      if(typeof(model.value)=='string'){
        model.value = data
      }else{
        if(!fileList) return
        if(fileList.length == 0) return
        if(!Object.prototype.hasOwnProperty.call(fileList[fileList.length-1],'response')) return
        model.value.push(data)
        console.log('sss', model.value)
      }
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
