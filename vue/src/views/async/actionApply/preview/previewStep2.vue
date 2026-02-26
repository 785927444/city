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

  // 模拟数据展示，实际应从接口获取
  const checkTasks = ref([
    { type: '危险性排查', indicator: 'DR设备检定完成', problem: '部分设备未完成检定，影响年度达标', content: '整改10条' },
    { type: '危险性排查', indicator: 'CB设备检定完成', problem: '检定记录缺失，需补录并复核', content: '整改10条' },
    { type: '危险性排查', indicator: '住宅隐患排查（车东米）', problem: '老旧小区隐患较多，需分批治理', content: '整改10条' },
  ])
  const keyTasks = ref([
    { task_type: '危险性改造', construct_content: 'DR设备检定改造（套）', construct_scale: '10', t2026: '10', t2027: '' },
    { task_type: '危险性改造', construct_content: 'CB设备检定改造（套）', construct_scale: '10', t2026: '10', t2027: '' },
    { task_type: '民住改造', construct_content: '居住隐患改造（车东米）', construct_scale: '10', t2026: '10', t2027: '' },
  ])
  const timelineRows = ref([
    { year: '2026', desc: '', investment: '' },
    { year: '2027', desc: '', investment: '' },
    { year: '2028', desc: '', investment: '' },
  ])

  // 在预览页面，如果有真实数据，可以尝试加载
  onMounted(() => {
    if (publicStore.form.tasks) {
      // 这里的逻辑可以根据实际数据结构进行调整
      // keyTasks.value = publicStore.form.tasks.filter(t => t.type === '1')
    }
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
