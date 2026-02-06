<template>
  <div class="annual-plan-goal-container">
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
          <span class="label">计划建设规模</span>
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
      <div class="table-title">重点落实任务</div>
      <el-table :data="tableData" border class="goal-table" style="width: 100%">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="task_type" label="任务类型" width="180" />
        <el-table-column prop="task_category" label="任务中类" width="200" />
        <el-table-column prop="build_content" label="建设内容" min-width="260" />
        <el-table-column prop="target_value" label="项目量化目标" width="160" />
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
  return '年度目标任务详情'
})
const regionText = computed(() => detail.city_name && detail.district_name ? `${detail.city_name}${detail.district_name}` : detail.city_name || '-')
const investmentText = computed(() => detail.investment_amount ? `${detail.investment_amount}万` : '-')
const projectCountText = computed(() => detail.project_count ? `${detail.project_count}个` : '-')
const planScaleText = computed(() => detail.project_count ? `${Number(detail.project_count) * 120}亩` : '-')

const getStatusType = (status: string) => ({ passed: 'success', special_audit: 'warning', failed: 'danger', wait_report: 'info', in_progress: '' }[status] || '')
const getStatusLabel = (status: string) => ({ passed: '已通过', special_audit: '特审候', failed: '不通过', wait_report: '待上报', in_progress: '进行中' }[status] || '未知')

const tableData = ref<any[]>([])
const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(1)

const loadDetail = async () => {
  const id = route.params.id as string
  if (!id) return
  const query = { model: 't_annual_plan_report', args: `id='${id}'` }
  const res = await publicStore.http({ Api: query })
  if (Array.isArray(res) && res.length > 0) Object.assign(detail, res[0])
}

const fetchGoals = async () => {
  const demoList = [
    { task_type: '城市更新示范区建设', task_category: '老旧小区改造', build_content: '完成5个小区外立面与屋面修缮', target_value: '5个' },
    { task_type: '社区服务设施完善', task_category: '养老托育', build_content: '新建社区养老服务站2处', target_value: '2处' },
    { task_type: '市政基础设施提升', task_category: '道路交通', build_content: '实施主干道微循环优化', target_value: '6条' },
    { task_type: '生态环境整治', task_category: '海绵城市', build_content: '完成雨污分流管网改造', target_value: '18公里' },
    { task_type: '公共空间提升', task_category: '公园绿地', build_content: '新增口袋公园及绿地', target_value: '12处' }
  ]
  total.value = demoList.length
  const start = (currentPage.value - 1) * pageSize.value
  tableData.value = demoList.slice(start, start + pageSize.value)
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchGoals()
}

const back = () => {
  proxy.toPath(`/annual-plan/${route.params.id}`)
}

onMounted(async () => {
  await loadDetail()
  await fetchGoals()
})
</script>

<style scoped lang="scss">
.annual-plan-goal-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}
.detail-header-card { border-radius: 8px; margin-bottom: 20px; }
.detail-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.detail-title { font-size: 20px; font-weight: 700; color: #303133; }
.detail-close { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #909399; background: #f5f7fa; }
.detail-summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px 24px; }
.summary-item { display: flex; align-items: center; justify-content: space-between; font-size: 14px; color: #606266; padding: 10px 12px; background: #fafafa; border-radius: 6px; }
.summary-item .label { color: #909399; }
.summary-item .value { color: #303133; font-weight: 600; }
.detail-info-card { border-radius: 8px; }
.info-title { font-size: 16px; font-weight: 700; color: #303133; margin-bottom: 12px; }
.table-title { font-size: 14px; font-weight: 700; color: #303133; margin-bottom: 12px; }
.goal-table { background: #fff; }
.pagination { display: flex; justify-content: center; margin-top: 16px; }
</style>
