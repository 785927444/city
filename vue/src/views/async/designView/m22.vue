<template>
  <div class="layout-col">
    <aa-title title="">
      <template #left-content>
        <div class="flex-sc mr30">
          <span class="mr10">项目类型</span>
          <span class="w50x4">
            <el-select v-model="state.task_type" placeholder="请选择" style="width:100%" filterable clearable>
              <el-option v-for="(v, i) in state.task_types" :key="v.id" :value="String(v.id)" :label="v.name" />
            </el-select>
          </span>
        </div>
        <div class="flex-sc mr15">
          <span class="mr10">项目名称</span>
          <span class="w50x4">
            <el-input v-model="state.name" placeholder="请输入" style="width:100%" filterable clearabl/>
          </span>
        </div>
        <div class="rad4 ptb6 plr12 flex-cc cursor bgi1 white" @click.stop="state.page=1; init()">
          <i-ep-filter class="f12 fw" /><span class="f14 ml5">搜索</span>
        </div>
      </template>
      <template #right-content></template>
    </aa-title>
    <!-- 内容 -->
    <div class="layout-col white-rgba50 rad8 bo-i16-1">
      <List @handleClick="handleClick" :state="state"/>
    </div>
    <Pagination class="" style="padding-bottom: 0;" v-show="state.total>0" :total="state.total" v-model:page.sync="state.page" v-model:limit.sync="state.limit" @pagination="init" />
  </div>
</template>

<script lang="ts" setup>
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const state = reactive({
	  ...publicStore.$state,
    content: [
      // { width: 'w50',   show: true, align: 'center', key: '-', name: '选择' },
      { width: 'w50',   show: true, align: 'center', key: '*', name: '序号' },
      { width: 'w50x5', show: true, align: 'left', key: 'name', name: '项目名称' },
      { width: 'w50x5', show: true, align: 'left', key: 'aera', name: '所属地区' }, 
      { width: 'w50x5', show: true, align: 'left', key: 'task_type', name: '任务类型', type: 'select', list: [], value: 'id', label: 'name' },
      { width: 'w50x5', show: true, align: 'left', key: 'construct_scale', name: '建设规模' }, 
      { width: 'w50x5', show: true, align: 'left', key: 'construct_nature', name: '建设性质' }, 
      { width: 'w50x5', show: true, align: 'left', key: 'construct_price', name: '投资预估' },
      { width: 'w50x5', show: true, align: 'left', key: 'construct_datetime', name: '建设周期' },
    ],
  })

  onMounted(async() => {
    await getInit()
    init()
  })

  const getInit = async() => {
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
    state.content.forEach(v => {
      if(v.key == 'task_type') v.list = [...secondLayer]
      if(v.key == 'task_class') v.list = [...thirdLayer]
      if(v.key == 'construct_content') v.list = [...list2]
    })
  }

  const init = async(key) => {
    let query = {model: 't_scheme_project', args: `user_id='${publicStore.active.user_id}' and type='design'`}
    if(state.task_type) query.args += ` and task_type='${state.task_type}'`
    if(state.name) query.args += ` and name LIKE '%${state.name}%'`
    let q1 = {limit: state.limit, page: state.page}
    let q2 = {field: `COUNT(*)`}
    let query1 = {}
    let query2 = {}
    Object.assign(query1, query, q1)
    Object.assign(query2, query, q2)
    let res = await publicStore.http({Api1: query1, Api2: query2})
    state.empty = proxy.isNull(res.Api1)? true : false
    state.list = proxy.isNull(res.Api1)? [] : res.Api1
    state.total = proxy.isNull(res.Api2)? 0 : res.Api2[0]['COUNT(*)']
    if(!proxy.isNull(publicStore.form.project)) {
      publicStore.form.project.forEach(v => {
        let exist = state.list.find(a=>a.id == v)
        if(exist){
          exist.click = true
          state.clickArr.push(exist)
        }
      })
    }
  }

  const handleClick = (remark, val) => {}
</script>
  
<style scoped lang="scss">
.w110 { width: 110px; }
.rads8{ border-radius: 8px 8px 0 0; }
.rady8{ border-radius: 0 0 8px 8px; }
</style>
  