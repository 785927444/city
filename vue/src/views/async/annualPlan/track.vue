<template>
  <div class="plan-track-container">
    <div class="page-top">
      <div class="breadcrumb">
        <span class="crumb">首页</span>
        <span class="sep">&gt;</span>
        <span class="crumb current">年度计划跟踪</span>
      </div>
      <div class="top-filters">
        <div class="filter-item">
          <span class="filter-label">年度</span>
          <el-select v-model="filters.year" class="pill-select">
            <el-option v-for="y in years" :key="y" :label="`${y}年`" :value="y" />
          </el-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">行政区</span>
          <el-select v-model="filters.region" class="pill-select">
            <el-option label="山西省" value="山西省" />
            <el-option label="太原市" value="太原市" />
            <el-option label="大同市" value="大同市" />
          </el-select>
        </div>
      </div>
    </div>

    <div class="kpi-bar">
      <div v-for="item in kpiList" :key="item.label" class="kpi-item">
        <div class="kpi-value">
          <span class="kpi-number">{{ item.value }}</span>
          <span v-if="item.unit" class="kpi-unit">{{ item.unit }}</span>
        </div>
        <div class="kpi-label">{{ item.label }}</div>
      </div>
    </div>

    <div class="content-grid">
      <div ref="lineWrapRef" class="card-wrap">
        <el-card class="dash-card" shadow="never">
          <template #header>
            <div class="card-header">
              <div class="card-header-left">
                <span class="title-dot"></span>
                <span class="card-title">年度投资金额趋势图</span>
              </div>
              <div class="card-header-right">
                <div class="fullscreen-btn" @click.stop="toggleFullscreen('line')">
                  <i-ep-full-screen class="fullscreen-ico" />
                  <span>全屏</span>
                </div>
              </div>
            </div>
          </template>
          <div ref="lineChartRef" class="chart chart-large"></div>
        </el-card>
      </div>

      <div ref="typeWrapRef" class="card-wrap">
        <el-card class="dash-card" shadow="never">
          <template #header>
            <div class="card-header">
              <div class="card-header-left">
                <span class="title-dot"></span>
                <span class="card-title">项目类型饼图</span>
              </div>
              <div class="card-header-right">
                <el-select v-model="typeSelect" class="header-pill">
                  <el-option label="项目类型" value="type" />
                </el-select>
                <div class="fullscreen-btn" @click.stop="toggleFullscreen('type')">
                  <i-ep-full-screen class="fullscreen-ico" />
                  <span>全屏</span>
                </div>
              </div>
            </div>
          </template>
          <div class="legend-row">
            <div v-for="item in typeLegend" :key="item.name" class="legend-item">
              <span class="legend-dot" :style="{ backgroundColor: item.color }"></span>
              <span class="legend-text">{{ item.name }}</span>
            </div>
          </div>
          <div class="donut-area">
            <div ref="typeChartRef" class="chart chart-donut"></div>
            <div class="center-icon"></div>
          </div>
        </el-card>
      </div>

      <div ref="barWrapRef" class="card-wrap">
        <el-card class="dash-card" shadow="never">
          <template #header>
            <div class="card-header">
              <div class="card-header-left">
                <span class="title-dot"></span>
                <span class="card-title">年度计划交叉分析图</span>
              </div>
              <div class="card-header-right">
                <div class="fullscreen-btn" @click.stop="toggleFullscreen('bar')">
                  <i-ep-full-screen class="fullscreen-ico" />
                  <span>全屏</span>
                </div>
              </div>
            </div>
          </template>
          <div ref="barChartRef" class="chart chart-large"></div>
        </el-card>
      </div>

      <div ref="amountWrapRef" class="card-wrap">
        <el-card class="dash-card" shadow="never">
          <template #header>
            <div class="card-header">
              <div class="card-header-left">
                <span class="title-dot"></span>
                <span class="card-title">项目金额饼图</span>
              </div>
              <div class="card-header-right">
                <div class="fullscreen-btn" @click.stop="toggleFullscreen('amount')">
                  <i-ep-full-screen class="fullscreen-ico" />
                  <span>全屏</span>
                </div>
              </div>
            </div>
          </template>
          <div class="legend-row">
            <div v-for="item in amountLegend" :key="item.name" class="legend-item">
              <span class="legend-dot" :style="{ backgroundColor: item.color }"></span>
              <span class="legend-text">{{ item.name }}</span>
            </div>
          </div>
          <div class="donut-area">
            <div ref="amountChartRef" class="chart chart-donut"></div>
            <div class="center-icon"></div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import * as echarts from 'echarts'
