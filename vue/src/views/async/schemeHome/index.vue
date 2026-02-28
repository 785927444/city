<template>
  <div class="layout-col">


    <!-- 主内容区 -->
    <main class="main-content">
      <div class="content-container">
        <!-- 标题部分 -->
        <div class="title-section">
          <h1 class="main-title">更新规划策划</h1>
          <p class="subtitle">城市更新专项规划的编制、审批与管理</p>
        </div>

        <!-- 卡片模块 -->
        <div class="card-grid">
          <!-- 专项规划管理 -->
          <div class="card-item card-blue" @click="toPath('/schemePlans')">
            <div class="card-content">
              <h3 class="card-title">专项规划管理</h3>
              <p class="card-description">城市更新专项规划的编制、审批与管理</p>
              <a href="#" class="card-link">进入管理 &gt;</a>
            </div>
            <div class="card-icon">
              <div class="icon-svg icon-file"></div>
            </div>
          </div>

          <!-- 片区规划管理 -->
          <div class="card-item card-green" @click="toPath('/schemeDesigns')">
            <div class="card-content">
              <h3 class="card-title">片区规划管理</h3>
              <p class="card-description">城市更新片区的规划设计与管理</p>
              <a href="#" class="card-link">进入管理 &gt;</a>
            </div>
            <div class="card-icon">
              <div class="icon-svg icon-map"></div>
            </div>
          </div>

          <!-- 城市设计管理 -->
          <div class="card-item card-purple">
            <div class="card-content">
              <h3 class="card-title">城市设计管理</h3>
              <p class="card-description">城市更新区域的设计方案管理与审批</p>
              <a href="#" class="card-link">进入管理 &gt;</a>
            </div>
            <div class="card-icon">
              <div class="icon-svg icon-building"></div>
            </div>
          </div>

          <!-- 城市更新辅助策划 -->
          <div class="card-item card-orange">
            <div class="card-content">
              <h3 class="card-title">城市更新辅助策划</h3>
              <p class="card-description">基于数据分析的城市更新策划辅助工具</p>
              <a href="#" class="card-link">进入管理 &gt;</a>
            </div>
            <div class="card-icon">
              <div class="icon-svg icon-chart"></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { getCurrentInstance, reactive, onMounted } from 'vue'

const { proxy }: any = getCurrentInstance()
const publicStore = proxy.publicStore()
const configStore = proxy.configStore()
const state = reactive({
  ...publicStore.$state,
})

onMounted(async () => {
  // 页面加载时的初始化逻辑
})

</script>

<style scoped lang="scss">
.layout-col {
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f9ff 0%, #f8f5ff 100%);
  overflow: hidden;
}

/* 导航栏样式 */
.nav-header {
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 12px 0;
  position: sticky;
  top: 0;
  z-index: 100;
  flex-shrink: 0;
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 28px;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.nav-menu {
  display: flex;
  gap: 32px;
}

.nav-item {
  text-decoration: none;
  color: #666666;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 0;
  position: relative;
  transition: color 0.3s ease;

  &:hover {
    color: #266fff;
  }

  &.active {
    color: #266fff;
    font-weight: 600;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: #266fff;
      border-radius: 1px;
    }
  }
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-name {
  font-size: 14px;
  color: #666666;
}

.user-avatar {
  font-size: 24px;
}

/* 主内容区样式 */
.main-content {
  flex: 1;
  padding: 40px 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.content-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 24px;
  flex: 1;
  overflow: hidden;
}

/* 标题部分 */
.title-section {
  text-align: center;
  margin-bottom: 30px;
}

.main-title {
  cursor: pointer;
  font-size: 32px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 12px;
}

.subtitle {
  font-size: 16px;
  color: #888888;
  margin: 0;
}

/* 卡片网格 */
.card-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

/* 卡片样式 */
.card-item {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 32px;
  display: flex;
  align-items: center;
  gap: 54px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  min-height: 150px;
  

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }

  &.card-blue {
    background: linear-gradient(135deg, rgba(38, 111, 255, 0.08) 0%, #ffffff 50%);
  }

  &.card-green {
    background: linear-gradient(135deg, rgba(72, 187, 120, 0.08) 0%, #ffffff 50%);
  }

  &.card-purple {
    background: linear-gradient(135deg, rgba(156, 39, 176, 0.08) 0%, #ffffff 50%);
  }

  &.card-orange {
    background: linear-gradient(135deg, rgba(255, 152, 0, 0.08) 0%, #ffffff 50%);
  }
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 10px 0;
}

.card-description {
  font-size: 14px;
  color: #888888;
  margin: 0 0 18px 0;
  line-height: 1.6;
}

.card-link {
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  display: inline-block;
  transition: color 0.3s ease;

  .card-blue & {
    color: #266fff;
  }

  .card-green & {
    color: #48bb78;
  }

  .card-purple & {
    color: #9c27b0;
  }

  .card-orange & {
    color: #ff9800;
  }

  &:hover {
    text-decoration: underline;
  }
}

/* 卡片图标 */
.card-icon {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.15;

  .card-blue & {
    color: #266fff;
  }

  .card-green & {
    color: #48bb78;
  }

  .card-purple & {
    color: #9c27b0;
  }

  .card-orange & {
    color: #ff9800;
  }
}

/* SVG 图标样式 */
.icon-svg {
  width: 80px;
  height: 80px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.icon-file {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23266fff'%3E%3Cpath d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z'/%3E%3Cpath d='M8 12h8v2H8zm0 4h8v2H8z'/%3E%3C/svg%3E");
}

.icon-map {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2348bb78'%3E%3Cpath d='M20.5 3l-6 1.5-6-1.5-5.5 1.5v15l5.5-1.5 6 1.5 6-1.5V3zm-6.5 14.5l-6-1.5v-12l6 1.5v12zm1-12l5-1.25v12l-5 1.25V5.5z'/%3E%3C/svg%3E");
}

.icon-building {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%239c27b0'%3E%3Cpath d='M12 2H2v20h20V7l-10-5zm-1 2.5l7 3.5v13H3V4h8v.5zM7 6H5v2h2V6zm0 4H5v2h2v-2zm0 4H5v2h2v-2zm4-8h-2v2h2V6zm0 4h-2v2h2v-2zm0 4h-2v2h2v-2z'/%3E%3C/svg%3E");
}

.icon-chart {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ff9800'%3E%3Cpath d='M3 3v18h18v-2H5V3H3zm4 14h4v-4H7v4zm6 0h4v-8h-4v8zm-6-6h4V7H7v4z'/%3E%3C/svg%3E");
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-menu {
    gap: 16px;
  }

  .nav-item {
    font-size: 12px;
  }

  .card-grid {
    grid-template-columns: 1fr;
  }

  .main-title {
    font-size: 24px;
  }

  .subtitle {
    font-size: 14px;
  }

  .card-item {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
}

@media (max-width: 480px) {
  .nav-container {
    flex-direction: column;
    gap: 12px;
    padding: 12px;
  }

  .nav-menu {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
