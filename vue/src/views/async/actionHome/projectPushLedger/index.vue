<template>
  <div class="ledger-container">
    <div class="header-row">
      <div class="breadcrumb">首页 / 项目台账</div>
      <el-button size="small" @click="router.back()">返回</el-button>
    </div>

    <el-card class="filter-card">
      <el-form :inline="true" :model="filters" class="filter-form">
        <el-form-item label="项目周期">
          <el-date-picker
            v-model="filters.period"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="所属地区">
          <el-select v-model="filters.city" placeholder="请选择" style="width: 140px" clearable>
            <el-option label="太原市" value="太原市" />
            <el-option label="大同市" value="大同市" />
            <el-option label="晋中市" value="晋中市" />
          </el-select>
          <el-select v-model="filters.district" placeholder="请选择" style="width: 140px; margin-left: 10px" clearable>
            <el-option label="小店区" value="小店区" />
            <el-option label="迎泽区" value="迎泽区" />
            <el-option label="杏花岭区" value="杏花岭区" />
            <el-option label="清徐县" value="清徐县" />
          </el-select>
        </el-form-item>
        <el-form-item label="项目阶段">
          <el-select v-model="filters.stage" placeholder="请选择" style="width: 140px" clearable>
            <el-option label="储备阶段" value="储备阶段" />
            <el-option label="实施阶段" value="实施阶段" />
            <el-option label="完工阶段" value="完工阶段" />
          </el-select>
        </el-form-item>
        <el-form-item label="项目类型">
          <el-select v-model="filters.type" placeholder="请选择" style="width: 200px" clearable>
            <el-option label="加强既有建筑改造" value="加强既有建筑改造" />
            <el-option label="完善社区服务设施" value="完善社区服务设施" />
            <el-option label="改善人居环境" value="改善人居环境" />
          </el-select>
        </el-form-item>
        <el-form-item label="总投资金额">
          <el-select v-model="filters.investment" placeholder="请选择" style="width: 140px" clearable>
            <el-option label="5千万以上" value="5千万以上" />
            <el-option label="1亿以上" value="1亿以上" />
            <el-option label="2亿以上" value="2亿以上" />
          </el-select>
        </el-form-item>
        <el-form-item label="项目名称">
          <el-input v-model="filters.keyword" placeholder="请输入" style="width: 180px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <div class="table-actions">
        <el-button class="export-btn" @click="onExport">导出</el-button>
      </div>

      <el-table :data="pagedRows" border style="width: 100%" height="520">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="name" label="项目名称" min-width="180" />
        <el-table-column prop="region" label="地区" width="140" />
        <el-table-column prop="area" label="所属片区" width="120" />
        <el-table-column prop="taskType" label="任务类型" width="140" />
        <el-table-column prop="status" label="项目状态" width="110" />
        <el-table-column prop="nature" label="建设性质" width="100" />
        <el-table-column prop="investment" label="投资估算(万元)" width="140" />
        <el-table-column prop="cycle" label="建设周期" width="120" />
        <el-table-column prop="funding" label="资金来源" min-width="170" />
        <el-table-column label="操作" width="80" fixed="right">
          <template #default="scope">
            <el-link type="primary" @click="onView(scope.row)">查看</el-link>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          background
          layout="prev, pager, next, jumper"
          :total="filteredRows.length"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handlePageChange"
        />
        <div class="total-text">共{{ filteredRows.length }}条数据</div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '@/api'

type LedgerRow = {
  id: string
  name: string
  region: string
  area: string
  taskType: string
  status: string
  nature: string
  investment: string
  cycle: string
  funding: string
  city: string
  district: string
  stage: string
  type: string
  investmentLevel: string
}

const route = useRoute()
const router = useRouter()
const filters = reactive({
  period: [] as any[],
  city: '',
  district: '',
  stage: '',
  type: '',
  investment: '',
  keyword: ''
})

const pageSize = ref(10)
const currentPage = ref(1)

const allRows = ref<LedgerRow[]>([])

const statusMap: Record<string, string> = {
  '0': '未开始',
  '1': '谋划中',
  '2': '实施中',
  '3': '已竣工'
}

// Mock Database
const mockDatabase: LedgerRow[] = [
  {
    id: 'mock_1',
    name: '龙城片区老城改造项目',
    region: '太原市-小店区',
    area: '龙城片区',
    taskType: '既有建筑改造利用',
    status: '谋划中',
    nature: '新建',
    investment: '12000',
    cycle: '2026-2030',
    funding: '政府投资30%社会资本投资70%',
    city: '太原市',
    district: '小店区',
    stage: '储备阶段',
    type: '加强既有建筑改造',
    investmentLevel: '1亿以上'
  },
  {
    id: 'mock_2',
    name: '清徐县老旧小区综合整治与“一刻钟生活圈”建设项目',
    region: '太原市-清徐县',
    area: '龙城片区',
    taskType: '完善社区服务设施',
    status: '实施中',
    nature: '改建',
    investment: '1000',
    cycle: '2025-2027',
    funding: '财政资金',
    city: '太原市',
    district: '清徐县',
    stage: '实施阶段',
    type: '完善社区服务设施',
    investmentLevel: '5千万以上'
  },
  {
    id: 'mock_3',
    name: '太原市“口袋公园”建设与老旧片区绿化品质提升项目',
    region: '太原市',
    area: '龙城片区',
    taskType: '改善人居环境',
    status: '实施中',
    nature: '新建',
    investment: '5000',
    cycle: '2025-2026',
    funding: '专项债',
    city: '太原市',
    district: '小店区',
    stage: '实施阶段',
    type: '改善人居环境',
    investmentLevel: '5千万以上'
  },
  {
    id: 'mock_4',
    name: '迎泽区历史文化街区保护与更新项目',
    region: '太原市-迎泽区',
    area: '龙城片区',
    taskType: '既有建筑改造利用',
    status: '储备阶段',
    nature: '修缮',
    investment: '8000',
    cycle: '2026-2028',
    funding: '申请超长期国债',
    city: '太原市',
    district: '迎泽区',
    stage: '储备阶段',
    type: '加强既有建筑改造',
    investmentLevel: '5千万以上'
  },
  {
    id: 'mock_5',
    name: '杏花岭区社区养老服务中心建设项目',
    region: '太原市-杏花岭区',
    area: '龙城片区',
    taskType: '完善社区服务设施',
    status: '谋划中',
    nature: '改建',
    investment: '2000',
    cycle: '2025-2026',
    funding: '企业融资',
    city: '太原市',
    district: '杏花岭区',
    stage: '储备阶段',
    type: '完善社区服务设施',
    investmentLevel: '5千万以上'
  }
]

