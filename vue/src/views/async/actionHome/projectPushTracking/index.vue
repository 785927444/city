<template>
  <div class="push-track-container">
    <div class="page-top">
      <div class="breadcrumb">
        <span class="crumb">首页</span>
        <span class="sep">&gt;</span>
        <span class="crumb current">项目实施跟踪</span>
      </div>
      <div class="top-filters">
        <el-select v-model="filters.year" class="pill-select" size="small">
          <el-option v-for="y in years" :key="y" :label="`${y}年`" :value="y"></el-option>
        </el-select>
        <el-select v-model="filters.region" class="pill-select" size="small">
          <el-option label="山西省" value="山西省"></el-option>
          <el-option label="太原市" value="太原市"></el-option>
          <el-option label="大同市" value="大同市"></el-option>
          <el-option label="晋城市" value="晋城市"></el-option>
        </el-select>
        <el-button class="pill-btn" type="primary" size="small" @click="refresh">查询</el-button>
      </div>
    </div>

    <div class="block-gap"></div>

    <div class="kpi-bar">
      <div class="kpi-item">
        <div class="kpi-value">{{ summary.total }}</div>
        <div class="kpi-label">项目总数</div>
      </div>
      <div class="kpi-item">
        <div class="kpi-value">{{ summary.completed }}</div>
        <div class="kpi-label">完成竣工项目</div>
      </div>
      <div class="kpi-item danger">
        <div class="kpi-value">
          <span>{{ summary.warn }}</span>
          <i-ep-caret-top class="kpi-arrow"></i-ep-caret-top>
        </div>
        <div class="kpi-label">预警项目</div>
      </div>
    </div>

    <div class="block-gap"></div>

    <div class="content-grid">
      <div class="left-col">
        <div ref="stageWrapRef" class="card-wrap">
          <el-card class="dash-card stage-card" shadow="never">
            <template #header>
              <div class="card-header">
                <div class="card-header-left">
                  <span class="title-dot"></span>
                  <span class="card-title">项目阶段进度跟踪图</span>
                </div>
                <div class="card-header-right">
                  <el-select v-model="stageFilters.projectType" class="pill-select header-pill" size="small">
                    <el-option v-for="o in stageProjectTypes" :key="o.value" :label="o.label" :value="o.value"></el-option>
                  </el-select>
                  <el-select v-model="stageFilters.viewMode" class="pill-select header-pill" size="small">
                    <el-option v-for="o in stageViewModes" :key="o.value" :label="o.label" :value="o.value"></el-option>
                  </el-select>
                  <el-select v-model="stageFilters.stage" class="pill-select header-pill" size="small">
                    <el-option v-for="o in stageStageOptions" :key="o.value" :label="o.label" :value="o.value"></el-option>
                  </el-select>
                  <div class="header-fullscreen" @click.stop="toggleFullscreen('stage')">
                    <i-ep-full-screen class="header-fullscreen-ico"></i-ep-full-screen>
                    <span>全屏</span>
                  </div>
                </div>
              </div>
            </template>
            <div ref="stageChartRef" class="chart chart-stage"></div>
          </el-card>
        </div>

        <div class="bottom-grid">
          <div ref="scaleWrapRef" class="card-wrap">
            <el-card class="dash-card bottom-card" shadow="never">
              <template #header>
                <div class="card-header">
                  <div class="card-header-left">
                    <span class="title-dot"></span>
                    <span class="card-title">更新项目规模对比图</span>
                  </div>
                  <div class="card-header-right">
                    <div class="header-fullscreen" @click.stop="toggleFullscreen('scale')">
                      <i-ep-full-screen class="header-fullscreen-ico"></i-ep-full-screen>
                      <span>全屏</span>
                    </div>
                  </div>
                </div>
              </template>
              <div ref="scaleChartRef" class="chart chart-bottom"></div>
            </el-card>
          </div>

          <DonutPieCard
            title="预警项目分布饼图"
            :data="warnPieData"
            :select-options="[{ label: '项目规模', value: 'scale' }]"
            v-model="warnPieSelect"
            :height="252"
          ></DonutPieCard>
        </div>
      </div>

      <div ref="tableWrapRef" class="card-wrap right-col">
        <el-card class="dash-card table-card" shadow="never">
          <template #header>
            <div class="card-header">
              <div class="card-header-left">
                <span class="title-dot"></span>
                <span class="card-title">数据清单</span>
              </div>
              <div class="card-header-right">
                <div class="header-fullscreen" @click.stop="toggleFullscreen('table')">
                  <i-ep-full-screen class="header-fullscreen-ico"></i-ep-full-screen>
                  <span>全屏</span>
                </div>
              </div>
            </div>
          </template>

          <div class="table-body">
            <el-table :data="pagedRows" border class="dash-table" height="100%">
              <el-table-column type="index" label="序号" width="60"></el-table-column>
              <el-table-column prop="name" label="项目名称" min-width="220" show-overflow-tooltip></el-table-column>
              <el-table-column prop="type" label="项目类型" width="120"></el-table-column>
              <el-table-column prop="region" label="项目地区" width="120"></el-table-column>
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="statusTagType(scope.row.status)" effect="light">{{ scope.row.status }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="updatedAt" label="更新时间" width="130"></el-table-column>
              <el-table-column label="操作" width="120" fixed="right">
                <template #default="scope">
                  <el-link class="op-link op-detail" :underline="false" @click="onView(scope.row)">详情</el-link>
                  <el-link class="op-link op-locate" :underline="false" @click="onLocate(scope.row)">定位</el-link>
                </template>
              </el-table-column>
            </el-table>

            <div class="table-pagination">
              <el-pagination
                background
                layout="prev, pager, next"
                :total="rows.length"
                :page-size="pageSize"
                :current-page="currentPage"
                @current-change="handlePageChange"
              ></el-pagination>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import DonutPieCard from '@/components/DonutPieCard.vue'
import * as echarts from 'echarts'
import screenfull from 'screenfull'

type EChart = echarts.ECharts

const years = Array.from({ length: 10 }).map((_, i) => new Date().getFullYear() - 9 + i)

const filters = reactive({
  year: new Date().getFullYear(),
  region: '山西省'
})

const stageProjectTypes = [
  { label: '既有建筑改造项目', value: '既有建筑改造项目' },
  { label: '城市更新项目', value: '城市更新项目' },
  { label: '基础设施项目', value: '基础设施项目' }
]
const stageViewModes = [
  { label: '项目总览', value: '项目总览' },
  { label: '预警视图', value: '预警视图' }
]
const stageStageOptions = [
  { label: '项目阶段', value: '项目阶段' },
  { label: '策划阶段', value: '策划阶段' },
  { label: '立项阶段', value: '立项阶段' },
  { label: '实施阶段', value: '实施阶段' },
  { label: '竣工阶段', value: '竣工阶段' }
]
const stageFilters = reactive({
  projectType: stageProjectTypes[0].value,
  viewMode: stageViewModes[0].value,
  stage: stageStageOptions[0].value
})

const summary = reactive({
  total: 133,
  completed: 621,
  warn: 249
})

type Row = {
  id: number
  name: string
  type: string
  region: string
  status: string
  updatedAt: string
}

const regions = ['山西省', '太原市', '大同市', '阳泉市', '长治市', '晋城市', '朔州市', '忻州市', '吕梁市', '运城市']
const types = ['历史文化保护与复兴', '完善社区服务设施', '基础设施补短板', '公共空间品质提升', '既有建筑节能改造']
const statuses = ['策划阶段', '立项阶段', '实施阶段', '竣工阶段']

const rows = ref<Row[]>(Array.from({ length: 60 }).map((_, i) => {
  const region = regions[i % regions.length]
  const type = types[i % types.length]
  const status = statuses[i % statuses.length]
  const day = (i % 28) + 1
  const suffix = String(i + 1).padStart(2, '0')

  return {
    id: i + 1,
    name: `${region}-十五五重点专项规划编制项目${suffix}`,
    type,
    region,
    status,
    updatedAt: `2026年6月${day}日`
  }
}))

const pageSize = ref(10)
const currentPage = ref(1)

const pagedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return rows.value.slice(start, start + pageSize.value)
})

