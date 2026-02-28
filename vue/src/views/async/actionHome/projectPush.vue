<template>
  <div class="layout-col">
    <aa-title title="">
      <template #left-content>
        <div class="flex-sc flex4 hidden warp">
          <div class="flex-sc mr30">
            <span class="mr10">项目周期</span>
            <span class="w50x6 flex-sc">
              <el-date-picker v-model="filters.period" size="large" type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 100%" />
            </span>
          </div>
          <div class="flex-sc mr30">
            <span class="mr10">所属地区</span>
            <span class="w50x6 flex-sc">
              <el-cascader v-model="filters.area" size="large" :options="getAreaDataByCode(state.code)" :props="state.cascaderProps" separator="/" placeholder="请选择" clearable style="width: 100%" />
            </span>
          </div>
          <div class="flex-sc pr30">
            <span class="mr10">项目阶段</span>
            <span class="w50x4 flex-sc hidden">
              <el-select size="large" v-model="filters.stage" placeholder="储备阶段" style="width: 100%" filterable clearable>
                <el-option label="储备阶段" value="储备阶段" />
                <el-option label="实施阶段" value="实施阶段" />
                <el-option label="完工阶段" value="完工阶段" />
              </el-select>
            </span>
          </div>
          <div class="flex-sc pr30">
            <span class="mr10">投资金额</span>
            <span class="w50x4 flex-sc hidden">
              <el-select size="large" v-model="filters.investment" placeholder="5千万以上" style="width: 100%" filterable clearable>
                <el-option label="5千万以上" value="5千万以上" />
                <el-option label="1亿以上" value="1亿以上" />
                <el-option label="2亿以上" value="2亿以上" />
              </el-select>
            </span>
          </div>
          <div class="flex-sc pr30 mt10">
            <span class="mr10">项目类型</span>
            <span class="w50x6 flex-sc hidden">
              <el-select size="large" v-model="filters.type" placeholder="加强既有建筑改造" style="width: 100%" filterable clearable>
                <el-option label="加强既有建筑改造" value="加强既有建筑改造" />
                <el-option label="完善社区服务设施" value="完善社区服务设施" />
                <el-option label="改善人居环境" value="改善人居环境" />
              </el-select>
            </span>
          </div>
          <div class="flex-sc pr30 mt10">
            <span class="mr10">项目名称</span>
            <span class="w50x4 flex-sc hidden">
              <el-input size="large" v-model="filters.keyword" style="width: 100%" placeholder="请输入" />
            </span>
          </div>
          <div class="rad4 ptb10 plr12 flex-cc cursor bgi1 white" @click.stop="init">
            <i-ep-search class="f12 fw" /><span class="f14 ml5">搜索</span>
          </div>
        </div>
      </template>
      <template #right-content></template>
    </aa-title>

    <div class="layout-col bg-white rad8 p8">
      <div class="ww100 flex-sc p8">
        <div class="flex-sc fw f16 tc">
          <div class="mr40 cursor flex-col-cc relative" @click="activeTab = 'pending'">
            <span class="mb5">待审核</span>
            <span class="ww100 h3 rad10" :class="activeTab === 'pending' ? 'bgi2' : 'black-rgba0'"></span>
          </div>
          <div class="mr40 cursor flex-col-cc relative" @click="activeTab = 'recommended'">
            <span class="mb5">{{ recommendedTabTitle }}</span>
            <span class="ww100 h3 rad10" :class="activeTab === 'recommended' ? 'bgi2' : 'black-rgba0'"></span>
          </div>
          <div class="mr40 cursor flex-col-cc relative" @click="activeTab = 'rejected'" v-if="configStore.user.role_id != '2'">
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
          <div class="ww100 bs bo-i16-1 relative rad8 project-card" @click.stop="onViewDetail(item)">
            <div class="ww100 flex-sc p12 bob-ce-1">
              <el-popover title="" width="300" placement="bottom-start">
                <template #default>
                  <div class="problem-content f16"><div class="hh100 flex-col">{{ item.name }}</div></div>
                </template>
                <template #reference>
                  <span class="flex1 f15 line1">{{ item.name }}</span>
                </template>
              </el-popover>
              <span class="flex-ec">
                <span class="w18 h18 tc lh18 rad3 ml10 white f12" :class="item.checked ? 'bgi1 bo-i1-1' : 'bo-cc-1'" @click.stop="toggleCard(item)">
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

              <div v-if="activeTab === 'recommended' && (configStore.user.role_id == '3' || configStore.user.role_id == '4')" class="mt10 pt10" style="border-top: 1px solid #eee;">
                <div class="flex-sc tc">
                  <div class="flex1 flex-col">
                    <span class="f14 c9 mb5">区级</span>
                    <span class="f14" :class="getAuditStatusColor(item, 'district')">{{ getAuditStatusText(item, 'district') }}</span>
                  </div>
                  <div class="flex1 flex-col">
                    <span class="f14 c9 mb5">市级</span>
                    <span class="f14" :class="getAuditStatusColor(item, 'city')">{{ getAuditStatusText(item, 'city') }}</span>
                  </div>
                  <div class="flex1 flex-col">
                    <span class="f14 c9 mb5">省级</span>
                    <span class="f14" :class="getAuditStatusColor(item, 'province')">{{ getAuditStatusText(item, 'province') }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="project-card-actions" v-if="activeTab === 'pending' || activeTab === 'rejected'">
              <div class="rad5 ptb5 plr12 cursor bgi1 white" @click.stop="handleAudit(item)">{{ activeTab === 'pending' ? '审核' : '处理' }}</div>
            </div>
          </div>
        </div>
      </div>

      <Pagination
        v-show="filteredList.length > 0"
        :total="filteredList.length"
        v-model:page="currentPage"
        v-model:limit="pageSize"
        @pagination="handlePagination"
      />
    </div>
  </div>
  <el-dialog v-model="auditDialogVisible" title="项目审核" width="500px">
    <el-form :model="auditForm">
      <el-form-item label="审核结果说明">
        <el-input v-model="auditForm.result" type="textarea" :rows="3" placeholder="请输入审核意见" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="submitAudit(2)" type="danger">驳回</el-button>
        <el-button @click="submitAudit(1)" type="primary">通过</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted, onBeforeUnmount, watch, nextTick, getCurrentInstance } from 'vue'
