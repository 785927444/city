<template>
  <el-dialog v-model="state.isFalse" title="所属地区" :before-close="onVisable" :draggable="true" width="750">
    <div class="layout-col">
      <el-form ref="formRef" :model="state.area" :rules="state.ruleList" label-width="85px">
        <el-form-item v-for="(v, i) in state.area" :key="i"
        :label="i==0?'省':i==1?'市':i==2?'区':''" 
        :prop="i + ''">
          <el-select size="large" v-model="state.area[i]" placeholder="请选择" style="width:100%" clearable filterable @change="init(i)">
            <el-option v-for="(vv, ii) in i==0?state.provinceList:i==1?state.cityList:i==2?state.districtList:[]" 
            :key="vv.properties.adcode.toString()" 
            :label="vv.properties.name" 
            :value="vv.properties.adcode.toString()" />
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
    ruleList: {
      '0': [{ required: true, message: '请选择', trigger:['blur','change'] }],
      '1': [{ required: true, message: '请选择', trigger:['blur','change'] }],
      '2': [{ required: true, message: '请选择', trigger:['blur','change'] }],
    },
    area: [],
    provinceList: [],
    cityList: [],
    districtList: [],
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
    state.area = [state.form.province?state.form.province:'',state.form.city?state.form.city:'',state.form.district?state.form.district:'']
    init()
  }

  const init = async(i?: any) => {
    console.log('state.area', state.area)
    if(i == 0) state.area[1] = ''
    if(i == 1) state.area[2] = ''
    getList('100000', 'provinceList')
    if(proxy.isNull(state.area[0])){
      state.cityList = []
      state.districtList = []
      state.area[0] = ''
      state.area[1] = ''
      state.area[2] = ''
      return
    }
    getList(state.area[0], 'cityList')
    if(proxy.isNull(state.area[1])){
      state.districtList = []
      state.area[1] = ''
      state.area[2] = ''
      return
    }
    getList(state.area[1], 'districtList')
    if(proxy.isNull(state.area[2])){
      state.area[2] = ''
      return
    }
  }

  const getList = async(adcode, remark) => {
    axios.get(`./china/${adcode}.json`).then(temp => {
      state[remark] = temp.data.features
      // console.log('list', state[remark])
    })
  }

  const handleSubmit = (formEl) => {
    formEl.validate(async valid =>{
      if(proxy.isNull(state.area[0]) || proxy.isNull(state.area[1]) || proxy.isNull(state.area[2])) return ElNotification({ title: '提示', message: '请选择', type: 'error' })
      let form = {"model": "t_station", list:[{id: state.form.id, province: state.area[0], city: state.area[1], district: state.area[2]}]}
      console.log('form----', form)
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
