<template>
  <div class="topclass">
    <el-dialog modal-class="topclass" v-model="state.isFalse" title="项目列表" :before-close="onVisable" :draggable="true" width="65%">
      <div class="ww100 h100x6 flex-col hidden">
        <!-- 标题 -->
        <aa-title title="">
          <template #left-content>
            <div class="flex-sc">
              <div class="flex-sc mr30">
                <span class="mr10">项目周期</span>
                <span class="w50x4 flex-sc">
                  <el-date-picker style="width: 100%;" v-model="state.construct_datetime" start-placeholder="开始周期" end-placeholder="结束周期" type="yearrange" value-format="YYYY" format="YYYY" />
                </span>
              </div>  
              <div class="flex-sc mr30">
                <span class="mr10">实施状态</span>
                <span class="w50x3 flex-sc">
                  <el-select v-model="state.completion_status" placeholder="请选择" style="width:100%" filterable clearable>
                    <el-option v-for="(v, i) in dictStore.project_completion_statuss" :key="v.value" :value="String(v.value)" :label="v.name" />
                  </el-select>
                </span>
              </div>
              <div class="flex-sc mr15">
                <span class="mr10">项目名称</span>
                <span class="w50x3 flex-sc">
                  <el-input v-model="state.search" style="width: 100%;" placeholder="请输入" />
                </span>
              </div>
              <div class="rad4 ptb5 w80 flex-cc cursor bgi1 white ml10" @click.stop="state.page=1;init()">搜索</div>
            </div>
          </template>
          <template #right-content></template>
        </aa-title>
        <!-- 内容 -->
        <div class="layout-col white-rgba50 rad8 p15">
          <el-table 
          v-if="!isNull(state.list)"
          v-loading.fullscreen.lock="state.loading" 
          header-cell-class-name="bgi16 c3"
          :cell-style="{'background-color': '#FFFFFF', 'color': '#626366'}"
          border
          empty-text="暂无数据" 
          :data="state.list" stripe>
          <el-table-column type="index" :index="indexMethod" label="序号" align="center" width="50" />
          <el-table-column prop="name" label="项目名称" />
          <el-table-column label="地区" align="center" width="140">
            <template #default="scope, $index">
              <span v-if="scope.row.province_name">{{ scope.row.province_name }}</span>
              <span v-if="scope.row.city_name">-{{ scope.row.city_name }}</span>
              <span v-if="scope.row.district_name">-{{ scope.row.district_name }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="construct_scale" label="建设规模" width="100" align="center" />
          <el-table-column prop="construct_nature" label="建设性质" width="100" align="center" />
          <el-table-column prop="construct_price" label="投资预估(万元)" width="100" align="center" />
          <el-table-column label="项目周期" align="center" width="100">
            <template #default="scope, $index">
              <span class="" v-if="scope.row.construct_datetime_start&&scope.row.construct_datetime_end">{{ scope.row.construct_datetime_start }} ~ {{ scope.row.construct_datetime_end }} </span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="100">
            <template #default="scope, $index">
              <span class="i1 cursor" @click.stop="">导入</span>
            </template>
          </el-table-column>
          </el-table>
        </div>
      </div>
      <ViewFiles ref="viewRef" />
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
  import api from '@/api'
  const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const dictStore = proxy.dictStore()
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
    state.active = {...val}
    console.log("state.active---", state.active)
    init()
  }

  const init = async() => {
    let query = {model: 't_scheme_project', args: `scheme_id='${state.active.scheme_id}'`}
    if(!proxy.isNull(state.construct_datetime)) {
      const [start, end] = state.construct_datetime
      query.args += ` and construct_datetime_start>='${start}' and construct_datetime_end<='${end}'`
    }
    if(state.completion_status) query.args += ` and completion_status='${state.completion_status}'`
    if(state.search) query.args += ` and name LIKE '%${state.search}%'`
    let res = await publicStore.http({Api: query})
    state.list = proxy.isNull(res)? [] : res
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
