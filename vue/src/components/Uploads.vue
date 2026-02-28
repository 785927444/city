<template>
  <!-- 多文件上传 -->
  <div class="layout-col">
    <!-- 固定高度的列表区域 -->
    <div class="file-list-area" :class="{ 'has-files': fileList.length > 0 }">
      <!-- 有文件时显示列表 -->
      <div v-if="fileList.length > 0" class="flex-col-ss ww100 hh100 overlay">
        <div v-for="(file, index) in fileList" :key="file.uid || index" class="ww100 flex-ss c8 ptb5">
          <!-- 文件信息区 -->
          <div class="flex1 flex-sc line1" :title="getFileName(file)">
            {{ file.name||'暂无' }}
          </div>
          <div class="flex-ec">
            <el-tooltip content="预览" placement="top">
              <i-ep-view class="preview-icon cursor ml10" @click="viewRef.onVisable(file.data) " />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <i-ep-delete class="delete-icon cursor ml10" @click="handleRemove(file)" />
            </el-tooltip>
          </div>
        </div>
      </div>
      <!-- 无文件时显示空状态 -->
      <el-empty v-else description="暂无文件" :image-size="80" class="empty-state" />
    </div>

    <!-- 固定在底部的按钮区域 -->
    <div v-if="isLimit" class="limit-tip i8">最多上传 {{ fileLimit }} 个文件</div>
    <div class="upload-footer">
      <el-button class="ww100" type="primary" :icon="Plus" @click="triggerUpload" :disabled="isLimit">
        上传文件
      </el-button>
    </div>

    <!-- 隐藏的上传组件 -->
    <el-upload
      ref="uploadRef"
      class="hidden-upload"
      :show-file-list="false"
      :action="action"
      :headers="uploadHeaders"
      :before-upload="onBeforeUpload"
      :on-change="onFileChange"
      :on-success="onSuccess"
      :on-error="onError"
      :on-exceed="onExceed"
      :limit="fileLimit"
      multiple />
  </div>

  <!-- 预览弹窗 -->
  <el-dialog 
    v-model="state.dialogVisible" 
    title="图片预览" 
    :width="600" 
    destroy-on-close
    class="preview-dialog">
    <img v-if="state.dialogImageUrl" :src="state.dialogImageUrl" class="preview-img" />
  </el-dialog>
  <ViewFiles ref="viewRef" /> 
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { isArray } from '@/utils/common'

const { proxy } = getCurrentInstance()
const publicStore = proxy.publicStore()
const configStore = proxy.configStore()
const model = defineModel('model')
const uploadRef = ref()
let viewRef = $ref() 

const props = defineProps({
  action: { type: String, default: '/api/v1/terminal/base/uploadFile' },
  fileLimit: { type: Number, default: 5 },
  fileSize: { type: Number, default: 2000 },
  fileType: { type: [Array, String], default: () => [] },
  fileList: { type: [Array, String], default: () => [] },
  fileInfo: { type: Object, default: () => ({}) }
})

// 状态
const state = reactive({
  dialogVisible: false,
  dialogImageUrl: '',
  uploadLoading: false,
  selectedFiles: [] // 用于临时存储本次选择的文件
})

// 计算属性
const isSingle = computed(() => typeof model.value === 'string')
const uploadHeaders = computed(() => ({
  'Authorization': configStore.token,
  'X-CSRF-Token': configStore.csrfToken,
  'AuthToken': 'xyz' + proxy.encrypt('xyz' + configStore.secret_key)
}))
const isLimit = computed(() => fileList.value?.length >= props.fileLimit)

// 文件列表（统一格式）
const fileList = computed(() => {
  if (!model.value) return []
  if (Array.isArray(model.value)) {
    return model.value.map(item => {
      if (typeof item === 'string') return { data: item, name: item.split('/').pop() }
      return item
    })
  }
  return []
})

// 工具函数
const getFileName = (file) => file.name || file.data?.split('/').pop() || '未知文件'
const getFileUrl = (file) => file.url || file.data || file
const isImageFile = (file) => /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(getFileName(file))

// 触发上传
const triggerUpload = () => {
  if (uploadRef.value && !isLimit.value) {
    // 重置本次选择的文件列表
    state.selectedFiles = []
    uploadRef.value.$el.querySelector('input').click()
  }
}

// 文件状态改变时触发
const onFileChange = (file, fileList) => {
  // 更新本次选择的文件列表
  state.selectedFiles = fileList
  
  const currentCount = model.value?.length || 0
  const selectedCount = fileList.length
  
  // 检查是否超过限制
  if (currentCount + selectedCount > props.fileLimit) {
    ElMessage.error(`最多只能上传 ${props.fileLimit} 个文件，当前已有 ${currentCount} 个文件，本次选择了 ${selectedCount} 个文件`)
    // 清除本次选择的文件
    uploadRef.value?.clearFiles()
    state.selectedFiles = []
    return false
  }
}

