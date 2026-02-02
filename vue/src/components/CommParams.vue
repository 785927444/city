<template>
  <el-dialog v-model="state.isFalse" title="通讯参数" :before-close="onVisable" :draggable="true" width="38%">
    <el-form ref="formRef" :model="state.form" :rules="state.ruleList" label-width="22%">
      <!-- 电机 start -->
      <div class="layout-col" v-if="state.type == 'Motorsensor'">
        <el-form-item label="code" prop="code">
          <el-input size="large" v-model="state.form.code" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="eui" prop="eui">
          <el-input size="large" v-model="state.form.eui" placeholder="请输入" />
        </el-form-item>
      </div>
      <!-- 电表 start -->
      <div class="layout-col" v-if="state.type == 'meter'">
        <el-form-item label="电表ID" prop="DBID">
          <el-input size="large" v-model="state.form.DBID" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="编号" prop="DBNUM">
          <el-input size="large" v-model="state.form.DBNUM" placeholder="请输入" />
        </el-form-item>
      </div>
      <!-- 默认 start -->
      <div class="layout-col" v-else>
        <el-form-item label="自定义" prop="form">
          <el-input size="large" v-model="state.form" placeholder="请输入" />
        </el-form-item>
      </div>
    </el-form>
    <div v-if="state.empty" class="f20 fw tc white">请配置</div>
    <template #footer>
      <div class="dialog-footer">
        <el-button size="large" type="info" class="i23 bg-white" @click="onVisable">取 消</el-button>
        <el-button size="large" type="info" class="white bgi22" @click.stop="handleSubmit(formRef)">确 定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const state = reactive({
	  ...publicStore.$state,
    ruleList: [],
    form: [],
    type: '',
    code: '',
  })
  let formRef = ref()
  const model = defineModel()

  // 打开关闭弹窗
  const onVisable = async (val) => {
    state.type = model.value.type
    state.isFalse = !state.isFalse
    if(!state.isFalse) return
    state.form = {} 
    state.code = val
    if(state.type == 'Motorsensor'){
      state.form = proxy.isNull(model.value[state.code])? {} : JSON.parse(model.value[state.code])
    }else if(state.type == 'meter'){
      state.form = proxy.isNull(model.value[state.code])? {} : JSON.parse(model.value[state.code])
    } else{
      state.form = model.value[state.code]
    }
  }

  const uploadImageFile = async(options, key) => {
    if (options.file) {
      const reader = new FileReader()
      reader.readAsDataURL(options.file)
      reader.onload = async () => {
        const base64Data = reader.result
        state.form [key] = base64Data
      }
    }
  }

  const handleSubmit = (formEl) => {
    if(state.type == 'Motorsensor' || state.type == 'meter'){
      model.value[state.code] = JSON.stringify(state.form)
    }else{
      model.value[state.code] = state.form
    }
    onVisable()
  }

  // 暴露给父组件
  defineExpose({
    onVisable
  })
</script>

<style scoped lang="scss">

</style>