import screenfull from 'screenfull'

const filters = reactive({
  year: 2025,
  region: '山西省'
})
const years = ref([2025, 2024, 2023, 2022, 2021])

const kpiList = [
  { value: '133↑', unit: '', label: '计划项目总数' },
  { value: '621', unit: '万平方米', label: '计划建设总规模' },
  { value: '249', unit: '亿元', label: '计划投资总金额' },
  { value: '87.2%', unit: '', label: '投资完成率' }
]

const typeSelect = ref('type')

const typeLegend = [
  { name: '老旧小区改造', color: '#FF8A34' },
  { name: '完整社区建设', color: '#FF4D4F' },
  { name: '历史风貌保护', color: '#34C2A1' },
  { name: '城市功能品质提升', color: '#2F7BFF' },
  { name: '其他', color: '#9BA4B2' }
]

const amountLegend = [
  { name: '已完成投资金额占比', color: '#2F7BFF' },
  { name: '待投资金额占比', color: '#34C2A1' }
]

const lineWrapRef = ref<HTMLElement | null>(null)
const barWrapRef = ref<HTMLElement | null>(null)
const typeWrapRef = ref<HTMLElement | null>(null)
const amountWrapRef = ref<HTMLElement | null>(null)

const lineChartRef = ref<HTMLDivElement | null>(null)
const barChartRef = ref<HTMLDivElement | null>(null)
const typeChartRef = ref<HTMLDivElement | null>(null)
const amountChartRef = ref<HTMLDivElement | null>(null)

let lineChart: echarts.ECharts | null = null
let barChart: echarts.ECharts | null = null
let typeChart: echarts.ECharts | null = null
let amountChart: echarts.ECharts | null = null

const lineYears = ['2015年','2016年','2017年','2018年','2019年','2020年','2021年','2022年','2023年','2024年','2025年','2026年']
const lineValues = [18, 28, 23, 31, 26, 30, 49, 41, 28, 34, 24, 31]

const cityList = ['晋城市','临汾市','太原市','长治市','大同市','忻州市','运城市','朔州市','吕梁市']
const cityCount = [32, 40, 55, 46, 38, 26, 30, 25, 22]
const cityAmount = [42, 60, 78, 66, 58, 50, 56, 48, 46]

const tooltipCardStyle = {
  backgroundColor: '#fff',
  borderColor: '#e6eaf2',
  textStyle: { color: '#303133', fontSize: 12 },
  extraCssText: 'box-shadow: 0 6px 16px rgba(16,24,40,0.08); border-radius: 6px;'
}

const buildLineOption = (): echarts.EChartsOption => ({
  animation: false,
  grid: { left: 42, right: 20, top: 34, bottom: 26 },
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(47,123,255,0.12)' } },
    ...tooltipCardStyle,
    formatter: (params: any) => `投资金额：${params[0]?.data ?? 0}亿`
  },
  xAxis: {
    type: 'category',
    data: lineYears,
    boundaryGap: false,
    axisLine: { lineStyle: { color: '#e6eaf2' } },
    axisTick: { show: false },
    axisLabel: { color: '#606266', fontSize: 12 }
  },
  yAxis: {
    type: 'value',
    name: '单位：亿元',
    nameTextStyle: { color: '#909399', fontSize: 12, padding: [0, 0, 0, 0] },
    splitLine: { lineStyle: { color: 'rgba(0,0,0,0.05)' } },
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: '#606266', fontSize: 12 }
  },
  series: [
    {
      name: '投资金额',
      type: 'line',
      data: lineValues,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: { color: '#2F7BFF', width: 2 },
      itemStyle: { color: '#fff', borderColor: '#2F7BFF', borderWidth: 2 }
    }
  ]
})