import * as echarts from 'echarts'
import { toPath } from '@/utils/common'
import { getAreaDataByCode } from '@/utils/areaData'

const { proxy }: any = getCurrentInstance()
const publicStore = proxy.publicStore()
const configStore = proxy.configStore()

const filters = reactive({
  period: [],
  area: [],
  stage: '',
  investment: '',
  type: '',
  keyword: ''
})

const activeTab = ref<'pending' | 'recommended' | 'rejected'>('pending')
const selectAll = ref(false)
const pageSize = ref(15)
const currentPage = ref(1)

const list = ref([])

const implementationRate = computed(() => {
  if (list.value.length === 0) return 0
  const inProgress = list.value.filter(item => item.completion_status == '2').length
  return Math.round((inProgress / list.value.length) * 100)
})

const recommendedTabTitle = computed(() => {
  const roleId = configStore.user.role_id
  if (roleId == '3' || roleId == '4') {
    return '审核进展'
  }
  return '推送库'
})

const state = reactive({
  code: '',
  cascaderProps: {
    value: 'code',
    label: 'name',
    children: 'children',
    expandTrigger: 'hover',
    checkStrictly: false,
  }
})

const getInit = async() => {
  if(configStore.user.role_id == '2') {
    state.code = configStore.user.province
    state.cascaderProps.checkStrictly = true
  }
  if(configStore.user.role_id == '3') state.code = configStore.user.city
  if(configStore.user.role_id == '4') state.code = configStore.user.district
}

const buildRoleArgs = () => {
  const { role_id, province, city, district } = configStore.user
  
  if(role_id == '2') {
    // 省级：看 construct_main_province 或 province
    // 且 (下级(市级)项目必须市级已通过 OR 是省级自建项目)
    return `(construct_main_province='${province}' or province='${province}') AND ((construct_main_city IS NOT NULL AND construct_main_city != '' AND push_status2='1') OR (construct_main_city IS NULL OR construct_main_city = ''))`
  }
  if(role_id == '3') {
    // 市级：看 construct_main_city 或 city
    // 且 (下级(区级)项目必须区级已通过 OR 是市级自建项目)
    return `(construct_main_city='${city}' or city='${city}') AND ((construct_main_district IS NOT NULL AND construct_main_district != '' AND push_status='1') OR (construct_main_district IS NULL OR construct_main_district = ''))`
  }
  if(role_id == '4') {
    // 区级：只要 construct_main_district 或 district 匹配即可
    return `(construct_main_district='${district}' or district='${district}')`
  }
  return "1=1"
}

