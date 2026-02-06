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
          <div class="bg-white rad8 p15 mb15">
            <el-input v-model="state.q" placeholder="请输入关键词" clearable @keyup.enter="search()">
              <template #append>
                <div class="kb-search-btn flex-cc cursor bgi1 white" @click.stop="search()">
                  <i-ep-search class="f16" />
                </div>
              </template>
            </el-input>
          </div>

          <div class="layout-col bg-white rad8 p15 hh100 hidden">
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

  onMounted(async () => {
    await init()
  })

  const getImageUrls = (row: any) => {
    const arr = row?.image_urls
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
</style>
