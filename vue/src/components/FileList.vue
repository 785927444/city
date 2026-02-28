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
            <span class="flex1 flex-ec c8">格式：{{ v.filetype?find(dictStore.fileType, ['value', v.filetype], 'name'):'暂无' }}</span> 
          </div> 
          <div class="ww100 flex-col ptb12 plr12 h50x3 overlay">
            <!-- <Uploads :fileInfo="v" :fileList="file(files[v.type])" v-model:model="files[v.type]" /> -->
            <div class="ww100 flex-sc ptb5" v-for="(vv, ii) in v.files?v.files:[]" :key="ii"> 
              <div class="flex1 flex-sc hidden"> 
                <div class="i1">{{ ii+1 }}.</div> 
                <UploadText :fileType="v.filetype?[v.filetype]:[]" :model="vv" @update:model="(newFile) => onFileUpdate(v.type, ii, newFile)" /> 
              </div> 
              <div class="flex-ec hidden"> 
                <span v-if="vv.data" class="ml12 i1 cursor" @click.stop="viewFile(vv)">预览</span> 
                <span v-else class="ml12 ca">预览</span> 
                <span v-if="vv.data" class="ml12 i9 cursor" @click.stop="delFile(v.type, ii, vv)">删除</span> 
                <span v-else class="ml12 ca">删除</span> 
              </div> 
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
  const dictStore = proxy.dictStore()
  let viewRef = $ref() 
  let dataForm = $ref([])
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
    parentField: { 
      type: String, 
      default: '' 
    }, 
  }) 
 
  const state = reactive({ 
    active: {}, 
    page: 1, 
    limit: 10
  })
  
  const contentsWithFiles = ref([])
 
  const filteredContents = computed(() => { 
    if (!state.active || !props.contents) return [] 
    return props.contents.filter(a => a.parent_id == state.active.id) 
  }) 
 
  const total = computed(() => filteredContents.value.length) 
 
  const pagedContents = computed(() => { 
    const start = (state.page - 1) * state.limit 
    const end = start + state.limit 
    return contentsWithFiles.value.slice(start, end) 
  })
  
  const updateContentsWithFiles = () => {
    if (!files.value || !filteredContents.value.length) {
      contentsWithFiles.value = []
      return
    }
    
    const result = []
    
    filteredContents.value.forEach(v => {
      const matchedFiles = Array.isArray(files.value) && files.value.length > 0 ? files.value.filter(a => a.type == v.type) : []
      const filelimit = v.filelimit || 1
      const placeholderCount = Math.max(0, filelimit - matchedFiles.length)
      
      const displayFiles = [...matchedFiles]
      for (let i = 0; i < placeholderCount; i++) { 
        displayFiles.push({ 
          name: '', 
          id: '', 
          parent_id: '',
          data: '', 
          time: '', 
          type: v.type, 
          _isPlaceholder: true
        }) 
      }
      
      result.push({
        ...v,
        files: displayFiles
      })
    })
    
    contentsWithFiles.value = result
  }
  
  watch([() => files.value, () => filteredContents.value, () => state.active], () => {
    updateContentsWithFiles()
  }, { immediate: true, deep: true })
  
  const onFileUpdate = (type, index, newFile) => {
    if (!files.value) files.value = []
    
    const matchedFiles = files.value.filter(a => a.type === type)
    const existingFile = matchedFiles[index]
    
    if (existingFile && !existingFile._isPlaceholder) {
      Object.assign(existingFile, newFile, { parent_field: props.parentField })
    } else {
      const newFileData = {
        ...newFile,
        type: type,
        parent_field: props.parentField
      }
      files.value.push(newFileData)
    }
  }
 
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
  }, { immediate: true, deep: true }) 
 
  watch(() => state.active, () => { 
    state.page = 1 
  })
 
  const viewFile = (v) => { 
    const filePath = v.data 
    viewRef.onVisable(filePath) 
  } 
 
  const delFile = (type, index, file) => { 
    if (!file.data) return
    
    const fileIndex = files.value.findIndex(f => f === file || (f.type === type && f.data === file.data))
    if (fileIndex > -1) {
      files.value.splice(fileIndex, 1)
    }
  } 
 
</script> 
 
<style lang="scss" scoped> 
.bob-tt-2 { border-bottom: 2px solid transparent; } 
.r-18{ right: -18px; } 
</style>