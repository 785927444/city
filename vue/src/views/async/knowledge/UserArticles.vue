<template>
  <div class="layout-col">
    <aa-title title="我的文章">
      <template #right-content>
        <div class="flex-sc">
          <div class="rad4 ptb5 plr8 flex-cc cursor bgi1 white ml10" @click="handleAdd">发布内容</div>
          <div class="rad4 ptb5 plr8 flex-cc cursor bg-white c8 bo-cc-1 ml10" @click="handleBack">返回</div>
        </div>
      </template>
    </aa-title>

    <div class="p15 bg-white m15 rad8 flex1 table-col">
      <div class="mb15 flex-sc">
        <el-input v-model="state.keyword" placeholder="关键词搜索" style="width: 200px" clearable @change="fetchList" />
        <el-button type="primary" class="ml10" @click="fetchList">搜索</el-button>
      </div>

      <el-table :data="state.list" v-loading="state.loading" style="width: 100%; flex: 1" height="0">
        <el-table-column prop="title" label="标题" show-overflow-tooltip />
        <el-table-column prop="column_code" label="分类" width="120">
            <template #default="{ row }">
                {{ getColumnName(row.column_code) }}
            </template>
        </el-table-column>
        <el-table-column prop="publish_time" label="发布时间" width="120" />
        <el-table-column prop="view_count" label="浏览" width="80" />
        <el-table-column prop="collect_count" label="收藏" width="80" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex-ec mt15">
        <el-pagination
          v-model:current-page="state.page"
          v-model:page-size="state.limit"
          :total="state.total"
          layout="total, prev, pager, next"
          @current-change="fetchList"
        />
      </div>
    </div>

    <el-dialog
      v-model="dialog.visible"
      :title="dialog.isEdit ? '编辑文章' : '新增文章'"
      width="800px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form :model="form" ref="formRef" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="标题" prop="title">
              <el-input v-model="form.title" placeholder="请输入标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
             <el-form-item label="副标题" prop="subtitle">
              <el-input v-model="form.subtitle" placeholder="请输入副标题" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
            <el-col :span="12">
                <el-form-item label="作者" prop="author">
                    <el-input v-model="form.author" placeholder="请输入作者" />
                </el-form-item>
            </el-col>
             <el-col :span="12">
                <el-form-item label="分类" prop="column_code">
                    <el-select v-model="form.column_code" placeholder="请选择分类">
                        <el-option
                            v-for="item in columns"
                            :key="item.code"
                            :label="item.name"
                            :value="item.code"
                        />
                    </el-select>
                </el-form-item>
            </el-col>
        </el-row>

        <el-form-item label="摘要" prop="summary">
          <el-input type="textarea" v-model="form.summary" placeholder="请输入摘要" :rows="3" />
        </el-form-item>

        <el-form-item label="封面图" prop="image_urls">
             <Upload v-model:model="form.image_urls" :fileList="imgFileList" :fileLimit="1" :fileSize="2" action="/kb-api/upload?type=simple" />
             <div class="el-upload__tip">建议尺寸 800×400、≤2 MB</div>
        </el-form-item>

        <el-form-item label="正文" prop="content">
          <RichEditor v-model="form.content" />
        </el-form-item>

        <el-form-item label="附件" prop="attachments">
             <el-upload
                action="#"
                :http-request="customUpload"
                :file-list="attachmentList"
                :on-change="handleAttachmentChange"
                :on-remove="handleAttachmentRemove"
                multiple
                :accept="'.pdf,.doc,.docx'"
             >
                <el-button type="primary">点击上传</el-button>
                <template #tip>
                    <div class="el-upload__tip">支持 pdf, doc, docx 格式</div>
                </template>
                 <template #file="{ file }">
                    <div class="flex-bc ww100 p5" style="border-bottom: 1px solid #eee">
                        <span class="mr10 line1 flex1">{{ file.name }}</span>
                        <div class="flex-sc">
                            <el-checkbox v-model="file.raw.isParse" @change="(val) => handleParse(val, file)" label="解析为正文" />
                            <i-ep-close class="ml10 cursor red" @click="handleRemoveFile(file)" />
                        </div>
                    </div>
                </template>
             </el-upload>
        </el-form-item>

        <el-row :gutter="20">
            <el-col :span="12">
                 <el-form-item label="发布时间" prop="publish_time">
                    <el-date-picker v-model="form.publish_time" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" />
                </el-form-item>
            </el-col>
            <el-col :span="12">
                <el-form-item label="是否置顶" prop="is_top">
                    <el-switch v-model="form.is_top" :active-value="1" :inactive-value="0" />
                </el-form-item>
            </el-col>
        </el-row>

        <el-form-item label="标签" prop="tags">
            <el-input v-model="form.tags" placeholder="请输入标签，逗号分隔" />
        </el-form-item>
        
        <el-form-item label="SEO关键字" prop="seo_keywords">
            <el-input v-model="form.seo_keywords" placeholder="请输入SEO关键字" />
        </el-form-item>

        <el-row :gutter="20">
             <el-col :span="12">
                <el-form-item label="浏览统计" prop="view_count">
                    <el-input-number v-model="form.view_count" :min="0" disabled />
                </el-form-item>
             </el-col>
             <el-col :span="12">
                <el-form-item label="收藏统计" prop="collect_count">
                    <el-input-number v-model="form.collect_count" :min="0" disabled />
                </el-form-item>
             </el-col>
        </el-row>

      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="dialog.loading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'
