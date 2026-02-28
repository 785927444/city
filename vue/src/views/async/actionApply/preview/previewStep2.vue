<template>
  <div class="layout-col overlay">
    <div class="hh100 ww100 flex-sc warp">
      <el-form class="ww100 pplr15" label-width="120" disabled>
        <div class="flex-sc warp ww100">
          <el-form-item label="方案名称" class="ww50 flex-sc">
            <div class="display-value">{{ publicStore.form.plan_name || '-' }}</div>
          </el-form-item>
          <el-form-item label="方案编制单位" class="ww50 flex-sc">
            <div class="display-value">{{ publicStore.form.plan_unit || '-' }}</div>
          </el-form-item>
          <el-form-item label="复批时间" class="ww50 flex-sc">
            <div class="display-value">{{ publicStore.form.approval_time || '-' }}</div>
          </el-form-item>
          <el-form-item label="方案摘要" class="ww100 flex-sc">
            <div class="display-value pre-wrap">{{ publicStore.form.plan_abstract || '-' }}</div>
          </el-form-item>
          <el-form-item label="基础建设条件" class="ww100 flex-sc">
            <div class="display-value pre-wrap">{{ publicStore.form.condition || '-' }}</div>
          </el-form-item>
          <el-form-item label="实施方案文件上传" class="ww100 flex-ss">
            <div class="ww100 plr30 ptb22 bo-i16-1 rad8 bg-white">
              <FileList v-if="publicStore.form?.plan_attr" v-model:files="publicStore.form.plan_attr" :plans="props.plans" :contents="props.contents" :active="props.active" is-readonly />
            </div>
          </el-form-item>
        </div>
        <div class="ww100 white-rgba50 rad8 p15 mt16">
          <div class="flex-sc f18 plr10">
            <span>项目任务</span>
          </div>
          <div class="ww100 flex-sc pb20 mt10">
            <div class="mr40 pb10 f18 relative cursor actfont" :class="tabKey==='key'?'i1 bob-i1-2':'bob-tt-2'" @click.stop="tabKey='key'">
              <span>重点落实任务</span>
            </div>
            <div class="mr40 pb10 f18 relative cursor actfont" :class="tabKey==='check'?'i1 bob-i1-2':'bob-tt-2'" @click.stop="tabKey='check'">
              <span>体检整改任务</span>
            </div>
          </div>
          <div v-show="tabKey==='check'" class="layout-col white-rgba50 rad8 p15">
            <el-table
              header-cell-class-name="bgi16 c3"
              :cell-style="{'background-color': '#FFFFFF', 'color': '#626366'}"
              border
              empty-text="暂无数据"
              :data="checkTasks"
              stripe>
              <el-table-column type="index" label="序号" align="center" width="60" />
              <el-table-column prop="type" label="体检维度" align="center" width="140" />
              <el-table-column prop="indicator" label="指标项" align="center" width="200" />
              <el-table-column prop="problem" label="存在问题" show-overflow-tooltip />
              <el-table-column prop="content" label="内容" align="center" width="140" />
            </el-table>
          </div>
          <div v-show="tabKey==='key'" class="layout-col white-rgba50 rad8 p15">
            <el-table
              header-cell-class-name="bgi16 c3"
              :cell-style="{'background-color': '#FFFFFF', 'color': '#626366'}"
              border
              empty-text="暂无数据"
              :data="keyTasks"
              stripe>
              <el-table-column type="index" label="序号" align="center" width="60" />
              <el-table-column prop="task_type" label="任务类型" align="center" width="200" />
              <el-table-column prop="construct_content" label="建设内容" />
              <el-table-column prop="construct_scale" label="建设规模" align="center" width="120" />
              <el-table-column prop="t2026" label="2026年目标" align="center" width="120" />
              <el-table-column prop="t2027" label="2027年目标" align="center" width="120" />
            </el-table>
          </div>
        </div>
        <div class="ww100 white-rgba50 rad8 p15 mt16">
          <div class="flex-sc f18 plr10">
            <span>时序管理</span>
          </div>
          <div class="layout-col white-rgba50 rad8 p15 mt10">
            <el-table
              header-cell-class-name="bgi16 c3"
              :cell-style="{'background-color': '#FFFFFF', 'color': '#626366'}"
              border
              empty-text="暂无数据"
              :data="timelineRows"
              stripe>
              <el-table-column type="index" label="序号" align="center" width="80" />
              <el-table-column prop="year" label="年度" align="center" width="120" />
              <el-table-column prop="desc" label="阶段任务描述" />
              <el-table-column prop="investment" label="阶段投资" align="center" width="140" />
            </el-table>
          </div>
        </div>
      </el-form>

      <div class="ww100 flex-cc f18 p40 bot-i16-1 mt20">
        <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" @click.stop="publicStore.actIndex--">上一步</div>
        
        <!-- 下一步按钮 (L202, L204) -->
        <template v-if="showNext">
          <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" @click.stop="publicStore.actIndex++">下一步</div>
        </template>
        
        <!-- 关闭按钮 (针对企业申请储备等两步流场景 L198-199) -->
        <template v-else-if="showClose">
          <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" @click.stop="$emit('close')">关 闭</div>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  const { proxy }: any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const route = useRoute()
  const tabKey = ref('key')

  const props = defineProps({
    contents: { type: Array, default: () => [] },
    plans: { type: Array, default: () => [] },
    active: { type: [Object, Array], default: () => ({}) },
  })

  defineEmits(['close'])

  // 导航按钮显隐判断逻辑同步自 step2.vue L198-204
  const showNext = computed(() => {
    return true
  })

  const showClose = computed(() => {
    return false
  })

  const checkTasks = ref([])
  const keyTasks = ref([])
  const timelineRows = ref([])
  const norm = (v) => String(v ?? '').trim()

  const mockKeyTaskGroups = [
    [
      { task_type: '危险住房改造', construct_content: 'D 级危险住房改造', construct_scale: '14栋', t2026: '5', t2027: '5', t2028: '4' },
      { task_type: '危险住房改造', construct_content: 'C 级危险住房改造', construct_scale: '12栋', t2026: '4', t2027: '4', t2028: '4' },
      { task_type: '危险住房改造', construct_content: '非成套住房改造', construct_scale: '8处', t2026: '3', t2027: '3', t2028: '2' },
      { task_type: '建筑节能改造', construct_content: '既有建筑节能提升', construct_scale: '10万㎡', t2026: '3', t2027: '4', t2028: '3' },
      { task_type: '建筑安全隐患整治', construct_content: '重点区域隐患整治', construct_scale: '20处', t2026: '8', t2027: '7', t2028: '5' },
      { task_type: '存量建筑改造', construct_content: '低效楼宇改造利用', construct_scale: '5栋', t2026: '2', t2027: '2', t2028: '1' },
      { task_type: '存量建筑改造', construct_content: '老旧厂房改造利用', construct_scale: '3处', t2026: '1', t2027: '1', t2028: '1' },
      { task_type: '存量建筑改造', construct_content: '传统商业设施改造利用', construct_scale: '2处', t2026: '1', t2027: '1', t2028: '0' },
    ],
    [
      { task_type: '存量建筑改造', construct_content: '低效楼宇改造利用', construct_scale: '4栋', t2026: '2', t2027: '1', t2028: '1' },
      { task_type: '存量建筑改造', construct_content: '老旧厂房改造利用', construct_scale: '4处', t2026: '2', t2027: '1', t2028: '1' },
      { task_type: '建筑安全隐患整治', construct_content: '住宅小区隐患排查整治', construct_scale: '30处', t2026: '10', t2027: '10', t2028: '10' },
      { task_type: '建筑节能改造', construct_content: '公共建筑能效提升', construct_scale: '6万㎡', t2026: '2', t2027: '2', t2028: '2' },
      { task_type: '危险住房改造', construct_content: 'D 级危险住房改造', construct_scale: '10栋', t2026: '4', t2027: '3', t2028: '3' },
    ],
    [
      { task_type: '建筑节能改造', construct_content: '既有居住建筑节能改造', construct_scale: '8万㎡', t2026: '3', t2027: '3', t2028: '2' },
      { task_type: '建筑安全隐患整治', construct_content: '消防通道与设施完善', construct_scale: '15处', t2026: '6', t2027: '5', t2028: '4' },
      { task_type: '存量建筑改造', construct_content: '传统商业设施改造利用', construct_scale: '3处', t2026: '1', t2027: '1', t2028: '1' },
      { task_type: '危险住房改造', construct_content: 'C 级危险住房改造', construct_scale: '9栋', t2026: '3', t2027: '3', t2028: '3' },
      { task_type: '危险住房改造', construct_content: '非成套住房改造', construct_scale: '6处', t2026: '2', t2027: '2', t2028: '2' },
    ]
  ]

  const mockCheckTaskGroups = [
    [
      {
        type: '住房',
        indicator: '存在结构安全隐患的住宅数量（栋）',
        problem: '住宅墙体楼板裂缝、砂浆粉化空鼓、砖砌体缺棱掉角等结构安全隐患较多。'
      },
      {
        type: '住房',
        indicator: '存在燃气安全隐患的住宅数量（栋）',
        problem: '部分住宅燃气管生锈腐蚀，存在燃气安全风险。'
      },
      {
        type: '住房',
        indicator: '存在楼道安全隐患的住宅数量（栋）',
        problem: '楼梯踏步缺损、扶手松动、照明缺失、消防器材缺失及楼道乱停乱放等问题突出。'
      },
      {
        type: '住房',
        indicator: '公共空间安全管理',
        problem: '部分住户占用消防楼梯、楼道、管道井等公共空间堆放杂物。'
      },
      {
        type: '住房',
        indicator: '消防标识完善情况',
        problem: '部分住宅缺乏或损坏消防安全出口标识，疏散指引不清晰。'
      },
    ],
    [
      {
        type: '城区',
        indicator: '人均公共文化设施面积（平方米/人）',
        problem: '人均公共文化设施面积未达到标准要求。'
      },
      {
        type: '城区',
        indicator: '应急供水保障率（%）',
        problem: '无应急水源，应急供水保障率为 0。'
      },
      {
        type: '城区',
        indicator: '老旧燃气管网改造完成率（%）',
        problem: '老旧燃气管网改造完成率低，存在燃气安全风险。'
      },
      {
        type: '城区',
        indicator: '城市消防站服务半径覆盖率（%）',
        problem: '城市消防站覆盖率低，存在大量覆盖盲区。'
      },
      {
        type: '城区',
        indicator: 'CIM 平台三维数据覆盖率（%）',
        problem: '未建设 CIM 基础平台，三维数据覆盖率为 0。'
      },
    ],
    [
      {
        type: '街道',
        indicator: '中学服务半径覆盖率（%）',
        problem: '中学资源配置不平衡，部分街道覆盖率不足。'
      },
      {
        type: '街道',
        indicator: '未达标配建的多功能运动场地数量（个）',
        problem: '文化站/运动场地建筑面积不达标，服务质量有待提升。'
      },
      {
        type: '街道',
        indicator: '存在乱停乱放车辆问题的道路数量（条）',
        problem: '车辆无序停放突出，存在占用人行道、绿化带等情况。'
      },
      {
        type: '街道',
        indicator: '需要更新改造的老旧商业街区数量（个）',
        problem: '老旧商业街区质量不高，商业功能单一，需要整体改造提升。'
      },
      {
        type: '街道',
        indicator: '需要更新改造的老旧厂区数量（个）',
        problem: '老旧工业用地利用效率不高，历史遗留企业用地需整体改造提升。'
      },
    ]
  ]

  const pickRandomN = <T,>(arr: T[], n: number) => {
    const copy = Array.isArray(arr) ? [...arr] : []
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy.slice(0, Math.max(0, Math.min(n, copy.length)))
  }

  const buildRectifyContent = (problem: any) => {
    const p = norm(problem)
    if (!p) return '-'
    const short = p.length > 26 ? `${p.slice(0, 26)}…` : p
    return `围绕“${short}”制定整改措施，明确责任单位与完成时限，验收后闭环销号。`
  }

  const applyDemoMockData = () => {
    const keyGroup = mockKeyTaskGroups[Math.floor(Math.random() * mockKeyTaskGroups.length)] || []
    const checkGroup = mockCheckTaskGroups[Math.floor(Math.random() * mockCheckTaskGroups.length)] || []

    keyTasks.value = pickRandomN(keyGroup, 3).map(r => ({ ...r }))
    checkTasks.value = pickRandomN(checkGroup, 3).map(r => ({
      ...r,
      content: r?.content || buildRectifyContent(r?.problem)
    }))
    timelineRows.value = [
      { year: '2026', desc: '完成底数摸排与重点项目开工', investment: '3000 万元' },
      { year: '2027', desc: '全面推进改造任务与配套完善', investment: '5000 万元' },
      { year: '2028', desc: '巩固提升并组织验收评估', investment: '2000 万元' },
    ]
  }

  const repairAndPersist = async () => {
    const rows: any[] = Array.isArray(checkTasks.value) ? checkTasks.value : []
    const targets = rows.filter(r => {
      const hasProblem = norm(r?.problem) !== ''
      const missing = norm(r?.type) === '' || norm(r?.indicator) === ''
      const sid = r?.scheme_id || r?.problemItemId
      return hasProblem && missing && !!sid
    })
    if (targets.length === 0) return

    const schemeIds = [...new Set(targets.map(r => String(r.scheme_id || r.problemItemId)).filter(Boolean))]
    if (schemeIds.length === 0) return

    const probRes = await publicStore.http({
      Api: { model: 't_scheme_problem', args: `id in ('${schemeIds.join("','")}')`, limit: 2000 }
    })
    const probs = Array.isArray(probRes) ? probRes : []
    const probMap = new Map(probs.map((p: any) => [String(p.id), p]))

    const itemRes = await publicStore.http({
      Api: { model: 't_scheme_problem_item', args: `problem_id in ('${schemeIds.join("','")}') or id in ('${schemeIds.join("','")}')`, limit: 5000 }
    })
    const items = Array.isArray(itemRes) ? itemRes : []
    const itemByProblemId = new Map(items.map((it: any) => [String(it.problem_id || it.id), it]))

    const indicatorIds = [...new Set([
      ...probs.map((p: any) => String(p.parent_id)).filter(Boolean),
      ...items.map((it: any) => String(it.parent_id)).filter(Boolean)
    ])]
    if (indicatorIds.length === 0) return

    const indRes = await publicStore.http({
      Api: { model: 't_task_problem', args: `id in ('${indicatorIds.join("','")}')`, limit: 2000 }
    })
    const indicators = Array.isArray(indRes) ? indRes : []
    const indMap = new Map(indicators.map((t: any) => [String(t.id), t]))

    const dimensionIds = [...new Set(indicators.map((t: any) => String(t.parent_id)).filter(Boolean))]
    const dimMap = new Map<string, any>()
    if (dimensionIds.length > 0) {
      const dimRes = await publicStore.http({
        Api: { model: 't_task_problem', args: `id in ('${dimensionIds.join("','")}')`, limit: 2000 }
      })
      const dims = Array.isArray(dimRes) ? dimRes : []
      dims.forEach((d: any) => dimMap.set(String(d.id), d))
    }

    const updates: any[] = []
    targets.forEach(r => {
      const sid = String(r.scheme_id || r.problemItemId)
      const prob = probMap.get(sid)
      const item = itemByProblemId.get(sid)
      const indicatorId = prob?.parent_id || item?.parent_id
      const ind = indicatorId ? indMap.get(String(indicatorId)) : null
      const dim = ind ? dimMap.get(String(ind.parent_id)) : null
      const dimensionName = norm(r.type) || norm(dim?.name)
      const indicatorName = norm(r.indicator) || norm(ind?.name)
      if (dimensionName) r.type = dimensionName
      if (indicatorName) r.indicator = indicatorName
      if (r.id && dimensionName && indicatorName) {
        updates.push({ id: r.id, dimension: dimensionName, indicator: indicatorName })
      }
    })

    if (updates.length > 0) {
      await publicStore.http({ updApi: { model: 't_project_task_check', list: updates } })
    }
  }

  // 获取明细数据
  const getDetailData = async () => {
    if (!publicStore.form || !publicStore.form.id) return
    const pid = publicStore.form.id
    
    const query = {
      Api1: { model: 't_project_task_key', args: `project_id='${pid}'`, limit: 1000 },
      Api2: { model: 't_project_task_check', args: `project_id='${pid}'`, limit: 1000 },
      Api3: { model: 't_project_task_timeline', args: `project_id='${pid}'`, limit: 1000 }
    }
    
    publicStore.http(query).then(res => {
      // 1. 回填重点任务
      keyTasks.value = Array.isArray(res?.Api1) ? res.Api1 : []

      // 2. 回填体检任务
      const checkList = Array.isArray(res?.Api2) ? res.Api2 : []
      checkTasks.value = checkList.map(item => ({
        ...item,
        type: item.dimension,
        range: item.rectify_range,
        content: item.rectify_content
      }))
      repairAndPersist()

      // 3. 回填时序管理
      const timeList = Array.isArray(res?.Api3) ? res.Api3 : []
      const sorted = [...timeList].sort((a, b) => Number(a.year) - Number(b.year))
      timelineRows.value = sorted.map(item => ({
        ...item,
        desc: item.construct_content
      }))
    }).catch(err => {
      console.error('previewStep2 加载三表明细失败:', err)
    })
  }

  // 在预览页面，加载真实数据
  onMounted(() => {
    applyDemoMockData()
    /*
      演示临时：三表查表回填逻辑先停用（不可删除，演示后恢复）
      getDetailData()
    */
  })
  
  watch(() => publicStore.form.id, (val) => {
    applyDemoMockData()
    /*
      演示临时：三表查表回填逻辑先停用（不可删除，演示后恢复）
      if (val) getDetailData()
    */
  })
</script>

<style scoped lang="scss">
.display-value {
  padding: 8px 15px;
  background: #f5f7fa;
  border-radius: 4px;
  min-height: 40px;
  display: flex;
  align-items: center;
  width: 100%;
  color: #606266;
  &.pre-wrap {
    white-space: pre-wrap;
    align-items: flex-start;
  }
}
.bob-tt-2 { border-bottom: 2px solid transparent; }
.bob-i1-2 { border-bottom: 2px solid var(--i1); }
</style>
