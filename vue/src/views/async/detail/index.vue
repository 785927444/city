<template>
  <div class="layout-col">
    <!-- 面包屑 -->
    <div class="ww100 flex-sc bs9 h40 mb15">
      <div class="cursor hh100 ptb10 plr20 i21"></div>
      <div class="cursor hh100 ptb10 plr20 i21"></div>
      <div class="flex1 hh100 flex-ec">
        <img src="@/assets/imgs/uu1.png" />
        <span class="ml15 cc cursor" @click.stop="router.go(-1)">返回</span>
        <span class="mlr10 cc">/</span>
        <span class="mr15 fontStyle">设备详情</span>
        <img src="@/assets/imgs/uu2.png" />
      </div>
    </div>
    <!-- 设备详情 -->
    <div class="layout-row plr15 pb15">
      <!-- 设备列表 -->
      <div class="layout-col flex1">
        <datas class="ww100 hidden flex1" ref="initRef" />
      </div>
      <!-- 数据分析 -->
      <div class="layout-col flex4 ml15">
        <!-- 标题 -->
        <div class="h40 ww100 flex-sc relative mb5">
            <img class="hh100" src="@/assets/imgs/title4.png" />
            <div class="ww100 hh100 flex-sc absolute pl35">
                <span class="fw ptb5">数据分析</span>
                <div class="flex-ec flex1">
                  <div class="flex-sc ml20">
                      <span class="plr10">时间</span>
                      <span class="w50x8">
                      <el-date-picker style="width:100%;" v-model="publicStore.datetime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
                          type="datetimerange" range-separator="-" start-placeholder="开始时间" end-placeholder="结束时间" @change="publicStore.status=false;initRef.init()" />
                      </span>
                  </div>
                </div>
            </div>
        </div>
        <!-- 内容 -->
        <div class="layout-row">
          <data1 class="flex2 hh100 hidden mr15" />
          <div class="flex7 hh100 hidden flex-col">
            <data2 class="hh100 hidden flex1 mb15" @init="publicStore.status=false;initRef.init()"/>
            <chart2 v-if="route.query&&route.query.code2" class="hh100 hidden flex1" />
            <alarm v-else class="hh100 hidden flex1" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import datas from './datas'
  import data1 from './data1'
  import data2 from './data2'
  import alarm from './alarm'
  import chart2 from './other/chart2'
  const router = useRouter()
  const route = useRoute()
  const { proxy }: any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const state = reactive({
    ...publicStore.$state,
  });
  let initRef = $ref()
</script>

<style lang="scss">

</style>