const buildFilterArgs = () => {
  let args = buildRoleArgs()
  // 排除未推送的项目 (push_status = '-1')
  args += ` AND (push_status != '-1' OR push_status IS NULL)`
  
  // 暂时屏蔽搜索栏功能，仅保留基础的角色过滤，确保能查到数据
  /*
  if(filters.area && filters.area.length > 0) {
    if(filters.area[0]) args += ` and (construct_main_province='${filters.area[0]}' or province='${filters.area[0]}')`
    if(filters.area[1]) args += ` and (construct_main_city='${filters.area[1]}' or city='${filters.area[1]}')`
    if(filters.area[2]) args += ` and (construct_main_district='${filters.area[2]}' or district='${filters.area[2]}')`
  }
  if (filters.keyword) {
    args += ` and name like '%${filters.keyword}%'`
  }
  if (filters.period && filters.period.length === 2) {
    args += ` and construct_datetime_start >= '${filters.period[0]}' and construct_datetime_end <= '${filters.period[1]}'`
  }
  if (filters.stage) {
    if (filters.stage === '储备阶段') args += ` and completion_status='1'`
    if (filters.stage === '实施阶段') args += ` and completion_status='2'`
    if (filters.stage === '完工阶段') args += ` and completion_status='3'`
  }
  if (filters.investment) {
    if (filters.investment === '5千万以上') args += ` and construct_price >= 5000`
    if (filters.investment === '1亿以上') args += ` and construct_price >= 10000`
    if (filters.investment === '2亿以上') args += ` and construct_price >= 20000`
  }
  if (filters.type) {
    args += ` and (construct_nature like '%${filters.type}%' or project_type like '%${filters.type}%')`
  }
  */
  return args
}

const init = async () => {
  let model = 't_project_report'
  // 增加 limit 确保能拿到足够的数据
  let query = { model: model, args: buildFilterArgs(), limit: 5000 }
  let res = await publicStore.http({ Api: query })
  if (!proxy.isNull(res)) {
    // 按更新时间降序排列，确保最新的排在前面
    res.sort((a: any, b: any) => {
      const t1 = a.update_time || 0
      const t2 = b.update_time || 0
      return Number(t2) - Number(t1)
    })
    list.value = res.map(item => {
      
      // 根据角色判断"待审核"状态
      // 这里逻辑比较复杂，需要结合改造方案 7
      // 区用户：push_status=0
      // 市用户：push_status=1 AND push_status2=0
      // 省用户：push_status2=1 AND push_status3=0
      
      // 但为了兼容原来的 tab 逻辑 (pending/recommended/rejected)，我们需要映射一下
      // 方案说：
      // 待审核 (pending)：符合上述“待我审核”条件的
      // 推送库 (recommended)：我这级已通过，且上级没驳回
      // 已退回 (rejected)：被上级驳回
      
      const roleId = String(configStore.user.role_id)
      let status = 'pending'

      // 规范化状态值，处理 null/undefined 为 '0'，并转为字符串
      const s1 = String(item.push_status || '0')
      const s2 = String(item.push_status2 || '0')
      const s3 = String(item.push_status3 || '0')

      // 1. 判断是否已退回 (Highest priority)
      let isRejected = false
      if (roleId == '4') {
        // 区级用户：被市级(2)或省级(3)驳回，或自己驳回(2)
        isRejected = s1 == '2' || s2 == '2' || s3 == '2'
      } else if (roleId == '3') {
        // 市级用户：被省级(3)驳回，或自己驳回(2)
        // 注意：如果是区级驳回(push_status=2)，市级是看不到的(buildRoleArgs过滤了)
        isRejected = s2 == '2' || s3 == '2'
      } else if (roleId == '2') {
        // 省级用户：自己驳回(3)
        isRejected = s3 == '2'
      }

      if (isRejected) {
        status = 'rejected'
      } else {
        // 2. 判断是否待审核
        let isPending = false
        if (roleId == '4') {
          // 区级待审：push_status=0
          isPending = s1 == '0'
        } else if (roleId == '3') {
          // 市级待审：区级已过(1) 且 市级未审(0/null)
          isPending = s1 == '1' && s2 == '0'
        } else if (roleId == '2') {
          // 省级待审：市级已过(1) 且 省级未审(0/null)
          isPending = s2 == '1' && s3 == '0'
        }

        if (isPending) {
          status = 'pending'
        } else {
          // 3. 判断是否推送库 (已通过)
          let isRecommended = false
          if (roleId == '4') {
            // 区级推送库：区级已过(1)
            isRecommended = s1 == '1'
          } else if (roleId == '3') {
            // 市级推送库：市级已过(1)
            isRecommended = s2 == '1'
          } else if (roleId == '2') {
            // 省级推送库：省级已过(1)
            isRecommended = s3 == '1'
          }

          if (isRecommended) {
            status = 'recommended'
          } else {
             // 兜底
             status = ''
          }
        }
      }
      
      return {
        ...item,
        status: status,
        reserve_status: item.reserve_status ? Number(item.reserve_status) : 0,
        region: `${item.city_name || ''}-${item.district_name || ''}`,
        period: `${item.construct_datetime_start || ''}-${item.construct_datetime_end || ''}`,
        investment: item.construct_price ? `${item.construct_price}万元` : '-',
        nature: item.construct_nature || '-',
        updateTime: item.rate_time || item.update_time || '-',
        checked: false
      }
    })

    // 动态生成图表数据
    const districtMap = new Map()
    list.value.forEach(item => {
      const dName = item.district_name || '其他'
      if (!districtMap.has(dName)) {
        districtMap.set(dName, { blue: 0, cyan: 0 })
      }
      const data = districtMap.get(dName)
      if (item.completion_status == '2') data.blue++ // 实施中
      if (item.completion_status == '1') data.cyan++ // 谋划中
    })
    
    barData.value = Array.from(districtMap.entries()).map(([name, data]) => ({
      name,
      ...data
    })).slice(0, 5) // 只取前5个展示
  }
}

