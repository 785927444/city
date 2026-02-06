<template>
  <div class="plan-track-container">
    <div class="breadcrumb">首页 / 年度计划跟踪</div>
    <el-card class="filter-card">
      <el-form :inline="true" :model="filters">
        <el-form-item label="年度">
          <el-select v-model="filters.year" placeholder="请选择" style="width: 120px">
            <el-option v-for="y in years" :key="y" :label="y + '年'" :value="y" />
          </el-select>
        </el-form-item>
        <el-form-item label="行政区">
          <el-select v-model="filters.city" placeholder="请选择" style="width: 150px">
            <el-option label="山西省" value="山西省" />
            <el-option label="太原市" value="太原市" />
            <el-option label="大同市" value="大同市" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="refresh">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-title">计划项目个数</div>
          <div class="stat-value">{{ stats.projectCount }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-title">计划建设规模</div>
          <div class="stat-value">{{ stats.planScale }}亩</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-title">计划投资总额</div>
          <div class="stat-value">{{ stats.totalInvestment }}亿元</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-title">投资完成率</div>
          <div class="stat-value">{{ stats.completionRate }}%</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="chart-row">
      <el-col :span="12">
        <el-card>
          <template #header><div class="chart-title">年度投资金额趋势</div></template>
          <div id="Line_investTrend" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header><div class="chart-title">项目类型饼图</div></template>
          <div id="Pie_projectType" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="chart-row">
      <el-col :span="12">
        <el-card>
          <template #header><div class="chart-title">年度计划拟交叉分析图</div></template>
          <div id="Bar_cityAnalysis" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header><div class="chart-title">项目金额饼图</div></template>
          <div id="Pie_amount" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
 </template>

 <script setup lang="ts">
 import { reactive, ref, onMounted, getCurrentInstance, nextTick } from 'vue'
 import ec from '@/utils/chart'

 const { drawChart } = ec()
 const { proxy } = getCurrentInstance() as any
 const publicStore = proxy.publicStore()

 const filters = reactive({
   year: new Date().getFullYear(),
   city: '山西省'
 })
 const years = ref<number[]>([])
 const stats = reactive({
   projectCount: 0,
   planScale: 0,
   totalInvestment: 0,
   completionRate: 0
 })

 const initYears = () => {
   const y = new Date().getFullYear()
   years.value = [y-9,y-8,y-7,y-6,y-5,y-4,y-3,y-2,y-1,y]
 }

 const loadStats = async () => {
   const args = []
   if (filters.year) args.push(`plan_year='${filters.year}'`)
   if (filters.city) args.push(`city_name='${filters.city}'`)
   const where = args.length ? args.join(' AND ') : '1=1'
   const res = await publicStore.http({
     Api: {
       model: 't_annual_plan_report',
       args: where,
       field: 'count(1) as cnt, sum(project_count) as proj_cnt, sum(investment_amount) as invest_sum',
       page: 1,
       limit: 1
     }
   })
   const row = Array.isArray(res) ? res[0] : (res && res.list && res.list[0]) || {}
   stats.projectCount = Number(row?.proj_cnt || 133)
   stats.planScale = Number(stats.projectCount) * 0.62
   stats.totalInvestment = Math.floor((Number(row?.invest_sum || 24900) / 100)) / 100
   stats.completionRate = 87.2
 }

 const renderCharts = async () => {
   const trendData = {
     x: ['2016年','2017年','2018年','2019年','2020年','2021年','2022年','2023年','2024年','2025年'],
     y: [22,30,31.4,28,75,60,46,28,36,29]
   }
   drawChart('Line', 'Line_investTrend',
     { legendArr: ['投资金额'], y_name: '亿元', tool_name_x: '年份', tool_name_y: '投资金额', tool_dw: '亿元' },
    { series: [{ data: trendData.x.map((x, i) => [x, trendData.y[i]]) }] },
     {}
   )

  drawChart('Pie', 'Pie_projectType',
    null,
    [{ name: '城市更新品质提升', value: 40 }, { name: '老旧小区改造', value: 20 }, { name: '完善社区服务设施', value: 20 }, { name: '历史风貌保护', value: 20 }],
    { name: '项目类型' }
  )

   const cityData = [
     { name: '晋城市', count: 33, amount: 45 },
     { name: '临汾市', count: 45, amount: 60 },
     { name: '太原市', count: 60, amount: 80 },
     { name: '长治市', count: 50, amount: 70 },
     { name: '大同市', count: 40, amount: 65 },
     { name: '忻州市', count: 28, amount: 54 },
     { name: '运城市', count: 30, amount: 56 },
     { name: '朔州市', count: 26, amount: 52 },
     { name: '吕梁市', count: 22, amount: 48 }
   ]
   drawChart('Bar', 'Bar_cityAnalysis',
     { legendArr: ['项目数量','计划投资金额'], tool_name_x: '城市', tool_name_y: '数量/金额', labelShow: false },
    { series: [
      { data: cityData.map(d => [d.name, d.count]) },
      { data: cityData.map(d => [d.name, d.amount]) }
    ]},
     {}
   )

  drawChart('Pie', 'Pie_amount',
    null,
    [{ name: '已完成投资金额', value: 20 }, { name: '待投资金额', value: 30 }],
    { name: '项目金额' }
  )
 }

 const refresh = async () => {
   await loadStats()
   await nextTick()
   await renderCharts()
 }

 onMounted(async () => {
   initYears()
   await refresh()
 })
 </script>

 <style scoped lang="scss">
 .plan-track-container {
   padding: 20px;
   background-color: #f5f7fa;
   min-height: 100vh;
 }
 .breadcrumb { margin-bottom: 10px; color: #606266; }
 .filter-card { margin-bottom: 16px; }
 .stats-row { margin-bottom: 16px; }
 .stat-card { text-align: center; }
 .stat-title { color: #909399; font-size: 14px; }
 .stat-value { font-size: 22px; font-weight: 700; color: #303133; }
 .chart-row { margin-bottom: 16px; }
 .chart-title { font-weight: 700; color: #303133; }
 .chart { height: 280px; }
 </style>
