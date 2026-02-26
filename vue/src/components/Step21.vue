<template>
  <div class="layout-col">
    <div class="ww100 flex-sc mb15">
      <div class="rad4 ptb6 plr14 flex-cc cursor bg-white c9 bo-cd-1 mr15" @click.stop="handleClick('selectAll')">全选</div>
      <div class="rad4 ptb6 plr14 flex-cc cursor bgi7 i9 bo-i8-1 mr15" @click.stop="handleClick('dels')">删除</div>
      <div class="rad4 ptb6 plr14 flex-cc cursor bgi10 i12 bo-i11-1 mr15" @click.stop="handleClick('in')">导入</div>
      <div class="rad4 ptb6 plr14 flex-cc cursor bgi13 i15 bo-i14-1 mr15" @click.stop="handleClick('out')">导出</div>
      <div class="rad4 ptb6 plr14 flex-cc cursor bgi1 white bo-i1-1 mr15" @click.stop="handleClick('add')">新增</div>
    </div>
    <List @handleClick="handleClick" :state="state" :hasLists="true" :lists="publicStore.form.project"/>
    <!-- 导入 -->
    <ImportDatax :state="state" @setLists="(lists)=>publicStore.form.project=[...publicStore.form.project, ...lists]" ref="importRef"/>
    <step111 :state="state" :type="props.type" ref="addRef" />
  </div>
</template>

<script lang="ts" setup>
  import step111 from './step111'
  import { pinyin } from 'pinyin-pro'
  import api from '@/api'
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  let importRef = $ref()
  let addRef = $ref()
  const state = reactive({
	  ...publicStore.$state,
    content: [
      { width: 'w50',   show: true, align: 'center', key: '-', name: '选择' },
      { width: 'w50',   show: true, align: 'center', key: '*', name: '序号' },
      { width: 'w50x4', show: true, align: 'left', key: 'name', name: '项目名称' },
      { width: 'w50x3', show: true, align: 'left', key: 'aera', name: '所属地区' }, 
      { width: 'w50x4', show: true, align: 'left', key: 'task_type', name: '任务类型', type: 'select', list: [], value: 'id', label: 'name' },
      { width: 'w50x3', show: true, align: 'left', key: 'construct_scale', name: '建设规模' }, 
      { width: 'w50x4', show: true, align: 'left', key: 'construct_nature', name: '建设性质' }, 
      { width: 'w50x3', show: true, align: 'left', key: 'construct_price', name: '投资预估（万元）' },
      { width: 'w50x3', show: true, align: 'left', key: 'construct_datetime', name: '建设周期' },
    ],
    export: [
      {key: 'id', name: 'ID'},
      // { key: 'num', name: '项目编号' }, 
      { key: 'name', name: '项目名称' }, 
      // { key: 'aera', name: '所属地区' }, 
      { key: 'task_type', name: '任务类型', list: [], label: 'name', value: 'id' }, 
      { key: 'construct_scale', name: '建设规模' }, 
      { key: 'construct_nature', name: '建设性质' }, 
      { key: 'construct_price', name: '投资预估' }, 
      { key: 'construct_datetime_start', name: '开始周期' }, 
      { key: 'construct_datetime_end', name: '结束周期' }, 
      
      // { key: 'user_id', name: '用户ID' },
      // { key: 'user_name', name: '用户名称' },
      // { key: 'province', name: '省' },
      // { key: 'province_name', name: '省名' },
      // { key: 'city', name: '市' },
      // { key: 'city_name', name: '市名' },
      // { key: 'district', name: '区名' },
    ],
    model: 't_scheme_project',
    export_name: '项目清单',
  })
  const props = defineProps({
    type: {
      type: String,
      default: ''
    },
  })

  onMounted(async() => {
    await getInit()
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
    state.export.forEach(v => {
      if(v.key == 'task_type') v.list = [...secondLayer]
      if(v.key == 'task_class') v.list = [...thirdLayer]
      if(v.key == 'construct_content') v.list = [...list2]
    })
  }

  const handleClick = async(remark, val) => {
    if(remark == 'add' || remark == 'upd'){
      addRef.onVisable(val)
    }
    if(remark == 'del'){
      addRef.del(val)
    }
    if(remark == 'dels'){ 
      if (!publicStore.form.project.find(a=>a.click))  return ElNotification({ title: '提示', message: '至少选中一条', type: 'error' }) 
      let temps = []
      publicStore.form.project.forEach(v => { if(!v.click) temps.push(v) })
      publicStore.form.project = [...temps]
    }
    if(remark == 'active'){
      val.click = !val.click
    }
    if (remark == 'selectAll') {
      publicStore.form.project.forEach(v => { v.click = !v.click })
    }
    if(remark == 'out'){
      let list = [...publicStore.form.project]
      let name = state.export_name
      list.forEach(v => {
        
      })
      proxy.handleExport(
        state.export, 
        list, 
        name,
        (filterVal, list) => {
          return list.map(item => {
            return filterVal.map(key => {
              if (key === 'task_type') {
                let data = state.task_types.find(a=>a.id == item[key])
                if(data) return data.name
              }
              return item[key] || ''
            })
          })
        }
      )
    } 
    if(remark == 'in'){
      let query = {}
      state.addItem = {
        num: getNum(configStore.user.city_name),
        type: props.type, 
        aera: (configStore.user.city_name?configStore.user.city_name:'') + (configStore.user.city_name&&configStore.user.district_name?'-':'') + (configStore.user.district_name?configStore.user.district_name:''),
        user_id: configStore.user.id,
        user_name: configStore.user.name,
        province: configStore.user.province,
        province_name: configStore.user.province_name,
        city: configStore.user.city,
        city_name: configStore.user.city_name,
        district: configStore.user.district,
        district_name: configStore.user.district_name,
      }
      let ctx = {content: state.export, addItem: state.addItem, key: state.key, query: query, unique: ''}
      importRef.onVisable(ctx)
    }
  }

  const getNum = (str) => {
    if(str) return
    const result = pinyin(str, { 
      pattern: 'first', 
      toneType: 'none',
      type: 'array' 
    })
    const pyStr = result.join('').toUpperCase()
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    return pyStr + dateStr
  }
</script>
  
<style scoped lang="scss">
.bob-tt-2 { border-bottom: 2px solid transparent; }
.tx{ top: -50px; }
.bx{ bottom: 0px; }
</style>
  