import Upload from '@/components/Upload.vue'
import RichEditor from '@/components/RichEditor.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const { proxy }: any = getCurrentInstance()
const configStore = proxy.configStore()
const router = useRouter()

const state = reactive({
  keyword: '',
  list: [],
  total: 0,
  page: 1,
  limit: 20,
  loading: false,
})

const dialog = reactive({
  visible: false,
  isEdit: false,
  loading: false,
})

const formRef = ref()
const form = reactive({
  id: '',
  title: '',
  subtitle: '',
  author: '',
  summary: '',
  content: '',
  image_urls: [] as string[],
  column_code: '',
  publish_time: '',
  is_top: 0,
  tags: '',
  seo_keywords: '',
  view_count: 0,
  collect_count: 0,
  attachments: [] as any[]
})

const attachmentList = ref<any[]>([])
const imgFileList = ref<any[]>([])

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入正文', trigger: 'blur' }],
  column_code: [{ required: true, message: '请选择分类', trigger: 'change' }],
  tags: [
    {
      validator: (rule: any, value: any, callback: any) => {
        if (!value) return callback()
        const tags = value.split(/[,，]/).filter((t: string) => t.trim())
        if (tags.length > 5) {
          callback(new Error('最多输入5个标签'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const columns = ref([
    { code: 'policy', name: '政策法规' },
    { code: 'standard', name: '标准规范' },
    { code: 'mechanism', name: '工作机制' },
    { code: 'expert', name: '专家智库' },
    { code: 'case', name: '优秀案例' },
    { code: 'course', name: '培训课程' },
])

const userId = computed(() => String(configStore?.user?.id ?? configStore?.user ?? '').trim() || 'anonymous')

onMounted(() => {
  fetchList()
  fetchColumns()
})

const fetchColumns = async () => {
    try {
        const res: any = await api.kbColumnsApi({})
        if (res?.data?.columns) {
            columns.value = res.data.columns
        }
    } catch (e) {
        console.error(e)
    }
}

const getColumnName = (code: string) => {
    const col = columns.value.find(c => c.code === code)
    return col ? col.name : code
}

const fetchList = async () => {
  state.loading = true
  try {
    const res: any = await api.kbMyArticleListApi({
      user_id: userId.value,
      q: state.keyword,
      page: state.page,
      limit: state.limit
    })
    const data = res?.data ?? res
    state.list = data.items || []
    state.total = data.total || 0
  } catch (e) {
    ElMessage.error('获取列表失败')
  } finally {
    state.loading = false
  }
}

const handleBack = () => {
  if (window.history.length > 1) return router.back()
  router.push('/knowledge')
}

const handleAdd = () => {
  dialog.isEdit = false
  dialog.visible = true
  resetForm()
}

const handleEdit = async (row: any) => {
  dialog.isEdit = true
  dialog.visible = true
  resetForm()
  Object.assign(form, row)
  if (typeof form.image_urls === 'string') {
      try {
          form.image_urls = JSON.parse(form.image_urls)
      } catch {
          form.image_urls = []
      }
  } else if (!Array.isArray(form.image_urls)) {
      form.image_urls = []
  }
  
  imgFileList.value = form.image_urls.map((url: string) => ({
      name: url.split('/').pop() || 'image',
      url: url
  }))

  attachmentList.value = (row.attachments || []).map((a: any) => ({
      name: a.file_name,
      url: a.url,
      raw: { ...a, isParse: false }
  }))
  try {
      const res: any = await api.kbArticleStatsApi({ id: row.id })
      const data = res?.data ?? res
      form.view_count = data.view_count
      form.collect_count = data.collect_count
  } catch (e) {
  }
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确认删除该文章吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await api.kbArticleDeleteApi({ id: row.id })
      ElMessage.success('删除成功')
      fetchList()
    } catch (e) {
      ElMessage.error('删除失败')
    }
  })
}

const resetForm = () => {
  form.id = ''
  form.title = ''
  form.subtitle = ''
  form.author = configStore?.user?.name || ''
  form.summary = ''
  form.content = ''
  form.image_urls = []
  form.column_code = ''
  form.publish_time = new Date().toISOString().split('T')[0]
  form.is_top = 0
  form.tags = ''
  form.seo_keywords = ''
  form.view_count = 0
  form.collect_count = 0
  form.attachments = []
  attachmentList.value = []
  imgFileList.value = []
}

const customUpload = async (options: any) => {
    try {
        const formData = new FormData()
        formData.append('file', options.file)
        const res: any = await api.kbUploadFileApi(formData, '/kb-api/upload?type=simple')
        const payload = res?.data ?? res
        let url = ''
        if (typeof payload === 'string') {
            url = payload
        } else if (payload?.url) {
            url = payload.url
        } else if (payload?.data && typeof payload.data === 'string') {
            url = payload.data
        } else if (payload?.data?.url) {
            url = payload.data.url
        } else if (payload?.href) {
            url = payload.href
        }
        
        if (url) {
             options.onSuccess({ url: url, name: options.file.name })
        } else {
            ElMessage.error('上传失败: 无URL返回')
            options.onError(new Error('No URL in response'))
        }
    } catch (e) {
        console.error(e)
        ElMessage.error('上传出错')
        options.onError(e)
    }
}

const handleAttachmentChange = (file: any, fileList: any[]) => {
    attachmentList.value = fileList
    if (file.raw && file.raw.isParse === undefined) {
        file.raw.isParse = false
    }
}

const handleAttachmentRemove = (file: any, fileList: any[]) => {
    attachmentList.value = fileList
}

const handleRemoveFile = (file: any) => {
    const idx = attachmentList.value.indexOf(file)
    if (idx !== -1) {
        attachmentList.value.splice(idx, 1)
    }
}

const handleParse = async (val: boolean, file: any) => {
    if (val) {
        try {
            if (!file?.raw) {
                ElMessage.error('解析失败')
                file.raw.isParse = false
                return
            }
            const formData = new FormData()
            formData.append('file', file.raw)
            const res: any = await api.kbDocExtractApi(formData)
            const data = res?.data ?? res
            const text = data?.text ?? data?.data?.text ?? ''
            if (!text) {
                ElMessage.error('解析失败')
                file.raw.isParse = false
                return
            }
            form.content = text
            ElMessage.success('解析成功')
        } catch (e) {
            ElMessage.error('解析失败')
            file.raw.isParse = false
        }
    }
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      dialog.loading = true
      try {
        const payload = { ...form, user_id: userId.value }
        payload.attachments = attachmentList.value.map(f => ({
            file_name: f.name,
            file_type: f.name.split('.').pop(),
            file_size: f.size || 0,
            url: f.response?.url || f.url
        }))

        if (dialog.isEdit) {
          await api.kbArticleUpdateApi(payload)
        } else {
          await api.kbArticleCreateApi(payload)
        }
        ElMessage.success('保存成功')
        dialog.visible = false
        fetchList()
      } catch (e) {
        ElMessage.error('保存失败')
      } finally {
        dialog.loading = false
      }
    }
  })
}
</script>

<style scoped lang="scss">
.red { color: #f56c6c; }
</style>
