<template>
  <el-dialog v-model="state.isFalse" title="所属行业" :before-close="onVisable" :draggable="true" width="40%">
    <div class="layout-col">
      <el-form ref="formRef" :model="state.form" :rules="state.ruleList" label-width="85px">
        <el-form-item label="行业" prop="industry">
          <el-select size="large" v-model="state.form.industry" placeholder="请选择" style="width:100%" clearable filterable>
            <el-option v-for="(v, i) in state.industrys?state.industrys:[]" 
            :key="i" :label="v.name"  :value="v.id" />
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button size="large" type="info" class="i23 bg-white" @click="onVisable">取 消</el-button>
        <el-button size="large" type="info" class="white bgi22" @click.stop="handleSubmit(formRef)">保 存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
  import axios from 'axios'
  import api from '../api'
  const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const emit = defineEmits(['init'])
  let formRef = $ref()
  const state = reactive({
	  ...publicStore.$state,
    ruleList: {},
  })
  const props = defineProps({
    state: {
      type: [Object, Array],
      default: ()=>{return {}}
    },
  })

  const onVisable = async (val?: any) => {
    state.isFalse = !state.isFalse
    if(!state.isFalse) return
    state.form = Object.assign({}, val)
    state.query = {model: 't_industry', args: `parent_id='0' and type='0'`}
    state.industrys = []
    state.industrys = await publicStore.http({Api: state.query})
    console.log("state.list---", state.industrys)
  }

  const handleSubmit = (formEl) => {
    formEl.validate(async valid =>{
      // if(proxy.isNull(state.form.province)) return ElNotification({ title: '提示', message: '请先设置地区', type: 'error' })
      let form = {"model": "t_station", list:[{id: state.form.id, industry: state.form.industry}]}
      api.updApi(form).then((res:any) => {
        if(res.code == 200){
          ElNotification({ title: '提示', message: '操作成功', type: 'success' })
          emit('init')
          onVisable()
        }
      }).catch((err) => {
        ElNotification({ title: '提示', message: '操作失败', type: 'error' })
      })
	  }).catch((err:any) =>{
			state.loading = false
		  console.log('表单错误信息：', err);
	  })
  }

 
  // 暴露给父组件
  defineExpose({
    onVisable
  })
</script>

<style scoped lang="scss">

</style>
