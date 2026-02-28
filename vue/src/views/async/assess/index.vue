<template>
  <div class="implementation-assessment">
    <!-- Header -->
    <el-row class="header" align="middle" :gutter="15">
      <el-col :span="12">
        <div class="title">城市更新项目实施评估管理</div>
      </el-col>
      <el-col :span="6" class="control-col">
        <el-select v-model="year" placeholder="2023年度" class="control-item" size="default">
          <el-option label="2023年度" value="2023" />
        </el-select>
      </el-col>
      <el-col :span="6" class="control-col">
        <el-select v-model="area" placeholder="全部区域" class="control-item" size="default">
          <el-option label="全部区域" value="all" />
        </el-select>
      </el-col>
    </el-row>

    <!-- Top Stats Cards -->
    <el-row :gutter="15" class="top-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card" :body-style="{ padding: '15px' }">
          <div class="stat-content">
            <div class="stat-icon blue-bg">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">更新项目数量统计</div>
              <div class="stat-value">128</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card" :body-style="{ padding: '15px' }">
          <div class="stat-content">
            <div class="stat-icon green-bg">
              <el-icon><OfficeBuilding /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">更新项目规模统计</div>
              <div class="stat-value">456.8 <span class="unit">万㎡</span></div>
              <div class="stat-sub">总建设面积</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card" :body-style="{ padding: '15px' }">
          <div class="stat-info centered">
            <div class="stat-label">更新项目投资金额统计</div>
            <div class="stat-value">28.6 <span class="unit">亿元</span></div>
            <div class="stat-sub">总投资金额</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card" :body-style="{ padding: '15px' }">
          <div class="stat-header">
            <div class="stat-label warning-label">
              <el-icon class="warning-icon"><Warning /></el-icon> 预警项目统计
            </div>
            <el-button type="primary" size="small" class="check-btn" @click="openWarningDialog">查看</el-button>
          </div>
          <div class="stat-value red-text">24</div>
          <div class="stat-sub">
            需重点关注
            <span class="dots">
              <span class="dot blue"></span>
              <span class="dot orange"></span>
              <span class="dot red"></span>
            </span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Middle Progress Cards -->
    <el-row :gutter="15" class="progress-section">
      <!-- Card 1 -->
      <el-col :span="8">
        <el-card shadow="hover" class="progress-card" :body-style="{ padding: '15px' }">
          <div class="card-header">
            <span class="card-title">项目数量实施进度</span>
            <el-tag type="success" effect="light" class="status-tag" size="small">正常</el-tag>
          </div>
          <div class="progress-display">
            <div class="percentage">72.5%</div>
            <el-progress :percentage="72.5" :show-text="false" :stroke-width="12" color="#409EFF" />
          </div>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="label">已储备</div>
              <div class="value">128</div>
            </div>
            <div class="stat-item">
              <div class="label">已开工</div>
              <div class="value">102</div>
            </div>
            <div class="stat-item">
              <div class="label">已竣工</div>
              <div class="value">88</div>
            </div>
            <div class="stat-item">
              <div class="label">预警项目</div>
              <div class="value red">9</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <!-- Card 2 -->
      <el-col :span="8">
        <el-card shadow="hover" class="progress-card" :body-style="{ padding: '15px' }">
          <div class="card-header">
            <span class="card-title">建设规模实施进度</span>
            <el-tag type="success" effect="light" class="status-tag" size="small">正常</el-tag>
          </div>
          <div class="progress-display">
            <div class="percentage">72.8%</div>
            <el-progress :percentage="72.8" :show-text="false" :stroke-width="12" color="#E6A23C" />
          </div>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="label">计划规模</div>
              <div class="value">456.8万㎡</div>
            </div>
            <div class="stat-item">
              <div class="label">已开工</div>
              <div class="value">398.5万㎡</div>
            </div>
            <div class="stat-item">
              <div class="label">已竣工</div>
              <div class="value">332.5万㎡</div>
            </div>
            <div class="stat-item">
              <div class="label">预警规模</div>
              <div class="value red">52.3万㎡</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <!-- Card 3 -->
      <el-col :span="8">
        <el-card shadow="hover" class="progress-card" :body-style="{ padding: '15px' }">
          <div class="card-header">
            <span class="card-title">投资资金实施进度</span>
            <el-tag type="warning" effect="light" class="status-tag warning" size="small">预警</el-tag>
          </div>
          <div class="progress-display">
            <div class="percentage">65.3%</div>
            <el-progress :percentage="65.3" :show-text="false" :stroke-width="12" color="#67C23A" />
          </div>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="label">计划投资</div>
              <div class="value">28.6亿</div>
            </div>
            <div class="stat-item">
              <div class="label">已到位</div>
              <div class="value">25.2亿</div>
            </div>
            <div class="stat-item">
              <div class="label">已使用</div>
              <div class="value">18.7亿</div>
            </div>
            <div class="stat-item">
              <div class="label">预警资金</div>
              <div class="value red">6.5亿</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Bottom Charts Section -->
    <div class="charts-section">
      <el-card shadow="hover" :body-style="{ padding: '15px' }">
        <el-tabs v-model="activeTab" class="custom-tabs" @tab-change="handleTabChange">
          <el-tab-pane label="项目类型统计" name="type">
            <el-row :gutter="30">
              <el-col :span="12">
                <div class="chart-header">
                  <span class="chart-title">更新项目类型统计</span>
                  <el-dropdown trigger="click" size="small">
                    <span class="chart-filter">按数量 <el-icon><ArrowDown /></el-icon></span>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item>按数量</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
                <div ref="pieChartRef" class="chart-container"></div>
              </el-col>
              <el-col :span="12">
                <div class="chart-header">
                  <span class="chart-title">项目类型投资分布</span>
                  <el-dropdown trigger="click" size="small">
                    <span class="chart-filter">按投资金额 <el-icon><ArrowDown /></el-icon></span>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item>按投资金额</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
                <div ref="barChartRef" class="chart-container"></div>
              </el-col>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="分区域统计" name="area">
             <div class="chart-header">
               <span class="chart-title">分区域项目数量统计</span>
               <el-dropdown trigger="click" size="small">
                 <span class="chart-filter">地市 <el-icon><ArrowDown /></el-icon></span>
                 <template #dropdown>
                   <el-dropdown-menu>
                     <el-dropdown-item>地市</el-dropdown-item>
                   </el-dropdown-menu>
                 </template>
               </el-dropdown>
             </div>
             <div ref="areaChartRef" class="chart-container wide"></div>
          </el-tab-pane>
          <el-tab-pane label="预警项目统计" name="warning">
            <div class="chart-header">
               <span class="chart-title">分区域预警项目统计</span>
               <el-dropdown trigger="click" size="small">
                 <span class="chart-filter">地市 <el-icon><ArrowDown /></el-icon></span>
                 <template #dropdown>
                   <el-dropdown-menu>
                     <el-dropdown-item>地市</el-dropdown-item>
                   </el-dropdown-menu>
                 </template>
               </el-dropdown>
             </div>
             <div ref="warningChartRef" class="chart-container wide"></div>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>

    <!-- Warning Dialog -->
    <el-dialog v-model="dialogVisible" width="70%" class="warning-dialog" :show-close="false" :append-to-body="false">
      <template #header>
        <div class="dialog-header-custom">
          <span class="dialog-title">预警项目明细</span>
          <div class="header-actions">
            <el-input
              v-model="searchQuery"
              placeholder="搜索项目名称..."
              class="search-input"
              :prefix-icon="Search"
            />
            <el-button :icon="Refresh" circle class="action-btn" />
            <el-button :icon="Filter" circle class="action-btn" />
          </div>
        </div>
      </template>
      
      <el-table :data="paginatedWarningList" style="width: 100%" :header-cell-style="{ background: '#fff', color: '#606266', fontWeight: 'bold' }">
        <el-table-column label="项目名称" min-width="180">
          <template #default="scope">
            <div class="project-name-cell">
              <div class="icon-box" :style="{ backgroundColor: scope.row.color + '20', color: scope.row.color }">
                <el-icon><component :is="scope.row.icon" /></el-icon>
              </div>
              <span class="project-name">{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="预警类型" width="140">
          <template #default="scope">
            <div class="custom-tag" :class="scope.row.typeTag">
              {{ scope.row.type }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="plan" label="计划值" width="120" />
        <el-table-column prop="current" label="当前值" width="120" />
        <el-table-column prop="date" label="预警时间" width="140" />
        <el-table-column label="操作" width="80">
          <template #default>
            <el-button link type="primary" class="view-link">查看</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <span class="total-text">{{ paginationText }}</span>
        <el-pagination
          background
          layout="prev, pager, next"
          :total="warningList.length"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handleCurrentChange"
          class="pagination-right"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch, computed } from 'vue'
import * as echarts from 'echarts'
import { Document, OfficeBuilding, Warning, ArrowDown, Search, Refresh, Filter, School, Place, House } from '@element-plus/icons-vue'

const year = ref('2023')
const area = ref('all')
const activeTab = ref('type')

// Dialog
const dialogVisible = ref(false)
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(5)

const warningList = ref([
  { name: '城东新区商业综合体', type: '项目数量预警', plan: '15个', current: '8个', date: '2023-07-15', icon: 'OfficeBuilding', color: '#409EFF', typeTag: 'danger' },
  { name: '城南快速路改造工程', type: '投资资金预警', plan: '25亿元', current: '16亿元', date: '2023-07-10', icon: 'Place', color: '#E6A23C', typeTag: 'warning' },
  { name: '城西保障房建设项目', type: '建设规模预警', plan: '80万㎡', current: '52万㎡', date: '2023-07-05', icon: 'House', color: '#409EFF', typeTag: 'primary' },
  { name: '北区教育园区建设', type: '项目数量预警', plan: '10个', current: '4个', date: '2023-07-01', icon: 'School', color: '#67C23A', typeTag: 'danger' },
  { name: '市中心医院扩建工程', type: '投资资金预警', plan: '18亿元', current: '12亿元', date: '2023-06-28', icon: 'OfficeBuilding', color: '#b37feb', typeTag: 'warning' },
  { name: '滨河公园景观提升', type: '建设规模预警', plan: '50万㎡', current: '30万㎡', date: '2023-06-25', icon: 'Place', color: '#67C23A', typeTag: 'primary' },
  { name: '老旧小区燃气管道改造', type: '项目数量预警', plan: '100个', current: '60个', date: '2023-06-20', icon: 'House', color: '#F56C6C', typeTag: 'danger' },
  { name: '智慧城市数据中心', type: '投资资金预警', plan: '12亿元', current: '8亿元', date: '2023-06-15', icon: 'OfficeBuilding', color: '#409EFF', typeTag: 'warning' },
  { name: '文化宫修缮工程', type: '建设规模预警', plan: '10万㎡', current: '6万㎡', date: '2023-06-10', icon: 'School', color: '#E6A23C', typeTag: 'primary' },
  { name: '城市道路亮化工程', type: '项目数量预警', plan: '50条', current: '20条', date: '2023-06-05', icon: 'Place', color: '#b37feb', typeTag: 'danger' },
  { name: '地下管廊二期工程', type: '投资资金预警', plan: '30亿元', current: '15亿元', date: '2023-05-30', icon: 'OfficeBuilding', color: '#F56C6C', typeTag: 'warning' },
  { name: '社区养老服务中心', type: '建设规模预警', plan: '20万㎡', current: '12万㎡', date: '2023-05-25', icon: 'House', color: '#67C23A', typeTag: 'primary' },
  { name: '工业园区污水处理厂', type: '项目数量预警', plan: '5个', current: '2个', date: '2023-05-20', icon: 'Place', color: '#409EFF', typeTag: 'danger' },
  { name: '市民体育馆建设项目', type: '投资资金预警', plan: '8亿元', current: '5亿元', date: '2023-05-15', icon: 'School', color: '#E6A23C', typeTag: 'warning' },
  { name: '图书馆数字化改造', type: '建设规模预警', plan: '5万㎡', current: '3万㎡', date: '2023-05-10', icon: 'Document', color: '#b37feb', typeTag: 'primary' },
  { name: '便民市场提升改造', type: '项目数量预警', plan: '20个', current: '12个', date: '2023-05-05', icon: 'House', color: '#F56C6C', typeTag: 'danger' },
  { name: '环城绿道建设工程', type: '投资资金预警', plan: '6亿元', current: '3亿元', date: '2023-04-30', icon: 'Place', color: '#67C23A', typeTag: 'warning' },
])

const paginatedWarningList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return warningList.value.slice(start, end)
})

