<template>
  <div class="flex-sc plr15 h60 f14 ww100 ml1">
    <svg class="w18 h18 mr5" style="color: #6c6c6c;" viewBox="0 0 48 48" width="18" height="18">
      <g>
        <path d="M7 17L24 7L41 17V41H7V17Z" stroke="#6c6c6c" fill="transparent" stroke-width="4"></path>
        <path d="M20 28H28V41H20V28Z" stroke="#6c6c6c" fill="#6c6c6c" stroke-width="4"></path>
      </g>
    </svg>
    <span class="flex1">{{configStore.crumbList}}</span>
  </div>
</template>

<script lang="ts" setup>
  import { adminRoutes } from '@/router/routes'
  const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const state = reactive({
	  ...publicStore.$state,
    distributId: ''
  })
  const route = useRoute()
  const defaultProps = {
    children: 'children',
    label: 'name',
  } 

  // onMounted(async() => {
  //   state.distributId = publicStore.distributId
  // })

  // 在这里使用 watch 监听路由变化
  watch(() => route.path, (to, from) => {
    let crumb = ''
    const routeTree = configStore.isRoute && configStore.isRoute !== 'false' ? configStore.routes : adminRoutes
    const nodes = Array.isArray(routeTree) ? proxy.parentNodes(routeTree, route.path, 'path') : []
    const list = Array.isArray(nodes) ? nodes.slice().reverse() : []
    list.forEach((item: any) => {
      crumb = crumb + item.name + ' / '
    })
    crumb  = crumb + (route.name ?? '')
    configStore.crumbList = crumb
  }, {immediate: true, deep: true});
  
</script>

<style lang="scss" scoped>

</style>
