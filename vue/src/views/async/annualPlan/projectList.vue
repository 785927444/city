<template>
  <div class="annual-plan-projects-container">
    <el-card class="detail-header-card">
      <div class="detail-header">
        <div class="detail-title">{{ title }}</div>
        <div class="detail-close" @click.stop="back">
          <i-ep-close />
        </div>
      </div>
      <div class="detail-summary">
        <div class="summary-item">
          <span class="label">所属地区</span>
          <span class="value">{{ regionText }}</span>
        </div>
        <div class="summary-item">
          <span class="label">计划总预算</span>
          <span class="value">{{ investmentText }}</span>
        </div>
        <div class="summary-item">
          <span class="label">计划状态</span>
          <span class="value">
            <el-tag :type="getStatusType(detail.status)" effect="dark" size="small">
              {{ getStatusLabel(detail.status) }}
            </el-tag>
          </span>
        </div>
        <div class="summary-item">
          <span class="label">包含项目</span>
          <span class="value">{{ projectCountText }}</span>
        </div>
        <div class="summary-item">
          <span class="label">建设规模</span>
          <span class="value">{{ planScaleText }}</span>
        </div>
        <div class="summary-item">
          <span class="label">上报单位</span>
          <span class="value">{{ detail.report_unit || '-' }}</span>
        </div>
      </div>
    </el-card>

    <el-card class="detail-info-card">
      <div class="info-title">详细信息</div>
      <div class="filter-bar">
        <el-form :inline="true" :model="filters">
          <el-form-item label="任务类型">
            <el-select v-model="filters.taskType" placeholder="请选择" style="width: 180px">
              <el-option label="既有建筑改造利用" value="既有建筑改造利用" />
              <el-option label="完善社区服务设施" value="完善社区服务设施" />
            </el-select>
          </el-form-item>
          <el-form-item label="项目名称">
            <el-input v-model="filters.name" placeholder="请输入" style="width: 200px" />
          </el-form-item>
          <el-form-item label="项目状态">
            <el-select v-model="filters.status" placeholder="请选择" style="width: 160px">
              <el-option label="未开始" value="未开始" />
              <el-option label="进行中" value="进行中" />
              <el-option label="已完成" value="已完成" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="fetchProjects">搜索</el-button>
            <el-button @click="resetFilters">重置</el-button>
            <el-button @click="back">返回</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table :data="tableData" border class="project-table" style="width: 100%">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="project_name" label="项目名称" min-width="180" />
        <el-table-column prop="city_name" label="地区" width="120" />
        <el-table-column prop="district_name" label="所属片区" width="140" />
        <el-table-column prop="project_type" label="项目类型" width="160" />
        <el-table-column prop="project_status" label="项目状态" width="120" />
        <el-table-column prop="construction_type" label="建设性质" width="120" />
        <el-table-column prop="investment_amount" label="投资估算(万元)" width="140" />
        <el-table-column prop="construction_period" label="建设周期" width="120" />
        <el-table-column prop="construction_scale" label="建设规模" width="120" />
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-link type="primary" @click="viewProject(scope.row)">查看</el-link>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="total"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted, getCurrentInstance } from 'vue'
import { useRoute } from 'vue-router'

const { proxy } = getCurrentInstance() as any
const publicStore = proxy.publicStore()
const route = useRoute()

const detail = reactive({
  id: '',
  city_name: '',
  district_name: '',
  status: '',
  report_time: '',
  plan_year: '',
  investment_amount: '',
  project_count: '',
  report_unit: ''
})

const title = computed(() => {
  if (detail.plan_year && detail.city_name) return `${detail.plan_year}年${detail.city_name}年度计划`
  if (detail.city_name) return `${detail.city_name}年度计划`
  return '年度计划详情'
})

const regionText = computed(() => {
  if (detail.city_name && detail.district_name) return `${detail.city_name}${detail.district_name}`
  if (detail.city_name) return detail.city_name
  return '-'
})
const investmentText = computed(() => detail.investment_amount ? `${detail.investment_amount}万` : '-')
const projectCountText = computed(() => detail.project_count ? `${detail.project_count}个` : '-')
const planScaleText = computed(() => detail.project_count ? `${Number(detail.project_count) * 120}亩` : '-')

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    passed: 'success',
    special_audit: 'warning',
    failed: 'danger',
    wait_report: 'info',
    in_progress: ''
  }
  return map[status] || ''
}
const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    passed: '已通过',
    special_audit: '特审候',
    failed: '不通过',
    wait_report: '待上报',
    in_progress: '进行中'
  }
  return map[status] || '未知'
}

const filters = reactive({
  taskType: '',
  name: '',
  status: ''
})
const tableData = ref<any[]>([])
const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(1)

const loadDetail = async () => {
  const id = route.params.id as string
  if (!id) return
  const query = { model: 't_annual_plan_report', args: `id='${id}'` }
  const res = await publicStore.http({ Api: query })
  if (Array.isArray(res) && res.length > 0) {
    Object.assign(detail, res[0])
  }
}

const fetchProjects = async () => {
  const id = route.params.id as string
  let where = `plan_id='${id}'`
  if (filters.taskType) where += ` AND project_type='${filters.taskType}'`
  if (filters.name) where += ` AND project_name LIKE '%${filters.name}%'`
  if (filters.status) where += ` AND project_status='${filters.status}'`
  const res = await publicStore.http({
    Api: {
      model: 't_annual_plan_project',
      args: where,
      order: 'id asc',
      page: currentPage.value,
      limit: pageSize.value
    }
  })
  if (res && res.list) {
    tableData.value = res.list
    total.value = res.total || 0
  } else if (Array.isArray(res)) {
    tableData.value = res
    total.value = res.length
  } else {
    tableData.value = []
    total.value = 0
  }
}

const resetFilters = () => {
  filters.taskType = ''
  filters.name = ''
  filters.status = ''
  currentPage.value = 1
  fetchProjects()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchProjects()
}

const back = () => {
  proxy.toPath(`/annual-plan/${route.params.id}`)
}

onMounted(async () => {
  await loadDetail()
  await fetchProjects()
})
</script>

<style scoped lang="scss">
.annual-plan-projects-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.detail-header-card {
  border-radius: 8px;
  margin-bottom: 20px;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.detail-title {
  font-size: 20px;
  font-weight: 700;
  color: #303133;
}

.detail-close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #909399;
  background: #f5f7fa;
}

.detail-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px 24px;
}

.summary-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  color: #606266;
  padding: 10px 12px;
  background: #fafafa;
  border-radius: 6px;
  .label {
    color: #909399;
  }
  .value {
    color: #303133;
    font-weight: 600;
  }
}

.detail-info-card {
  border-radius: 8px;
}

.info-title {
  font-size: 16px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 16px;
}

.filter-bar {
  margin-bottom: 16px;
}

.project-table {
  background: #fff;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}
</style>
