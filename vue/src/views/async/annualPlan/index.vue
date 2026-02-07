<template>
  <div class="annual-plan-container">
    <el-container>
      <!-- Main Content (Left) -->
      <el-main class="main-content">
        <!-- Breadcrumb -->
        <div class="breadcrumb">
          <span class="home-icon"><i class="el-icon-s-home"></i> 城市更新</span>
          <span class="separator">/</span>
          <span class="current">实施与调度管理</span>
        </div>

        <!-- Filter Bar -->
        <el-card class="filter-card">
          <el-form :inline="true" :model="filters" class="filter-form">
            <el-form-item label="项目周期">
              <el-date-picker
                v-model="filters.period"
                type="date"
                placeholder="请选择日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
            <el-form-item label="所属地区">
              <el-select v-model="filters.city" placeholder="请选择市" style="width: 120px; margin-right: 10px;" @change="handleCityChange">
                <el-option label="太原市" value="太原市" />
                <el-option label="大同市" value="大同市" />
                <el-option label="阳泉市" value="阳泉市" />
                <el-option label="长治市" value="长治市" />
                <el-option label="晋城市" value="晋城市" />
                <el-option label="朔州市" value="朔州市" />
                <el-option label="晋中市" value="晋中市" />
                <el-option label="运城市" value="运城市" />
                <el-option label="忻州市" value="忻州市" />
                <el-option label="临汾市" value="临汾市" />
                <el-option label="吕梁市" value="吕梁市" />
              </el-select>
              <el-select v-model="filters.district" placeholder="请选择区/县" style="width: 120px;">
                <el-option v-for="item in districtOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
            <el-form-item label="项目阶段">
              <el-select v-model="filters.stage" placeholder="请选择">
                <el-option label="储备阶段" value="储备阶段" />
                <el-option label="实施阶段" value="实施阶段" />
              </el-select>
            </el-form-item>
            <el-form-item label="总投资金额">
              <el-select v-model="filters.investment" placeholder="请选择">
                <el-option label="5千万以上" value="gt5000" />
                <el-option label="5千万以下" value="lt5000" />
              </el-select>
            </el-form-item>
            <el-form-item label="项目类型">
              <el-select v-model="filters.type" placeholder="请选择" style="width: 180px;">
                <el-option label="加强既有建筑改造利用" value="加强既有建筑改造利用" />
                <el-option label="完善社区服务设施" value="完善社区服务设施" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-input v-model="filters.keyword" placeholder="请输入" style="width: 150px;" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="fetchData">搜索</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- List Section -->
        <div class="list-section">
          <div class="list-header">
            <h3 class="section-title">年度计划</h3>
            <div class="list-actions">
              <el-button>全选</el-button>
              <el-button type="primary">提醒</el-button>
            </div>
          </div>

          <el-row :gutter="20">
            <el-col :span="8" v-for="item in listData" :key="item.id" style="margin-bottom: 20px;">
              <el-card class="data-card" @click.stop="goDetail(item)">
                <template #header>
                  <div class="card-header">
                    <span class="city-name">{{ item.city_name }}</span>
                    <div class="header-right">
                      <el-tag :type="getStatusType(item.status)" effect="dark" size="small" class="status-tag">
                        {{ getStatusLabel(item.status) }}
                      </el-tag>
                      <el-checkbox v-model="item.checked" />
                    </div>
                  </div>
                </template>
                <div class="card-content">
                  <div class="info-row">
                    <span class="label">上报时间：</span>
                    <span class="value">{{ item.report_time || '-' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">计划年度：</span>
                    <span class="value">{{ item.plan_year }}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">年度投资估算：</span>
                    <span class="value">{{ item.investment_amount }}万元</span>
                  </div>
                  <div class="info-row">
                    <span class="label">包含项目数：</span>
                    <span class="value">{{ item.project_count }}个</span>
                  </div>
                  <div class="info-row">
                    <span class="label">上报单位：</span>
                    <span class="value">{{ item.report_unit || '-' }}</span>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>

          <!-- Pagination -->
          <div class="pagination-container">
            <el-pagination
              background
              layout="prev, pager, next"
              :total="total"
              :page-size="pageSize"
              :current-page="currentPage"
              @current-change="handlePageChange"
            />
          </div>
        </div>
      </el-main>

      <!-- Right Sidebar -->
      <el-aside width="400px" class="right-sidebar">
        <div class="sidebar-actions">
          <el-button type="primary" class="action-btn" @click.stop="goReport">年度计划上报</el-button>
          <el-button class="action-btn" @click.stop="goTrack">年度计划跟踪</el-button>
        </div>

        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">年度计划上报情况</div>
          </template>
          <div class="stats-summary">
            <div>共<span class="highlight">11</span>个地市</div>
            <div class="pie-chart-placeholder">
              <!-- Placeholder for Pie Chart -->
              <div class="pie-circle">
                <span class="percentage">60%</span>
              </div>
            </div>
            <div>
              <div>共<span class="highlight blue">160</span>个县</div>
              <div><span class="highlight blue">55</span>个县完成上报</div>
            </div>
          </div>
        </el-card>

        <el-card class="chart-card chart-card-tall">
          <template #header>
            <div class="chart-header">片区策划内容</div>
          </template>
          <div class="chart-legend">
            <span class="legend-item"><span class="dot pink"></span>项目数量</span>
            <span class="legend-item"><span class="dot cyan"></span>年度投资金额(万元)</span>
          </div>
          <div class="bar-chart-placeholder">
            <!-- Simple HTML/CSS Bar Chart Mockup -->
            <div class="bar-row" v-for="(item, index) in chartData" :key="index">
              <span class="bar-label">{{ item.name }}</span>
              <div class="bar-container">
                <div class="bar-group">
                  <div class="bar pink" :style="{ width: item.count * 2 + 'px' }"></div>
                  <span class="bar-value pink-text">{{ item.count }}</span>
                </div>
                <div class="bar-group">
                  <div class="bar cyan" :style="{ width: item.amount / 2 + 'px' }"></div>
                  <span class="bar-value cyan-text">{{ item.amount }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-aside>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, getCurrentInstance } from 'vue'

const { proxy } = getCurrentInstance() as any
const publicStore = proxy.publicStore()

// State
const filters = reactive({
  period: '',
  city: '',
  district: '',
  stage: '',
  investment: '',
  type: '',
  keyword: ''
})

const districtOptions = ref<string[]>([])
const listData = ref<any[]>([])
const total = ref(0)
const pageSize = ref(9)
const currentPage = ref(1)

const chartData = ref([
  { name: '太原六城区', count: 13, amount: 203 },
  { name: '古交市', count: 10, amount: 219 },
  { name: '娄烦县', count: 23, amount: 225 },
  { name: '阳曲县', count: 14, amount: 167 },
  { name: '清徐县', count: 15, amount: 143 },
])

// Methods
const handleCityChange = (val: string) => {
  // Mock district data based on city
  if (val === '太原市') districtOptions.value = ['小店区', '迎泽区', '杏花岭区', '尖草坪区', '万柏林区', '晋源区', '古交市', '清徐县', '阳曲县', '娄烦县']
  else if (val === '大同市') districtOptions.value = ['平城区', '云冈区', '新荣区', '云州区', '阳高县', '天镇县']
  else districtOptions.value = [] // Simplified for demo
  filters.district = ''
}

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    'passed': 'success',
    'special_audit': 'warning',
    'failed': 'danger',
    'wait_report': 'info',
    'in_progress': ''
  }
  return map[status] || ''
}

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    'passed': '已通过',
    'special_audit': '特审候',
    'failed': '不通过',
    'wait_report': '待上报',
    'in_progress': '进行中'
  }
  return map[status] || status
}

