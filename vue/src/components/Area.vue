<template>
  <el-dialog v-model="state.isFalse" title="所属地区" :before-close="onVisable" :draggable="true" width="40%">
    <div class="layout-col">
      <el-form ref="formRef" :model="state.form" :rules="state.ruleList" label-width="85px">
        <el-form-item label="区域选择" prop="area" class="ww100 flex-sc">
          <el-cascader v-model="state.form.area" size="large" :options="setAreaLevel('district')" :props="cascaderProps" separator="/" placeholder="请选择" clearable style="width: 100%" />
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
  import axios from 'axios'
  import api from '../api'
  import { setAreaLevel, areaOptions } from '@/utils/areaData'
  const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const emit = defineEmits(['init'])
  let formRef = $ref()
  const state = reactive({
	  ...publicStore.$state,
    ruleList: {
      // '0': [{ required: true, message: '请选择', trigger:['blur','change'] }],
      // '1': [{ required: true, message: '请选择', trigger:['blur','change'] }],
      // '2': [{ required: true, message: '请选择', trigger:['blur','change'] }],
    },
    area: [],
  })
  const areaList = computed(() => {
    // 在这里传入你想限制的层级：'province' | 'city' | 'district'
    return setAreaLevel('city') 
  })
  const cascaderProps = {
    value: 'code',    // 指定选项的值为节点对象中的 code 属性
    label: 'name',    // 指定选项的标签为节点对象中的 name 属性
    children: 'children', // 指定子选项的字段名
    expandTrigger: 'hover', // 次级菜单的展开方式 (可选: click/hover)
    checkStrictly: true, // 允许选择任意一级选项（如只选省、只选市）
  }

  const props = defineProps({
    state: {
      type: [Object, Array],
      default: ()=>{return {}}
    },
  })

  const onVisable = async (val?: any) => {
    state.isFalse = !state.isFalse
    if(!state.isFalse) return
    state.form = {...val}
    state.form.area = []
    if(state.form.province) {
      state.form.area[0] = state.form.province
      if(state.form.city) {
        state.form.area[1] = state.form.city
        if(state.form.district) {
          state.form.area[2] = state.form.district
        }
      }
    }
  }

  const handleSubmit = (formEl) => {
    formEl.validate(async valid =>{
      // 所属地区 省市区
      if(!proxy.isNull(state.form.area)){
        if(state.form.area.length>0){
          state.form.province = state.form.area.length>0? state.form.area[0] : ''
          let province = proxy.findNode(areaOptions, (node) => { return node.code == state.form.province })
          if(province) state.form.province_name = province.name
        }else{
          state.form.province = ''
          state.form.province_name = ''
        }
        if(state.form.area.length>1){
          state.form.city = state.form.area.length>1? state.form.area[1] : ''
          let city = proxy.findNode(areaOptions, (node) => { return node.code == state.form.city })
          if(city) state.form.city_name = city.name
        }else{
          state.form.city = ''
          state.form.city_name = ''
        }
        if(state.form.area.length>2){
          state.form.district = state.form.area.length>2? state.form.area[2] : ''
          let district = proxy.findNode(areaOptions, (node) => { return node.code == state.form.district })
          if(district) state.form.district_name = district.name
        }else{
          state.form.district = ''
          state.form.district_name = ''
        }
        state.form.area = JSON.stringify(state.form.area)
      }
      let form = {...state.form}
      let params = {"model": "t_station", list:[form]}
      console.log('params----', params)
      api.updApi(params).then((res:any) => {
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
