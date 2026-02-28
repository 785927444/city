<template>
  <div class="layout-col">
    <aa-title title="">
      <template #left-content>
        <div class="flex-sc flex4 hidden warp">
          <div class="flex-sc mr30">
            <span class="mr10">计划年度</span>
            <span class="w50x4 flex-sc">
              <el-date-picker size="large" style="width: 100%;" v-model="state.plan_year" type="year" value-format="YYYY" format="YYYY" placeholder="请选择" />
            </span>
          </div>
          <!-- <div class="flex-sc pr30">
            <span class="mr10">状态</span>
            <span class="w50x4 flex-sc hidden">
              <el-select size="large" v-model="state.status" placeholder="请选择" style="width:100%" filterable clearable>
                <el-option label="已通过" value="passed" />
                <el-option label="特审候" value="special_audit" />
                <el-option label="不通过" value="failed" />
                <el-option label="待上报" value="wait_report" />
                <el-option label="进行中" value="in_progress" />
              </el-select>
            </span>
          </div> -->
          <div class="flex-sc pr30 mt10">
            <span class="mr10">关键字</span>
            <span class="w50x4 flex-sc hidden">
              <el-input size="large" v-model="state.search" style="width: 100%;" placeholder="请输入" />
            </span>
          </div>
          <div class="rad4 ptb10 plr12 flex-cc cursor bgi1 white" @click.stop="init()">
            <i-ep-search class="f12 fw" /><span class="f14 ml5">搜索</span>
          </div>
        </div>
      </template>
      <template #right-content></template>
    </aa-title>

    <div class="layout-col bg-white rad8 p8">
      <div class="ww100 flex-sc p8">
        <div class="flex-sc fw f16 tc">
          <div class="mr40 cursor flex-col-cc relative" v-for="(v, i) in state.types" :key="i" @click.stop="toPath(v.path)">
            <span class="mb5">{{ v.name }}</span>
            <span class="ww100 h3 rad10" :class="v.type == state.type?'bgi2':'black-rgba0'"></span>
          </div>
        </div>
        <div class="flex-ec flex1">
          <div class="rad4 ptb5 plr12 flex-cc cursor bg-white c8 bo-cc-1 ml15" @click.stop="handleClick('selectAll')">全选</div>
          <div class="rad4 ptb5 plr12 flex-cc cursor bgi1 white bo-i1-1 ml15" @click.stop="handleClick('remind')">提醒</div>
        </div>
      </div>

      <div class="table flex-sc warp">
        <div class="ww25 cursor p8" v-for="(v, i) in state.list" :key="v.id || i">
          <div class="ww100 bs bo-i16-1 relative rad8 project-card" @click.stop="goDetail(v)">
            <div class="ww100 flex-sc p12 bob-ce-1">
              <el-popover title="" width="300" placement="bottom-start">
                <template #default>
                  <div class="problem-content f16"><div class="hh100 flex-col">{{ v.report_unit || v.name }}</div></div>
                </template>
                <template #reference>
                  <span class="flex1 f15 line1">{{ v.name }}</span>
                </template>
              </el-popover>
              <span class="flex-ec">
                <!-- <span class="rad3 ptb3 plr6 f12" :class="getStatusClass(v.status)">{{ getStatusLabel(v.status) }}</span> -->
                <span class="w18 h18 tc lh18 rad3 ml10 white f12" :class="v.click?'bgi1 bo-i1-1':'bo-cc-1'" @click.stop="v.click = !v.click">
                  <i-ep-check v-if="v.click" />
                </span>
              </span>
            </div>
            <div class="ww100 flex-col p12 c6">
              <div class="ww100 flex-sc">
                <span class="w110">所属地区</span>
                <span>{{ v.city_name ? `${v.city_name}${v.district_name?`-${v.district_name}`:''}` : '-' }}</span>
              </div>
              <div class="ww100 flex-sc mt10">
                <span class="w110">上报时间</span>
                <span>{{ v.report_time || '-' }}</span>
              </div>
              <div class="ww100 flex-sc mt10">
                <span class="w110">计划年度</span>
                <span>{{ v.plan_year || '-' }}</span>
              </div>
              <div class="ww100 flex-sc mt10">
                <span class="w110">年度投资估算</span>
                <span>{{ v.investment_amount ? `${v.investment_amount} 万元` : '-' }}</span>
              </div>
              <div class="ww100 flex-sc mt10">
                <span class="w110">包含项目数</span>
                <span>{{ v.project_count ? `${v.project_count} 个` : '-' }}</span>
              </div>
              <div class="ww100 flex-sc mt10">
                <span class="w110">上报单位</span>
                <span class="flex1">{{ v.report_unit || '-' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Pagination style="padding-bottom: 0;" v-show="state.total>0" :total="state.total" v-model:page.sync="state.page" v-model:limit.sync="state.limit" @pagination="init" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { getCurrentInstance, onMounted, reactive } from 'vue'

type AnnualPlanRow = {
  id: string
  name: string
  city_name?: string
  district_name?: string
  status?: string
  report_time?: string
  plan_year?: string
  investment_amount?: string | number
  project_count?: string | number
  report_unit?: string
  click?: boolean
}

const { proxy }: any = getCurrentInstance()
const publicStore = proxy?.publicStore?.()

const state = reactive({
  page: 1,
  limit: 8,
  total: 0,
  list: [] as AnnualPlanRow[],
  status: '',
  plan_year: '',
  search: '',
  types: [{ type: 'annualPlan', name: '年度计划', path: '/annual-plan', total: 0 }],
  type: 'annualPlan',
  click: false,
  clickArr: [] as AnnualPlanRow[]
})

const getStatusLabel = (status?: string) => {
  const map: Record<string, string> = {
    passed: '已通过',
    special_audit: '特审候',
    failed: '不通过',
    wait_report: '待上报',
    in_progress: '进行中'
  }
  return map[status || ''] || '未知'
}

const getStatusClass = (status?: string) => {
  const map: Record<string, string> = {
    passed: 'bgi10 bo-i11-1 i12',
    special_audit: 'bgi12 bo-i12-1 i14',
    failed: 'bgi13 bo-i14-1 i15',
    wait_report: 'bgi8 bo-i8-1 i8',
    in_progress: 'bgi1 bo-i1-1 white'
  }
  return map[status || ''] || 'bo-cc-1 c8'
}

const toPath = (path: string, query?: any) => {
  proxy?.toPath?.(path, query)
}

const goDetail = (row: AnnualPlanRow) => {
  if (!row?.id) return
  toPath(`/annual-plan/${row.id}`)
}

const buildMockList = (): AnnualPlanRow[] => {
  const cities = [
    { city: '太原市', dists: ['小店区', '迎泽区', '万柏林区', '尖草坪区'] },
    { city: '大同市', dists: ['平城区', '云冈区', '新荣区', '云州区'] },
    { city: '晋中市', dists: ['榆次区', '太谷区', '介休市', '寿阳县'] },
    { city: '运城市', dists: ['盐湖区', '永济市', '河津市', '临猗县'] }
  ]
  const years = ['2024', '2025', '2026']
  const units = ['城市更新中心', '住建局', '发改委', '重点项目办']
  const rows: AnnualPlanRow[] = []
  for (let i = 0; i < 26; i++) {
    const c = cities[i % cities.length]
    const d = c.dists[i % c.dists.length]
    const y = years[i % years.length]
    const month = String((i % 12) + 1).padStart(2, '0')
    const day = String(((i * 3) % 28) + 1).padStart(2, '0')
    const inv = 8000 + (i % 9) * 3200
    const cnt = 4 + (i % 11)
    const unit = `${c.city}${units[i % units.length]}`
    rows.push({
      id: `mock-${i + 1}`,
      name: `${c.city}${d}年度计划`,
      city_name: c.city,
      district_name: d,
      status: 'passed',
      report_time: `${y}-0${(i % 9) + 1}-${day}`,
      plan_year: y,
      investment_amount: inv,
      project_count: cnt,
      report_unit: unit,
      click: false
    })
  }
  return rows
}

const applyMock = () => {
  let rows = buildMockList()
  if (state.plan_year) rows = rows.filter(r => String(r.plan_year || '') === String(state.plan_year))
  if (state.search) {
    const kw = state.search.trim()
    rows = rows.filter(r => {
      const s = `${r.name || ''}${r.city_name || ''}${r.district_name || ''}${r.report_unit || ''}`
      return s.includes(kw)
    })
  }
  state.total = rows.length
  state.types[0].total = rows.length
  const start = (state.page - 1) * state.limit
  state.list = rows.slice(start, start + state.limit)
}

const init = async () => {
  state.click = false
  state.clickArr = []

  try {
    const res = await publicStore?.http?.({
      Api: {
        model: 't_annual_plan_report',
        args: '1=1',
        order: 'report_time desc',
        page: state.page,
        limit: state.limit
      }
    })

    const list = Array.isArray(res?.list) ? res.list : (Array.isArray(res) ? res : [])
    if (Array.isArray(list) && list.length > 0) {
      state.list = list.map((item: any, idx: number) => ({
        id: String(item.id ?? idx),
        name: item.name || `${item.city_name || ''}${item.district_name || ''}年度计划`,
        city_name: item.city_name,
        district_name: item.district_name,
        status: 'passed',
        report_time: item.report_time,
        plan_year: item.plan_year,
        investment_amount: item.investment_amount,
        project_count: item.project_count,
        report_unit: item.report_unit,
        click: false
      }))
      state.total = Number(res?.total || state.list.length)
      state.types[0].total = state.total
      return
    }
  } catch (e) {}

  applyMock()
}

const handleClick = (remark: 'selectAll' | 'remind') => {
  if (remark === 'remind') {
    const clickIndex = state.list.findIndex(a => a.click)
    if (clickIndex === -1) return ElNotification({ title: '提示', message: '请选择至少一个', type: 'error' })
    ElNotification({ title: '提示', message: '提醒成功', type: 'success' })
  }
  if (remark === 'selectAll') {
    const clickIndex = state.list.findIndex(a => a.click)
    if (clickIndex === -1) {
      state.click = true
      state.list.forEach(item => {
        item.click = true
        state.clickArr.push(item)
      })
    } else {
      state.click = false
      state.clickArr = []
      state.list.forEach(item => {
        item.click = false
      })
    }
  }
}

onMounted(() => {
  init()
})
</script>

<style scoped lang="scss">
.w110 { width: 110px; }
.project-card {
  transition: all 0.3s;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: var(--el-color-primary);
  }
}
</style>
