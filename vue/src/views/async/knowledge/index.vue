<template>
  <div class="layout-col">
    <div class="layout-row">
      <div class="kb-left bg-white rad8 p15">
        <div class="flex-bc mb15">
            <div class="fw f16">分类导航栏</div>
            <div class="flex-sc">
              <el-button type="primary" link @click="$router.push('/knowledge/manage')">管理后台</el-button>
            </div>
        </div>
        <div class="table-col">
          <div v-for="c in state.columns" :key="c.code" class="kb-group">
            <div class="kb-group-title flex-bc cursor" @click.stop="toggleColumn(c.code)">
              <div class="flex-sc">
                <i-ep-arrowDown v-if="state.openMap[c.code]" class="f14 mr8" />
                <i-ep-arrowRight v-else class="f14 mr8" />
                <span class="f14" :class="c.code === state.activeColumnCode ? 'i1 fw' : 'c8'">{{ c.name }}</span>
              </div>
            </div>
            <div v-show="state.openMap[c.code]" class="kb-children">
              <div
                v-for="ch in c.children"
                :key="ch.id"
                class="kb-child cursor"
                :class="ch.id === state.activeCategoryId ? 'kb-child-active' : 'kb-child-normal'"
                @click.stop="selectCategory(c.code, ch.id)"
              >
                <span class="f14 line1">{{ ch.name }}</span>
              </div>
              <div class="kb-add cursor" @click.stop="openAddDialog(c.code)">
                <i-ep-plus class="f14 mr5" /><span class="f14">新增</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex1 hh100 hidden ml15">
        <div class="layout-col">
          <div class="bg-white rad8 p15 mb15" v-if="state.activeColumnCode !== 'policy'">
            <el-input v-model="state.q" placeholder="请输入关键词" clearable @keyup.enter="search()">
              <template #append>
                <div class="kb-search-btn flex-cc cursor bgi1 white" @click.stop="search()">
                  <i-ep-search class="f16" />
                </div>
              </template>
            </el-input>
          </div>

          <div class="layout-col hh100 hidden" style="background: transparent;" v-if="state.activeColumnCode === 'policy'">
             <div class="flex-sc align-start hh100" style="align-items: stretch;">
                <!-- Left Column: Banner + List -->
                <div class="flex1 flex-col hh100 mr15 bg-white rad8 overflow-hidden">
                       <!-- Policy Layout -->
                       <div class="policy-banner flex-col-cc white relative overflow-hidden" style="border-radius: 8px 8px 0 0; height: 180px; min-height: 180px; max-height: 180px; flex: 0 0 180px;">
                          <div class="f36 fw z10 text-shadow">政策法规</div>
                           <div class="absolute ww100 hh100" style="background: linear-gradient(135deg, #66b1ff 0%, #A6D4FE 100%); opacity: 0.9;"></div>
                      </div>
                     
                     <div class="flex1 overflow-hidden p20 pr0 flex-col">
                         <div class="flex-sc mb15">
                             <div class="f18 fw">政策法规列表</div>
                        </div>
                        <div class="flex1 overflow-y-auto pr10" v-loading="state.loading">
                            <div v-for="(item, index) in state.items" :key="index" class="policy-item flex-sc p15 bb-e cursor hover-bg" @click="openItem(item.id)">
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
                            <div v-if="state.items.length === 0" class="ww100 p15 i2">暂无数据</div>
                        </div>
                        <div class="flex-ec mt10">
                          <el-pagination
                            background
                            layout="prev, pager, next, sizes, jumper"
                            :total="state.total"
                            :page-size="state.limit"
                            :current-page="state.page"
                            @size-change="onSizeChange"
                            @current-change="onPageChange"
                          />
                        </div>
                    </div>
                </div>

                <!-- Right Column: Hot Knowledge -->
                <div class="w280 hh100 bg-white rad8 flex-col overflow-hidden p20">
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

          <div class="layout-col bg-white rad8 p15 hh100 hidden" v-else-if="state.activeColumnCode === 'case' || state.activeColumnCode === 'expert'">
             <!-- Grid Layout -->
             <div class="fw f16 mb10">{{ state.activeColumnName }}</div>
             <div class="flex1 overflow-y-auto" v-loading="state.loading">
                 <div class="grid-container">
                     <div v-for="(item, index) in state.items" :key="index" class="grid-card rad8 overflow-hidden bo-e cursor hover-shadow transition-all bg-white" @click="openItem(item.id)">
                         <div class="cover-box relative" style="padding-top: 56.25%;">
                             <img v-if="firstImage(item)" :src="firstImage(item)" class="absolute top0 left0 ww100 hh100 object-cover" />
                             <img v-else :src="`https://picsum.photos/400/225?random=${index}`" class="absolute top0 left0 ww100 hh100 object-cover" />
                         </div>
                         <div class="p15">
                             <div class="f16 fw line1 mb10" :title="item.title" style="color: #333;">{{ item.title }}</div>
                             <div class="flex-bc c9 f12">
                                 <span>{{ item.publish_time || '2023-01-01' }}</span>
                                 <i-ep-arrow-right class="f14" />
                             </div>
                         </div>
                     </div>
                 </div>
                 <div v-if="state.items.length === 0" class="ww100 p15 i2">暂无数据</div>
             </div>
             <div class="flex-ec mt10">
              <el-pagination
                background
                layout="prev, pager, next, sizes, jumper"
                :total="state.total"
                :page-size="state.limit"
                :current-page="state.page"
                @size-change="onSizeChange"
                @current-change="onPageChange"
              />
            </div>
          </div>

          <div class="layout-col bg-white rad8 p15 hh100 hidden" v-else>
            <!-- Default Table Layout -->
            <div class="fw f16 mb10">{{ state.activeColumnName || '文章列表' }}</div>
            <div class="table-col" v-loading="state.loading">
              <div v-if="state.items.length === 0" class="ww100 p15 i2">暂无数据</div>
              <div v-else>
                <div
                  v-for="v in state.items"
                  :key="v.id"
                  class="kb-row cursor"
                  @click.stop="openItem(v.id)"
                >
                  <div class="flex-bc ww100">
                    <div class="flex-sc flex1 hidden">
                      <el-image
                        v-if="showThumb && firstImage(v)"
                        :src="firstImage(v)"
                        :preview-src-list="getImageUrls(v)"
                        :initial-index="0"
                        fit="cover"
                        style="width: 72px; height: 48px; border-radius: 4px; margin-right: 12px"
                      />
                      <span v-for="(t, idx) in getItemCategories(v)" :key="`${v.id}-${idx}`" class="kb-tag mr15">{{ t }}</span>
                      <span class="f14 line1">{{ v.title }}</span>
                    </div>
                    <span class="c9 f14">{{ v.publish_time || '-' }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex-ec mt10">
              <el-pagination
                background
                layout="prev, pager, next, sizes, jumper"
                :total="state.total"
                :page-size="state.limit"
                :current-page="state.page"
                @size-change="onSizeChange"
                @current-change="onPageChange"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="state.addVisible" title="新增二级分类" width="420px">
      <div class="flex-sc">
        <span class="mr10">分类名称</span>
        <div class="flex1">
          <el-input v-model="state.addName" placeholder="请输入" maxlength="30" show-word-limit />
        </div>
      </div>
      <template #footer>
        <div class="flex-ec">
          <div class="rad4 ptb5 plr12 flex-cc cursor bg-white c8 bo-cc-1" @click.stop="closeAddDialog()">取消</div>
          <div class="rad4 ptb5 plr12 flex-cc cursor bgi1 white bo-i1-1 ml15" @click.stop="submitAdd()">确定</div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
  import api from '@/api'

  const { proxy }: any = getCurrentInstance()
  type KbCategory = { id: number | string; name: string }
  type KbColumn = { code: string; name: string; count?: number; desc?: string; children?: KbCategory[] }

  const state = reactive({
    q: '',
    columns: [] as KbColumn[],
    openMap: {} as Record<string, boolean>,
    activeColumnCode: '',
    activeColumnName: '',
    activeCategoryId: '' as any,
    items: [] as Array<any>,
    total: 0,
    page: 1,
    limit: 10,
    loading: false,
    addVisible: false,
    addColumnCode: '',
    addName: '',
  })

  const showThumb = computed(() => state.activeColumnCode === 'expert' || state.activeColumnCode === 'case')

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
    await init()
  })

  const getImageUrls = (row: any) => {
    let arr = row?.image_urls
    if (typeof arr === 'string') {
        try {
            arr = JSON.parse(arr)
        } catch {
            arr = [arr]
        }
    }
    if (!Array.isArray(arr)) return []
    return arr.map((x: any) => String(x)).filter((x: string) => x.trim())
  }

  const firstImage = (row: any) => getImageUrls(row)[0] || ''

  const init = async () => {
    state.loading = true
    try {
      const columnsRes: any = await api.kbColumnsApi({})
      const cols = (columnsRes?.data?.columns ?? columnsRes?.columns ?? []) as KbColumn[]
      state.columns = cols.map((c) => ({ ...c, children: c.children ?? [] }))
      state.openMap = state.columns.reduce<Record<string, boolean>>((acc, c) => {
        acc[c.code] = true
        return acc
      }, {})
      if (!state.activeColumnCode && state.columns.length > 0) {
        state.activeColumnCode = state.columns[0].code
        state.activeColumnName = state.columns[0].name
        const firstChild = state.columns[0].children?.[0]
        if (firstChild) state.activeCategoryId = firstChild.id
      }
      await loadItems(1)
    } catch (e) {
      state.columns = []
      state.items = []
      state.total = 0
    } finally {
      state.loading = false
    }
  }

  const search = () => {
    loadItems(1)
  }

  const toggleColumn = (code: string) => {
    state.openMap[code] = !state.openMap[code]
    if (state.activeColumnCode !== code) {
      const col = state.columns.find((x) => x.code === code)
      state.activeColumnCode = code
      state.activeColumnName = col?.name ?? ''
      state.activeCategoryId = ''
      loadItems(1)
    }
  }

  const selectCategory = async (code: string, id: any) => {
    if (state.activeColumnCode !== code) {
      const col = state.columns.find((x) => x.code === code)
      state.activeColumnCode = code
      state.activeColumnName = col?.name ?? ''
    }
    state.activeCategoryId = id
    await loadItems(1)
  }

  const openItem = (id: any) => {
    proxy.toPath(`/knowledge/item/${id}`)
  }

  const onPageChange = (p: number) => {
    state.page = p
    loadItems(p)
  }

  const onSizeChange = (s: number) => {
    state.limit = s
    loadItems(1)
  }

  const loadItems = async (page: number) => {
    state.loading = true
    // Adjust limit for grid view
    if (state.activeColumnCode === 'case' || state.activeColumnCode === 'expert') {
        state.limit = 12
    } else {
        state.limit = 10 // Default limit for table
    }

    try {
      const payload = {
        column_code: state.activeColumnCode,
        category_id: state.activeCategoryId || '',
        q: state.q,
        page,
        limit: state.limit,
      }
      const res: any = await api.kbItemsApi(payload)
      const data = res?.data ?? res
      state.items = data?.items ?? []
      state.total = Number(data?.total ?? 0) || 0
      state.page = page
    } catch (e) {
      state.items = []
      state.total = 0
    } finally {
      state.loading = false
    }
  }

  const getItemCategories = (it: any) => {
    const names = it?.category_names ?? it?.categories ?? null
    if (Array.isArray(names) && names.length) return names.map((x) => String(x)).filter(Boolean)
    const single = it?.category_name ?? it?.category ?? ''
    const v = String(single).trim()
    return v ? [v] : ['-']
  }

  const openAddDialog = (code: string) => {
    state.addColumnCode = code
    state.addName = ''
    state.addVisible = true
  }

  const closeAddDialog = () => {
    state.addVisible = false
    state.addName = ''
    state.addColumnCode = ''
  }

  const submitAdd = async () => {
    const name = String(state.addName ?? '').trim()
    const code = String(state.addColumnCode ?? '').trim()
    if (!name || !code) return
    try {
      const res: any = await api.kbCategoryAddApi({ column_code: code, name })
      const created = res?.data?.category ?? res?.category ?? null
      await init()
      if (created?.id != null) {
        state.activeColumnCode = code
        const col = state.columns.find((x) => x.code === code)
        state.activeColumnName = col?.name ?? ''
        state.activeCategoryId = created.id
        await loadItems(1)
      }
    } finally {
      closeAddDialog()
    }
  }
