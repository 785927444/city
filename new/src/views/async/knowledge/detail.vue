<template>
  <div class="layout-col">
    <aa-title :title="state.item.title || '文章详情'">
      <template #right-content>
        <div class="rad4 ptb5 plr8 flex-cc cursor bgi1 white ml10" @click.stop="back()">返回</div>
      </template>
    </aa-title>

    <div class="layout-row hh100 hidden">
      <div class="kb-left layout-col">
        <div class="bg-white rad8 p15 mb15">
          <div class="flex-bc ww100 mb12">
            <div class="fw f15">文档信息</div>
            <div class="flex-ec">
              <div
                class="kb-act flex-cc cursor mr10"
                :class="state.item.is_favorited ? 'kb-act-on' : 'kb-act-off'"
                @click.stop="toggleFavorite()"
              >
                <i-ep-starFilled v-if="state.item.is_favorited" class="f14 mr5" />
                <i-ep-star v-else class="f14 mr5" />
                <span class="f13">收藏</span>
              </div>
              <div class="kb-act kb-act-off flex-cc cursor" @click.stop="downloadAll()">
                <i-ep-download class="f14 mr5" />
                <span class="f13">下载</span>
              </div>
            </div>
          </div>

          <div class="kb-meta table-col">
            <div class="kb-meta-row flex-sc">
              <span class="kb-meta-k">文档名称</span>
              <span class="kb-meta-v line1">{{ state.item.title || '-' }}</span>
            </div>
            <div class="kb-meta-row flex-sc">
              <span class="kb-meta-k">创建时间</span>
              <span class="kb-meta-v">{{ state.item.created_at || '-' }}</span>
            </div>
            <div class="kb-meta-row flex-sc">
              <span class="kb-meta-k">修改时间</span>
              <span class="kb-meta-v">{{ state.item.updated_at || '-' }}</span>
            </div>
            <div class="kb-meta-row flex-sc">
              <span class="kb-meta-k">作者</span>
              <span class="kb-meta-v">{{ state.item.author || '-' }}</span>
            </div>
            <div class="kb-meta-row flex-sc">
              <span class="kb-meta-k">下载次数</span>
              <span class="kb-meta-v">{{ state.item.download_count ?? 0 }}</span>
            </div>
            <div class="kb-meta-row flex-sc">
              <span class="kb-meta-k">收藏次数</span>
              <span class="kb-meta-v">{{ state.item.favorite_count ?? 0 }}</span>
            </div>
          </div>
        </div>

        <div class="bg-white rad8 p15 flex1 hidden">
          <div class="fw f15 mb12">附件列表</div>
          <div class="kb-att table-col">
            <div v-if="attachments.length === 0" class="i2 p10">暂无附件</div>
            <div v-else>
              <div v-for="(a, idx) in attachments" :key="a.id" class="kb-att-row flex-bc">
                <div class="flex-sc flex1 hidden">
                  <span class="kb-att-no">{{ idx + 1 }}.</span>
                  <span class="kb-att-name line1">{{ a.file_name }}</span>
                </div>
                <div class="kb-att-info">
                  <span class="mr10">{{ (a.file_type || '').toUpperCase() || '-' }}</span>
                  <span>{{ formatSize(a.file_size) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex1 hh100 hidden ml15">
        <div class="bg-white rad8 p15 hh100 table-col" v-loading="state.loading">
          <div class="flex-bc ww100 mb10">
            <div class="fw f15">{{ state.item.column_name || state.item.column_code || '-' }}</div>
          </div>

          <div v-if="state.error" class="i2 p15">{{ state.error }}</div>
          <div v-else>
            <div class="kb-title tc fw mb10" style="color:#d84a4a">{{ state.item.title || '-' }}</div>
            <div class="kb-top-meta flex-cc i2 mb15">
              <span class="mr25">时间：{{ state.item.publish_time || '-' }}</span>
              <span>来源：{{ state.item.publish_org || '-' }}</span>
            </div>

            <div class="content" v-html="state.item.content || ''"></div>

            <div v-if="imageUrls.length" class="kb-imgs mt15">
              <el-image
                v-for="(u, idx) in imageUrls"
                :key="`${idx}-${u}`"
                :src="u"
                :preview-src-list="imageUrls"
                :initial-index="idx"
                fit="contain"
                style="width: 240px; height: 160px; border-radius: 6px; margin-right: 12px; margin-bottom: 12px"
              />
            </div>

            <div v-if="attachments.length" class="kb-related mt15">
              <span class="i2">相关附件：</span>
              <span class="kb-related-link">{{ attachments[0]?.file_name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import api from '@/api'
  import { saveAs } from 'file-saver'

  const route = useRoute()
  const router = useRouter()
  const { proxy }: any = getCurrentInstance()
  const configStore = proxy.configStore()

  const state = reactive({
    id: '',
    item: {} as any,
    loading: false,
    error: '',
  })

  const userId = computed(() => String(configStore?.user?.id ?? configStore?.user ?? '').trim() || 'anonymous')
  const attachments = computed(() => (Array.isArray(state.item?.attachments) ? state.item.attachments : []))
  const imageUrls = computed(() => {
    const arr = state.item?.image_urls
    if (!Array.isArray(arr)) return []
    return arr.map((x: any) => String(x)).filter((x: string) => x.trim())
  })

  onMounted(async () => {
    state.id = (route.params.id as string) || ''
    await init()
  })

  const init = async () => {
    if (!state.id) return
    state.loading = true
    state.error = ''
    try {
      const res: any = await api.kbItemApi({ id: state.id, user_id: userId.value })
      const item = res?.data?.item ?? res?.item ?? {}
      state.item = item || {}
      if (!item) state.error = '未找到该文章'
    } catch (e) {
      state.item = {}
      state.error = '加载失败，请稍后重试'
    } finally {
      state.loading = false
    }
  }

  const toggleFavorite = async () => {
    if (!state.id) return
    try {
      const res: any = await api.kbFavoriteToggleApi({ user_id: userId.value, item_id: state.id })
      const data = res?.data ?? res
      state.item.is_favorited = !!data?.is_favorited
      state.item.favorite_count = Number(data?.favorite_count ?? state.item.favorite_count ?? 0)
    } catch (e) {
      ElMessage({ type: 'error', message: '操作失败' })
    }
  }

  const resolveKbUrl = (url: string) => {
    const v = String(url ?? '').trim()
    if (!v) return ''
    const origin = String((import.meta as any)?.env?.VITE_KB_URL ?? '').trim()
    if (origin && v.startsWith('/kb-api/')) {
      return `${origin}${v}`
    }
    return v
  }

  const downloadAll = async () => {
    if (!state.id) return
    try {
      const res: any = await api.kbItemDownloadAllApi({ user_id: userId.value, item_id: state.id })
      const data = res?.data ?? res
      state.item.download_count = Number(data?.download_count ?? state.item.download_count ?? 0)
      const url = resolveKbUrl(String(data?.download_url ?? ''))
      if (url) {
        const resp = await fetch(url)
        if (!resp.ok) throw new Error(`download failed: ${resp.status}`)
        const blob = await resp.blob()
        const cd = resp.headers.get('content-disposition') || ''
        const m1 = /filename\*=UTF-8''([^;]+)/i.exec(cd)
        const m2 = /filename="?([^"]+)"?/i.exec(cd)
        const filename = decodeURIComponent((m1?.[1] || m2?.[1] || '').trim()) || `attachments-${state.id}.zip`
        saveAs(blob, filename)
        return
      }
      const lines = attachments.value.map((a: any, idx: number) => {
        const name = String(a?.file_name ?? '')
        const type = String(a?.file_type ?? '').toUpperCase() || '-'
        const size = formatSize(a?.file_size)
        return `${idx + 1}. ${name}  ${type}  ${size}`
      })
      const blob = new Blob([lines.join('\n') || 'no attachments'], { type: 'text/plain;charset=utf-8' })
      saveAs(blob, `attachments-${state.id}.txt`)
    } catch (e) {
      ElMessage({ type: 'error', message: '下载失败' })
    }
  }

  const formatSize = (v: any) => {
    const n = Number(v ?? 0) || 0
    if (n < 1024) return `${n} B`
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
    if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`
    return `${(n / 1024 / 1024 / 1024).toFixed(1)} GB`
  }

  const back = () => {
    router.back()
  }
</script>

<style scoped lang="scss">
  .kb-left{
    width: 300px;
  }
  .kb-act{
    height: 30px;
    padding: 0 10px;
    border-radius: 4px;
    border: 1px solid rgba(38, 111, 255, 0.8);
    user-select: none;
  }
  .kb-act-off{
    color: #266fff;
    background: #fff;
  }
  .kb-act-on{
    color: #fff;
    background: #266fff;
    border-color: #266fff;
  }
  .kb-meta-row{
    padding: 8px 0;
    border-bottom: 1px dashed rgba(228, 231, 237, 0.9);
  }
  .kb-meta-row:last-child{
    border-bottom: none;
  }
  .kb-meta-k{
    width: 84px;
    color: #7b8794;
  }
  .kb-meta-v{
    flex: 1;
    color: #2b2a2a;
  }
  .kb-att-row{
    padding: 10px 0;
    border-bottom: 1px dashed rgba(228, 231, 237, 0.9);
  }
  .kb-att-row:last-child{
    border-bottom: none;
  }
  .kb-att-no{
    width: 22px;
    color: #7b8794;
  }
  .kb-att-name{
    color: #2b2a2a;
  }
  .kb-att-info{
    color: #7b8794;
    font-size: 12px;
    white-space: nowrap;
  }
  .kb-title{
    color: #d91d1d;
    font-size: 18px;
  }
  .kb-top-meta{
    font-size: 12px;
  }
  .kb-related-link{
    color: #266fff;
  }
  .content{
    line-height: 1.8;
  }

  @media (max-width: 980px) {
    .kb-left{
      width: 100%;
    }
    .layout-row{
      flex-direction: column;
    }
    .ml15{
      margin-left: 0 !important;
      margin-top: 12px;
    }
  }
</style>
