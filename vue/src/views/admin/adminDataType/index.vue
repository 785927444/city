<template>
  <div class="layout-row">
    <!-- Left Sidebar: Classification -->
    <div class="w300 hh100 bg-white rad8 flex-col bo-r1">
      <div class="h50 flex-cc bo-b1 f16 b">
        基础数据管理
      </div>
      <div class="flex1 scroll-y p10">
        <el-tree
          ref="treeRef"
          :data="treeData"
          :props="defaultProps"
          node-key="id"
          highlight-current
          @node-click="handleNodeClick"
        >
          <template #default="{ node, data }">
            <span class="custom-tree-node">
              <span v-if="data.children && data.children.length > 0">📂</span>
              <span v-else>📄</span>
              <span class="ml5">{{ node.label }}</span>
            </span>
          </template>
        </el-tree>
      </div>
    </div>

    <!-- Right Content: Table -->
    <div class="flex1 hh100 bg-white rad8 ml15 flex-col p20">
      <!-- Header: Search & Add -->
      <div class="flex-sc mb20">
        <div class="flex-sc flex1">
          <el-input
            v-model="searchQuery"
            placeholder="请输入"
            style="width: 300px"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          />
          <el-button type="primary" class="ml10" @click="handleSearch">搜索</el-button>
        </div>
        <div>
          <el-button type="primary" @click="handleAdd">新增</el-button>
        </div>
      </div>

      <!-- Table -->
      <el-table
        :data="tableData"
        style="width: 100%"
        class="flex1"
        height="100%"
        stripe
        border
      >
        <el-table-column type="index" label="序号" width="80" align="center" />
        <el-table-column prop="indicator_item" label="问题指标项" min-width="200" show-overflow-tooltip />
        <el-table-column prop="unit" label="量化单位" width="150" align="center" />
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="handleEnable(scope.row)">启用</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="flex-ec mt20">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    
    <!-- Add Dialog -->
    <el-dialog v-model="addDialogVisible" title="新增任务问题" width="500px">
      <el-form :model="addForm" label-width="100px">
        <el-form-item label="任务问题" required>
          <el-select 
            v-model="addForm.task_problem_id" 
            placeholder="请选择任务问题" 
            filterable 
            style="width: 100%"
          >
            <el-option
              v-for="item in taskProblems"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmAdd" :loading="addLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, getCurrentInstance, nextTick } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/api'

const { proxy }: any = getCurrentInstance()
const publicStore = proxy.publicStore()

// State
const treeData = ref<any[]>([])
const tableData = ref<any[]>([])
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const currentClassId = ref('') // Currently selected task class ID (t_task_type.id)

// Add Dialog State
const addDialogVisible = ref(false)
const addLoading = ref(false)
const taskProblems = ref<any[]>([]) // List from t_task_problem
const addForm = reactive({
  task_problem_id: ''
})

const defaultProps = {
  children: 'children',
  label: 'name',
}

// Fetch Tree Data
const getTreeData = async () => {
  // Query t_task_type to build the tree
  // Hierarchy: Root -> Task Type (Level 2) -> Task Class (Level 3)
  // We want to display Level 2 as roots, and Level 3 as children.
  
  let query = { model: 't_task_type', order: 'orderd ASC' }
  try {
    const res = await publicStore.http({ Api: query })
    if (proxy.isNull(res)) return

    const allTypes = res
    
    // 1. Find actual DB roots (Level 1) - parent_id = '0'
    const dbRoots = allTypes.filter((item: any) => item.parent_id === '0')
    const dbRootIds = dbRoots.map((item: any) => item.id)

    // 2. Find Level 2 (Task Types) - parent_id in dbRoots
    const level2 = allTypes.filter((item: any) => dbRootIds.includes(item.parent_id))
    
    // 3. Find Level 3 (Task Classes) - parent_id in Level 2
    const level2Ids = level2.map((item: any) => item.id)
    const level3 = allTypes.filter((item: any) => level2Ids.includes(item.parent_id))

    // Build tree structure: Level 2 -> Level 3
    const tree = level2.map((type: any) => {
      const children = level3.filter((cls: any) => cls.parent_id === type.id)
      return {
        ...type,
        children: children.length > 0 ? children : null
      }
    })
    
    treeData.value = tree
  } catch (error) {
    console.error('Failed to fetch tree data', error)
  }
}

