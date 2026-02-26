<template>
  <div class="layout-col">
    <div class="row bgi16" v-if="!state.listRow">
      <div :style="{textAlign: v.align}" v-for="(v, i) in state.content" :key="i" v-show="v.show" :class="typeof(v.key) == 'object'?v.width +' '+ 'mlr5':v.width">{{v.name}}</div>
    </div>
    <div class="table bg-white">
      <div class="row cursor" :class="publicStore.active[state.key] == item[state.key]?'active':index%2 == 1?'i2':'i2'" v-for="(item, index) in hasLists? lists : state.list" :key="index" @click.stop="emit('handleClick', 'active', item)">
        <div v-show="v.show" :class="v.width" :style="{textAlign: v.align}" v-for="(v, i) in state.content" :key="i">
          <span v-if="typeof(v.key) == 'object'" class="cursor mlr5" :class="kk=='add'|| state.auth[kk] == false?'none':kk=='del'?'i8':'i1'" v-for="(vv, kk, ii) in v.key" :key="ii" @click.stop="emit('handleClick', kk, item)">{{vv}}</span>
          <div v-else-if="v.key=='-'" class="w18 h18 rad2 m-auto cursor flex-cc" :class="item['click']?'bgi1 white bo-i1-1':'bg-white bo-cc-1'" @click.stop="emit('handleClick', 'active', item)">
            <i-ep-select v-if="item['click']" class="f10" />
          </div>
          <span v-else-if="v.key=='*'">{{(state.page-1)*state.limit + index+1}}</span>
          <span v-else-if="v.type == 'time'">{{item[v.key] == 0?'/':parseTime(item[v.key])}}</span>
          <span v-else-if="v.type == 'select'" :class="find(v.list, [v.value, item[v.key]], 'color')?find(v.list, [v.value, item[v.key]], 'color'):''">
            {{find(v.list, [v.value, item[v.key]], v.label)}}
          </span>
          <span v-else-if="v.type == 'switch'">
            <el-switch v-model="item[v.key]" :active-text="v.value[1].name" :inactive-text="v.value[0].name" :active-value="v.value[1].value" :inactive-value="v.value[0].value" inline-prompt @change="handleClick('switch', item)"></el-switch>
          </span>
          <span v-else-if="v.type == 'editSelect'" class="i12 fw">
            <el-select v-model="item[v.key]" placeholder="请选择" style="width: 90%;" @change="emit('handleClick', 'change', item)">
              <el-option 
                v-for="(opt, oi) in (typeof v.options === 'function' ? v.options(item) : v.options)" 
                :key="oi" 
                :label="opt[v.label || 'name']" 
                :value="opt[v.value || 'id']" 
              />
            </el-select>
          </span>
          <span v-else-if="v.type == 'input'" class="i12 fw">
            <span v-if="item.mode==1&&v.key=='value'" :class="item[v.key]?'':'c9'">{{item[v.key]?item[v.key]:'/'}}</span>
            <el-input v-else v-model="item[v.key]" placeholder="暂无" style="width: 90%;" @focus="state.tempKey = v.key; state.tempValue = item[v.key]" @blur="handleChange(item)" />
          </span>
          <span v-else-if="v.type == 'preload'&&v.filed">{{item[v.key]?item[v.key][v.filed]:''}}</span>
          <span v-else-if="v.type == 'image'" class="flex-sc warp">
            <div class="flex-sc" v-if="typeof(item[v.key]) == 'string'">
              <el-image class="w25 h25 m2 rad3 cursor" v-if="item[v.key].length!=0" :src="I(item[v.key])" :preview-src-list="state.srcList" @click.stop="state.srcList= [];state.srcList.push(I(item[v.key]))" />
              <span class="w50 h25 ca flex-sc" v-else>暂无</span>
            </div>
            <div class="flex-sc" v-else v-for="(img, ii) in item[v.key]" :key="ii">
              <el-image :class="ii==0?'':'ml5'" class="w25 h25 rad3 cursor" :src="I(img)" :preview-src-list="state.srcList" @click.stop="state.srcList= [];state.srcList.push(I(img))" />
            </div>
          </span>
          <span v-else>{{isNull(item[v.key]) && v.key!=''? '/' : item[v.key]}}</span>
        </div>
      </div>
      <div v-if="state.empty" class="flex-cc ww100 tc ptb13">没有数据</div>
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
  const emit = defineEmits(['handleClick'])
  const props = defineProps({
    state: {
      type: [Object, Array],
      default: ()=>{return {}}
    },
    hasLists: {
      type: Boolean,
      default: false
    },
    lists: {
      type: Array,
      default: () => []
    }
  })

  // 触发弹窗事件
  const onVisable = async (val?: any) => {}
 
  // 暴露给父组件
  defineExpose({
    onVisable
  })
</script>

<style scoped lang="scss">

</style>
