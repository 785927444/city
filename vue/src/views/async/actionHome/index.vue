<template>
  <div class="ww100 hh100 flex-cc relative">
    <div class="ww80 hh100 flex-cc relative">
      <div class="background-shapes absolute ww100 hh100">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
      </div>
      
      <div class="card flex-col-ss cursor w100 h50x5" @click.stop="toPath('/basicProjectOverview')">
        <h2 class="fw f28 mb16">项目基础库</h2>
        <p class="c6 f16">所有上报的城市更新项目</p>
      </div>
      
      <div class="card flex-col-ss cursor w100 h50x5">
        <h2 class="fw f28 mb16">项目储备库</h2>
        <p class="c6 f16">符合储备项目条件的城市更新项目</p>
      </div>
      
      <div class="card flex-col-ss cursor w100 h50x5" @click.stop="toPath('/project-push')">
        <h2 class="fw f28 mb16">项目推送库</h2>
        <p class="c6 f16">符合贷款条件的项目</p>
      </div>
      
      <div class="card flex-col-ss cursor w100 h50x5" @click.stop="toPath('/annual-plan')">
        <h2 class="fw f28 mb16">年度计划</h2>
        <p class="c6 f16">本年度计划实施的城市更新项目</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const dictStore = proxy.dictStore()
  const route = useRoute()
  const state = reactive({
	  ...publicStore.$state,
  })

  onMounted(async() => {
    await getInit()
    init()
  })

  const getInit = async() => {}

  const init = async(key) => {}
</script>
  
<style scoped lang="scss">
.card {
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  flex: 1;
  margin: 0 15px;
}

.card:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.card:nth-child(2) {
  background: linear-gradient(135deg, #9cedd4 0%, #ffffff 100%);
}

.card:nth-child(3) {
  background: linear-gradient(135deg, #8bb0f5 0%, #ffffff 100%);
}

.card:nth-child(4) {
  background: linear-gradient(135deg, #f1eaa5 0%, #ffffff 100%);
}

.card:nth-child(5) {
  background: linear-gradient(135deg, #bfa7f2 0%, #ffffff 100%);
}

.card p {
  line-height: 1.6;
}

.background-shapes {
  overflow: hidden;
  z-index: -1;
}

.shape {
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.shape-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  left: -100px;
}

.shape-2 {
  width: 200px;
  height: 200px;
  bottom: -50px;
  right: -50px;
}
</style>
  
