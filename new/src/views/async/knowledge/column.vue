<template>
  <div class="layout-col">
    <aa-title :title="state.title">
      <template #left-content>
        <div class="flex-sc ml15">
          <el-input v-model="state.q" placeholder="检索本专栏" clearable class="w320" @keyup.enter="init(1)" />
          <div class="rad4 ptb5 w80 flex-cc cursor bgi1 white ml10" @click.stop="init(1)">查询</div>
        </div>
      </template>
      <template #right-content>
        <div class="rad4 ptb5 plr8 flex-cc cursor bgi1 white ml10" @click.stop="toHome()">首页</div>
      </template>
    </aa-title>

    <div class="white-rgba50 rad8 p15">
      <el-table :data="state.list" stripe v-loading="state.loading">
        <el-table-column type="index" width="60" label="#" />
        <el-table-column v-if="showThumb" label="预览" width="120">
          <template #default="{ row }">
            <el-image
              v-if="firstImage(row)"
              :src="firstImage(row)"
              :preview-src-list="getImageUrls(row)"
              :initial-index="0"
              fit="cover"
              style="width: 90px; height: 54px; border-radius: 4px"
            />
            <span v-else class="i2">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="320">
          <template #default="{ row }">
            <span class="cursor i1" @click="openItem(row.id)">{{ row.title }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="publish_org" label="发布单位" width="160" />
        <el-table-column prop="doc_no" label="文号/编号" width="180" />
        <el-table-column prop="publish_time" label="发布时间" width="140" />
        <el-table-column prop="views" label="浏览" width="100" />
      </el-table>

      <div class="flex-ec mt15">
        <el-pagination
          background
          layout="total, prev, pager, next, sizes"
          :total="state.total"
          :page-size="state.limit"
          :current-page="state.page"
          @current-change="(p:number)=>init(p)"
          @size-change="(s:number)=>{ state.limit = s; init(1) }"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import api from '@/api'

  const { proxy }: any = getCurrentInstance()
  const route = useRoute()

  const COLUMN_MAP: Record<string, string> = {
    policy: '政策法规',
    standard: '标准规范',
    mechanism: '工作机制',
    expert: '专家智库',
    case: '优秀案例',
    course: '培训课程',
    all: '全部专栏',
  }

  const state = reactive({
    code: 'all',
    title: '知识库专栏',
    q: '',
    page: 1,
    limit: 20,
    total: 0,
    list: [] as Array<any>,
    loading: false,
  })

  const showThumb = computed(() => state.code === 'expert' || state.code === 'case')

  onMounted(async () => {
    state.code = (route.params.code as string) || 'all'
    state.q = (route.query.q as string) || ''
    state.title = COLUMN_MAP[state.code] || '知识库专栏'
    await init(1)
  })

  watch(
    () => route.params.code,
    async (val: any) => {
      state.code = val || 'all'
      state.title = COLUMN_MAP[state.code] || '知识库专栏'
      state.page = 1
      await init(1)
    }
  )

  watch(
    () => route.query.q,
    async (val: any) => {
      state.q = (val as string) || ''
      state.page = 1
      await init(1)
    }
  )

  const init = async (page: number) => {
    state.page = page
    state.loading = true
    try {
      const payload = {
        column_code: state.code === 'all' ? '' : state.code,
        q: state.q,
        page: state.page,
        limit: state.limit,
      }
      const res: any = await api.kbItemsApi(payload)
      const data = res?.data ?? res
      state.list = data?.items ?? []
      state.total = data?.total ?? 0
    } catch (e) {
      state.list = []
      state.total = 0
    } finally {
      state.loading = false
    }
  }

  const openItem = (id: any) => {
    proxy.toPath(`/knowledge/item/${id}`)
  }

  const toHome = () => {
    proxy.toPath('/knowledge')
  }

  const getImageUrls = (row: any) => {
    const arr = row?.image_urls
    if (!Array.isArray(arr)) return []
    return arr.map((x: any) => String(x)).filter((x: string) => x.trim())
  }

  const firstImage = (row: any) => getImageUrls(row)[0] || ''
</script>

<style scoped lang="scss">

</style>
