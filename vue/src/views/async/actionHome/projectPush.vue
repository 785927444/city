<template>
  <div class="push-library-container">
    <div class="layout-row">
      <div class="left-panel">
        <div class="filter-card bg-white rad8 p8 mb15">
          <el-form :inline="true" :model="filters" class="filter-form">
            <el-form-item label="项目周期">
              <el-date-picker v-model="filters.period" type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 240px" />
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
            <el-form-item label="总投资金额">
              <el-select v-model="filters.investment" placeholder="5千万以上" style="width: 140px">
                <el-option label="5千万以上" value="5千万以上" />
                <el-option label="1亿以上" value="1亿以上" />
                <el-option label="2亿以上" value="2亿以上" />
              </el-select>
            </el-form-item>
            <el-form-item label="项目类型">
              <el-select v-model="filters.type" placeholder="加强既有建筑改造" style="width: 200px">
                <el-option label="加强既有建筑改造" value="加强既有建筑改造" />
                <el-option label="完善社区服务设施" value="完善社区服务设施" />
                <el-option label="改善人居环境" value="改善人居环境" />
              </el-select>
            </el-form-item>
            <el-form-item label="项目名称">
              <el-input v-model="filters.keyword" placeholder="请输入" style="width: 180px" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" class="search-btn">搜索</el-button>
            </el-form-item>
          </el-form>
        </div>

        <div class="list-card layout-col flex1 bg-white rad8 p8">
          <div class="ww100 flex-sc p8">
            <div class="flex-sc fw f16 tc">
              <div class="mr40 cursor flex-col-cc relative" @click="activeTab = 'pending'">
                <span class="mb5">待审核</span>
                <span class="ww100 h3 rad10" :class="activeTab === 'pending' ? 'bgi2' : 'black-rgba0'"></span>
              </div>
              <div class="mr40 cursor flex-col-cc relative" @click="activeTab = 'recommended'">
                <span class="mb5">推送库</span>
                <span class="ww100 h3 rad10" :class="activeTab === 'recommended' ? 'bgi2' : 'black-rgba0'"></span>
              </div>
              <div class="mr40 cursor flex-col-cc relative" @click="activeTab = 'rejected'">
                <span class="mb5">已退回</span>
                <span class="ww100 h3 rad10" :class="activeTab === 'rejected' ? 'bgi2' : 'black-rgba0'"></span>
              </div>
            </div>
            <div class="flex-ec flex1">
              <div class="rad4 ptb5 plr12 flex-cc cursor bg-white c8 bo-cc-1 ml15" @click="onToggleAll">全选</div>
              <div class="rad4 ptb5 plr12 flex-cc cursor bgi1 white bo-i1-1 ml15">提醒</div>
            </div>
          </div>

          <div class="table flex-sc warp">
            <div class="ww25 cursor p8" v-for="item in pagedList" :key="item.id">
              <div class="ww100 bs bo-i16-1 relative rad8 project-card" @click.stop="toggleCard(item)">
                <div class="ww100 flex-sc p12 bob-ce-1">
                  <span class="f15 line1">{{ item.name }}</span>
                  <span class="flex1 flex-ec">
                    <span class="w28 h28 tc lh28 rad6 ml10 white f14" :class="item.checked ? 'bgi1 bo-i1-1' : 'bo-cc-1 bg-white c8'">
                      <i-ep-check v-if="item.checked" />
                    </span>
                  </span>
                </div>
                <div class="ww100 flex-col p12 c6">
                  <div class="ww100 flex-sc">
                    <span class="w110">所属地区</span>
                    <span class="flex1 line1">{{ item.region }}</span>
                  </div>
                  <div class="ww100 flex-sc mt10">
                    <span class="w110">项目周期</span>
                    <span class="flex1 line1">{{ item.period }}</span>
                  </div>
                  <div class="ww100 flex-sc mt10">
                    <span class="w110">投资估算</span>
                    <span class="flex1 line1">{{ item.investment }}</span>
                  </div>
                  <div class="ww100 flex-sc mt10">
                    <span class="w110">项目性质</span>
                    <span class="flex1 line1">{{ item.nature }}</span>
                  </div>
                  <div class="ww100 flex-sc mt10">
                    <div class="flex-sc flex1">
                      <span class="w110">更新进度时间</span>
                      <span class="flex1 line1">{{ item.updateTime }}</span>
                    </div>
                  </div>
                </div>
                <div class="project-card-actions">
                  <div class="rad5 ptb5 plr12 cursor bgi1 white" @click.stop="onApprove(item)">审批</div>
                </div>
              </div>
            </div>
          </div>

          <div class="pagination">
            <el-pagination
              background
              layout="prev, pager, next"
              :total="filteredList.length"
              :page-size="pageSize"
              :current-page="currentPage"
              @current-change="handlePageChange"
            />
          </div>
        </div>
      </div>

      <div class="right-panel ml15">
        <div class="quick-actions">
          <div class="quick-card">项目台账</div>
          <div class="quick-card">项目实施跟踪</div>
        </div>

        <div class="bg-white rad8 p15 mb15 right-card">
          <div class="chart-title">项目实施情况</div>
          <div class="ring-wrap">
            <div class="ring">
              <span>50%</span>
            </div>
          </div>
          <div class="ring-info">
            <div>共<span class="highlight">51</span>个上报项目</div>
            <div>处于推进中状态</div>
          </div>
        </div>

        <div class="bg-white rad8 p15 right-card">
          <div class="chart-title">项目分布情况</div>
          <div class="legend">
            <span class="legend-item"><span class="dot blue"></span>实施中项目</span>
            <span class="legend-item"><span class="dot cyan"></span>深规中项目</span>
          </div>
          <div ref="barChartRef" class="bar-chart"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import { toPath } from '@/utils/common'

