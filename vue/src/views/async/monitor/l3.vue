<template>
  <div class="layout-col">
    <!-- 标题 -->
    <div class="h40 ww100 flex-sc relative mb5">
      <img class="hh100" src="@/assets/imgs/title.png" />
      <div class="ww100 hh100 flex-sc absolute pl35">
        <span class="fw flex1 ptb5">调节幅度排名</span>
      </div>
    </div>
    <!-- 内容 -->
    <div class="layout-col relative p20 ba1">
      <div class="rank_line"></div>
      <div class="flex-col ww100">
        <div class="ww100 flex-sc mb25" v-for="(v, i) in publicStore._public.rankData?publicStore._public.rankData.slice(0, 3):[]" :key="i" >
          <div class="w12 h12 rad100 bgi22 bo-white-3"></div>
          <div class="w80 tc" :class="i==0?'i6': i==1?'i21': i==2?'i30': i==3||i==4?'i29': 'white'">NO{{i+1}}</div>
          <div class="flex1 hh100 flex-sc relative">
            <img v-if="i==0" class="ww100 absolute" src="@/assets/imgs/title_rank1.png" />
            <img v-if="i==1" class="ww100 absolute" src="@/assets/imgs/title_rank2.png" />
            <img v-if="i==2" class="ww100 absolute" src="@/assets/imgs/title_rank3.png" />
            <img v-if="i==3 || i==4" class="ww100 absolute" src="@/assets/imgs/title_rank4.png" />
            <img v-else class="ww100 absolute" src="@/assets/imgs/title_rank5.png" />
            <div class="flex1 pl20">{{v.name}}</div>
            <div class="flex1 i15 flex-bc">
              <span>调节幅度</span>
              <span>
                <span class="white">{{v.value}}</span>
                <span class="ml5">kW</span>
              </span>
            </div>
          </div>
        </div>
      </div>
      <loopScroll :listData="publicStore._public.rankData?publicStore._public.rankData:[]" class="layout-col">      
        <div class="ww100 flex-sc mb25" v-for="(v, i) in publicStore._public.rankData?publicStore._public.rankData.slice(3):[]" :key="i" >
          <div class="w12 h12 rad100 bgi22 bo-white-3"></div>
          <div class="w80 tc" :class="i==0||i==1?'i29': 'white'">NO{{i+4}}</div>
          <div class="flex1 hh100 flex-sc relative">
            <img v-if="i==0 || i==1" class="ww100 absolute" src="@/assets/imgs/title_rank4.png" />
            <img v-else class="ww100 absolute" src="@/assets/imgs/title_rank5.png" />
            <div class="flex1 pl20">{{v.name}}</div>
            <div class="flex1 i15 flex-bc">
              <span>调节幅度</span>
              <span>
                <span class="white">{{v.value}}</span>
                <span class="ml5">kW</span>
              </span>
            </div>
          </div>
        </div>
      </loopScroll>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import loopScroll from 'loop-scroll';
  const { proxy }: any = getCurrentInstance();
  const publicStore = proxy.publicStore();
  const configStore = proxy.configStore();
  const state = reactive({
    ...publicStore.$state,
  });

</script>

<style scoped lang="scss">
.rank_line{
  width: 4px;
  height: 100%;
  position: absolute;
  top: 24px;
  left: 24px;
  z-index: -1;
  opacity: 1;
  box-sizing: border-box;
  background: linear-gradient(to bottom, rgba(238, 246, 255, 1) 10%, rgba(238, 246, 255, 0) 100%);
}
</style>
