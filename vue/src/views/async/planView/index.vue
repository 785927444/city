<template>
  <div class="ww100 hh100 overlay">
    <div v-if="state.canView" class="ww100 hh100">
      <m1 class="rad8 hidden" />
      <m2 class="rad8 hidden" :class="publicStore.actIndex==1?'hhover':''" v-show="publicStore._public.tabType == 'special'" />
      <div v-show="publicStore._public.tabType == 'region'" class="ww100 flex-col bg-white p20 mt20 rad8">
        <!-- 这里是片区策划的内容，暂时显示一个占位或者复用其他组件 -->
        <div class="f20 fw mb20">片区策划列表</div>
        <div class="flex-sc warp">
          <!-- 这里可以根据 parent_id 查出来的 designs 循环显示 -->
          <div v-for="item in state.designs" :key="item.id" class="w50x4 p15 bo-i16-1 rad8 mr20 mb20 cursor hover-i1" @click="toPath('/schemeDesignView', {id: item.id})">
            <div class="f16 fw mb10">{{ item.name }}</div>
            <div class="f12 c9">所属地区：{{ item.province_name }}{{ item.city_name }}{{ item.district_name }}</div>
          </div>
          <div v-if="proxy.isNull(state.designs)" class="ww100 tc ptb50 c9">暂无片区策划</div>
        </div>
      </div>
    </div>
    <div v-else class="ww100 hh100 flex-cc f24 cc bg-white rad8">
      抱歉，您没有权限查看该项目
    </div>
  </div>
</template>

<script lang="ts" setup>
  import m1 from './m1'
  import m2 from './m2'
  import { toPath } from '@/utils/common'
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const route = useRoute()
  const state = reactive({
	  ...publicStore.$state,
    tabType: 'special', // special: 专项规划, region: 片区策划
    canView: true,
  })

  onMounted(async() => {
    publicStore.actIndex = 1
    await init()
    getDesignNum()
  })

  const checkLevel = (item) => {
    if (!item) return 1
    // 只有省就是省级 (1) 有省有市就市级别 (2) 有省有市有区就是区级别 (3)
    const p = item.province || item.province_name
    const c = item.city || item.city_name
    const d = item.district || item.district_name
    if (p && c && d) return 3
    if (p && c) return 2
    if (p) return 1
    return 1
  }

  const getDesignNum = async () => {
    let query = {model: `t_scheme_design`, args: `parent_id='${route.query.id}'`}
    let res = await publicStore.http({Api: query})
    let list = proxy.isNull(res) ? [] : res
    
    // 过滤片区策划
    state.designs = list.filter(item => {
      const itemLevel = checkLevel(item)
      const userLevel = configStore.user.level || 1
      // 省级用户(1)看到所有, 市级(2)看到2和3, 区级(3)只能看3
      if (userLevel == 2 && itemLevel == 1) return false
      if (userLevel == 3 && (itemLevel == 1 || itemLevel == 2)) return false
      return true
    })
    
    publicStore._public.design_num = state.designs.length
  }

  const init = async(key) => {
    let query = {model: `t_scheme_plan`, args: `id='${route.query.id}'`}
    let res = await publicStore.http({Api: query})
    let data = proxy.isNull(res)? {} : res[0]
    
    // 校验可见性
    const itemLevel = checkLevel(data)
    const userLevel = configStore.user.level || 1
    // 省级用户(1)看到所有, 市级(2)看到2和3, 区级(3)只能看3
    if (userLevel == 2 && itemLevel == 1) state.canView = false
    if (userLevel == 3 && (itemLevel == 1 || itemLevel == 2)) state.canView = false

    if (state.canView) {
      state.designs = []
      await getDesignNum()
      try {
        if(data.datetime){
          data.datetime = JSON.parse(data.datetime)
          data.datetime = `${data.datetime[0]}-${data.datetime[1]}`
        }else{
          data.datetime = ''
        }
        data.attr = data.attr? JSON.parse(data.attr) : {}
        data.project = data.project? JSON.parse(data.project) : []
        data.task = data.task? JSON.parse(data.task) : []
      } catch (error) {
        console.error("解析失败:", error.message)
      }
    }
    publicStore.active = {...data}
    publicStore._public.tabType = state.tabType
  }
</script>
  
<style scoped lang="scss">
.hhover{height: 1000px;}
</style>
  