const filters = reactive({
  period: [],
  city: '太原市',
  district: '小店区',
  stage: '储备阶段',
  investment: '5千万以上',
  type: '加强既有建筑改造',
  keyword: ''
})

const activeTab = ref<'pending' | 'recommended' | 'rejected'>('pending')
const selectAll = ref(false)
const pageSize = ref(9)
const currentPage = ref(1)

const list = ref([
  { id: 1, name: '龙城片区旧城改造项目', region: '太原市-小店区', period: '2026-2028', investment: '12000万元', nature: '新建', updateTime: '2025-12-12', status: 'pending', checked: false },
  { id: 2, name: '迎泽区老旧小区提升项目', region: '太原市-迎泽区', period: '2026-2028', investment: '12000万元', nature: '新建', updateTime: '2025-12-12', status: 'pending', checked: false },
  { id: 3, name: '杏花岭区片区更新项目', region: '太原市-杏花岭区', period: '2026-2028', investment: '12000万元', nature: '新建', updateTime: '2025-12-12', status: 'pending', checked: false },
  { id: 4, name: '万柏林区综合整治项目', region: '太原市-万柏林区', period: '2026-2028', investment: '12000万元', nature: '新建', updateTime: '2025-12-12', status: 'pending', checked: false },
  { id: 5, name: '晋源区道路提升项目', region: '太原市-晋源区', period: '2026-2028', investment: '12000万元', nature: '新建', updateTime: '2025-12-12', status: 'recommended', checked: false },
  { id: 6, name: '尖草坪区街区改造项目', region: '太原市-尖草坪区', period: '2026-2028', investment: '12000万元', nature: '新建', updateTime: '2025-12-12', status: 'recommended', checked: false },
  { id: 7, name: '清徐县城中村改造项目', region: '太原市-清徐县', period: '2026-2028', investment: '12000万元', nature: '新建', updateTime: '2025-12-12', status: 'pending', checked: false },
  { id: 8, name: '阳曲县片区更新项目', region: '太原市-阳曲县', period: '2026-2028', investment: '12000万元', nature: '新建', updateTime: '2025-12-12', status: 'pending', checked: false },
  { id: 9, name: '娄烦县旧城改造项目', region: '太原市-娄烦县', period: '2026-2028', investment: '12000万元', nature: '新建', updateTime: '2025-12-12', status: 'rejected', checked: false },
  { id: 10, name: '古交市片区更新项目', region: '太原市-古交市', period: '2026-2028', investment: '12000万元', nature: '新建', updateTime: '2025-12-12', status: 'pending', checked: false },
  { id: 11, name: '龙城片区配套完善项目', region: '太原市-小店区', period: '2026-2028', investment: '12000万元', nature: '新建', updateTime: '2025-12-12', status: 'recommended', checked: false },
  { id: 12, name: '迎泽区基础设施提升项目', region: '太原市-迎泽区', period: '2026-2028', investment: '12000万元', nature: '新建', updateTime: '2025-12-12', status: 'pending', checked: false }
])