const handlePageChange = (page: number) => {
  currentPage.value = page
}

const onView = (row: Row) => {
  ElMessage.info(`示例：查看 ${row.name}`)
}

const onLocate = (row: Row) => {
  ElMessage.success(`示例：定位 ${row.name}`)
}

const statusTagType = (status: string) => {
  if (status === '竣工阶段') return 'success'
  if (status === '实施阶段') return 'warning'
  if (status === '立项阶段') return 'info'
  return 'info'
}

const warnPieSelect = ref('scale')

const warnPieData = computed(() => ([
  { name: '太原市', value: 20, color: '#FF8A34' },
  { name: '大同市', value: 20, color: '#FF4D4F' },
  { name: '阳泉市', value: 20, color: '#34C2A1' },
  { name: '长治市', value: 20, color: '#2F7BFF' },
  { name: '晋城市', value: 20, color: '#56C2E6' }
]))

const stageWrapRef = ref<HTMLElement | null>(null)
const scaleWrapRef = ref<HTMLElement | null>(null)
const tableWrapRef = ref<HTMLElement | null>(null)
const stageChartRef = ref<HTMLDivElement | null>(null)
const scaleChartRef = ref<HTMLDivElement | null>(null)

let stageChart: EChart | null = null
let scaleChart: EChart | null = null
let ro: ResizeObserver | null = null
let raf = 0