// 文件数量超限时的回调
const onExceed = (files, uploadFiles) => {
  const currentCount = model.value?.length || 0
  const selectedCount = files.length
  const remaining = props.fileLimit - currentCount
  
  if (remaining <= 0) {
    ElMessage.error(`最多只能上传 ${props.fileLimit} 个文件，当前已有 ${currentCount} 个文件，已达到上限`)
  } else {
    ElMessage.error(`最多只能上传 ${props.fileLimit} 个文件，当前已有 ${currentCount} 个文件，本次还能上传 ${remaining} 个文件，但你选择了 ${selectedCount} 个文件`)
  }
}

// 上传前验证
const onBeforeUpload = (file) => {
  const isSizeValid = file.size / 1024 / 1024 < props.fileSize
  if (!isSizeValid) {
    ElMessage.error(`文件大小不能超过 ${props.fileSize}MB`)
    return false
  }
  console.log("props.fileType", props.fileType)
  if (!proxy.isNull(props.fileType)) {
    console.log("props.fileType2", isArray(props.fileType))
    const fileTypes = isArray(props.fileType) ? props.fileType : [props.fileType]
    const isTypeValid = fileTypes.includes(file.type)
    if (!isTypeValid) {
      ElMessage.error(`请上传 ${fileTypes.join('/')} 格式的文件`)
      return false
    }
  }
  return true
}

// 上传成功
const onSuccess = (res, file) => {
  const data = file.response?.data
  if (!data) return

  state.uploadLoading = false
  const fileObj = { 
    data, 
    name: file.name, 
    time: file.uid, 
    status: 'success', 
    type: props.fileInfo.type?props.fileInfo.type:'', 
    parent_id: props.fileInfo.parent_id?props.fileInfo.parent_id:'', 
    parent_type: props.fileInfo.parent_type?props.fileInfo.parent_type:'',  
    user_id: configStore.user&&configStore.user.id?configStore.user.id:'',
    id: '' 
  }
  console.log("fileObj", fileObj)
  if (isSingle.value) {
    model.value = data
  } else {
    if (!Array.isArray(model.value)) model.value = []
    model.value.push(fileObj)
  }
  
  // 上传成功后清除临时文件列表
  uploadRef.value?.clearFiles()
  state.selectedFiles = []
}

// 上传失败
const onError = () => {
  state.uploadLoading = false
  ElMessage.error('上传失败，请重试')
  // 上传失败后清除临时文件列表
  uploadRef.value?.clearFiles()
  state.selectedFiles = []
}
</script>

<style scoped>
/* 单文件上传样式保持不变 */
.single-uploader {
  display: inline-block;
}

.single-upload-content {
  width: 120px;
  height: 120px;
  border: 2px dashed #e4e7ed;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #fafafa;
  overflow: hidden;
}

.single-upload-content:hover {
  border-color: #266fff;
  background: #f0f7ff;
}

.single-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-icon {
  font-size: 32px;
  color: #909399;
}

/* 文件列表区域 - 占据剩余空间，可滚动 */
.file-list-area {
  flex: 1;
  min-height: 0; /* 重要：flex子项需要设置min-height:0才能正确滚动 */
}

/* 文件网格布局 */
.file-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  height: 100%;
  overflow-y: auto; /* 垂直滚动 */
  padding-right: 4px; /* 为滚动条留出空间 */
}

.file-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  height: fit-content; /* 根据内容自适应高度 */
}

.file-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.file-preview {
  height: 120px;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-icon {
  font-size: 36px;
  line-height: 1;
}

.file-info {
  padding: 10px;
  border-top: 1px solid #ebeef5;
}

.file-name {
  font-size: 12px;
  color: #303133;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-actions {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
}

/* 空状态样式 */
.empty-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* 底部按钮区域 - 固定在底部 */
.upload-footer {
  margin-top: 10px;
  display: flex;
  align-items: center;
  width: 100%;
}

.limit-tip {
  font-size: 12px;
  color: #909399;
}

.hidden-upload {
  display: none;
}

/* 预览弹窗 */
.preview-dialog :deep(.el-dialog__body) {
  padding: 20px;
  text-align: center;
}

.preview-img {
  max-width: 100%;
  max-height: 70vh;
  border-radius: 4px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .multi-upload-container {
    height: 350px;
  }
  
  .file-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
</style>