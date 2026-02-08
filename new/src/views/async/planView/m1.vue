<template>
  <div class="ww100 flex-col hidden bg-white p20">
    <div class="ww100 fw f16 flex-bc">
      <span class="bob-ca-3 pb10">{{ publicStore.active.name??'' }}</span>
      <span class="plr12 ptb8 rad4 bgi1 white cursor f14" @click.stop="toPath('/schemePlansManagerCity')">返 回</span>
    </div>
    <div class="ww100 flex-sc warp bgi16 p10 rad5 mt20">
      <div class="ww33 flex-sc p10">
        <span class="w110">规划周期</span>
        <span class="flex1 line1 flex-sc">{{ publicStore.active.datetime?publicStore.active.datetime:'-' }}</span>
      </div>
      <div class="ww33 flex-sc p10">
        <span class="w110">所属地区</span>
        <span class="flex1 line1 flex-sc">
          <span class="mr2" v-if="publicStore.active.province_name">{{ publicStore.active.province_name }}</span>
          <span class="mr2" v-if="publicStore.active.city_name">{{ publicStore.active.city_name }}</span>
          <span class="mr2" v-if="publicStore.active.district_name">{{ publicStore.active.district_name }}</span>
        </span>
      </div>
      <div class="ww33 flex-sc p10">
        <span class="w110">规划状态</span>
        <span class="flex1 line1 flex-sc ptb2 rad3 hidden">
          <!-- 待上报 -->
          <span class="plr12 ptb6 rad3 bgc c6" v-if="publicStore.active.release_status == '0'">{{ find(release_statuss, ['value', publicStore.active.release_status], 'name') }}</span>
          <!-- 已上报，待审核 -->
          <span class="plr12 ptb6 rad3 bgi13 i15" v-else-if="publicStore.active.release_status == '1'&&publicStore.active.examine_status=='0'">{{ find(examine_statuss, ['value', publicStore.active.examine_status], 'name') }}</span>
          <!-- 已上报，审核中 -->
          <span class="plr12 ptb6 rad3 bgi13 i15" v-else-if="publicStore.active.release_status == '1'&&publicStore.active.examine_status=='1'">{{ find(examine_statuss, ['value', publicStore.active.examine_status], 'name') }}</span>
          <!-- 已上报，审核不通过 -->
          <span class="plr12 ptb6 rad3 bgi7 i9" v-else-if="publicStore.active.release_status == '1'&&publicStore.active.examine_status=='3'">{{ find(examine_statuss, ['value', publicStore.active.examine_status], 'name') }}</span>
          <!-- 审核通过，待开始 -->
          <span class="plr12 ptb6 rad3 bgc c6" v-else-if="publicStore.active.examine_status=='2'&&publicStore.active.completion_status=='0'">{{ find(completion_statuss, ['value', publicStore.active.completion_status], 'name') }}</span>
          <!-- 审核通过，进行中 -->
          <span class="plr12 ptb6 rad3 bgi10 i12" v-else-if="publicStore.active.examine_status=='2'&&publicStore.active.completion_status=='1'">{{ find(completion_statuss, ['value', publicStore.active.completion_status], 'name') }}</span>
          <!-- 审核通过，已完成 -->
          <span class="plr12 ptb6 rad3 bgi10 i12" v-else-if="publicStore.active.examine_status=='2'&&publicStore.active.completion_status=='2'">{{ find(completion_statuss, ['value', publicStore.active.completion_status], 'name') }}</span>
          <span class="plr12 ptb6 rad3 bgc c6" v-else>状态补充</span>
        </span>
      </div>
      <div class="ww33 flex-sc p10">
        <span class="w110">片区数量</span>
        <span class="flex1 line1 flex-sc">{{ publicStore._public?.design_num?publicStore._public.design_num:'0' }}</span>
      </div>
      <div class="ww33 flex-sc p10">
        <span class="w110">项目数量</span>
        <span class="flex1 line1 flex-sc">{{ publicStore.active.project_num?publicStore.active.project_num:'0' }}</span>
      </div>
      <div class="ww33 flex-sc p10">
        <span class="w110">上报单位</span>
        <span class="flex1 line1 flex-sc">{{ publicStore.active.user_name?decrypt(publicStore.active.user_name):'-'  }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import router from '@/router'
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const dictStore = proxy.dictStore()
  const release_statuss = [
    {value: '0', name: '待上报'},
    {value: '1', name: '已上报'},
  ]
  const completion_statuss = [
    {value: '0', name: '待开始'},
    {value: '1', name: '进行中'},
    {value: '2', name: '已完成'},
  ]
  const examine_statuss = [
    {value: '0', name: '待审核'},
    {value: '1', name: '审核中'},
    {value: '2', name: '已通过'},
    {value: '3', name: '不通过'},
  ]
  const types = [
    {type: 'special', name: '专项规划', path: '/schemePlansManagerCity'},
    {type: 'region', name: '片区策划', path: '/schemeDesignsManagerCity'},
  ]
  const state = reactive({
	  ...publicStore.$state,
    click: false,
    clickArr: [],
    status: '1',
    type: 'special',
    provinces: [],
    province: '',
    citys: [],
    city: '',
  })
</script>
  
<style scoped lang="scss">
.w110 { width: 110px; }
</style>
  