<template>
  <el-aside :style="state.defaultHeight" :width="configStore.isCollapse?'3%':'inherit'">
    <el-menu router :default-active="$route.path" :collapse="configStore.isCollapse" :unique-opened="true" background-color="#FFFFFF" text-color="#101010" active-text-color="#FFFFFF">
      <div v-for="menu in configStore.isRoute?configStore.routes.filter(a=>a.meta.isroute):adminRoutes.filter(a=>a.meta.isroute)" :key="menu">
        <!-- 无下级 -->
        <el-menu-item v-if="menu.children && menu.children.length === 0" :index="menu.path">
          <img class="hh75" v-if="menu.meta.icon" :src="menu.meta.icon" />
          <template #title>
            {{menu.name}}
          </template>
        </el-menu-item>
        <!-- 有下级 -->
        <el-sub-menu v-else :index="menu.path">
          <template #title>
            <svg class="cd w22 h22" viewBox="0 0 22 22">
              <path class="menu-svg-path" fill="#fff" stroke="#333" d="M4.5 6C4.5 5.17157 5.17157 4.5 6 4.5H8.28674C8.72177 4.5 9.13536 4.68886 9.42028 5.0176L9.8231 5.4824C10.108 5.81114 10.5216 6 10.9566 6H15C15.8284 6 16.5 6.67157 16.5 7.5V9.5H4.5V6Z"></path>
              <path class="menu-svg-path" fill="currentColor" stroke="#333" d="M3.70218 10.0879C3.64745 9.78143 3.88308 9.5 4.19439 9.5H16.8056C17.1169 9.5 17.3525 9.78143 17.2978 10.0879L16.405 15.0879C16.3624 15.3264 16.155 15.5 15.9128 15.5H5.08725C4.84501 15.5 4.63762 15.3264 4.59503 15.0879L3.70218 10.0879Z"></path>
            </svg> 
            <span v-if="!configStore.isCollapse" :class="[configStore.isCollapse ? 'is-collapse' : '']">{{menu.name}}</span>
          </template>
          <el-menu-item v-for="child in menu.children?menu.children.filter(a=>a.meta.isroute):[]" :key="child" :index="child.path">
            <svg class="c2 w20 h20 child-svg" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5 4.5c-.552 0-1 .41-1 .917v9.166c0 .507.448.917 1 .917h10c.552 0 1-.41 1-.917V5.417c0-.507-.448-.917-1-.917zm.5 2.2a.5.5 0 0 0-.5.5v6.7a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5V7.2a.5.5 0 0 0-.5-.5z" clip-rule="evenodd"></path>
            </svg>
            <template #title>
              {{child.name}}
            </template>
          </el-menu-item>
        </el-sub-menu>
      </div>
    </el-menu>
  </el-aside>
</template>

<script lang="ts" setup>
  import { adminRoutes } from '@/router/routes'
  const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const state = reactive({
	  ...publicStore.$state,
    defaultHeight: { height: '' },
    menulist: [],
  })
  const router = useRouter()
  const route = useRoute()
  onBeforeMount(() => {
    state.defaultHeight.height = document.body.clientHeight + "px"
  })
</script>

<style lang="scss" scoped>
  .el-aside {
    height: 100% !important;
    transition: all .5s;
    overflow-y: auto;
    overflow-x: hidden;
    background: #FFFFFF !important;
    width: 250px;
    border-radius: 8px;
  }
  :deep(.el-aside::-webkit-scrollbar){
    width: 0px;
  }
  :deep(.el-menu){
    border-right: none;
    /* background: none; */
  }
  :deep(.el-menu-item){
    justify-content: flex-start;
    font-size: 14px;
    box-sizing: border-box;
    border-left: 4px solid transparent;
  }
  :deep(.el-menu-item.is-active){
    background: #e6f7ff;
    border-left: 4px solid #e6f7ff;
    color: #1684fc;
  }
  :deep(.el-menu-item:focus, .el-menu-item:hover){
    background: #e6f7ff;
    border-left: 4px solid #e6f7ff;
    color: #1684fc;
  }
  :deep(.el-menu-item:hover){
    background: #e6f7ff;
    border-left: 4px solid #e6f7ff;
    color: #1684fc;
  }
  :deep(.el-sub-menu__title){
    display: flex;
    flex-direction: row;
    align-items: center;
    text-align: left;
    box-sizing: border-box;
  }
  :deep(.el-sub-menu .el-menu-item){
    padding: 0 0px;
    /* border-left: 4px solid rgba(255, 255, 255, 0); */
  }
  // :deep(.el-menu--vertical:not(.el-menu--collapse):not(.el-menu--popup-container) .el-menu-item, .el-menu--vertical:not(.el-menu--collapse):not(.el-menu--popup-container) .el-menu-item-group__title, .el-menu--vertical:not(.el-menu--collapse):not(.el-menu--popup-container) .el-sub-menu__title){
  //   padding-left: 17px;
  // }
  :deep(.el-sub-menu .el-sub-menu__icon-arrow){
    font-weight: bold;
    font-size: 16px;
  }
  :deep(.el-sub-menu__title:hover){
    background: #e6f7ff;
    color: #1684fc;
  }
  :deep(.el-sub-menu.is-active .el-sub-menu__title){
    display: flex;
    flex-direction: row;
    align-items: center;
    box-sizing: border-box;
  }
  /* 只有当鼠标悬停在标题区域（不是整个sub-menu区域）时才改变颜色 */
  .el-sub-menu__title:hover .menu-svg-path {
    stroke: #409EFF !important;
  }
  .el-sub-menu__title:hover .menu-svg-path[fill="currentColor"] {
    fill: #409EFF !important;
  }
  /* 鼠标悬停在子菜单项上 */
  .el-menu-item:hover .child-svg path {
    fill: #409EFF !important;
  }
  /* 子菜单项激活（点击）状态 */
  .el-menu-item.is-active .child-svg path {
    fill: #409EFF !important;
  }
  /* 可选：防止子菜单hover影响父菜单 */
  .el-sub-menu .el-menu {
    pointer-events: none;
  }
  .el-sub-menu .el-menu-item {
    pointer-events: auto;
  }
  
</style>