const paginationText = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value + 1
  const end = Math.min(currentPage.value * pageSize.value, warningList.value.length)
  return `显示 ${start} 至 ${end} 条，共 ${warningList.value.length} 条记录`
})

const handleCurrentChange = (val) => {
  currentPage.value = val
}

const openWarningDialog = () => {
  dialogVisible.value = true
}

const pieChartRef = ref(null)
const barChartRef = ref(null)
const areaChartRef = ref(null)
const warningChartRef = ref(null)

let pieChart = null
let barChart = null
let areaChart = null
let warningChart = null

const initCharts = () => {
  if (pieChartRef.value && !pieChart) {
    pieChart = echarts.init(pieChartRef.value)
    pieChart.setOption({
      tooltip: {
        trigger: 'item'
      },
      legend: {
        bottom: '0%',
        left: 'center',
        icon: 'circle',
        itemWidth: 8,
        itemHeight: 8,
        textStyle: {
          fontSize: 12, // 调整图例字体大小 (Adjust legend font size)
          color: '#666'
        }
      },
      series: [
        {
          name: '更新项目类型',
          type: 'pie',
          radius: ['45%', '65%'],
          center: ['50%', '40%'],
          avoidLabelOverlap: false,
          label: {
            show: true,
            position: 'center',
            formatter: '{total|128}\n{text|项目总数}',
            rich: {
              total: {
                fontSize: 24, // 调整中间数字字体大小 (Adjust center number font size)
                fontWeight: 'bold',
                color: '#333'
              },
              text: {
                fontSize: 14, // 调整中间文字字体大小 (Adjust center text font size)
                color: '#999',
                padding: [2, 0, 0, 0]
              }
            }
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 20, // 调整高亮字体大小 (Adjust emphasis font size)
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            { value: 19, name: '既有建筑改造 (19个)', itemStyle: { color: '#409EFF' } },
            { value: 23, name: '老旧小区改造 (23个)', itemStyle: { color: '#67C23A' } },
            { value: 15, name: '完整社区建设 (15个)', itemStyle: { color: '#E6A23C' } },
            { value: 13, name: '老旧街区改造 (13个)', itemStyle: { color: '#F56C6C' } },
            { value: 10, name: '老旧厂区改造 (10个)', itemStyle: { color: '#909399' } },
            { value: 9, name: '城中村改造 (9个)', itemStyle: { color: '#529b2e' } },
            { value: 12, name: '完善城市功能 (12个)', itemStyle: { color: '#e6a23c' } },
            { value: 27, name: '其他类型 (27个)', itemStyle: { color: '#909399' } }
          ]
        }
      ]
    })
  }

  if (barChartRef.value && !barChart) {
    barChart = echarts.init(barChartRef.value)
    barChart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '10%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: ['既有建筑改造', '老旧小区改造', '完整社区建设', '老旧街区改造', '其他类型'],
          axisTick: {
            alignWithLabel: true
          },
          axisLabel: {
            interval: 0,
            color: '#333',
            fontSize: 12 // 调整X轴字体大小 (Adjust X-axis font size)
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
          splitLine: {
            lineStyle: {
              type: 'dashed'
            }
          }
        }
      ],
      series: [
        {
          name: '投资金额',
          type: 'bar',
          barWidth: '35%',
          data: [
            { value: 17.5, itemStyle: { color: '#409EFF' }, label: { show: true, position: 'top', formatter: '{c}亿', fontSize: 12 } }, // 调整柱状图数值字体大小 (Adjust bar label font size)
            { value: 15.0, itemStyle: { color: '#529b2e' }, label: { show: true, position: 'top', formatter: '{c}亿', fontSize: 12 } },
            { value: 12.5, itemStyle: { color: '#E6A23C' }, label: { show: true, position: 'top', formatter: '{c}亿', fontSize: 12 } },
            { value: 10.0, itemStyle: { color: '#F56C6C' }, label: { show: true, position: 'top', formatter: '{c}亿', fontSize: 12 } },
            { value: 7.5, itemStyle: { color: '#909399' }, label: { show: true, position: 'top', formatter: '{c}亿', fontSize: 12 } }
          ]
        }
      ]
    })
  }
}