const requestResize = () => {
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(() => {
    stageChart?.resize()
    scaleChart?.resize()
  })
}

const tooltipCommon = {
  backgroundColor: 'rgba(0,0,0,0.65)',
  borderWidth: 0,
  textStyle: { color: '#fff', fontSize: 12 }
}

const buildAxisTooltip = (unit = '个') => ({
  ...tooltipCommon,
  trigger: 'axis',
  axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(47,123,255,0.08)' } },
  formatter: (params: any[]) => {
    const rows = params
      .filter(p => p && p.seriesName != null)
      .map(p => `<div style="display:flex;justify-content:space-between;gap:16px;"><span>${p.marker}${p.seriesName}</span><span style="font-weight:700;">${p.value ?? 0}${unit}</span></div>`)
      .join('')
    return `<div style="min-width:160px;"><div style="font-weight:700;margin-bottom:6px;">${params?.[0]?.axisValue ?? ''}</div>${rows}</div>`
  }
})

const ensureStageChart = () => {
  if (!stageChartRef.value) return null
  if (!stageChart) stageChart = echarts.init(stageChartRef.value)
  return stageChart
}

const ensureScaleChart = () => {
  if (!scaleChartRef.value) return null
  if (!scaleChart) scaleChart = echarts.init(scaleChartRef.value)
  return scaleChart
}

const renderStage = () => {
  const chart = ensureStageChart()
  if (!chart) return

  const cities = ['太原市', '阳泉市', '长治市', '晋城市', '朔州市', '忻州市', '运城市', '吕梁市']
  const planning = [76, 97, 96, 85, 68, 72, 80, 74]
  const approval = [44, 66, 63, 55, 42, 51, 58, 49]
  const implementing = [22, 30, 31, 28, 24, 26, 29, 27]
  const done = [10, 16, 14, 13, 8, 9, 12, 11]

  const option: echarts.EChartsOption = {
    animation: false,
    grid: { left: 44, right: 18, top: 44, bottom: 26, containLabel: true },
    legend: {
      left: 0,
      top: 6,
      itemWidth: 12,
      itemHeight: 8,
      icon: 'roundRect',
      textStyle: { color: '#606266', fontSize: 12 },
      data: ['策划阶段', '立项阶段', '实施阶段', '竣工阶段']
    },
    tooltip: buildAxisTooltip('个'),
    xAxis: {
      type: 'category',
      data: cities,
      axisTick: { show: false },
      axisLabel: { color: '#606266', fontSize: 12 },
      axisLine: { lineStyle: { color: '#E6EAF2' } }
    },
    yAxis: {
      type: 'value',
      name: '单位：个',
      nameLocation: 'end',
      nameTextStyle: { color: '#909399', fontSize: 12, padding: [0, 0, 0, 0] },
      nameGap: 10,
      axisLabel: { color: '#606266', fontSize: 12 },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#EEF1F6' } }
    },
    series: [
      { name: '策划阶段', type: 'bar', data: planning, barWidth: 14, itemStyle: { color: '#FF4D4F', borderRadius: [3, 3, 0, 0] } },
      { name: '立项阶段', type: 'bar', data: approval, barWidth: 14, itemStyle: { color: '#FF8A34', borderRadius: [3, 3, 0, 0] } },
      { name: '实施阶段', type: 'bar', data: implementing, barWidth: 14, itemStyle: { color: '#34C2A1', borderRadius: [3, 3, 0, 0] } },
      { name: '竣工阶段', type: 'bar', data: done, barWidth: 14, itemStyle: { color: '#2F7BFF', borderRadius: [3, 3, 0, 0] } }
    ]
  }

  chart.setOption(option, true)
  requestResize()
}

