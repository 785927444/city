<template>
  <el-dialog v-model="state.isFalse" title="新增" :before-close="onVisable" :draggable="true" width="40%">
    <div class="layout-col">
      <el-form ref="formRef" :model="state.form" :rules="state.ruleList" label-width="85px">
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="state.form.name" size="large" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="任务类型" prop="task_type">
          <el-select size="large" v-model="state.form.task_type" placeholder="请选择" style="width:100%" clearable filterable @change="state.form.task_class='';state.form.construct_content=''">
            <el-option v-for="(v, i) in props.state.task_types" :key="i" :label="v.name" :value="v.id.toString()" />
          </el-select>
        </el-form-item>
        <el-form-item label="建设规模" prop="construct_scale">
          <el-input v-model="state.form.construct_scale" size="large" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="建设性质" prop="construct_nature">
          <el-input v-model="state.form.construct_nature" size="large" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="投资预估" prop="construct_price">
          <el-input v-model="state.form.construct_price" size="large" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="建设周期" prop="construct_datetime">
          <el-date-picker style="width: 100%;" v-model="state.form.construct_datetime" start-placeholder="开始周期" end-placeholder="结束周期" size="large" type="yearrange" value-format="YYYY" format="YYYY" />
          <!-- <el-input v-model="state.form.construct_datetime" size="large" placeholder="请输入" /> -->
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

  const onVisable = async (val?: any) => {
    state.isFalse = !state.isFalse
    if(!state.isFalse) return
    state.form = val? {...val} : {}
  }

  const handleSubmit = (formEl) => {
    formEl.validate(async valid =>{
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
            construct_datetime: state.form.construct_datetime?`${state.form.construct_datetime[0]}-${state.form.construct_datetime[1]}`:'',
            num: getNum(configStore.user.city_name?configStore.user.city_name:configStore.user.province_name?configStore.user.province_name:''),
            type: 'plan', 
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
      console.log('form----', form)
      api.addApi(form).then((res:any) => {
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