const initAreaChart = () => {
  if (areaChartRef.value && !areaChart) {
    areaChart = echarts.init(areaChartRef.value)
    areaChart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        top: '5%',
        right: '10%',
        itemWidth: 10,
        itemHeight: 10,
        data: ['已储备', '已开工项目', '已竣工项目'],
        textStyle: { fontSize: 14 } // 调整图例字体大小 (Adjust legend font size)
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: ['太原市', '大同市', '长治市', '晋中市', '阳泉市', '晋城市', '朔州市', '忻州市', '吕梁市', '临汾市', '运城市'],
        axisTick: { alignWithLabel: true },
        axisLabel: { interval: 0, color: '#333', fontSize: 13 } // 调整X轴字体大小 (Adjust X-axis font size)
      },
      yAxis: {
        type: 'value',
        max: 30,
        splitLine: { lineStyle: { type: 'dashed', color: '#eee' } }
      },
      series: [
        {
          name: '已竣工项目',
          type: 'bar',
          stack: 'total',
          barWidth: '50%',
          itemStyle: { color: '#2b73c4' },
          data: [14, 11, 11, 9, 7, 5, 4, 4, 3, 3, 1]
        },
        {
          name: '已开工项目',
          type: 'bar',
          stack: 'total',
          itemStyle: { color: '#8ac4f5' },
          data: [3, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1]
        },
        {
          name: '已储备',
          type: 'bar',
          stack: 'total',
          itemStyle: { color: '#e6e8eb' },
          label: {
            show: true,
            position: 'top',
            color: '#333',
            fontSize: 14, // 调整数值字体大小 (Adjust value font size)
            formatter: (params) => {
               const idx = params.dataIndex
               const total = [14, 11, 11, 9, 7, 5, 4, 4, 3, 3, 1][idx] + 
                             [3, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1][idx] + 
                             [3, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1][idx]
               return total
            }
          },
          data: [3, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1]
        }
      ]
    })
  } else if (areaChart) {
    areaChart.resize()
  }
}