const generateMockData = () => {
  // Randomly select 2 to 4 items
  const count = Math.floor(Math.random() * 3) + 2 // 2, 3, or 4
  const shuffled = [...mockDatabase].sort(() => 0.5 - Math.random())
  const selected = shuffled.slice(0, count)
  allRows.value = selected
  // Remove toast
  // ElMessage.success(`已生成 ${count} 条模拟数据`)
}

const fetchData = async () => {
  // Mock Data Logic (Active)
  generateMockData()

  /* 
  // Real API Logic (Commented out)
  const problemId = route.query.id as string
  if (!problemId) {
    // ElMessage.warning('未提供体检问题ID')
    return
  }

  try {
    // 1. 根据体检问题ID查询 t_project_task_check
    const checkRes: any = await api.Api({
      model: 't_project_task_check',
      args: `scheme_id='${problemId}'` // 入口体检问题ID对应 scheme_id
    })

    const checkList = Array.isArray(checkRes) ? checkRes : []
    if (checkList.length === 0) {
      allRows.value = []
      return
    }

    const projectIds = checkList.map((item: any) => item.project_id).filter(Boolean)
    if (projectIds.length === 0) {
      allRows.value = []
      return
    }

    // 去重
    const uniqueIds = [...new Set(projectIds)]

    // 2. 根据 project_id 查询 t_project_report
    const idsStr = uniqueIds.map(id => `'${id}'`).join(',')
    const reportRes: any = await api.Api({
      model: 't_project_report',
      args: `id in (${idsStr})`
    })

    const reportList = Array.isArray(reportRes) ? reportRes : []

    allRows.value = reportList.map((item: any) => {
      // 映射字段
      const statusText = statusMap[item.completion_status] || item.completion_status || '未知'
      const cycle = (item.construct_datetime_start || '') + '-' + (item.construct_datetime_end || '')
      
      return {
        id: item.id,
        name: item.name || '',
        region: item.area || '', // 地区
        area: item.parent_area || '', // 所属片区
        taskType: item.task_type || '',
        status: statusText,
        nature: item.construct_nature || '',
        investment: item.construct_price || '',
        cycle: cycle === '-' ? '' : cycle,
        funding: item.fund_source || '',
        
        // 以下字段用于筛选，需根据实际数据填充或保留默认逻辑
        city: '太原市', // 示例默认值，实际可能需要从 area 解析
        district: '小店区', // 示例默认值
        stage: '储备阶段', // 示例默认值
        type: '加强既有建筑改造', // 示例默认值
        investmentLevel: '5千万以上' // 示例默认值
      }
    })

  } catch (error) {
    console.error('Fetch data failed:', error)
    ElMessage.error('获取数据失败')
  }
  */
}

onMounted(() => {
  // Always fetch (mock) data regardless of query ID
  fetchData()
})

const filteredRows = computed(() => {
  const kw = filters.keyword.trim()
  return allRows.value.filter(r => {
    if (filters.city && r.city !== filters.city) return false
    if (filters.district && r.district !== filters.district) return false
    if (filters.stage && r.stage !== filters.stage) return false
    if (filters.type && r.type !== filters.type) return false
    if (filters.investment && r.investmentLevel !== filters.investment) return false
    if (kw && !r.name.includes(kw)) return false
    return true
  })
})

const pagedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredRows.value.slice(start, start + pageSize.value)
})

const onSearch = () => {
  currentPage.value = 1
}

const onExport = () => {
  ElMessage.success('已导出示例数据')
}

const onView = (row: LedgerRow) => {
  ElMessage.info(`示例：查看 ${row.name}`)
}

const handlePageChange = (page: number) => {
  currentPage.value = page
}
</script>

<style scoped lang="scss">
.ledger-container {
  padding: 20px;
  background-color: #f5f7fa;
  height: 100vh;
  overflow: auto;
}

.breadcrumb { margin-bottom: 10px; color: #606266; }
.filter-card { margin-bottom: 16px; }
.table-card { border-radius: 10px; }
.table-actions { display: flex; justify-content: flex-start; margin-bottom: 10px; }
.export-btn { border-color: #2F7BFF; color: #2F7BFF; }

.pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 12px;
}

.total-text {
  color: #606266;
  font-size: 13px;
}
</style>
