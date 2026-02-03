<template>
  <div class="ww100 flex-sc bs1 p10">
    <div class="flex1 flex-sc hidden">
      <div class="flex-col-cc p10 flex1">
        <div class="fw f24">
          <span>{{ publicStore.active?.project_all_num?publicStore.active.project_all_num:'0'}}</span>
          <span class="mt10 ml5 f12">个</span>
        </div>
        <div class="mt5 c8">规划项目总数</div>
      </div>
      <div class="flex-col-cc p10 flex1">
        <div class="fw f24">
          <span>{{ publicStore.active?.project_pre_num?publicStore.active.project_pre_num:'0'}}</span>
          <span class="mt10 ml5 f12">个</span>
        </div>
        <div class="mt5 c8">前期研究与策划阶段项目数</div>
      </div>
      <div class="flex-col-cc p10 flex1">
        <div class="fw f24">
          <span>{{ publicStore.active?.project_scheme_num?publicStore.active.project_scheme_num:'0'}}</span>
          <span class="mt10 ml5 f12">个</span>
        </div>
        <div class="mt5 c8">规划方案设计项目数</div>
      </div>
      <div class="flex-col-cc p10 flex1">
        <div class="fw f24">
          <span>{{ publicStore.active?.project_examine_num?publicStore.active.project_examine_num:'0'}}</span>
          <span class="mt10 ml5 f12">个</span>
        </div>
        <div class="mt5 c8">规划审批与许可项目数</div>
      </div>
      <div class="flex-col-cc p10 flex1">
        <div class="fw f24">
          <span>{{ publicStore.active?.project_effect_num?publicStore.active.project_effect_num:'0'}}</span>
          <span class="mt10 ml5 f12">个</span>
        </div>
        <div class="mt5 c8">规划实施与衔接项目数</div>
      </div>
      <div class="flex-col-cc p10 flex1">
        <div class="fw f24">
          <span>{{ publicStore.active?.investment_completion_rate?publicStore.active.investment_completion_rate:'0'}}</span>
          <span class="mt10 ml5 f12">%</span>
        </div>
        <div class="mt5 c8">投资完成率</div>
      </div>
      <div class="flex-col-cc p10 flex1">
        <div class="fw f24">
          <span>{{ publicStore.active?.examine_pass_rate?publicStore.active.examine_pass_rate:'0'}}</span>
          <span class="mt10 ml5 f12">%</span>
        </div>
        <div class="mt5 c8">规划审核通过率</div>
      </div>
    </div>
    <div class="flex-ec">
      <div class="flex-sc mr30">
        <span class="mr10">行政区</span>
        <span class="w50x3">
          <el-select v-model="publicStore.actIndex" placeholder="请选择" style="width:100%" filterable>
            <el-option v-for="(v, i) in state.provinces" :key="v.value" :value="String(v.value)" :label="v.name" />
          </el-select>
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const state = reactive({
	  ...publicStore.$state,
  })

  onMounted(async() => {
    // 获取地区
    state.provinces = [{name: configStore.user.province_name, value: configStore.user.province}]
    publicStore.actIndex = state.provinces[0]['value']
  })

  watch(() => publicStore.actIndex, async(val) => {
    if(proxy.isNull(val)) return
    await nextTick()
    init()
  }, {immediate: false, deep: true})

  const init = async() => {
    
  }

</script>
  
<style scoped lang="scss">

</style>
  