// Fetch Table Data
const getTableData = async () => {
  if (!currentClassId.value) {
    tableData.value = []
    total.value = 0
    return
  }

  // 1. Query t_task_type_scheme_problem to get relations
  let args = `task_type_id='${currentClassId.value}'`
  
  let queryRelation = { 
    model: 't_task_type_scheme_problem', 
    args: args, 
    limit: pageSize.value, 
    page: currentPage.value
  }
  
  // Count query
  let queryCount = {
    model: 't_task_type_scheme_problem',
    args: args,
    field: 'COUNT(*)'
  }

  try {
    const res = await publicStore.http({ Api1: queryRelation, Api2: queryCount })
    // Check if res is array or object based on publicStore implementation
    // If multiple APIs, it usually returns { Api1: ..., Api2: ... }
    // If single API, it returns the result directly.
    // Here we use Api1 and Api2 keys.
    
    const relations = res.Api1 && !proxy.isNull(res.Api1) ? res.Api1 : []
    const totalCount = res.Api2 && !proxy.isNull(res.Api2) && res.Api2.length > 0 ? res.Api2[0]['COUNT(*)'] : 0
    
    total.value = totalCount
    
    if (relations.length === 0) {
      tableData.value = []
      return
    }

    // 2. Fetch scheme problem details
    const schemeIds = relations.map((r: any) => r.scheme_problem_id).filter((id: string) => id)
    if (schemeIds.length === 0) {
       tableData.value = []
       return
    }
    
    const idsStr = schemeIds.map((id: string) => `'${id}'`).join(',')
    let queryScheme = {
      model: 't_scheme_problem',
      args: `id IN (${idsStr})`
    }
    
    const schemeRes = await publicStore.http({ Api: queryScheme })
    const schemes = proxy.isNull(schemeRes) ? [] : schemeRes
    
    // Merge data
    tableData.value = relations.map((rel: any) => {
      const scheme = schemes.find((s: any) => s.id === rel.scheme_problem_id)
      return {
        ...rel,
        indicator_item: scheme ? scheme.indicator_item : '',
        unit: scheme ? scheme.unit : ''
      }
    })
    
  } catch (error) {
    console.error('Failed to fetch table data', error)
    tableData.value = []
  }
}

// Fetch Task Problems for Dropdown
const getTaskProblems = async () => {
    let query = { model: 't_task_problem' }
    try {
        const res = await publicStore.http({ Api: query })
        taskProblems.value = proxy.isNull(res) ? [] : res
    } catch (error) {
        console.error('Failed to fetch task problems', error)
    }
}

// Event Handlers
const handleNodeClick = (data: any) => {
  const isRoot = treeData.value.some(node => node.id === data.id)
  
  if (isRoot) {
    currentClassId.value = ''
    tableData.value = []
    total.value = 0
  } else {
    currentClassId.value = data.id
    currentPage.value = 1
    getTableData()
  }
}

const handleSearch = () => {
  currentPage.value = 1
  getTableData()
}

const handleAdd = async () => {
    if (!currentClassId.value) {
      ElMessage.warning('请先选择左侧的分类（二级分类）')
      return
    }
    // Load options if empty
    if (taskProblems.value.length === 0) {
        await getTaskProblems()
    }
    addForm.task_problem_id = ''
    addDialogVisible.value = true
  }

