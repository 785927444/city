<template>
  <div class="layout-col">
    <div class="ww100 flex-sc mb15">
      <div class="rad4 ptb6 plr14 flex-cc cursor bg-white c9 bo-cd-1 mr15" @click.stop="handleClick('selectAll')">全选</div>
      <div class="rad4 ptb6 plr14 flex-cc cursor bgi7 i9 bo-i8-1 mr15" @click.stop="handleClick('dels')">删除</div>
      <div class="rad4 ptb6 plr14 flex-cc cursor bgi10 i12 bo-i11-1 mr15" @click.stop="handleClick('in')">导入</div>
      <div class="rad4 ptb6 plr14 flex-cc cursor bgi13 i15 bo-i14-1 mr15" @click.stop="handleClick('out')">导出</div>
      <div class="rad4 ptb6 plr14 flex-cc cursor bgi1 white bo-i1-1 mr15" @click.stop="handleClick('add')">新增</div>
    </div>
    <List @handleClick="handleClick" :state="state"/>
    <Pagination style="padding-bottom: 0;" v-show="state.total>0" :total="state.total" v-model:page.sync="state.page" v-model:limit.sync="state.limit" @pagination="init" />
    <!-- 导入 -->
    <ImportData @init="init" :state="state" ref="importRef"/>
    <step222 @init="init" :state="state" ref="addRef" />
  </div>
</template>

<script lang="ts" setup>
  import step222 from './step222'
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
    click: false,
    clickArr: [],
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
    let query = {model: 't_scheme_task', args: `user_id='${configStore.user.id}' and type='plan'`}
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
    if(!proxy.isNull(publicStore.form.task)) {
      publicStore.form.task.forEach(v => {
        let exist = state.list.find(a=>a.id == v)
        if(exist){
          exist.click = true
          state.clickArr.push(exist)
        }
      })
    }
  }

  const handleClick = async(remark, val) => {
    if(remark == 'add' || remark == 'upd'){
      addRef.onVisable(val)
    }
    if(remark == 'del'){
      addRef.del(val)
    }
    if(remark == 'dels'){
      if (state.clickArr.length == 0) return ElNotification({ title: '提示', message: '至少选中一条', type: 'error' })
      if(publicStore._public && !proxy.isNull(publicStore._public.task)){
       const hasIntersection = state.clickArr.some(({id}) => publicStore._public.task.includes(id))
       if(hasIntersection) return ElNotification({ title: '提示', message: '不能删除规划中已存在的任务，请取消后在删除', type: 'error' })
      }
      dels(state.clickArr)
    }
    if(remark == 'active'){
      let clickIndex = state.clickArr.findIndex(a=>a[state.key] == val[state.key])
      if(clickIndex != -1){
        val.click = false
        state.clickArr.splice(clickIndex, 1)
      }else{
        val.click = true
        state.clickArr.push(val)
      }
      const exists = !proxy.isNull(publicStore.form.task)? publicStore.form.task.find(a=>a == val.id) : false
      publicStore.form.task = exists ? publicStore.form.task.filter(a => a !== val.id) : [...publicStore.form.task, val.id]
    }
    if (remark == 'selectAll') {
        const currentPageIds = state.list.map(item => item.id)
        const hasUnselected = state.list.some(item => !item.click)
        if (hasUnselected) {
            state.list.forEach(item => item.click = true)
            state.list.forEach(item => {
              if (!state.clickArr.some(a => a[state.key] === item[state.key])) {
                state.clickArr.push(item)
              }
            })
            publicStore.form.task = [...new Set([...publicStore.form.task, ...currentPageIds])]
        } else {
            state.list.forEach(item => delete item.click)
            state.clickArr = state.clickArr.filter(item => !currentPageIds.includes(item.id))
            publicStore.form.task = publicStore.form.task.filter(id => !currentPageIds.includes(id))
        }
    }
    if(remark == 'out'){
      let query = {model: 't_scheme_task', args: `user_id='${configStore.user.id}'`}
      let res = await publicStore.http({Api: query})
      let list = [...res]
      let name = `重点落实任务`
      proxy.handleExport(state.export, list, name)
    } 
    if(remark == 'in'){
      let query = {model: 't_scheme_task', args: `user_id='${configStore.user.id}'`}
      state.addItem = {
        num: getNum(configStore.user.city_name?configStore.user.city_name:configStore.user.province_name?configStore.user.province_name:''),
        type: 'plan', 
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
  