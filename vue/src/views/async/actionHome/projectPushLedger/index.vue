<template>
  <div class="ledger-container">
    <div class="breadcrumb">首页 / 项目台账</div>

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
          <el-select v-model="filters.city" placeholder="太原市" style="width: 140px">
            <el-option label="太原市" value="太原市" />
            <el-option label="大同市" value="大同市" />
            <el-option label="晋中市" value="晋中市" />
          </el-select>
          <el-select v-model="filters.district" placeholder="小店区" style="width: 140px; margin-left: 10px">
            <el-option label="小店区" value="小店区" />
            <el-option label="迎泽区" value="迎泽区" />
            <el-option label="杏花岭区" value="杏花岭区" />
          </el-select>
        </el-form-item>
        <el-form-item label="项目阶段">
          <el-select v-model="filters.stage" placeholder="储备阶段" style="width: 140px">
            <el-option label="储备阶段" value="储备阶段" />
            <el-option label="实施阶段" value="实施阶段" />
            <el-option label="完工阶段" value="完工阶段" />
          </el-select>
        </el-form-item>
        <el-form-item label="项目类型">
          <el-select v-model="filters.type" placeholder="加强既有建筑改造" style="width: 200px">
            <el-option label="加强既有建筑改造" value="加强既有建筑改造" />
            <el-option label="完善社区服务设施" value="完善社区服务设施" />
            <el-option label="改善人居环境" value="改善人居环境" />
          </el-select>
        </el-form-item>
        <el-form-item label="总投资金额">
          <el-select v-model="filters.investment" placeholder="5千万以上" style="width: 140px">
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
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'

type LedgerRow = {
  id: number
  name: string
  region: string
  area: string
  taskType: string
  status: string
  nature: string
  investment: number
  cycle: string
  funding: string
  city: string
  district: string
  stage: string
  type: string
  investmentLevel: string
}

const filters = reactive({
  period: [] as any[],
  city: '太原市',
  district: '小店区',
  stage: '储备阶段',
  type: '加强既有建筑改造',
  investment: '5千万以上',
  keyword: ''
})

const pageSize = ref(10)
const currentPage = ref(1)

const allRows = ref<LedgerRow[]>(Array.from({ length: 36 }).map((_, i) => {
  const city = i % 3 === 0 ? '太原市' : (i % 3 === 1 ? '大同市' : '晋中市')
  const district = i % 3 === 0 ? '小店区' : (i % 3 === 1 ? '迎泽区' : '杏花岭区')
  const stage = i % 3 === 0 ? '储备阶段' : (i % 3 === 1 ? '实施阶段' : '完工阶段')
  const type = i % 3 === 0 ? '加强既有建筑改造' : (i % 3 === 1 ? '完善社区服务设施' : '改善人居环境')
  const investmentLevel = i % 3 === 0 ? '5千万以上' : (i % 3 === 1 ? '1亿以上' : '2亿以上')
  const investment = i % 3 === 0 ? 12000 : (i % 3 === 1 ? 18000 : 26000)
  const status = i % 3 === 0 ? '谋划中' : (i % 3 === 1 ? '实施中' : '已完工')
  const area = i % 3 === 0 ? '龙城片区' : (i % 3 === 1 ? '老城区片区' : '产业片区')
  const taskType = i % 3 === 0 ? '既有建筑改造利用' : (i % 3 === 1 ? '完善社区服务设施' : '历史风貌保护')
  const funding = i % 3 === 0 ? '政府投资30% 社会资本70%' : (i % 3 === 1 ? '政府投资20% 社会资本80%' : '政府投资40% 社会资本60%')

  return {
    id: i + 1,
    name: `${area}城市更新改造项目${i + 1}`,
    region: `${city}-${district}`,
    area,
    taskType,
    status,
    nature: '新建',
    investment,
    cycle: '2026-2030',
    funding,
    city,
    district,
    stage,
    type,
    investmentLevel
  }
}))

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
