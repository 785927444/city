<template>
  <div class="annual-plan-detail-container">
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
          <span class="label">计划总投资</span>
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
      <div class="info-actions">
        <div class="info-action" @click.stop="toProjects">
          <div class="action-icon icon-orange">
            <i class="el-icon-s-operation"></i>
          </div>
          <div class="action-text">项目库</div>
        </div>
        <div class="info-action" @click.stop="toGoals">
          <div class="action-icon icon-blue">
            <i class="el-icon-s-grid"></i>
          </div>
          <div class="action-text">年度目标</div>
        </div>
        <div class="info-action" @click.stop="toAttachments">
          <div class="action-icon icon-purple">
            <i class="el-icon-document"></i>
          </div>
          <div class="action-text">计划附件</div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted, getCurrentInstance } from 'vue'
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

const investmentText = computed(() => {
  if (!detail.investment_amount) return '-'
  return `${detail.investment_amount}万`
})

const projectCountText = computed(() => {
  if (!detail.project_count) return '-'
  return `${detail.project_count}个`
})

const planScaleText = computed(() => {
  if (!detail.project_count) return '-'
  return `${Number(detail.project_count) * 120}亩`
})

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

const loadDetail = async () => {
  const id = route.params.id as string
  if (!id) return
  const query = { model: 't_annual_plan_report', args: `id='${id}'` }
  const res = await publicStore.http({ Api: query })
  if (Array.isArray(res) && res.length > 0) {
    Object.assign(detail, res[0])
    return
  }
  Object.assign(detail, {
    id,
    city_name: '太原市',
    district_name: '小店区',
    status: 'in_progress',
    report_time: '2026-01-20',
    plan_year: '2026',
    investment_amount: '38000',
    project_count: '8',
    report_unit: '太原市城市更新中心'
  })
}

const back = () => {
  proxy.toPath('/annual-plan')
}

const toProjects = () => {
  proxy.toPath(`/annual-plan/${detail.id}/projects`)
}

const toAttachments = () => {
  proxy.toPath(`/annual-plan/${detail.id}/attachments`)
}

const toGoals = () => {
  proxy.toPath(`/annual-plan/${detail.id}/goals`)
}

onMounted(() => {
  loadDetail()
})
</script>

<style scoped lang="scss">
.annual-plan-detail-container {
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
  min-height: 420px;
}

.info-title {
  font-size: 16px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 16px;
}

.info-actions {
  display: flex;
  gap: 30px;
}

.info-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.action-icon {
  width: 66px;
  height: 66px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 28px;
}

.icon-orange { background: linear-gradient(135deg, #f6a36f, #f0855d); }
.icon-blue { background: linear-gradient(135deg, #4c7dff, #2d5bff); }
.icon-purple { background: linear-gradient(135deg, #8b7cff, #6a4dff); }

.action-text {
  font-size: 14px;
  color: #303133;
  font-weight: 600;
}
</style>