</script>

<style scoped lang="scss">
  .kb-left{
    width: 280px;
  }
  .kb-group{
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(228, 231, 237, 0.8);
    margin-bottom: 12px;
  }
  .kb-group:last-child{
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
  .kb-children{
    padding-left: 22px;
    margin-top: 10px;
  }
  .kb-child{
    padding: 6px 0;
  }
  .kb-child-normal{
    color: #7b8794;
  }
  .kb-child-active{
    color: #266fff;
    font-weight: bold;
  }
  .kb-add{
    border: 1px solid #266fff;
    color: #266fff;
    border-radius: 4px;
    padding: 6px 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 120px;
  }
  .kb-search-btn{
    width: 56px;
    height: 32px;
  }
  .kb-row{
    padding: 12px 0;
    border-bottom: 1px dashed rgba(228, 231, 237, 0.9);
  }
  .kb-row:last-child{
    border-bottom: none;
  }
  .kb-tag{
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(38, 111, 255, 0.6);
    color: #266fff;
    border-radius: 3px;
    padding: 2px 8px;
    font-size: 12px;
    white-space: nowrap;
  }

  /* Added styles from column.vue */
  .policy-banner {
      height: 280px !important;
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
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); /* slightly smaller min-width for sidebar layout */
      gap: 15px;
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
