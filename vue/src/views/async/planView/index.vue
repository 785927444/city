<template>
  <div class="layout-col">
    <m1 class="rad8 hidden" />
    <m2 class="flex1 hh100 rad8 hidden" />
  </div>
</template>

<script lang="ts" setup>
  import m1 from './m1'
  import m2 from './m2'
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const route = useRoute()
  const state = reactive({
	  ...publicStore.$state,
  })

  onMounted(async() => {
    publicStore.actIndex = 1
    init()
    getDesignNum()
  })

  const getDesignNum = () => {
    let query = {model: `t_scheme_design`, args: `parent_id='${route.query.id}'`, field: `COUNT(*)`}
    publicStore.http({Api: query}).then(res=>{
      publicStore._public.design_num = proxy.isNull(res)? 0 : res[0]['COUNT(*)']
    })
  }

  const init = async(key) => {
    let query = {model: `t_scheme_plan`, args: `id='${route.query.id}'`}
    let res = await publicStore.http({Api: query})
    let data = proxy.isNull(res)? {} : res[0]
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
    publicStore.active = {...data}
    // console.log("publicStore.active---", publicStore.active)
  }
</script>
  
<style scoped lang="scss">
.fullscreen-absolute {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  /* 高度可以任意设置 */
  height: 20000px;
  /* 如果需要滚动 */
  overflow-y: auto;
  /* 如果需要覆盖原有内容 */
  z-index: 10;
  background: white; /* 添加背景避免透出 */
}
</style>
  