const buildBarOption = (): echarts.EChartsOption => ({
  animation: false,
  grid: { left: 48, right: 48, top: 40, bottom: 28 },
  legend: {
    left: 0,
    top: 6,
    itemWidth: 10,
    itemHeight: 10,
    textStyle: { color: '#606266', fontSize: 12 },
    data: ['项目数量', '计划投资金额']
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(47,123,255,0.12)' } },
    ...tooltipCardStyle,
    formatter: (params: any) => {
      const count = params.find((p: any) => p.seriesName === '项目数量')?.data ?? 0
      const amount = params.find((p: any) => p.seriesName === '计划投资金额')?.data ?? 0
      return `项目数量：${count}个<br/>计划投资金额：${amount}万元`
    }
  },
  xAxis: {
    type: 'category',
    data: cityList,
    axisLine: { lineStyle: { color: '#e6eaf2' } },
    axisTick: { show: false },
    axisLabel: { color: '#606266', fontSize: 12 }
  },
  yAxis: [
    {
      type: 'value',
      name: '单位：个',
      nameTextStyle: { color: '#909399', fontSize: 12, padding: [0, 0, 0, -6] },
      splitLine: { lineStyle: { color: 'rgba(0,0,0,0.05)' } },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#606266', fontSize: 12 }
    },
    {
      type: 'value',
      name: '单位：万元',
      nameTextStyle: { color: '#909399', fontSize: 12, padding: [0, 0, 0, 6] },
      splitLine: { show: false },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#606266', fontSize: 12 }
    }
  ],
  series: [
    {
      name: '项目数量',
      type: 'bar',
      yAxisIndex: 0,
      data: cityCount,
      barWidth: 14,
      itemStyle: { color: '#2F7BFF', borderRadius: [4, 4, 0, 0] }
    },
    {
      name: '计划投资金额',
      type: 'bar',
      yAxisIndex: 1,
      data: cityAmount,
      barWidth: 14,
      itemStyle: { color: '#FF8A34', borderRadius: [4, 4, 0, 0] }
    }
  ]
})

const buildTypeDonutOption = (): echarts.EChartsOption => ({
  animation: false,
  tooltip: { show: false },
  series: [
    {
      type: 'pie',
      radius: ['58%', '78%'],
      center: ['50%', '55%'],
      minAngle: 8,
      label: {
        show: true,
        formatter: (p: any) => `${p.percent}% ${p.name}`,
        color: (p: any) => p.color,
        fontSize: 12,
        fontWeight: 600
      },
      labelLine: { show: true, length: 18, length2: 12, smooth: 0.25 },
      itemStyle: { borderColor: '#fff', borderWidth: 2 },
      data: [
        { name: '老旧小区改造', value: 20, itemStyle: { color: '#FF8A34' } },
        { name: '完整社区建设', value: 20, itemStyle: { color: '#FF4D4F' } },
        { name: '历史风貌保护', value: 20, itemStyle: { color: '#34C2A1' } },
        { name: '城市功能品质提升', value: 40, itemStyle: { color: '#2F7BFF' } },
        { name: '其他', value: 10, itemStyle: { color: '#9BA4B2' } }
      ]
    }
  ]
})

const buildAmountDonutOption = (): echarts.EChartsOption => ({
  animation: false,
  tooltip: { show: false },
  series: [
    {
      type: 'pie',
      radius: ['58%', '78%'],
      center: ['50%', '55%'],
      minAngle: 10,
      label: {
        show: true,
        formatter: (p: any) => `${p.percent}% ${p.name}\n${p.value}亿元`,
        color: (p: any) => p.color,
        fontSize: 12,
        fontWeight: 600,
        lineHeight: 18
      },
      labelLine: { show: true, length: 18, length2: 12, smooth: 0.25 },
      itemStyle: { borderColor: '#fff', borderWidth: 2 },
      data: [
        { name: '已完成投资金额占比', value: 20, itemStyle: { color: '#2F7BFF' } },
        { name: '待投资金额占比', value: 30, itemStyle: { color: '#34C2A1' } }
      ]
    }
  ]
})

const resizeAll = () => {
  lineChart?.resize()
  barChart?.resize()
  typeChart?.resize()
  amountChart?.resize()
}

const toggleFullscreen = (key: 'line' | 'bar' | 'type' | 'amount') => {
  if (!screenfull.isEnabled) return
  const map = {
    line: lineWrapRef.value,
    bar: barWrapRef.value,
    type: typeWrapRef.value,
    amount: amountWrapRef.value
  }
  const target = map[key]
  if (!target) return
  screenfull.toggle(target)
  resizeAll()
}

