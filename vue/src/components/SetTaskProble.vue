<template>
  <el-dialog v-model="state.isFalse" title="关联任务类型" :before-close="onVisable" :draggable="true" width="40%">
    <div class="layout-col">
      <el-form ref="formRef" :model="state.form" :rules="state.ruleList" label-width="85px">
        <el-form-item label="任务类型" prop="task_type" :rules="[{ required: true, message: '请选择', trigger: 'blur' }]">
          <el-select size="large" v-model="state.form.task_type" placeholder="请选择" style="width:100%" clearable filterable @change="state.form.task_class='';state.form.construct_content=''">
            <el-option v-for="(v, i) in state.task_types" :key="i" :label="v.name" :value="v.id.toString()" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型中类" prop="task_class" :rules="[{ required: true, message: '请选择', trigger: 'blur' }]">
          <el-select size="large" v-model="state.form.task_class" placeholder="请选择" style="width:100%" clearable filterable @change="state.form.construct_content=''">
            <el-option v-for="(v, i) in state.form.task_type?state.task_classs.filter(a=>a.parent_id == state.form.task_type):[]" :key="i" :label="v.name" :value="v.id.toString()" />
          </el-select>
        </el-form-item>
        <el-form-item label="建设内容" prop="construct_content" :rules="[{ required: true, message: '请选择', trigger: 'blur' }]">
          <el-select size="large" v-model="state.form.construct_content" placeholder="请选择" style="width:100%" clearable filterable>
            <el-option v-for="(v, i) in state.form.task_type&&state.form.task_class?state.construct_contents.filter(a=>a.parent_id == state.form.task_class):[]" :key="i" :label="v.name" :value="v.id.toString()" />
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button size="large" class="bgc white" @click="onVisable">取 消</el-button>
        <el-button size="large" class="bgi1 white" @click.stop="handleSubmit(formRef)">确 定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
  import { pinyin } from 'pinyin-pro'
  import api from '@/api'
  const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
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

  const emit = defineEmits(['init'])

  onMounted(async() => {
    init()
  })

  const init = async() => {
    let query1 = {model: 't_task_type'}
    let query2 = {model: 't_task_content'}
    let res = await publicStore.http({Api1: query1, Api2: query2})
    let list1 = proxy.isNull(res.Api1)? [] : res.Api1
    let list2 = proxy.isNull(res.Api2)? [] : res.Api2
    const firstLevelIds = res.Api1.filter(item => item.parent_id === '0').map(item => item.id)
    const secondLayer = res.Api1.filter(item => firstLevelIds.includes(item.parent_id))
    const thirdLayer = res.Api1.filter(item => secondLayer.map(s => s.id).includes(item.parent_id))
    state.task_types = secondLayer
    state.task_classs = thirdLayer
    state.construct_contents = list2
  }

  const onVisable = async (val?: any) => {
    state.isFalse = !state.isFalse
    if(!state.isFalse) return
    state.form = val? {...val} : {}
  }

  const handleSubmit = (formEl) => {
    formEl.validate(async valid =>{
      if (valid) {
        let form = {...state.form}
        let params = { "model": "t_task_problem",  list:[form] }
        // console.log("params", params)
        api.updApi(params).then((res:any) => {
          if(res.code == 200){
            ElNotification({ title: '提示', message: '操作成功', type: 'success' })
            emit('init')
            onVisable()
          }
        }).catch((err) => {
          ElNotification({ title: '提示', message: '操作失败', type: 'error' })
        })
      }
	  }).catch((err:any) =>{
			state.loading = false
		  console.log('表单错误信息：', err);
	  })
  }

  const getNum = (str) => {
    const result = pinyin(str, { 
      pattern: 'first', 
      toneType: 'none',
      type: 'array' 
    })
    const pyStr = result.join('').toUpperCase()
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    return pyStr + dateStr
  }
 
  // 暴露给父组件
  defineExpose({
    onVisable
  })
</script>

<style scoped lang="scss">

</style>
