<template>
  <div class="layout-col">
    <!-- Policy Layout (政策法规) -->
    <div v-if="state.code === 'policy'" class="flex-col h100 p15">
        <div class="policy-banner mb20 rad8 flex-col-cc white relative overflow-hidden">
            <div class="f36 fw z10 text-shadow">政策法规</div>
             <div class="absolute ww100 hh100" style="background: linear-gradient(135deg, #66b1ff 0%, #409eff 100%); opacity: 0.9;"></div>
        </div>
        
        <div class="flex-sc align-start flex1 overflow-hidden">
            <!-- Left: List -->
            <div class="flex1 bg-white rad8 p20 mr20 h100 flex-col overflow-hidden">
                <div class="flex-sc mb15">
                     <div class="f18 fw">政策法规列表</div>
                </div>
                <div class="flex1 overflow-y-auto pr10">
                    <div v-for="(item, index) in state.list" :key="index" class="policy-item flex-sc p15 bb-e cursor hover-bg" @click="openItem(item.id)">
                        <div class="date-box mr20 tc">
                            <div class="f24 fw c-primary">{{ getDayMonth(item.publish_time) }}</div>
                            <div class="c9 f12">{{ getYear(item.publish_time) }}</div>
                        </div>
                        <div class="flex-col flex1 mr20">
                            <div class="f16 fw mb10 line1">{{ item.title }}</div>
                            <div class="c9 f12 flex-sc">
                                <span class="mr10">{{ item.publish_org || '发布单位未知' }}</span>
                                <span>{{ item.doc_no || '' }}</span>
                            </div>
                        </div>
                        <div class="w120 h80 rad4 overflow-hidden flex-shrink-0">
                             <img v-if="firstImage(item)" :src="firstImage(item)" class="ww100 hh100 object-cover" />
                             <img v-else src="https://picsum.photos/120/80?random=1" class="ww100 hh100 object-cover" />
                        </div>
                    </div>
                    <el-empty v-if="state.list.length === 0" description="暂无数据" />
                </div>
                <div class="flex-ec mt15 pt10 bt-e">
                    <el-pagination
                        background
                        layout="total, prev, pager, next"
                        :total="state.total"
                        :page-size="state.limit"
                        :current-page="state.page"
                        @current-change="(p)=>init(p)"
                    />
                </div>
            </div>
            
            <!-- Right: Hot Knowledge -->
            <div class="w320 bg-white rad8 p20 h100 flex-col overflow-hidden">
                <div class="f16 fw mb15 pl10 bl-primary">热门知识</div>
                <div class="flex1 overflow-y-auto">
                    <div v-for="(h, hi) in hotList" :key="hi" class="mb20 cursor hover-text-primary">
                        <div class="f14 fw line2 mb5">{{ h.title }}</div>
                        <div class="f12 c9 line3">{{ h.desc }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Grid Layout (Excellent Cases / Expert Think Tank) -->
    <div v-else-if="state.code === 'case' || state.code === 'expert'" class="layout-col">
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
        
        <div class="flex1 bg-white rad8 p20 m15 overflow-y-auto">
             <div class="grid-container">
                 <div v-for="(item, index) in state.list" :key="index" class="grid-card rad8 overflow-hidden bo-e cursor hover-shadow transition-all" @click="openItem(item.id)">
                     <div class="cover-box relative" style="padding-top: 56.25%;"> <!-- 16:9 aspect ratio -->
                         <img v-if="firstImage(item)" :src="firstImage(item)" class="absolute top0 left0 ww100 hh100 object-cover" />
                         <img v-else :src="`https://picsum.photos/400/225?random=${index}`" class="absolute top0 left0 ww100 hh100 object-cover" />
                     </div>
                     <div class="p15">
                         <div class="f16 fw line1 mb10" :title="item.title">{{ item.title }}</div>
                         <div class="flex-bc c9 f12">
                             <span>{{ item.publish_time }}</span>
                             <i-ep-arrow-right class="f14" />
                         </div>
                     </div>
                 </div>
             </div>
             <el-empty v-if="state.list.length === 0" description="暂无数据" />
             
             <div class="flex-ec mt20">
                <el-pagination
                  background
                  layout="total, prev, pager, next, sizes"
                  :total="state.total"
                  :page-size="state.limit"
                  :current-page="state.page"
                  @current-change="(p)=>init(p)"
                  @size-change="(s)=>{ state.limit = s; init(1) }"
                />
             </div>
        </div>
    </div>

    <!-- Default Table Layout -->
    <div v-else class="layout-col">
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
    
        <div class="white-rgba50 rad8 p15 m15 flex1 overflow-hidden flex-col">
          <el-table :data="state.list" stripe v-loading="state.loading" height="100%">
            <el-table-column type="index" width="60" label="#" />
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
              @current-change="(p)=>init(p)"
              @size-change="(s)=>{ state.limit = s; init(1) }"
            />
          </div>
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

  // Mock data for hot knowledge
  const hotList = [
      { title: '《关于全面开展城市体检工作的指导意见》', desc: '以习近平新时代中国特色社会主义思想为指引，坚持发展理念以及“人民城市”理念' },
      { title: '《城市体检评估机制建设指南》', desc: '规范城市体检评估工作，推动城市高质量发展' },
      { title: '《关于实施城市更新行动的指导意见》', desc: '全面推进城镇老旧小区改造，提升城市功能和品质' },
      { title: '《“十四五”新型城镇化实施方案》', desc: '深入推进以人为核心的新型城镇化战略' },
      { title: '《国家生态园林城市标准》', desc: '促进城市生态文明建设，改善城市人居环境' }
  ]

  const getDayMonth = (dateStr: string) => {
      if (!dateStr) return '01.01'
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return '01.01'
      return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
  }

  const getYear = (dateStr: string) => {
      if (!dateStr) return '2023'
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return '2023'
      return String(d.getFullYear())
  }

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
    // Adjust limit for grid view if needed
    if (state.code === 'case' || state.code === 'expert') {
        state.limit = 12
    } else {
        state.limit = 20
    }

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
  .policy-banner {
      height: 180px;
  }
  .text-shadow {
      text-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
  .bb-e {
      border-bottom: 1px solid #eee;
  }
  .bt-e {
      border-top: 1px solid #eee;
  }
  .bo-e {
      border: 1px solid #eee;
  }
  .bl-primary {
      border-left: 4px solid #409eff;
  }
  .c-primary {
      color: #409eff;
  }
  .hover-bg:hover {
      background-color: #f9f9f9;
  }
  .hover-text-primary:hover {
      color: #409eff;
  }
  .grid-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
  }
  .hover-shadow:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      transform: translateY(-2px);
  }
  .object-cover {
      object-fit: cover;
  }
  .transition-all {
      transition: all 0.3s;
  }
  .z10 {
      z-index: 10;
  }
</style>