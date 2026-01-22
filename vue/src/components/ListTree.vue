<template>
    <div class="layout-col">
      <div class="row" v-if="!state.listRow">
        <div :style="{textAlign: v.align, paddingRight: v.name=='操作'?'10px': 'inherit'}" v-for="(v, i) in state.content" :key="i" v-show="v.show" :class="v.width">{{v.name}}</div>
      </div>
      <div class="table-col bg-white">
        <el-tree 
        class="ww100" 
        ref="treeRef" 
        :data="state.tree"
        :node-key="state.key" 
        :current-node-key="defaultId"
        :default-expand-all="state.listExpand"
        :props="state.defaultProps"
        highlight-current    
        @node-click="handleNodeClick"
        empty-text="暂无数据">
          <template #default="{ node, data }">
            <span class="row">
              <div v-show="v.show" :class="v.width" :style="{textAlign: v.align}" v-for="(v, i) in state.content" :key="i">
                <span v-if="typeof(v.key) == 'object'" class="cursor mlr5" v-for="(vv, kk, ii) in v.key" :key="ii" :class="kk=='add'||state.auth[kk] == false?'none':kk=='del'?'i8':'i1'" @click.stop="emit('handleClick', kk, item)">{{vv}}</span>
                <span v-else-if="v.type == 'select'" :class="find(v.list, [v.value, data[v.key]], 'color')?find(v.list, [v.value, data[v.key]], 'color'):''">
                  {{find(v.list, [v.value, data[v.key]], v.label)}}
                </span>
                <span v-else-if="v.type == 'icon'" class="flex-ss">
                  <span class="w20 mr5">
                    <i-ep-folderOpened v-if="data.parent_id == 0" />
                    <i-ep-folder v-else />
                  </span>
                  <span class="line2">{{data[v.key]}}</span>
                </span>
                <span v-else>{{isNull(data[v.key]) && v.key!=''? '/' : data[v.key]}}</span>
              </div>
            </span>
          </template>
        </el-tree>
      </div>
    </div>
</template>

<script lang="ts" setup>
  const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  // const state = reactive({
	//   ...publicStore.$state,
  // })
  const treeRef = ref()
  const defaultId = ref()
  const emit = defineEmits(['handleNodeClick', 'handleClick'])
  const props = defineProps({
    state: {
      type: [Object, Array],
      default: ()=>{return {}}
    },
  })

  // 触发弹窗事件
  const onVisable = async (val?: any) => {}

  // 树结构点击事件
  const handleNodeClick = async(val) => {
    defaultId.value = val[props.state.key]
    treeRef.value.setCurrentKey(defaultId.value, true)
    emit('handleNodeClick', val)
  }
 
  // 暴露给父组件
  defineExpose({
    onVisable,
    handleNodeClick
  })
</script>

<style scoped lang="scss">

</style>