const barData = ref([
  { name: '太原-大营区', blue: 190, cyan: 171 },
  { name: '古交市', blue: 100, cyan: 185 },
  { name: '娄烦县', blue: 200, cyan: 148 },
  { name: '阳曲县', blue: 100, cyan: 219 },
  { name: '清徐县', blue: 150, cyan: 141 }
])

const barChartRef = ref()
let barChart: any = null

const filteredList = computed(() => list.value.filter(item => item.status === activeTab.value))

const pagedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredList.value.slice(start, start + pageSize.value)
})

const handlePageChange = (page: number) => {
  currentPage.value = page
}

const toggleAll = () => {
  pagedList.value.forEach(item => { item.checked = selectAll.value })
}

const onToggleAll = () => {
  selectAll.value = !selectAll.value
  toggleAll()
}

const toggleCard = (item: { checked: boolean }) => {
  item.checked = !item.checked
}

const onApprove = (item: { id: number; name: string }) => {
  toPath('/project-push/apply', { demo: 1, name: item.name, id: item.id })
}

const renderBarChart = async () => {
  await nextTick()
  const dom = barChartRef.value
  if (!dom) return
  if (barChart) {
    barChart.dispose()
    barChart = null
  }
  barChart = echarts.init(dom)
  const rows = barData.value || []
  const names = rows.map((r) => r.name)
  const dataBlue = rows.map((r) => r.blue)
  const dataCyan = rows.map((r) => r.cyan)
  barChart.setOption({
    grid: { left: 60, right: 20, top: 10, bottom: 20, containLabel: true },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: { type: 'value', splitLine: { lineStyle: { color: '#e5e7eb' } } },
    yAxis: { type: 'category', data: names, axisTick: { show: false } },
    series: [
      { name: '实施中项目', type: 'bar', data: dataBlue, barWidth: 10, itemStyle: { color: '#2b5cff' } },
      { name: '深规中项目', type: 'bar', data: dataCyan, barWidth: 10, itemStyle: { color: '#56c2e6' } }
    ]
  })
}

onMounted(() => {
  renderBarChart()
  window.addEventListener('resize', renderBarChart)
})

watch(barData, () => {
  renderBarChart()
}, { deep: true })

onBeforeUnmount(() => {
  window.removeEventListener('resize', renderBarChart)
  if (barChart) {
    barChart.dispose()
    barChart = null
  }
})
</script>

<style scoped lang="scss">
.push-library-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.left-panel {
  flex: 1 1 0;
  min-width: 0;
}

.right-panel {
  width: 420px;
  flex: 0 0 420px;
}

.right-card {
  min-height: 260px;
}

.remind-btn {
  background: #2b5cff;
  border-color: #2b5cff;
}

.project-card {
  line-height: 20px;
  color: rgba(16, 16, 16, 1);
  font-size: 14px;
  font-family: -regular;
  padding-bottom: 44px;
}

.project-reserve-btn {
  position: absolute;
  right: 12px;
  bottom: 12px;
}

.project-card-actions {
  position: absolute;
  right: 12px;
  bottom: 12px;
  display: flex;
  gap: 8px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 15px;
}

.quick-card {
  background: #fff;
  border-radius: 8px;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
  color: #303133;
}

.chart-title {
  
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 10px;
}

.ring-wrap {
  display: flex;
  justify-content: center;
  margin: 12px 0;
}

.ring {
  width: 104px;
  height: 104px;
  border-radius: 50%;
  background: conic-gradient(#2b5cff 0% 50%, #e6ebf5 50% 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2b5cff;
  font-weight: 700;
}

.ring-info {
  text-align: center;
  font-size: 12px;
  color: #606266;
}

.highlight {
  color: #2b5cff;
  font-weight: 700;
  margin: 0 4px;
}

.legend {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #606266;
  margin-bottom: 10px;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.dot.blue {
  background: #2b5cff;
}

.dot.cyan {
  background: #56c2e6;
}

.bar-chart {
  height: 300px;
  width: 100%;
}
</style>
