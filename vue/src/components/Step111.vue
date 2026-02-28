<template>
  <el-dialog v-model="state.isFalse" title="新增" :before-close="onVisable" :draggable="true" width="40%">
    <div class="layout-col">
      <el-form ref="formRef" :model="state.form" :rules="state.ruleList" label-width="85px">
        <el-form-item label="项目名称" prop="name" :rules="[{ required: true, message: '请输入', trigger: 'blur' }]">
          <el-input v-model="state.form.name" size="large" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="任务类型" prop="task_type" :rules="[{ required: true, message: '请选择', trigger: 'blur' }]">
          <el-select size="large" v-model="state.form.task_type" placeholder="请选择" style="width:100%" clearable filterable @change="state.form.task_class='';state.form.construct_content=''">
            <el-option v-for="(v, i) in props.state.task_types" :key="i" :label="v.name" :value="v.id.toString()" />
          </el-select>
        </el-form-item>
        <el-form-item label="建设规模" prop="construct_scale" :rules="[{ required: true, message: '请输入', trigger: 'blur' }]">
          <el-input v-model="state.form.construct_scale" size="large" placeholder="请输入">
            <template #suffix>
              <span class="unit-text">平方米</span>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="建设性质" prop="construct_nature" :rules="[{ required: true, message: '请输入', trigger: 'blur' }]">
          <el-input v-model="state.form.construct_nature" size="large" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="投资预估" prop="construct_price" :rules="[{ required: true, message: '请输入', trigger: 'blur' }, { pattern: new RegExp('^(0|[1-9]\\d{0,9})$'), message: '请输入10位以内数字', trigger: ['blur', 'change'] }]">
          <el-input v-model="state.form.construct_price" size="large" placeholder="请输入" type="text" inputmode="numeric" maxlength="10" @input="state.form.construct_price = String(state.form.construct_price || '').replace(/\\D/g, '').slice(0, 10)">
            <template #suffix>
              <span class="unit-text">万元</span>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="开始时间" prop="construct_datetime_start" :rules="[{ required: true, message: '请输入', trigger: 'blur' }]">
          <el-date-picker style="width: 100%;" v-model="state.form.construct_datetime_start" size="large" type="year" placeholder="请选择" value-format="YYYY" format="YYYY" />
        </el-form-item>
        <el-form-item label="结束时间" prop="construct_datetime_end" :rules="[{ required: true, message: '请输入', trigger: 'blur' }]">
          <el-date-picker style="width: 100%;" v-model="state.form.construct_datetime_end" size="large" type="year" placeholder="请选择" value-format="YYYY" format="YYYY" />
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
    type: {
      type: String,
      default: ''
    },
  })

  const emit = defineEmits(['init'])

  const onVisable = async (val?: any) => {
    state.isFalse = !state.isFalse
    if(!state.isFalse) return
    state.form = val? {...val} : {}
  }

  const handleSubmit = (formEl) => {
    formEl.validate (async valid => {
      if (valid) {
        let aera = (configStore.user.city_name?configStore.user.city_name:'') + (configStore.user.city_name&&configStore.user.district_name?'-':'') + (configStore.user.district_name?configStore.user.district_name:'')
        if(!aera) aera = configStore.user.province_name
        let form = {
          "model": "t_scheme_project", 
          list:[
            {
              name: state.form.name,
              task_type: state.form.task_type,
              construct_scale: state.form.construct_scale,
              construct_nature: state.form.construct_nature,
              construct_price: state.form.construct_price,
              construct_datetime_start: state.form.construct_datetime_start?state.form.construct_datetime_start:'',
              construct_datetime_end: state.form.construct_datetime_end?state.form.construct_datetime_end:'',
              construct_datetime: state.form.construct_datetime_start&&state.form.construct_datetime_end?`${state.form.construct_datetime_start}-${state.form.construct_datetime_end}`:'',
              num: getNum(configStore.user.city_name?configStore.user.city_name:configStore.user.province_name?configStore.user.province_name:''),
              type: props.type, 
              aera: aera,
              user_id: configStore.user.id,
              user_name: configStore.user.name,
              province: configStore.user.province,
              province_name: configStore.user.province_name,
              city: configStore.user.city,
              city_name: configStore.user.city_name,
              district: configStore.user.district,
              district_name: configStore.user.district_name,
            }
          ]
        }
        publicStore.form.project = [...publicStore.form.project, ...form.list]
        onVisable()
        // api.addApi(form).then((res:any) => {
        //   if(res.code == 200){
        //     ElNotification({ title: '提示', message: '操作成功', type: 'success' })
        //     emit('init')
        //     onVisable()
        //   }
        // }).catch((err) => {
        //   ElNotification({ title: '提示', message: '操作失败', type: 'error' })
        // })
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