const fetchData = async () => {
  let whereClause = "1=1"
  
  if (filters.period) whereClause += ` AND report_time = '${filters.period}'`
  if (filters.city) whereClause += ` AND city_name = '${filters.city}'`
  if (filters.district) whereClause += ` AND district_name = '${filters.district}'`
  if (filters.stage) whereClause += ` AND project_stage = '${filters.stage}'`
  if (filters.type) whereClause += ` AND project_type = '${filters.type}'`
  if (filters.keyword) whereClause += ` AND (city_name LIKE '%${filters.keyword}%' OR report_unit LIKE '%${filters.keyword}%')`
  
  if (filters.investment === 'gt5000') whereClause += ` AND investment_amount >= 5000`
  if (filters.investment === 'lt5000') whereClause += ` AND investment_amount < 5000`

  try {
    const res = await publicStore.http({
      Api: {
        model: 't_annual_plan_report',
        args: whereClause,
        order: 'report_time desc',
        page: currentPage.value,
        limit: pageSize.value
      }
    })
    
    // Check if response structure matches expectation (adjust based on actual API)
    if (res && res.list) {
       listData.value = res.list.map((item: any) => ({ ...item, checked: false }))
       total.value = res.total || 50 // Fallback if total not returned
    } else {
       // Fallback for direct array return or different structure
       listData.value = Array.isArray(res) ? res : []
    }
  } catch (error) {
    console.error('Failed to fetch data:', error)
  }
}