const renderScale = () => {
  const chart = ensureScaleChart()
  if (!chart) return

  const cities = ['太原市', '大同市', '阳泉市', '长治市', '晋城市']
  const y2024 = [62, 44, 38, 29, 26]
  const y2025 = [76, 60, 55, 41, 33]
  const y2026 = [96, 72, 64, 52, 40]

  const option: echarts.EChartsOption = {
    animation: false,
    grid: { left: 44, right: 18, top: 44, bottom: 26, containLabel: true },
    legend: {
      left: 0,
      top: 6,
      itemWidth: 12,
      itemHeight: 8,
      icon: 'roundRect',
      textStyle: { color: '#606266', fontSize: 12 },
      data: ['2024年', '2025年', '2026年']
    },
    tooltip: buildAxisTooltip('个'),
    xAxis: {
      type: 'category',
      data: cities,
      axisTick: { show: false },
      axisLabel: { color: '#606266', fontSize: 12 },
      axisLine: { lineStyle: { color: '#E6EAF2' } }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#606266', fontSize: 12 },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#EEF1F6' } }
    },
    series: [
      { name: '2024年', type: 'bar', data: y2024, barWidth: 14, itemStyle: { color: '#FF4D4F', borderRadius: [3, 3, 0, 0] } },
      { name: '2025年', type: 'bar', data: y2025, barWidth: 14, itemStyle: { color: '#FF8A34', borderRadius: [3, 3, 0, 0] } },
      { name: '2026年', type: 'bar', data: y2026, barWidth: 14, itemStyle: { color: '#2F7BFF', borderRadius: [3, 3, 0, 0] } }
    ]
  }

  chart.setOption(option, true)
  requestResize()
}

const renderCharts = () => {
  renderStage()
  renderScale()
}

const setFullscreenState = () => {
  requestResize()
}

const toggleFullscreen = async (key: 'stage' | 'scale' | 'table') => {
  if (!screenfull.isEnabled) return
  const el = key === 'stage'
    ? stageWrapRef.value
    : (key === 'scale' ? scaleWrapRef.value : tableWrapRef.value)
  if (!el) return
  await screenfull.toggle(el)
  requestResize()
}

const refresh = async () => {
  currentPage.value = 1
  renderCharts()
}

onMounted(async () => {
  renderCharts()
  if ('ResizeObserver' in window) {
    ro = new ResizeObserver(() => requestResize())
    if (stageWrapRef.value) ro.observe(stageWrapRef.value)
    if (scaleWrapRef.value) ro.observe(scaleWrapRef.value)
    if (tableWrapRef.value) ro.observe(tableWrapRef.value)
  } else {
    window.addEventListener('resize', requestResize)
  }
  if (screenfull.isEnabled) screenfull.on('change', setFullscreenState)
})

watch(() => [filters.year, filters.region, stageFilters.projectType, stageFilters.viewMode, stageFilters.stage], () => {
  renderCharts()
})

onBeforeUnmount(() => {
  if (ro && stageWrapRef.value) ro.unobserve(stageWrapRef.value)
  if (ro && scaleWrapRef.value) ro.unobserve(scaleWrapRef.value)
  if (ro && tableWrapRef.value) ro.unobserve(tableWrapRef.value)
  ro = null
  window.removeEventListener('resize', requestResize)
  if (screenfull.isEnabled) screenfull.off('change', setFullscreenState)
  cancelAnimationFrame(raf)
  stageChart?.dispose()
  scaleChart?.dispose()
  stageChart = null
  scaleChart = null
})
</script>

<style scoped lang="scss">
.push-track-container {
  padding: 20px;
  background-color: #f5f7fa;
  height: 100vh;
  overflow: auto;
}

.page-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #606266;
  font-size: 14px;
}

.crumb.current {
  color: #2f7bff;
  font-weight: 600;
}

.sep {
  color: #c0c4cc;
}

.top-filters {
  display: flex;
  align-items: center;
  gap: 12px;
}

