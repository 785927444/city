<template>
  <div class="layout-col overlay">
    <div class="hh100 ww100 flex-sc warp">
      <el-form class="ww100 pplr15" ref="formRef" :model="publicStore.form" :rules="ruleList" label-width="120" :disabled="props.isReadonly">
        <div class="flex-sc warp ww100">
          <el-form-item label="项目状态" prop="completion_status" class="ww50 flex-sc" :rules="[{ required: true, message: '请选择', trigger: 'blur' }]">
            <el-select v-model="publicStore.form.completion_status" placeholder="请选择" style="width:100%" filterable clearable>
              <el-option v-for="(v, i) in dictStore.project_completion_statuss" :key="v.value" :value="String(v.value)" :label="v.name" />
            </el-select>
          </el-form-item>
          <el-form-item label="已投资金额（万元）" prop="has_construct_price" class="ww50 flex-sc">
            <el-input size="large" v-model="publicStore.form.has_construct_price" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="已建设规模" prop="has_construct_scale" class="ww50 flex-sc">
            <el-input size="large" v-model="publicStore.form.has_construct_scale" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="实施成效说明" prop="has_construct_effect" class="ww100 flex-ss">
            <el-input size="large" v-model="publicStore.form.has_construct_effect" style="width: 100%;" type="textarea" :rows="4" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="过程材料上传" prop="has_attr" class="ww100 flex-ss">
            <div class="ww100 plr30 ptb22 bo-i16-1 rad8 bg-white">
              <FileList v-if="publicStore.form?.has_attr" v-model:files="publicStore.form.has_attr" parent-field="has_attr" :plans="props.plans" :contents="props.contents" :active="props.active"  />
            </div>
          </el-form-item>
          <el-form-item label="实施成效材料上传" prop="effect_attr" class="ww100 flex-ss">
            <div class="ww100 plr30 ptb22 bo-i16-1 rad8 bg-white">
              <FileList v-if="publicStore.form?.effect_attr" v-model:files="publicStore.form.effect_attr" parent-field="effect_attr" :plans="props.plans1" :contents="props.contents1" :active="props.active1"  />
            </div>
          </el-form-item>
        </div>
      </el-form>
      <div class="ww100 flex-cc f18 p40 bot-i16-1 mt20">
        <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" @click.stop="emitPrev">上一步</div>
        <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" v-if="route.query.action == '1f10502a-e388-6850-8aa3-265c92863866'" @click.stop="emitSave('1')">更 新</div>
        <div class="flex-sc" v-else>
          <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" @click.stop="emitSave('1')">保 存</div>
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
let formRef = ref()
let ruleList = $ref({})
const props = defineProps({
  isReadonly: {
    type: Boolean,
    default: false
  },
  state: {
    type: [Object, Array],
    default: () => { return {} }
  },
  contents: {
    type: Array,
    default: []
  },
  plans: {
    type: Array,
    default: []
  },
  active: {
    type: [Object, Array],
    default: () => { return {} }
  },
  contents1: {
    type: Array,
    default: []
  },
  plans1: {
    type: Array,
    default: []
  },
  active1: {
    type: [Object, Array],
    default: () => { return {} }
  },
})

const emit = defineEmits(['prev', 'save'])
const emitPrev = () => emit('prev')
const emitSave = (status?: string) => emit('save', status)

const validate = () => {
  return new Promise<boolean>((resolve) => {
    formRef.value?.validate((ok: boolean) => resolve(ok))
  })
}

const collect = () => {
  return {
    tables: {
      keyTasks: publicStore._public.keyTasks || [],
      checkTasks: publicStore._public.checkTasks || [],
      timelineRows: publicStore._public.timelineRows || []
    }
  }
}

const apply = (data: any) => {
  if (data?.tables) {
    if (data.tables.keyTasks) {
      if (!publicStore._public.keyTasks) publicStore._public.keyTasks = []
      publicStore._public.keyTasks.splice(0, publicStore._public.keyTasks.length, ...data.tables.keyTasks)
    }
    if (data.tables.checkTasks) {
      if (!publicStore._public.checkTasks) publicStore._public.checkTasks = []
      publicStore._public.checkTasks.splice(0, publicStore._public.checkTasks.length, ...data.tables.checkTasks)
    }
    if (data.tables.timelineRows) {
      if (!publicStore._public.timelineRows) publicStore._public.timelineRows = []
      publicStore._public.timelineRows.splice(0, publicStore._public.timelineRows.length, ...data.tables.timelineRows)
    }
  }
}

defineExpose({ validate, collect, apply })
</script>

<style scoped lang="scss">
.bob-tt-2 { border-bottom: 2px solid transparent; }
.r-18{ right: -18px; }
.autoHeight{min-height: 100%; height: 3000px;}
</style>
