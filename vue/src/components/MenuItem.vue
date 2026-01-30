	<template>
	  <!-- 情况A：有子路由，渲染子菜单 -->
	  <el-sub-menu v-if="hasChildren" :index="item.path">
	    <template #title>
	      <!-- 【修复点1】文件夹图标：将固定颜色改为 currentColor，使其能随父元素文字颜色变化 -->
	      <svg class="menu-icon w22 h22" viewBox="0 0 22 22">
	        <path fill="currentColor" stroke="currentColor" d="M4.5 6C4.5 5.17157 5.17157 4.5 6 4.5H8.28674C8.72177 4.5 9.13536 4.68886 9.42028 5.0176L9.8231 5.4824C10.108 5.81114 10.5216 6 10.9566 6H15C15.8284 6 16.5 6.67157 16.5 7.5V9.5H4.5V6Z"></path>
	        <path fill="currentColor" stroke="currentColor" d="M3.70218 10.0879C3.64745 9.78143 3.88308 9.5 4.19439 9.5H16.8056C17.1169 9.5 17.3525 9.78143 17.2978 10.0879L16.405 15.0879C16.3624 15.3264 16.155 15.5 15.9128 15.5H5.08725C4.84501 15.5 4.63762 15.3264 4.59503 15.0879L3.70218 10.0879Z"></path>
	      </svg>
	      <span>{{ item.name }}</span>
	    </template>
	    <!-- 【递归核心】自己调用自己，渲染子级 -->
	    <menu-item v-for="child in visibleChildren" :key="child.id" :item="child" />
	  </el-sub-menu>
	  <!-- 情况B：无子路由，渲染菜单项 -->
	  <el-menu-item v-else :index="item.path">
	    <!-- 优先显示自定义图片，否则显示默认SVG -->
	    <img v-if="item.meta.icon" class="hh75" :src="item.meta.icon" />
	    <!-- 【修复点2】子项图标：同样使用 currentColor -->
	    <svg v-else class="child-icon w20 h20" viewBox="0 0 20 20">
	      <path fill="currentColor" fill-rule="evenodd" d="M5 4.5c-.552 0-1 .41-1 .917v9.166c0 .507.448.917 1 .917h10c.552 0 1-.41 1-.917V5.417c0-.507-.448-.917-1-.917zm.5 2.2a.5.5 0 0 0-.5.5v6.7a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5V7.2a.5.5 0 0 0-.5-.5z" clip-rule="evenodd"></path>
	    </svg>
	    <template #title>{{ item.name }}</template>
	  </el-menu-item>
	</template>
	<script setup>
	import { computed } from 'vue'
	// 【修复点3】递归组件必须显式定义 name
	defineOptions({
	  name: 'MenuItem'
	})
	const props = defineProps({
	  item: {
	    type: Object,
	    required: true
	  }
	})
	// 计算有效的子路由（过滤 isroute）
	const visibleChildren = computed(() => {
	  if (!props.item.children) return []
	  return props.item.children.filter(child => child.meta?.isroute === 1)
	})
	// 判断是否有子路由
	const hasChildren = computed(() => {
	  return visibleChildren.value.length > 0
	})
	</script>
	<style lang="scss" scoped>
	/* 
	  布局样式
	*/
	:deep(.el-sub-menu__title),
	:deep(.el-menu-item) {
	  display: flex;
	  align-items: center;
	  box-sizing: border-box;
	}
	:deep(.el-menu-item) {
	  font-size: 14px;
	  border-left: 4px solid transparent;
	}
	// 悬停状态：父级和子项
	// 注意：这里只需要改变容器的文字颜色，SVG 会自动通过 currentColor 跟随
	:deep(.el-sub-menu__title:hover),
	:deep(.el-menu-item:hover) {
	  background-color: #e6f7ff !important;
	  color: #1684fc !important;
	}
	// 激活状态：子项
	:deep(.el-menu-item.is-active) {
	  background-color: #e6f7ff !important;
	  border-left: 4px solid #1684fc;
	  color: #1684fc !important;
	}
	/* 
	  ===========================
	  SVG 图标颜色样式核心修复
	  ===========================
	*/
	// 【子级图标样式】保持不变
	// 因为子级路径本身是"空心"的(带镂空)，所以用 fill 填充就表现为线条效果
	:deep(.child-icon path) {
	  fill: currentColor; 
	  stroke: none; // 明确去掉描边，防止双重线条
	  transition: all 0.3s;
	}
	// 【父级图标样式】修改为描边模式
	// 因为父级路径是"实心"的，fill 填充会变成色块。
	// 必须去掉 fill，加上 stroke，才能变成线条图标。
	:deep(.menu-icon path) {
	  fill: none !important;       // 【关键】去掉填充，解决"全黑/全蓝"实心问题
	  stroke: currentColor;       // 【关键】使用描边来显示轮廓
	  stroke-width: 1.5px;        // 【关键】设置线条粗细，否则看不见
	  stroke-linecap: round;      // 可选：让线条端点圆润
	  stroke-linejoin: round;     // 可选：让线条转折圆润
	  transition: all 0.3s;
	}
	/* 子菜单内部样式微调 */
	:deep(.el-sub-menu .el-menu-item) {
	  padding: 0 0px;
	  background-color: #ffffff !important;
	}
	:deep(.el-sub-menu .el-menu-item:hover) {
	  background-color: #e6f7ff !important;
	}
	// 箭头样式
	:deep(.el-sub-menu .el-sub-menu__icon-arrow){
	  font-weight: bold;
	  font-size: 16px;
	}
	</style>