const confirmAdd = async () => {
  if (!addForm.task_problem_id) {
    ElMessage.warning('请选择任务问题')
    return
  }

  addLoading.value = true

  try {
    // 1) Fetch scheme problems by parent_id = task_problem_id
    const queryScheme = {
      model: 't_scheme_problem',
      args: `parent_id='${addForm.task_problem_id}'`
    }

    const schemeRes = await publicStore.http({ Api: queryScheme })
    const schemeProblems = proxy.isNull(schemeRes) ? [] : schemeRes

    if (!Array.isArray(schemeProblems) || schemeProblems.length === 0) {
      ElMessage.warning('该任务问题下没有对应的指标项')
      return
    }

    // 2) Build rows to insert
    const rowsAll = schemeProblems
      .filter((sp: any) => sp && sp.id)
      .map((sp: any) => ({
        id: uuidv4(),
        task_type_id: currentClassId.value,
        scheme_problem_id: sp.id,
        task_problem_id: addForm.task_problem_id
      }))

    if (rowsAll.length === 0) {
      ElMessage.warning('未找到可插入的指标项（缺少 scheme_problem_id）')
      return
    }

    // 3) De-duplicate: remove rows that already exist in t_task_type_scheme_problem
    const spIdsSql = rowsAll.map(r => `'${r.scheme_problem_id}'`).join(',')
    const existsArgs = `task_type_id='${currentClassId.value}' and task_problem_id='${addForm.task_problem_id}' and scheme_problem_id in (${spIdsSql})`

    const existsRes = await publicStore.http({
      Api: {
        model: 't_task_type_scheme_problem',
        args: existsArgs
      }
    })
    const existsRows = proxy.isNull(existsRes) ? [] : existsRes
    const existsSet = new Set((Array.isArray(existsRows) ? existsRows : []).map((x: any) => x.scheme_problem_id))

    const rows = rowsAll.filter(r => !existsSet.has(r.scheme_problem_id))

    if (rows.length === 0) {
      ElMessage.success('已存在，无需重复添加')
      addDialogVisible.value = false
      getTableData()
      return
    }

    await api.addApi({ model: 't_task_type_scheme_problem', list: rows })

    ElMessage.success('添加成功')
    addDialogVisible.value = false
    await nextTick()
    getTableData()
  } catch (error) {
    console.error('confirmAdd failed', error)
    ElMessage.error('添加失败')
  } finally {
    addLoading.value = false
  }
}

const handleEnable = (row: any) => {
  
}

const handleDelete = async (row: any) => {
  try {
      await ElMessageBox.confirm('确认删除?', '提示', { type: 'warning' })
      // Use delApi for deletion, args to specify condition
      await publicStore.http({
          delApi: {
              model: 't_task_type_scheme_problem',
              args: `id='${row.id}'`
          }
      })
      ElMessage.success('删除成功')
      getTableData()
  } catch (error) {
      
  }
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  getTableData()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  getTableData()
}

onMounted(() => {
  getTreeData()
})

</script>

<style scoped lang="scss">
.layout-row {
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100%;
  padding: 15px;
  box-sizing: border-box;
  background-color: #f0f2f5; // Assuming a light gray background for the page
}

.bo-r1 {
  border-right: 1px solid #e4e7ed;
}

.bo-b1 {
  border-bottom: 1px solid #e4e7ed;
}

.bg-white {
  background-color: #fff;
}

.rad8 {
  border-radius: 8px;
}

.p10 {
  padding: 10px;
}

.p20 {
  padding: 20px;
}

.mb20 {
  margin-bottom: 20px;
}

.ml10 {
  margin-left: 10px;
}

.ml15 {
  margin-left: 15px;
}

.mt20 {
  margin-top: 20px;
}

.flex-sc {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.flex-cc {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-ec {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.flex-col {
  display: flex;
  flex-direction: column;
}

.flex1 {
  flex: 1;
  overflow: hidden; // Important for scrolling inside flex items
}

.hh100 {
  height: 100%;
}

.w300 {
  width: 300px;
}

.h50 {
  height: 50px;
}

.f16 {
  font-size: 16px;
}

.b {
  font-weight: bold;
}

.scroll-y {
  overflow-y: auto;
}
</style>