.block-gap { height: 16px; }

.pill-select {
  width: 140px;
  :deep(.el-input__wrapper) {
    height: 32px;
    border-radius: 8px;
    background: #fff;
    border: 1px solid #e6eaf2;
    box-shadow: none;
  }
  :deep(.el-input__inner) { font-size: 12px; }
}

.pill-btn {
  height: 32px;
  border-radius: 8px;
  padding: 0 14px;
  background: #2f7bff;
  border-color: #2f7bff;
}

.pill-btn:hover {
  background: #2563eb;
  border-color: #2563eb;
}

.kpi-bar {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #eef1f6;
  height: 80px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  background-image: linear-gradient(90deg, rgba(47, 123, 255, 0.12), rgba(47, 123, 255, 0.03), rgba(47, 123, 255, 0.10));
}

.kpi-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.kpi-value {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 32px;
  font-weight: 700;
  color: #303133;
  line-height: 1;
}

.kpi-label {
  margin-top: 6px;
  font-size: 12px;
  color: #909399;
}

.kpi-item.danger .kpi-value { color: #ff4d4f; }
.kpi-item.danger .kpi-arrow { color: #ff4d4f; font-size: 14px; }

.content-grid {
  --stage-row: 440px;
  --bottom-row: 320px;
  display: grid;
  grid-template-columns: 1.85fr 1fr;
  gap: 16px;
  align-items: stretch;
}

.left-col {
  display: grid;
  grid-template-rows: var(--stage-row) var(--bottom-row);
  gap: 16px;
}

.right-col {
  height: calc(var(--stage-row) + var(--bottom-row) + 16px);
}

.bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  height: 100%;
  align-items: stretch;
}

.card-wrap {
  width: 100%;
  height: 100%;
}

.dash-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  border: 1px solid #eef1f6;
  background: #fff;
  box-shadow: 0 2px 10px rgba(16, 24, 40, 0.04);
  :deep(.el-card__header) { padding: 14px 16px; border-bottom: 1px solid #f0f2f6; }
  :deep(.el-card__body) { padding: 16px; flex: 1 1 auto; min-height: 0; }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.card-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.title-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2f7bff;
  flex: 0 0 auto;
}

.card-title {
  font-weight: 600;
  font-size: 15px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-header-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex: 0 0 auto;
}

.header-pill {
  width: 160px;
}

.header-fullscreen {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 10px;
  border: 1px solid #e6eaf2;
  border-radius: 8px;
  background: #fff;
  color: #606266;
  font-size: 12px;
  cursor: pointer;
  user-select: none;
}

.header-fullscreen:hover {
  border-color: #cfe0ff;
  color: #2f7bff;
}

.header-fullscreen-ico {
  font-size: 14px;
}

.chart {
  width: 100%;
  height: 100%;
}

.chart-stage {
  height: 100%;
}

.chart-bottom {
  height: 100%;
}

.table-body {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.table-card :deep(.el-card__body) {
  display: flex;
  flex-direction: column;
}

.dash-table {
  flex: 1 1 auto;
  min-height: 0;
}

.table-card :deep(.el-table__header th) {
  background: #f7f9fc;
  color: #303133;
  font-weight: 600;
}

.table-card :deep(.el-table__row td) {
  height: 46px;
}

.table-card :deep(.el-table--border) {
  border-color: #eef1f6;
}

.table-card :deep(.el-table td.el-table__cell),
.table-card :deep(.el-table th.el-table__cell.is-leaf) {
  border-color: #eef1f6;
}

.table-pagination {
  display: flex;
  justify-content: flex-end;
  padding-top: 14px;
  padding-bottom: 2px;
}

.table-pagination :deep(.el-pagination.is-background .el-pager li.is-active) {
  background: #2f7bff;
  color: #fff;
  border-radius: 6px;
}

.table-pagination :deep(.el-pagination.is-background .el-pager li) {
  border: 1px solid #e6eaf2;
  background: #fff;
  color: #606266;
  border-radius: 6px;
}

.table-pagination :deep(.el-pagination.is-background .el-pager li:hover) {
  background: rgba(47, 123, 255, 0.10);
  color: #2f7bff;
}

.op-link {
  font-size: 12px;
  margin-right: 10px;
}

.op-detail {
  color: #2f7bff;
}

.op-locate {
  color: #20c997;
}
</style>
