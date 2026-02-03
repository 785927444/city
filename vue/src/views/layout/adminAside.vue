	<template>
	  <el-aside :style="state.defaultHeight" :width="configStore.isCollapse?'3%':'inherit'">
	    <el-menu router :default-active="$route.path" :collapse="configStore.isCollapse" :unique-opened="true"
	      background-color="#FFFFFF"  text-color="#101010" active-text-color="#1684fc">
	      <!-- 只需要循环第一层，剩下的交给 MenuItem 递归处理  -->
	      <template v-for="menu in menuRoutes" :key="menu.id">
	        <menu-item :item="markRaw(menu)" />
	      </template>
	    </el-menu>
	  </el-aside>
	</template>
	<script lang="ts" setup>
	  import { adminRoutes } from '@/router/routes'
	  import MenuItem from '@/components/MenuItem.vue' // 引入递归组件
	  import { computed, markRaw } from 'vue' // 引入 markRaw
	  const { proxy }:any = getCurrentInstance()
	  const publicStore = proxy.publicStore()
	  const configStore = proxy.configStore()
	  const state = reactive({
	      ...publicStore.$state,
	    defaultHeight: { height: '' },
	    menulist: [],
	  })
	  onBeforeMount(() => {
	    state.defaultHeight.height = document.body.clientHeight + "px"
	  })

	  const kbMenu: any = {
	    id: -9900,
	    path: '/kb-management',
	    name: '知识库管理',
	    meta: { isroute: 1, icon: '' },
	    children: [
	      {
	        id: -9901,
	        path: '/kb-management/user-articles',
	        name: '知识库内容管理',
	        meta: { isroute: 1, icon: '' },
	        children: []
	      }
	    ]
	  }

	  const menuRoutes = computed(() => {
	    const useDynamic = configStore.isRoute && configStore.isRoute !== 'false'
	    const base = (useDynamic ? configStore.routes : adminRoutes) as any
	    const list = Array.isArray(base) ? base.slice() : []
	    const hasKb =
	      list.some((x: any) => x?.name === '知识库管理' || x?.path === kbMenu.path) ||
	      list.some((x: any) => Array.isArray(x?.children) && x.children.some((c: any) => c?.path === '/kb-management/user-articles' || c?.path === '/knowledge/user-articles'))
	    if (!hasKb) list.push(kbMenu)
	    return list.filter((a: any) => a?.meta?.isroute)
	  })
	</script>
	<style lang="scss" scoped>
	  /* 侧边栏整体布局样式 */
	  .el-aside {
	    height: 100% !important;
	    transition: all .5s;
	    overflow-y: auto;
	    overflow-x: hidden;
	    background: #FFFFFF !important;
	    width: 250px;
	    border-radius: 0px;
	  }
	  /* 隐藏滚动条 */
	  :deep(.el-aside::-webkit-scrollbar){
	    width: 0px;
	  }
	  :deep(.el-menu){
	    border-right: none;
	  }
	</style>