const goDetail = (item: any) => {
  if (!item || !item.id) return
  proxy.toPath(`/annual-plan/${item.id}`)
}

const goTrack = () => {
  proxy.toPath('/annual-plan/track')
}

const goReport = () => {
  proxy.toPath('/annual-plan/report')
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped lang="scss">
.annual-plan-container {
  font-size: 30px;
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
  height: 100vh;
  overflow: auto;
}

.breadcrumb {
  margin-bottom: 20px;
  font-size: 14px;
  color: #606266;
  .home-icon { margin-right: 5px; }
  .separator { margin: 0 8px; }
  .current { color: #409EFF; font-weight: bold; }
}

.filter-card {
  margin-bottom: 20px;
  .filter-form {
    .el-form-item { margin-bottom: 0; }
    :deep(.el-select__selected-item) { color: #303133; }
    :deep(.el-select__input) { color: #303133; }
    :deep(.el-input__inner) { color: #303133; }
  }
}

.list-section {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  .section-title {
    font-size: 18px;
    font-weight: bold;
    margin: 0;
  }
}

.data-card {
  height: 100%;
  cursor: pointer;
  :deep(.el-card__header) {
    padding: 10px 15px;
    border-bottom: 1px solid #EBEEF5;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .city-name {
      font-weight: bold;
      font-size: 16px;
    }
    .header-right {
      display: flex;
      align-items: center;
      gap: 10px;
    }
  }
  
  .card-content {
    font-size: 13px;
    color: #606266;
    .info-row {
      display: flex;
      margin-bottom: 8px;
      &:last-child { margin-bottom: 0; }
      .label { width: 100px; color: #909399; }
      .value { flex: 1; text-align: right; color: #303133; }
    }
  }
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.main-content {
  min-width: 0;
}

.right-sidebar {
  padding-left: 20px;
  .sidebar-actions {
    margin-top: 65px;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 16px;
  }
  .action-btn {
    width: 100%;
    aspect-ratio: 1 / 1;
    height: 128px;
    margin: 0;
    font-size: 28px;
    font-weight: 600;
    line-height: 1.2;
    padding: 8px;
    border-radius: 10px;
  }
  .action-btn:first-child {
    background-color: #3366FF;
    border-color: #3366FF;
  }
}

.chart-card {
  margin-bottom: 20px;
  .chart-header { font-weight: bold; font-size: 18px; }
}

.chart-card-tall {
  min-height: 420px;
}

.stats-summary {
  display: flex;
  justify-content: space-around;
  align-items: center;
  text-align: center;
  font-size: 14px;
  
  .highlight {
    font-size: 20px;
    font-weight: bold;
    color: #3366FF;
    margin: 0 4px;
    
    &.blue { color: #3366FF; }
  }
  
  .pie-chart-placeholder {
    width: 80px;
    height: 80px;
    position: relative;
    
    .pie-circle {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: conic-gradient(#3366FF 0% 60%, #E6EBF5 60% 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      
      &::before {
        content: '';
        width: 60%;
        height: 60%;
        background: #fff;
        border-radius: 50%;
        position: absolute;
      }
      
      .percentage {
        position: relative;
        z-index: 1;
        font-weight: bold;
        color: #3366FF;
      }
    }
  }
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 15px;
  font-size: 14px;
  
  .legend-item {
    display: flex;
    align-items: center;
    .dot {
      width: 10px;
      height: 10px;
      border-radius: 2px;
      margin-right: 5px;
      &.pink { background-color: #F56C6C; }
      &.cyan { background-color: #409EFF; }
    }
  }
}

.bar-chart-placeholder {
  .bar-row {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    
    .bar-label {
      width: 80px;
      font-size: 14px;
      text-align: right;
      margin-right: 10px;
    }
    
    .bar-container {
      flex: 1;
      
      .bar-group {
        display: flex;
        align-items: center;
        margin-bottom: 4px;
        
        .bar {
          height: 10px;
          border-radius: 0 4px 4px 0;
          &.pink { background-color: #F56C6C; }
          &.cyan { background-color: #409EFF; }
        }
        
        .bar-value {
          margin-left: 5px;
          font-size: 14px;
          transform: scale(0.8);
          transform-origin: left;
          &.pink-text { color: #F56C6C; }
          &.cyan-text { color: #409EFF; }
        }
      }
    }
  }
}
</style>
