<template>
  <div ref="wrapRef" class="donut-wrap">
    <el-card class="donut-card" shadow="never">
      <template #header>
        <div class="donut-header">
          <div class="donut-header-left">
            <span class="donut-title-dot" :style="{ backgroundColor: dotColor }" />
            <span class="donut-title">{{ title }}</span>
          </div>
          <div class="donut-header-right">
            <el-select
              v-if="selectOptions.length"
              :model-value="modelValue"
              size="small"
              class="donut-select"
              @update:model-value="onSelectUpdate"
            >
              <el-option v-for="o in selectOptions" :key="String(o.value)" :label="o.label" :value="o.value" />
            </el-select>
            <div v-if="fullscreen" class="donut-fullscreen" @click.stop="toggleFullscreen">
              <span class="donut-fullscreen-box" :class="{ checked: isFullscreen }" />
              <span>全屏</span>
            </div>
          </div>
        </div>
      </template>

      <div v-if="legend.length" class="donut-legend">
        <div v-for="item in legend" :key="item.name" class="donut-legend-item">
          <span class="donut-legend-dot" :style="{ backgroundColor: item.color }" />
          <span class="donut-legend-text">{{ item.name }}</span>
        </div>
      </div>

      <div class="donut-chart-area" :style="{ height: heightPx }">
        <div ref="chartRef" class="donut-chart" />
        <div v-if="centerIcon" class="donut-center-icon" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import screenfull from 'screenfull'

type SelectOption = { label: string; value: string | number }
type DonutDatum = { name: string; value: number; color?: string }

const props = withDefaults(defineProps<{
  title: string
  data: DonutDatum[]
  dotColor?: string
  centerIcon?: boolean
  height?: number
  valueSuffix?: string
  showValueInLabel?: boolean
  selectOptions?: SelectOption[]
  modelValue?: string | number
  fullscreen?: boolean
}>(), {
  dotColor: '#2F7BFF',
  centerIcon: true,
  height: 220,
  valueSuffix: '',
  showValueInLabel: false,
  selectOptions: () => [],
  fullscreen: true
})

const emit = defineEmits<{
  (e: 'update:modelValue', v: string | number): void
}>()

const wrapRef = ref<HTMLElement | null>(null)
const chartRef = ref<HTMLDivElement | null>(null)
let chart: echarts.ECharts | null = null
let ro: ResizeObserver | null = null
let raf = 0

const heightPx = computed(() => `${props.height}px`)
const legend = computed(() => props.data.map(d => ({ name: d.name, color: d.color || props.dotColor })))
const isFullscreen = ref(false)

const requestResize = () => {
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(() => {
    chart?.resize()
  })
}

const setFullscreenState = () => {
  if (!screenfull.isEnabled) {
    isFullscreen.value = false
    return
  }
  isFullscreen.value = !!screenfull.element && screenfull.element === wrapRef.value
  requestResize()
}

const toggleFullscreen = async () => {
  if (!screenfull.isEnabled || !wrapRef.value) return
  await screenfull.toggle(wrapRef.value)
  requestResize()
}

const labelFormatter = (p: any) => {
  const valueText = props.showValueInLabel ? ` ${p.value}${props.valueSuffix}` : ''
  return `${p.name}\n${p.percent}%${valueText}`
}

const buildOption = () => {
  const center = ['50%', '56%'] as [string, string]
  const seriesData = props.data.map(d => ({
    name: d.name,
    value: d.value,
    itemStyle: { color: d.color || props.dotColor }
  }))

  return {
    animation: false,
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0,0,0,0.65)',
      textStyle: { color: '#fff' },
      formatter: (p: any) => `${p.name}<br/>${p.value} (${p.percent}%)`
    },
    series: [
      {
        type: 'pie',
        radius: ['0%', '50%'],
        center,
        silent: true,
        data: [{ value: 1 }],
        itemStyle: { color: 'rgba(47,123,255,0.06)' },
        label: { show: false }
      },
      {
        type: 'pie',
        radius: ['52%', '72%'],
        center,
        minAngle: 8,
        avoidLabelOverlap: true,
        label: {
          show: true,
          formatter: labelFormatter,
          color: (p: any) => p.color,
          fontSize: 12,
          fontWeight: 600,
          lineHeight: 16
        },
        labelLine: {
          show: true,
          length: 18,
          length2: 12,
          smooth: 0.25
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 2,
          borderRadius: 6
        },
        data: seriesData
      },
      {
        type: 'pie',
        radius: ['74%', '76%'],
        center,
        silent: true,
        data: [{ value: 1 }],
        itemStyle: { color: 'rgba(47,123,255,0.14)' },
        label: { show: false }
      }
    ]
  }
}

