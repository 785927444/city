<template>
  <div class="layout-col">
    <div class="hh100 flex-col pplr15 hidden">
      <!-- 切换 -->
      <div class="ww100 flex-sc pt20 pb15 plr15">
        <div class="mr40 ptb10 f18 relative cursor actfont" 
        :class="publicStore.current.value == v.value?'i1 bob-i1-2':'bob-tt-2'" 
        v-for="(v, i) in props.state.type=='plan'?activeTab:activeTab.filter(a=>a.value=='1')" :key="i" @click.stop="publicStore.current = {...v}" >
        <el-popover :content="v.describe" placement="top-start">
            <template #reference>
              <div class="absolute f14 t10 r-18">
                <i-ep-questionFilled v-show="v.describe" />
              </div>
            </template>
          </el-popover>
          <span>{{ v.name }}</span>
        </div>
      </div>
      <!-- 列表 -->
      <div class="layout-col">
        <Step21 :type="props.state.type" v-show="publicStore.current.value=='1'" />
        <Step22 :type="props.state.type" v-show="publicStore.current.value=='2'" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const activeTab = [
    {value: '1', name: '项目清单'},
    {value: '2', name: '重点落实项目'},
  ]
  const state = reactive({
	  ...publicStore.$state,
  })
  const props = defineProps({
    state: {
      type: [Object, Array],
      default: ()=>{return {}}
    },
  })

  onMounted(async() => {
    publicStore.current = {...activeTab[0]}
  })

</script>
  
<style scoped lang="scss">
.bob-tt-2 { border-bottom: 2px solid transparent; }
.r-18{ right: -18px; }
</style>
  