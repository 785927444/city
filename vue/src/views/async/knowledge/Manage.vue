<template>
  <div class="layout-col">
    <aa-title title="知识库管理后台">
      <template #right-content>
        <div class="rad4 ptb5 plr8 flex-cc cursor bgi1 white ml10" @click.stop="back">返回</div>
      </template>
    </aa-title>

    <div class="layout-row flex1 hidden">
      <div class="flex1 layout-col" style="min-height: 0">
        <div class="bg-white rad8 p15 mb15">
          <div class="flex-bc">
            <div class="fw f16">个人收藏统计</div>
            <div class="i2">共 {{ state.total }} 条</div>
          </div>
        </div>
        <div class="bg-white rad8 p15 flex1 hidden table-col" style="min-height: 0" v-loading="state.loading">
          <el-table :data="state.items" style="width: 100%">
            <el-table-column prop="title" label="标题" show-overflow-tooltip />
            <el-table-column prop="column_name" label="分类" width="140" show-overflow-tooltip />
            <el-table-column prop="publish_time" label="发布时间" width="120" />
            <el-table-column prop="download_count" label="下载" width="80" />
            <el-table-column prop="favorite_count" label="收藏" width="80" />
            <el-table-column prop="favorited_at" label="收藏时间" width="160" />
          </el-table>
        </div>
      </div>
      <div class="layout-col ml15" style="width: 360px; min-height: 0">
        <div class="bg-white rad8 p15 mb15">
          <div class="fw f16">分类统计</div>
        </div>
        <div class="bg-white rad8 p15">
          <div v-if="!state.stats.length" class="i2">暂无统计</div>
          <div v-else ref="chartRef" class="kb-chart"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, reactive, ref, computed, nextTick, getCurrentInstance } from 'vue'
import api from '@/api'
import { drawPies } from '@/utils/echartTools'

const { proxy }: any = getCurrentInstance()
const configStore = proxy.configStore()
const router = useRouter()

const state = reactive({
  loading: false,
  items: [] as any[],
  stats: [] as any[],
  total: 0,
})

const chartRef = ref<HTMLDivElement | null>(null)
let chartInst: any = null

const userId = computed(() => String(configStore?.user?.id ?? configStore?.user ?? '').trim() || 'anonymous')

const renderChart = async () => {
  if (!chartRef.value) return
  if (!state.stats.length) {
    if (chartInst?.dispose) chartInst.dispose()
    chartInst = null
    return
  }
  const seriesData = state.stats.map((s: any) => ({
    name: String(s?.name ?? ''),
    value: Number(s?.value ?? 0),
  }))
  chartInst = await drawPies(chartRef.value, { title: '分类统计', seriesData })
}

const fetchData = async () => {
  state.loading = true
  try {
    const res: any = await api.kbAdminUserFavoritesApi({ user_id: userId.value })
    const data = res?.data ?? res
    state.items = data?.items || []
    state.stats = data?.stats || []
    state.total = Number(data?.total ?? state.items.length ?? 0)
    await nextTick()
    await renderChart()
  } catch (e) {
    state.items = []
    state.stats = []
    state.total = 0
  } finally {
    state.loading = false
  }
}

const handleResize = () => {
  if (chartInst?.resize) chartInst.resize()
}

onMounted(async () => {
  await fetchData()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (chartInst?.dispose) chartInst.dispose()
})

const back = () => {
  router.back()
}
</script>

<style scoped lang="scss">
.kb-chart {
  width: 100%;
  height: 300px;
}
</style>
