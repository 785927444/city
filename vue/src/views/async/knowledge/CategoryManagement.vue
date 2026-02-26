<template>
  <div class="layout-col">
    <aa-title title="分类管理">
      <template #right-content>
        <div class="flex-sc">
          <div class="rad4 ptb5 plr8 flex-cc cursor bgi1 white ml10" @click="handleAddColumn">新增专栏</div>
          <div class="rad4 ptb5 plr8 flex-cc cursor bg-white c8 bo-cc-1 ml10" @click="handleBack">返回</div>
        </div>
      </template>
    </aa-title>

    <div class="p15 bg-white m15 rad8 flex1 table-col overflow-auto">
      <div class="column-list">
        <el-collapse v-model="activeNames">
          <el-collapse-item v-for="col in columns" :key="col.code" :name="col.code">
            <template #title>
              <div class="flex-bc ww100 pr15">
                <div class="flex-sc">
                  <span class="fb f16">{{ col.name }}</span>
                  <span class="c9 ml10 f12">({{ col.code }})</span>
                </div>
                <div class="flex-sc">
                  <el-button link type="primary" @click.stop="handleEditColumn(col)">编辑</el-button>
                  <el-button link type="danger" @click.stop="handleDeleteColumn(col)">删除</el-button>
                  <el-button link type="success" @click.stop="handleAddCategory(col)">新增二级分类</el-button>
                </div>
              </div>
            </template>

            <div class="category-list pl30">
              <el-table :data="col.children || []" style="width: 100%">
                <el-table-column prop="name" label="二级分类名称" />
                <el-table-column label="操作" width="150" fixed="right">
                  <template #default="{ row }">
                    <el-button link type="primary" @click="handleEditCategory(row, col)">编辑</el-button>
                    <el-button link type="danger" @click="handleDeleteCategory(row, col)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>

    <!-- 专栏弹窗 -->
    <el-dialog
      v-model="columnDialog.visible"
      :title="columnDialog.isEdit ? '编辑专栏' : '新增专栏'"
      width="500px"
    >
      <el-form :model="columnForm" ref="columnFormRef" :rules="columnRules" label-width="100px">
        <el-form-item label="专栏代码" prop="code">
          <el-input v-model="columnForm.code" :disabled="columnDialog.isEdit" placeholder="请输入唯一代码" />
        </el-form-item>
        <el-form-item label="专栏名称" prop="name">
          <el-input v-model="columnForm.name" placeholder="请输入专栏名称" />
        </el-form-item>
        <el-form-item label="排序号" prop="sort_no">
          <el-input-number v-model="columnForm.sort_no" :min="0" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input type="textarea" v-model="columnForm.description" placeholder="请输入描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="columnDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitColumn" :loading="columnDialog.loading">确定</el-button>
      </template>
    </el-dialog>

    <!-- 二级分类弹窗 -->
    <el-dialog
      v-model="categoryDialog.visible"
      :title="categoryDialog.isEdit ? '编辑二级分类' : '新增二级分类'"
      width="500px"
    >
      <el-form :model="categoryForm" ref="categoryFormRef" :rules="categoryRules" label-width="100px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="排序号" prop="sort_no">
          <el-input-number v-model="categoryForm.sort_no" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="categoryDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitCategory" :loading="categoryDialog.loading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const activeNames = ref<string[]>([])
const columns = ref<any[]>([])

const columnDialog = reactive({
  visible: false,
  isEdit: false,
  loading: false
})

const columnForm = reactive({
  code: '',
  name: '',
  description: '',
  sort_no: 0
})

const columnRules = {
  code: [{ required: true, message: '请输入专栏代码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入专栏名称', trigger: 'blur' }]
}

const categoryDialog = reactive({
  visible: false,
  isEdit: false,
  loading: false,
  currentColumn: null as any
})

const categoryForm = reactive({
  id: '',
  column_code: '',
  name: '',
  sort_no: 0
})

const categoryRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
}

onMounted(() => {
  fetchColumns()
})

const fetchColumns = async () => {
  try {
    const res: any = await api.kbColumnsApi({})
    if (res?.data?.columns) {
      columns.value = res.data.columns
      if (activeNames.value.length === 0 && columns.value.length > 0) {
        activeNames.value = [columns.value[0].code]
      }
    }
  } catch (e) {
    ElMessage.error('获取专栏列表失败')
  }
}

const handleBack = () => {
  router.back()
}

// 专栏操作
const handleAddColumn = () => {
  columnDialog.isEdit = false
  columnDialog.visible = true
  Object.assign(columnForm, { code: '', name: '', description: '', sort_no: 0 })
}

const handleEditColumn = (col: any) => {
  columnDialog.isEdit = true
  columnDialog.visible = true
  Object.assign(columnForm, {
    code: col.code,
    name: col.name,
    description: col.desc || '',
    sort_no: col.sort_no || 0
  })
}

const handleDeleteColumn = (col: any) => {
  ElMessageBox.confirm(`确定删除专栏 "${col.name}" 吗？删除专栏将同时删除其下的所有二级分类。`, '警告', {
    type: 'warning'
  }).then(async () => {
    try {
      const res: any = await api.kbColumnDeleteApi({ code: col.code })
      if (res.code === 200) {
        ElMessage.success('删除成功')
        fetchColumns()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (e) {
      ElMessage.error('删除失败')
    }
  })
}

const submitColumn = async () => {
  try {
    columnDialog.loading = true
    if (columnDialog.isEdit) {
      await api.kbColumnUpdateApi(columnForm)
    } else {
      await api.kbColumnAddApi(columnForm)
    }
    ElMessage.success('保存成功')
    columnDialog.visible = false
    fetchColumns()
  } catch (e) {
    ElMessage.error('保存失败')
  } finally {
    columnDialog.loading = false
  }
}

// 二级分类操作
const handleAddCategory = (col: any) => {
  categoryDialog.isEdit = false
  categoryDialog.visible = true
  categoryDialog.currentColumn = col
  Object.assign(categoryForm, { id: '', column_code: col.code, name: '', sort_no: 0 })
}

const handleEditCategory = (cat: any, col: any) => {
  categoryDialog.isEdit = true
  categoryDialog.visible = true
  categoryDialog.currentColumn = col
  Object.assign(categoryForm, {
    id: cat.id,
    column_code: col.code,
    name: cat.name,
    sort_no: cat.sort_no || 0
  })
}

const handleDeleteCategory = (cat: any, col: any) => {
  ElMessageBox.confirm(`确定删除二级分类 "${cat.name}" 吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      const res: any = await api.kbCategoryDeleteApi({ id: cat.id })
      if (res.code === 200) {
        ElMessage.success('删除成功')
        fetchColumns()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (e) {
      ElMessage.error('删除失败')
    }
  })
}

const submitCategory = async () => {
  try {
    categoryDialog.loading = true
    if (categoryDialog.isEdit) {
      await api.kbCategoryUpdateApi(categoryForm)
    } else {
      await api.kbCategoryAddApi(categoryForm)
    }
    ElMessage.success('保存成功')
    categoryDialog.visible = false
    fetchColumns()
  } catch (e) {
    ElMessage.error('保存失败')
  } finally {
    categoryDialog.loading = false
  }
}
</script>

<style scoped lang="scss">
.column-list {
  :deep(.el-collapse-item__header) {
    height: 60px;
    line-height: 60px;
  }
}
.category-list {
  padding-bottom: 15px;
}
</style>
