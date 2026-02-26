<template>
  <div class="ww100 flex-col">
    <div class="ww100 flex-sc pb15 plr15">
      <div class="mr50 pb10 f18 relative cursor actfont" :class="state.active && state.active.name == v.name?'i1 bob-i1-2':'bob-tt-2'" v-for="(v, i) in props.plans?props.plans:[]" :key="i" @click.stop="state.active = {...v}" >
      <el-popover :content="v.describe" placement="top-start">
          <template #reference>
            <div class="absolute f14 t0 r-18">
              <i-ep-questionFilled v-show="v.describe" />
            </div>
          </template>
        </el-popover>
        <span>{{ v.name }}</span>
      </div>
    </div>
    <div class="ww100 rad5 flex-sc warp">
      <div class="ww25 flex-sc ptb8 pr16" v-if="state.active&&files" v-for="(v, i) in pagedContents" :key="i">
        <div class="ww100 bs bo-i16-1 relative rad8">
          <div class="ww100 flex-sc p12 bob-ce-1">
            <span class="f15">{{ v.name }}</span>
            <span class="flex1 flex-ec">
              <UploadText v-if="v.type" v-model:model="files[v.type]" />
            </span>
          </div>
          <div class="ww100 flex-col p12">
            <div class="ww100 flex-sc">
              <span class="w90 c8">上传状态</span>
              <span class="flex1 line1">{{ files[v.type]&&files[v.type]['status']?files[v.type]['status']=='success'?'成功':'失败':'-' }}</span>
            </div>
            <div class="ww100 flex-sc mt12">
              <span class="w90 c8">文件类型</span>
              <span class="flex1 line1">{{ files[v.type]&&files[v.type]['type']?files[v.type]['type']:'-' }}</span>
            </div>
            <div class="ww100 flex-sc mt12">
              <span class="w90 c8">上传时间</span>
              <span class="flex1 line1">{{ files[v.type]&&files[v.type]['time']?parseTime(files[v.type]['time']):'-' }}</span>
            </div>
            <div class="ww100 flex-ec mt12">
              <span v-if="files[v.type]" class="ml12 i1 cursor" @click.stop="viewFile(v)">预览</span>
              <span v-else class="ml12 ca">预览</span>
              <span v-if="files[v.type]" class="ml12 i9 cursor" @click.stop="delFile(v)">删除</span>
              <span v-else class="ml12 ca">删除</span>
            </div>
          </div>
        </div>
      </div>
      <ViewFiles ref="viewRef" />
    </div>
    <Pagination
      v-show="total > 0"
      :total="total"
      v-model:page="state.page"
      v-model:limit="state.limit"
    />
  </div>
</template>

<script lang="ts" setup>
  const { proxy } = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  let viewRef = $ref()
  const files = defineModel('files')
  const props = defineProps({
    contents: {
      type: Array,
      default: []
    },
    plans: {
      type: Array,
      default: []
    },
    active: {
      type: [Object, Array],
      default: ()=>{return {}}
    },
  })

  const state = reactive({ 
    active: {},
    page: 1,
    limit: 12
  })

  const filteredContents = computed(() => {
    if (!state.active || !props.contents) return []
    return props.contents.filter(a => a.parent_id == state.active.id)
  })

  const total = computed(() => filteredContents.value.length)

  const pagedContents = computed(() => {
    const start = (state.page - 1) * state.limit
    const end = start + state.limit
    return filteredContents.value.slice(start, end)
  })

  const syncActive = (val) => {
    if (!proxy.isNull(val)) {
      state.active = { ...val }
      state.page = 1
      return
    }
    const first = Array.isArray(props.plans) ? props.plans[0] : null
    state.active = proxy.isNull(first) ? {} : { ...first }
    state.page = 1
  }

  watch(() => props.active, (val) => {
    syncActive(val)
  },{ immediate: true, deep: true })

  // 监听 active 切换时重置页码
  watch(() => state.active, () => {
    state.page = 1
  })

  // 预览
  const viewFile = (v) => {
    let val = files.value[v.type]
    const filePath = val.data
    viewRef.onVisable(filePath)
  }

  // 删除
  const delFile = async(v) => {
    delete files.value[v.type]
  }

</script>

<style lang="scss" scoped>
.bob-tt-2 { border-bottom: 2px solid transparent; }
.r-18{ right: -18px; }
</style>
