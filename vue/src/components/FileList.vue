<template>
  <div class="ww100 plr30 ptb22 bo-i16-1 rad5 flex-sc warp bg-white">
    <div class="ww25 flex-sc ptb8 pr16" v-if="props.active&&files" v-for="(v, i) in props.contents?props.contents.filter(a=>a.parent_id==props.active.id):[]" :key="i">
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
    active: {
      type: [Object, Array],
      default: ()=>{return {}}
    },
  })

  const state = reactive({})

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

</style>