const render = () => {
  if (!chartRef.value) return
  if (!chart) chart = echarts.init(chartRef.value)
  chart.setOption(buildOption(), true)
  requestResize()
}

const onSelectUpdate = (v: string | number) => emit('update:modelValue', v)

onMounted(() => {
  render()

  if (wrapRef.value && 'ResizeObserver' in window) {
    ro = new ResizeObserver(() => requestResize())
    ro.observe(wrapRef.value)
  } else {
    window.addEventListener('resize', requestResize)
  }

  if (screenfull.isEnabled) screenfull.on('change', setFullscreenState)
  setFullscreenState()
})

onBeforeUnmount(() => {
  if (ro && wrapRef.value) ro.unobserve(wrapRef.value)
  ro = null
  window.removeEventListener('resize', requestResize)
  if (screenfull.isEnabled) screenfull.off('change', setFullscreenState)
  cancelAnimationFrame(raf)
  chart?.dispose()
  chart = null
})

watch(() => props.data, () => render(), { deep: true })
</script>

<style scoped lang="scss">
.donut-wrap {
  width: 100%;
}

.donut-card {
  border-radius: 12px;
  border: 1px solid #eef1f6;
  background: #fff;
  box-shadow: 0 2px 10px rgba(16, 24, 40, 0.04);
  :deep(.el-card__header) { padding: 14px 16px; border-bottom: 1px solid #f0f2f6; }
  :deep(.el-card__body) { padding: 16px; }
}

.donut-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.donut-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.donut-title-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.donut-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.donut-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.donut-select {
  width: 120px;
  :deep(.el-input__wrapper) {
    height: 32px;
    border-radius: 8px;
    background: #fff;
    border: 1px solid #e6eaf2;
    box-shadow: none;
  }
  :deep(.el-input__inner) { font-size: 12px; }
}

.donut-fullscreen {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 10px;
  border: 1px solid #e6eaf2;
  border-radius: 8px;
  background: #fff;
  color: #606266;
  font-size: 12px;
  cursor: pointer;
  user-select: none;
}

.donut-fullscreen:hover {
  border-color: #cfe0ff;
  color: #2f7bff;
}

.donut-fullscreen-box {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  border: 1px solid #cfd5e2;
  background: #fff;
  position: relative;
  &.checked {
    border-color: #2f7bff;
    background: #2f7bff;
  }
  &.checked::after {
    content: '';
    position: absolute;
    left: 4px;
    top: 2px;
    width: 4px;
    height: 8px;
    border-right: 2px solid #fff;
    border-bottom: 2px solid #fff;
    transform: rotate(45deg);
  }
}

.donut-legend {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.donut-legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.donut-legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 2px;
}

.donut-legend-text {
  font-size: 13px;
  color: #606266;
}

.donut-chart-area {
  position: relative;
}

.donut-chart {
  width: 100%;
  height: 100%;
}

.donut-center-icon {
  position: absolute;
  left: 50%;
  top: 56%;
  transform: translate(-50%, -50%);
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #9BC3FF 0%, #2F7BFF 55%, #1F66E8 100%);
  opacity: 0.95;
  box-shadow: 0 10px 22px rgba(47,123,255,0.25);
}

.donut-center-icon::before,
.donut-center-icon::after {
  content: '';
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 34px;
  height: 12px;
  border-radius: 999px;
  background: rgba(255,255,255,0.35);
}

.donut-center-icon::before { top: 16px; }
.donut-center-icon::after { top: 30px; opacity: 0.28; }
</style>