const barData = ref([])

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

const handlePagination = ({ page, limit }: { page: number; limit: number }) => {
  currentPage.value = page
  pageSize.value = limit
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

const auditDialogVisible = ref(false)
const auditForm = reactive({
  result: ''
})
const currentAuditItem = ref<any>(null)

const getStatusText = (status: string) => {
  if (status == '1') return '通过'
  if (status == '2') return '驳回'
  return '待审核'
}

const getStatusColor = (status: string) => {
  if (status == '1') return 'c-green'
  if (status == '2') return 'c-red'
  return 'c-orange'
}

const getAuditStatusText = (item: any, level: string) => {
  const isProvincial = !item.city && !item.construct_main_city
  const isCity = !item.district && !item.construct_main_district

  if (level === 'district') {
    if (isProvincial || isCity) return '-'
    return getStatusText(item.push_status)
  }
  if (level === 'city') {
    if (isProvincial) return '-'
    return getStatusText(item.push_status2)
  }
  if (level === 'province') {
    return getStatusText(item.push_status3)
  }
  return '-'
}

const getAuditStatusColor = (item: any, level: string) => {
  const isProvincial = !item.city && !item.construct_main_city
  const isCity = !item.district && !item.construct_main_district

  if (level === 'district') {
    if (isProvincial || isCity) return 'c9'
    return getStatusColor(item.push_status)
  }
  if (level === 'city') {
    if (isProvincial) return 'c9'
    return getStatusColor(item.push_status2)
  }
  if (level === 'province') {
    return getStatusColor(item.push_status3)
  }
  return ''
}

const handleAudit = (item: any) => {
  proxy.toPath('/actionApply', { 
    id: item.id, 
    action: '019c03f8-971e-72a5-8dc3-82f1a1fc2758',
    key: 'department' 
  })
}

const submitAudit = async (status: number) => {
  // Deprecated: logic moved to PushAuditSidebar
}

const onViewDetail = (item: any) => {
  proxy.toPath('/actionApply/preview/previewIndex', { id: item.id, key: item.type })
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

onMounted(async() => {
  await getInit()
  init()
  renderBarChart()
  window.addEventListener('resize', renderBarChart)
})

onActivated(() => {
  getInit()
  init()
  renderBarChart()
})

watch(() => filters.area, () => {
  init()
}, { deep: true })

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
.w110 { width: 110px; }

.project-card {
  line-height: 20px;
  color: rgba(16, 16, 16, 1);
  font-size: 14px;
  font-family: -regular;
  padding-bottom: 44px;
  transition: all 0.3s;
  cursor: pointer;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: var(--el-color-primary);
  }
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
  cursor: pointer;
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

.c-green { color: #67c23a; }
.c-red { color: #f56c6c; }
.c-orange { color: #e6a23c; }
</style>
