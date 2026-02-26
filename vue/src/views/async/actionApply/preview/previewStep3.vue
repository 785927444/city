<template>
  <div class="layout-col overlay">
    <div class="hh100 ww100 flex-sc warp">
      <el-form class="ww100 pplr15" label-width="120" disabled>
        <div class="flex-sc warp ww100">
          <el-form-item label="项目状态" class="ww50 flex-sc">
            <div class="display-value">{{ getDictName(dictStore.project_completion_statuss, publicStore.form.completion_status) }}</div>
          </el-form-item>
          <el-form-item label="已投资金额（万元）" class="ww50 flex-sc">
            <div class="display-value">{{ publicStore.form.has_construct_price || '0' }} 万元</div>
          </el-form-item>
          <el-form-item label="已建设规模" class="ww50 flex-sc">
            <div class="display-value">{{ publicStore.form.has_construct_scale || '-' }}</div>
          </el-form-item>
          <el-form-item label="实施成效说明" class="ww100 flex-ss">
            <div class="display-value pre-wrap">{{ publicStore.form.has_construct_effect || '-' }}</div>
          </el-form-item>
          <el-form-item label="过程材料上传" class="ww100 flex-ss">
            <div class="ww100 plr30 ptb22 bo-i16-1 rad8 bg-white">
              <FileList v-if="publicStore.form?.has_attr" v-model:files="publicStore.form.has_attr" :plans="props.plans" :contents="props.contents" :active="props.active" is-readonly />
            </div>
          </el-form-item>
          <el-form-item label="实施成效材料上传" class="ww100 flex-ss">
            <div class="ww100 plr30 ptb22 bo-i16-1 rad8 bg-white">
              <FileList v-if="publicStore.form?.effect_attr" v-model:files="publicStore.form.effect_attr" :plans="props.plans" :contents="props.contents" :active="props.active" is-readonly />
            </div>
          </el-form-item>
          <el-form-item v-if="route.query.key == 'enterprise'" label="审核结果" class="ww100 flex-ss">
            <div class="display-value pre-wrap">{{ publicStore.form.reserve_res || '-' }}</div>
          </el-form-item>
        </div>
      </el-form>
      <div class="ww100 flex-cc f18 p40 bot-i16-1 mt20">
        <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" @click.stop="publicStore.actIndex--">上一步</div>
        <template v-if="route.query.action == '1f10502a-e388-6850-8aa3-265c92863865'">
          <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" @click.stop="$emit('close')">更 新</div>
        </template>
        <div class="flex-sc" v-else>
          <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" @click.stop="$emit('close')">通 过</div>
          <div class="plr14 ptb5 rad4 ml15 cursor white bgi8 bo-i8-1" @click.stop="$emit('close')">驳 回</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  const { proxy }: any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const dictStore = proxy.dictStore()
  const route = useRoute()

  const props = defineProps({
    contents: { type: Array, default: () => [] },
    plans: { type: Array, default: () => [] },
    active: { type: [Object, Array], default: () => ({}) },
  })

  defineEmits(['close'])

  const getDictName = (list, value, key = 'value') => {
    if (!list || !value) return '-'
    const item = list.find(a => String(a[key]) === String(value))
    return item ? item.name : '-'
  }
</script>

<style scoped lang="scss">
.display-value {
  padding: 8px 15px;
  background: #f5f7fa;
  border-radius: 4px;
  min-height: 40px;
  display: flex;
  align-items: center;
  width: 100%;
  color: #606266;
  &.pre-wrap {
    white-space: pre-wrap;
    align-items: flex-start;
  }
}
</style>