const initWarningChart = () => {
  if (warningChartRef.value && !warningChart) {
    warningChart = echarts.init(warningChartRef.value)
    warningChart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        top: '5%',
        right: '10%',
        itemWidth: 10,
        itemHeight: 10,
        data: ['开工/竣工预警', '建设面积预警', '投资资金预警'],
        textStyle: { fontSize: 14 }, // 调整图例字体大小 (Adjust legend font size)
        // Use rect icon to match the image better
        icon: 'rect'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: ['太原市', '大同市', '长治市', '晋中市', '阳泉市', '晋城市', '朔州市', '忻州市', '吕梁市', '临汾市', '运城市'],
        axisTick: { alignWithLabel: true },
        axisLabel: { interval: 0, color: '#333', fontSize: 13 } // 调整X轴字体大小 (Adjust X-axis font size)
      },
      yAxis: {
        type: 'value',
        max: 12,
        splitLine: { lineStyle: { type: 'dashed', color: '#eee' } }
      },
      series: [
        {
          name: '开工/竣工预警',
          type: 'bar',
          barGap: 0, // Bars stick together
          barWidth: 12, // Narrow bars
          itemStyle: { color: '#F54E4E' }, // Red
          data: [3.2, 2.4, 2.4, 1.6, 3.2, 1.6, 0.8, 0.8, 0.8, 0.8, 0.8]
        },
        {
          name: '建设面积预警',
          type: 'bar',
          barWidth: 12,
          itemStyle: { color: '#F89D13' }, // Orange
          data: [2.4, 1.6, 1.6, 0.8, 1.6, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8]
        },
        {
          name: '投资资金预警',
          type: 'bar',
          barWidth: 12,
          itemStyle: { color: '#7B40F2' }, // Purple
          data: [1.6, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8]
        }
      ]
    })
  } else if (warningChart) {
    warningChart.resize()
  }
}