const initCharts = () => {
  if (lineChartRef.value) {
    lineChart = echarts.init(lineChartRef.value)
    lineChart.setOption(buildLineOption(), true)
  }
  if (barChartRef.value) {
    barChart = echarts.init(barChartRef.value)
    barChart.setOption(buildBarOption(), true)
  }
  if (typeChartRef.value) {
    typeChart = echarts.init(typeChartRef.value)
    typeChart.setOption(buildTypeDonutOption(), true)
  }
  if (amountChartRef.value) {
    amountChart = echarts.init(amountChartRef.value)
    amountChart.setOption(buildAmountDonutOption(), true)
  }
  resizeAll()
}

onMounted(() => {
  initCharts()
  window.addEventListener('resize', resizeAll)
  if (screenfull.isEnabled) screenfull.on('change', resizeAll)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeAll)
  if (screenfull.isEnabled) screenfull.off('change', resizeAll)
  lineChart?.dispose()
  barChart?.dispose()
  typeChart?.dispose()
  amountChart?.dispose()
  lineChart = null
  barChart = null
  typeChart = null
  amountChart = null
})
</script>

<style scoped lang="scss">
.plan-track-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100%;
  height: auto;
  overflow: visible;
  padding-bottom: 24px;
}

.page-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.breadcrumb {
  font-size: 14px;
  color: #606266;
}

.crumb.current {
  color: #2f7bff;
  font-weight: 600;
}

.sep {
  margin: 0 6px;
  color: #909399;
}

.top-filters {
  display: flex;
  align-items: center;
  gap: 16px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  color: #606266;
  font-size: 12px;
}

.pill-select {
  width: 120px;
  :deep(.el-input__wrapper) {
    height: 32px;
    border-radius: 8px;
    border: 1px solid #e6eaf2;
    box-shadow: none;
    background: #fff;
  }
  :deep(.el-input__inner) {
    font-size: 12px;
    color: #303133;
  }
}

.kpi-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  align-items: center;
  background: linear-gradient(180deg, rgba(47,123,255,0.12) 0%, rgba(47,123,255,0.04) 100%);
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 16px;
}

.kpi-item {
  text-align: center;
}

.kpi-value {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  color: #1f2d3d;
}

.kpi-number {
  font-size: 32px;
  font-weight: 700;
}

.kpi-unit {
  font-size: 14px;
  color: #6b7a90;
}

.kpi-label {
  margin-top: 6px;
  font-size: 12px;
  color: #8a95a6;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
}

.card-wrap {
  width: 100%;
}

.dash-card {
  border-radius: 12px;
  border: 1px solid #eef1f6;
  background: #fff;
  box-shadow: 0 2px 10px rgba(16, 24, 40, 0.04);
  :deep(.el-card__header) {
    padding: 14px 16px;
    border-bottom: 1px solid #f0f2f6;
  }
  :deep(.el-card__body) {
    padding: 16px;
  }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2f7bff;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.card-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-pill {
  width: 110px;
  :deep(.el-input__wrapper) {
    height: 32px;
    border-radius: 8px;
    border: 1px solid #e6eaf2;
    box-shadow: none;
    background: #fff;
  }
  :deep(.el-input__inner) {
    font-size: 12px;
    color: #303133;
  }
}

.fullscreen-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid #e6eaf2;
  background: #fff;
  color: #606266;
  font-size: 12px;
  cursor: pointer;
  user-select: none;
}

.fullscreen-ico {
  font-size: 14px;
}

.legend-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 2px;
}

.legend-text {
  font-size: 12px;
  color: #606266;
}

.chart {
  width: 100%;
}

.chart-large {
  height: 280px;
}

.donut-area {
  position: relative;
  height: 260px;
}

.chart-donut {
  height: 100%;
}

.center-icon {
  position: absolute;
  left: 50%;
  top: 55%;
  transform: translate(-50%, -50%);
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #9bc3ff 0%, #2f7bff 55%, #1f66e8 100%);
  box-shadow: 0 10px 22px rgba(47, 123, 255, 0.25);
}

.center-icon::before,
.center-icon::after {
  content: '';
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 34px;
  height: 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.35);
}

.center-icon::before {
  top: 16px;
}

.center-icon::after {
  top: 30px;
  opacity: 0.28;
}
</style>
