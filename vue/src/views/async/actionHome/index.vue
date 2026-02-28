<template>
  <div class="layout-col action-home2">
    <div class="page-title">实施与调度管理</div>
    <div class="card-grid">
      <div class="card" @click.stop="toPath('/actionEnterprise')">
        <div class="card-top">
          <div class="icon-wrap blue">
            <i-ep-coin class="icon" />
          </div>
          <div class="text">
            <div class="title">项目基础库</div>
            <div class="desc">管理城市更新项目的基础信息与资源库</div>
          </div>
        </div>
        <div class="link">进入管理 <span class="arrow">→</span></div>
      </div>

      <div class="card" @click.stop="toPath('/actionReserve')">
        <div class="card-top">
          <div class="icon-wrap purple">
            <i-ep-files class="icon" />
          </div>
          <div class="text">
            <div class="title">项目储备库</div>
            <div class="desc">存储和管理待实施的城市更新储备项目</div>
          </div>
        </div>
        <div class="link">进入管理 <span class="arrow">→</span></div>
      </div>

      <div class="card" @click.stop="toPath('/project-push')">
        <div class="card-top">
          <div class="icon-wrap green">
            <i-ep-promotion class="icon" />
          </div>
          <div class="text">
            <div class="title">项目推送库</div>
            <div class="desc">管理已推送至各实施单位的项目信息</div>
          </div>
        </div>
        <div class="link">进入管理 <span class="arrow">→</span></div>
      </div>

      <div class="card" @click.stop="toPath('/annual-plan')">
        <div class="card-top">
          <div class="icon-wrap orange">
            <i-ep-calendar class="icon" />
          </div>
          <div class="text">
            <div class="title">年度计划</div>
            <div class="desc">制定和管理城市更新项目年度实施计划</div>
          </div>
        </div>
        <div class="link">进入管理 <span class="arrow">→</span></div>
      </div>

      <div class="card" @click.stop="toPath('/assess')">
        <div class="card-top">
          <div class="icon-wrap pink">
            <i-ep-histogram class="icon" />
          </div>
          <div class="text">
            <div class="title">项目实施评估管理</div>
            <div class="desc">评估和监控城市更新项目实施进度与效果</div>
          </div>
        </div>
        <div class="link">进入管理 <span class="arrow">→</span></div>
      </div>

      <div class="card" @click.stop="noop">
        <div class="card-top">
          <div class="icon-wrap blue2">
            <i-ep-data-analysis class="icon" />
          </div>
          <div class="text">
            <div class="title">项目成效与案例管理</div>
            <div class="desc">针对已竣工的项目，城市更新实施成效与案例管理</div>
          </div>
        </div>
        <div class="link">进入管理 <span class="arrow">→</span></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const noop = () => {}
</script>

<style scoped lang="scss">
.action-home2 {
  min-height: 100%;
  padding: 22px 26px 30px;
  background: #f2f2f2;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 18px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
  max-width: 980px;
  margin: 0 auto;
}

.card {
  background: #ffffff;
  border-radius: 8px;
  padding: 22px 22px 18px;
  height: 150px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
}

.card-top {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
}

.icon {
  font-size: 18px;
}

.icon-wrap.blue {
  background: #e8f1ff;
  color: #2b5cff;
}

.icon-wrap.purple {
  background: #f1ecff;
  color: #7b40f2;
}

.icon-wrap.green {
  background: #e8fbf0;
  color: #22c55e;
}

.icon-wrap.orange {
  background: #fff2e4;
  color: #f59e0b;
}

.icon-wrap.pink {
  background: #ffecef;
  color: #f43f5e;
}

.icon-wrap.blue2 {
  background: #e8f1ff;
  color: #2b5cff;
}

.text {
  flex: 1;
  min-width: 0;
}

.title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin-top: 2px;
}

.desc {
  margin-top: 6px;
  font-size: 12px;
  color: #6b7280;
  line-height: 18px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.link {
  margin-top: 14px;
  font-size: 12px;
  color: #2b5cff;
  font-weight: 600;
}

.arrow {
  margin-left: 4px;
}

@media (max-width: 1100px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
    max-width: 760px;
  }
}

@media (max-width: 720px) {
  .card-grid {
    grid-template-columns: 1fr;
    max-width: 520px;
  }
}
</style>
