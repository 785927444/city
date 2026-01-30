	<template>
	  <el-aside :style="state.defaultHeight" :width="configStore.isCollapse?'3%':'inherit'">
	    <el-menu router :default-active="$route.path" :collapse="configStore.isCollapse" :unique-opened="true"
	      background-color="#FFFFFF"  text-color="#101010" active-text-color="#1684fc">
	      <!-- 只需要循环第一层，剩下的交给 MenuItem 递归处理  -->
	      <template v-for="menu in (configStore.isRoute ? configStore.routes : adminRoutes).filter(a => a.meta.isroute)" :key="menu.id">
	        <menu-item :item="markRaw(menu)" />
	      </template>
	    </el-menu>
	  </el-aside>
	</template>
	<script lang="ts" setup>
	  import { adminRoutes } from '@/router/routes'
	  import MenuItem from '@/components/MenuItem.vue' // 引入递归组件
	  import { markRaw } from 'vue' // 引入 markRaw
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