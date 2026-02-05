<template>
  <div class="layout-col">
    <div class="ww100 flex-sc mb15">
      <div class="rad4 ptb6 plr14 flex-cc cursor bg-white c9 bo-cd-1 mr15" @click.stop="handleClick('selectAll')">全选</div>
      <div class="rad4 ptb6 plr14 flex-cc cursor bgi7 i9 bo-i8-1 mr15" @click.stop="handleClick('dels')">删除</div>
      <div class="rad4 ptb6 plr14 flex-cc cursor bgi10 i12 bo-i11-1 mr15" @click.stop="handleClick('in')">导入</div>
      <div class="rad4 ptb6 plr14 flex-cc cursor bgi13 i15 bo-i14-1 mr15" @click.stop="handleClick('out')">导出</div>
      <div class="rad4 ptb6 plr14 flex-cc cursor bgi1 white bo-i1-1 mr15" @click.stop="handleClick('add')">新增</div>
    </div>
    <List @handleClick="handleClick" :state="state" :hasLists="true" :lists="publicStore.form.task" /><List @handleClick="handleClick" :state="state" :hasLists="true" :lists="publicStore.form.task" />
    <!-- 导入 -->
    <ImportDatax :state="state" @setLists="(lists)=>publicStore.form.task=[...publicStore.form.task, ...lists]"  ref="importRef"/>
    <step222 :state="state" :type="props.type" ref="addRef" />
  </div>
</template>

<script lang="ts" setup>
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
      { width: 'w50x6', show: true, align: 'left', key: 'task_type', name: '任务类型', type: 'select', list: [], value: 'id', label: 'name' },
      { width: 'w50x6', show: true, align: 'left', key: 'task_class', name: '类型中类', type: 'select', list: [], value: 'id', label: 'name' }, 
      { width: 'w50x6', show: true, align: 'left', key: 'construct_content', name: '建设内容', type: 'select', list: [], value: 'id', label: 'name' }, 
      { width: 'w50x6', show: true, align: 'left', key: 'unit_target', name: '量化目标' },
    ],
    export: [
      {key: 'id', name: 'ID'}, 
      { key: 'task_type', name: '任务类型' }, 
      { key: 'task_class', name: '类型中类' }, 
      { key: 'construct_content', name: '建设内容' }, 
      { key: 'unit_target', name: '量化目标' }, 
      // { key: 'user_id', name: '用户ID' },
      // { key: 'user_name', name: '用户名称' },
      // { key: 'province', name: '省' },
      // { key: 'province_name', name: '省名' },
      // { key: 'city', name: '市' },
      // { key: 'city_name', name: '市名' },
      // { key: 'district', name: '区名' },
    ],
    model: 't_scheme_task',
    export_name: '重点落实任务',
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
  }

  const handleClick = async(remark, val) => {
    if(remark == 'add' || remark == 'upd'){
      addRef.onVisable(val)
    }
    if(remark == 'del'){
      addRef.del(val)
    }
    if(remark == 'dels'){
      if (!publicStore.form.task.find(a=>a.click))  return ElNotification({ title: '提示', message: '至少选中一条', type: 'error' }) 
      let temps = []
      publicStore.form.task.forEach(v => { if(!v.click) temps.push(v) })
      publicStore.form.task = [...temps]
    }
    if(remark == 'active'){
      val.click = !val.click
    }
    if (remark == 'selectAll') {
      publicStore.form.task.forEach(v => { v.click = !v.click })
    }
    if(remark == 'out'){
      let list = [...publicStore.form.task]
      let name = state.export_name
      proxy.handleExport(state.export, list, name)
    } 
    if(remark == 'in'){
      let query = {}
      state.addItem = {
        num: getNum(configStore.user.city_name?configStore.user.city_name:configStore.user.province_name?configStore.user.province_name:''),
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

  // 删除
  const dels = (form:any) => {
    ElMessageBox.confirm('是否确定删除?', '删除提示', {confirmButtonText: '确定', cancelButtonText: '关闭', type: 'error'}).then(() => {
      let params = {model: state.model, list: form}
      api.delApi(params).then((res:any) => {
        if(res.code == 200){
          ElNotification({ title: '提示', message: '操作成功', type: 'success' })
          state.clickArr = []
          init()
        }else{
          ElNotification({ title: '提示', message: res.msg?res.msg:'操作失败', type: 'error' })
        }
      }).catch((err) => {
        ElNotification({ title: '提示', message: '操作失败', type: 'error' })
      })
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
</script>
  
<style scoped lang="scss">
.bob-tt-2 { border-bottom: 2px solid transparent; }
.tx{ top: -50px; }
.bx{ bottom: 0px; }
</style>
  