const handleTabChange = (tab) => {
  nextTick(() => {
    if (tab === 'type') {
      pieChart?.resize()
      barChart?.resize()
    } else if (tab === 'area') {
      initAreaChart()
    } else if (tab === 'warning') {
      initWarningChart()
    }
  })
}

onMounted(() => {
  nextTick(() => {
    initCharts()
  })
  window.addEventListener('resize', () => {
    pieChart?.resize()
    barChart?.resize()
    areaChart?.resize()
    warningChart?.resize()
  })
})
</script>

<style scoped lang="scss">
.implementation-assessment {
  padding: 15px; /* Reduced from 20px */
  background-color: #f5f7fa;
  min-height: 100vh;
}

.header {
  margin-bottom: 10px; /* Reduced from 20px */

  .title {
    font-size: 18px; /* Reduced from 20px */
    font-weight: bold;
    color: #333;
  }

  .control-col {
    display: flex;
    justify-content: flex-start;
  }

  .control-item {
    width: 120px; /* Reduced from 140px */
  }
}

.top-cards {
  margin-bottom: 15px; /* Reduced from 20px */

  .stat-card {
    height: 100px; /* Reduced from 140px */
    display: flex;
    flex-direction: column;
    justify-content: center;

    .stat-content {
      display: flex;
      align-items: center;
    }

    .stat-icon {
      width: 40px; /* Reduced from 48px */
      height: 40px;
      border-radius: 6px;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-right: 12px;
      
      &.blue-bg {
        background-color: #ecf5ff;
        color: #409EFF;
      }
      &.green-bg {
        background-color: #f0f9eb;
        color: #67C23A;
      }
      
      .el-icon {
        font-size: 20px; /* Reduced from 24px */
      }
    }

    .stat-info {
      &.centered {
        text-align: left; 
        padding-left: 8px;
      }
    }

    .stat-label {
      font-size: 12px; /* Reduced from 14px */
      color: #666;
      margin-bottom: 4px;
      
      &.warning-label {
        display: flex;
        align-items: center;
        color: #F56C6C;
        
        .warning-icon {
          margin-right: 4px;
        }
      }
    }

    .stat-value {
      font-size: 24px; /* Reduced from 28px */
      font-weight: bold;
      color: #333;
      line-height: 1.1;
      
      .unit {
        font-size: 12px;
        font-weight: normal;
        color: #666;
      }
      
      &.red-text {
        color: #F56C6C;
      }
    }

    .stat-sub {
      font-size: 11px; /* Reduced from 12px */
      color: #999;
      margin-top: 4px;
      
      .dots {
        margin-left: 8px;
        .dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          margin-right: 2px;
          
          &.blue { background-color: #409EFF; }
          &.orange { background-color: #E6A23C; }
          &.red { background-color: #F56C6C; }
        }
      }
    }

    .stat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }

    .check-btn {
      padding: 3px 8px;
      height: auto;
      font-size: 11px;
    }
  }
}

.progress-section {
  margin-bottom: 15px;

  .progress-card {
    height: 240px; /* 调整这里的高度数值来改变卡片高度 (Adjust this value to change card height) */
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      
      .card-title {
        font-weight: bold;
        font-size: 14px; /* Reduced from 16px */
      }
    }

    .progress-display {
      text-align: center;
      margin-bottom: 15px;
      
      .percentage {
        font-size: 26px; /* Reduced from 32px */
        font-weight: bold;
        margin-bottom: 8px;
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px; /* Increased gap */
      
      .stat-item {
        display: flex;
        flex-direction: column; /* Stack vertically */
        align-items: flex-start; /* Left align */
        font-size: 11px;
        
        .label {
          color: #999;
          margin-bottom: 2px;
        }
        
        .value {
          font-weight: bold;
          color: #333;
          font-size: 13px; /* Slightly larger for value */
          
          &.red {
            color: #F56C6C;
          }
        }
      }
    }
  }
}

.charts-section {
  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    
    .chart-title {
      font-weight: bold;
      font-size: 14px; /* Reduced from 16px */
    }
    
    .chart-filter {
      font-size: 11px;
      color: #999;
      cursor: pointer;
      display: flex;
      align-items: center;
      
      .el-icon {
        margin-left: 4px;
      }
    }
  }

  .chart-container {
    height: 280px; /* Reduced from 350px */
    
    &.wide {
      width: 100%;
    }
  }
  
  .placeholder {
    height: 250px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #999;
  }
}

