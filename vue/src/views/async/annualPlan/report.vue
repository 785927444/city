<template>
  <div class="annual-plan-report-page">
    <div class="report-card">
      <div class="report-header">
        <div class="report-title">年度计划上报</div>
        <div class="report-close" @click.stop="back">
          <i-ep-close />
        </div>
      </div>

      <div class="section">
        <div class="section-title">支撑材料</div>
        <el-table
          :data="attachmentRows"
          border
          size="small"
          class="attach-table"
          header-cell-class-name="table-header"
          cell-class-name="table-cell"
        >
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="type" label="文件类型" width="140" align="center" />
          <el-table-column prop="time" label="上传时间" width="180" align="center" />
          <el-table-column prop="name" label="已上传文件" align="center" />
          <el-table-column label="操作" width="120" align="center">
            <template #default="scope">
              <el-link type="primary" :underline="false" class="op-link">查看</el-link>
              <el-link type="primary" :underline="false" class="op-link">删除</el-link>
            </template>
          </el-table-column>
        </el-table>
        <div class="add-row">
          <el-link type="primary" :underline="false" class="add-link">添加+</el-link>
        </div>
      </div>

      <div class="section">
        <div class="tabs">
          <div
            class="tab-item"
            :class="{ active: activeTab === 'list' }"
            @click="activeTab = 'list'"
          >
            项目清单
          </div>
          <div
            class="tab-item"
            :class="{ active: activeTab === 'task' }"
            @click="activeTab = 'task'"
          >
            重点落实任务
          </div>
        </div>

        <div v-if="activeTab === 'list'">
          <el-table
            :data="projectRows"
            border
            class="project-table"
            header-cell-class-name="table-header"
            cell-class-name="table-cell"
          >
            <el-table-column type="selection" width="50" align="center" />
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="name" label="项目名称" min-width="200" />
            <el-table-column prop="region" label="地区" width="120" align="center" />
            <el-table-column prop="type" label="项目类型" width="160" align="center" />
            <el-table-column prop="scale" label="建设规模" width="120" align="center" />
            <el-table-column prop="nature" label="建设性质" width="120" align="center" />
            <el-table-column prop="total" label="总投资（万）" width="140" align="center" />
            <el-table-column prop="year" label="年度投资（万）" width="140" align="center" />
            <el-table-column prop="period" label="建设周期" width="140" align="center" />
          </el-table>

          <div class="table-footer">
            <div class="footer-actions">
              <el-button class="plain-btn">全选</el-button>
              <el-button class="plain-btn">删除</el-button>
              <el-button class="accent-btn">选择存在项目</el-button>
            </div>
            <el-pagination
              class="table-pagination"
              layout="prev, pager, next"
              :total="total"
              :page-size="pageSize"
              :current-page="currentPage"
              @current-change="handlePageChange"
            />
          </div>
        </div>
        <div v-else class="empty-area">暂无数据</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getCurrentInstance, ref } from 'vue'

const { proxy } = getCurrentInstance() as any

const activeTab = ref<'list' | 'task'>('list')

const attachmentRows = ref([
  { type: '文本文件', time: '2025-12-15 12:00', name: '' },
  { type: '文本文件', time: '2025-12-15 12:00', name: '' },
  { type: '文本文件', time: '2025-12-15 12:00', name: '' }
])

const projectRows = ref([
  {
    name: '龙城片区老旧改造项目',
    region: '太原市-小店区',
    type: '既有建筑改造利用',
    scale: '300亩',
    nature: '新建',
    total: 12000,
    year: 6000,
    period: '2026-2030'
  },
  {
    name: '龙城片区老旧改造项目',
    region: '太原市-小店区',
    type: '既有建筑改造利用',
    scale: '300亩',
    nature: '新建',
    total: 12000,
    year: 6000,
    period: '2026-2030'
  },
  {
    name: '龙城片区老旧改造项目',
    region: '太原市-小店区',
    type: '既有建筑改造利用',
    scale: '300亩',
    nature: '新建',
    total: 12000,
    year: 6000,
    period: '2026-2030'
  },
  {
    name: '龙城片区老旧改造项目',
    region: '太原市-小店区',
    type: '既有建筑改造利用',
    scale: '300亩',
    nature: '新建',
    total: 12000,
    year: 6000,
    period: '2026-2030'
  }
])

const total = ref(25)
const pageSize = ref(5)
const currentPage = ref(1)

const handlePageChange = (page: number) => {
  currentPage.value = page
}

const back = () => {
  proxy.toPath('/annual-plan')
}
</script>

<style scoped lang="scss">
.annual-plan-report-page {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.report-card {
  background: #fff;
  border: 1px solid #eef1f6;
  border-radius: 12px;
  padding: 20px;
}

.report-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.report-title {
  font-size: 18px;
  font-weight: 700;
  color: #303133;
}

.report-close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #606266;
  background: #f5f7fa;
}

.section {
  margin-top: 12px;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 8px;
}

.attach-table :deep(.el-table__row) {
  height: 36px;
}

.project-table :deep(.el-table__row) {
  height: 44px;
}

.table-header {
  background: #f3f4f6;
  color: #606266;
  font-weight: 600;
  text-align: center;
}

.table-cell {
  text-align: center;
  color: #303133;
  border-color: #e5e7eb;
}

.project-table :deep(.el-table__cell) {
  border-color: #e5e7eb;
}

.attach-table :deep(.el-table__cell) {
  border-color: #e5e7eb;
}

.attach-table :deep(.el-table__cell .cell) {
  padding: 6px 6px;
}

.project-table :deep(.el-table__cell .cell) {
  padding: 8px 8px;
}

.project-table :deep(.el-table__body-wrapper) {
  border-bottom: 1px solid #e5e7eb;
}

.add-row {
  display: flex;
  justify-content: center;
  padding: 10px 0 6px;
}

.add-link {
  font-size: 13px;
}

.op-link + .op-link {
  margin-left: 10px;
}

.tabs {
  display: flex;
  align-items: center;
  gap: 28px;
  border-bottom: 1px solid #e5e7eb;
  margin: 16px 0 12px;
}

.tab-item {
  padding: 8px 2px 10px;
  color: #5f6368;
  font-size: 14px;
  cursor: pointer;
  position: relative;
}

.tab-item.active {
  color: #111827;
  font-weight: 700;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 3px;
  background: #111827;
}

.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
}

.footer-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.plain-btn {
  border: 1px solid #d1d5db;
  color: #606266;
  background: #fff;
  border-radius: 6px;
  height: 30px;
  padding: 0 12px;
}

.accent-btn {
  border: 1px solid #f8d47a;
  background: #ffe9b3;
  color: #c67a00;
  border-radius: 6px;
  height: 30px;
  padding: 0 14px;
}

.table-pagination {
  display: flex;
  justify-content: flex-end;
}

.table-pagination :deep(.el-pager li) {
  border: 1px solid #d1d5db;
  margin: 0 4px;
  border-radius: 4px;
  min-width: 26px;
  height: 26px;
  line-height: 26px;
  color: #606266;
}

.table-pagination :deep(.el-pager li.is-active) {
  border-color: #2f7bff;
  color: #2f7bff;
  background: #fff;
}

.table-pagination :deep(.btn-prev),
.table-pagination :deep(.btn-next) {
  border: 1px solid #d1d5db;
  border-radius: 4px;
  min-width: 26px;
  height: 26px;
  line-height: 26px;
  color: #606266;
}

.empty-area {
  padding: 20px 0;
  text-align: center;
  color: #909399;
  font-size: 14px;
}
</style>