:deep(.warning-dialog) {
  border-radius: 8px;
  
  .el-dialog__header {
    margin-right: 0;
    padding: 20px 30px 10px;
    border-bottom: none;
  }
  
  .el-dialog__body {
    padding: 10px 30px 30px;
  }

  .dialog-header-custom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    
    .dialog-title {
      font-size: 18px;
      font-weight: bold;
      color: #333;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .search-input {
        width: 240px;
        
        .el-input__wrapper {
          border-radius: 20px;
          background-color: #f5f7fa;
          box-shadow: none;
          
          &:hover, &.is-focus {
            background-color: #fff;
            box-shadow: 0 0 0 1px #409EFF inset;
          }
        }
      }
      
      .action-btn {
        border: 1px solid #dcdfe6;
        color: #606266;
        &:hover {
          color: #409EFF;
          border-color: #c6e2ff;
          background-color: #ecf5ff;
        }
      }
    }
  }

  .project-name-cell {
    display: flex;
    align-items: center;
    
    .icon-box {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-right: 12px;
      font-size: 18px;
    }
    
    .project-name {
      font-weight: 500;
      color: #333;
    }
  }

  .custom-tag {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 15px;
    font-size: 12px;
    font-weight: 500;
    
    &.danger {
      background-color: #fff1f0;
      color: #f56c6c;
      border: 1px solid #ffccc7;
    }
    
    &.warning {
      background-color: #fdf6ec;
      color: #e6a23c;
      border: 1px solid #fcebe0;
    }
    
    &.primary {
      background-color: #ecf5ff;
      color: #409eff;
      border: 1px solid #d9ecff;
    }
  }

  .view-link {
    font-size: 13px;
    color: #606266;
    text-decoration: underline;
    
    &:hover {
      color: #409EFF;
    }
  }

  .pagination-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 25px;
    
    .total-text {
      color: #909399;
      font-size: 13px;
    }
    
    .el-pagination {
      --el-pagination-bg-color: #fff;
      --el-pagination-button-disabled-bg-color: #fff;
      
      .el-pager li {
        border: 1px solid #dcdfe6;
        background-color: #fff;
        border-radius: 4px;
        margin: 0 4px;
        font-weight: normal;
        
        &.is-active {
          background-color: #409EFF;
          color: #fff;
          border-color: #409EFF;
        }
        
        &:hover:not(.is-active) {
          color: #409EFF;
        }
      }
      
      .btn-prev, .btn-next {
        border: 1px solid #dcdfe6;
        background-color: #fff;
        border-radius: 4px;
        padding: 0 6px;
        
        &:disabled {
          background-color: #f5f7fa;
        }
      }
    }
  }
}
</style>
