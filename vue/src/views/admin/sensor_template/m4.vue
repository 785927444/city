<template>
  <div class="layout-col flex3 ml16">
    <!-- 标题 -->
		<aa-title :title="isNull(publicStore.active)?'':publicStore.active.name + ' - 告警'">
      <template #right-content>
        <div class="flex-ec flex1">
          <div class="rad4 hidden flex mr15" v-if="dictStore.typeSelect">
            <div class="ptb5 plr10 flex-cc cursor white" :class="publicStore.actIndex == v.value?'bs4':'bg3'" :style="{marginLeft: i==0?'':'1px'}" v-for="(v, i) in dictStore.typeSelect" :key="i"
            @click.stop="publicStore.actIndex = v.value; init()">{{v.name}}</div>
          </div>
          <!-- 新增导入按钮 -->
          <div class="rad4 ptb5 plr8 flex-cc cursor bgi22 i21 ml10 bo-i21-1" 
            @click.stop="handleClick('in')"> 
            <i-ep-switch class="f12 fw" /><span class="f14 ml5">导入</span>
          </div>
          
          <!-- 新增导出按钮 -->
          <div class="rad4 ptb5 plr8 flex-cc cursor bgi22 i21 ml10 bo-i21-1" 
            @click.stop="handleClick('out')"> 
            <i-ep-filter class="f12 fw" /><span class="f14 ml5">导出</span>
          </div>
          <div class="rad4 ptb5 plr8 flex-cc cursor bgi22 i21 ml10 bo-i21-1" 
            v-if="state.content.find(v=>{return typeof(v.key) == 'object'}) && state.content.find(v=>{return typeof(v.key) == 'object'})['key'].hasOwnProperty('add')" 
            @click.stop="handleClick('add', state.addItem)">
            <i-ep-plus class="f12 fw" /><span class="f14 ml4">{{state.content.find(v=>{return typeof(v.key) == 'object'})['key'].add}}</span>
          </div>
        </div>
      </template>
    </aa-title> 
    <!-- 内容 -->
    <div class="layout-col ba1">
      <div class="row bgi22">
        <div :style="{textAlign: v.align}" v-for="(v, i) in state.content" :key="i" v-show="v.show" :class="typeof(v.key) == 'object'?v.width +' '+ 'mlr5':v.width">{{v.name}}</div>
      </div>
      <div class="table">
        <div class="row" :class="publicStore.active[state.key] == item[state.key]?'active':index%2 == 1?'bgi23':'bgi18'" v-for="(item, index) in state.list" :key="index" @click="handleClick('active', item)">
          <div v-show="v.show" :class="v.width" :style="{textAlign: v.align}" v-for="(v, i) in state.content" :key="i">
            <span v-if="typeof(v.key) == 'object'" class="cursor mlr5" :class="kk=='add'||state.auth[kk] == false?'none':kk=='del'?'i8':'i21'" 
            v-for="(vv, kk, ii) in v.key" :key="ii" @click.stop="handleClick(kk, item)">{{vv}}</span>
            <span v-else-if="v.key=='*'">{{(state.page-1)*state.limit + index+1}}</span>
            <span v-else-if="v.type == 'time'">{{item[v.key] == 0?'/':parseTime(item[v.key])}}</span>
            <span v-else-if="v.type == 'select'" :class="find(v.list, [v.value, item[v.key]], 'color')?find(v.list, [v.value, item[v.key]], 'color'):''">
              {{find(v.list, [v.value, item[v.key]], v.label)}}
            </span>
            <span v-else-if="v.type == 'switch'">
              <el-switch v-model="item[v.key]" :active-text="v.value[1].name" :inactive-text="v.value[0].name" :active-value="v.value[1].value" :inactive-value="v.value[0].value" inline-prompt @change="handleClick('switch', item)"></el-switch>
            </span>
            <span v-else-if="v.type == 'input'"><el-input v-model="item[v.value]" placeholder="请输入" style="width: 150px;" size="small" /></span>
            <span v-else-if="v.type == 'preload'">{{item[v.filed]}}</span>
            <span v-else>{{isNull(item[v.key]) && v.key!=''? '/' : item[v.key]}}</span>
          </div>
        </div>
        <div v-if="state.empty" class="flex-cc ww100 tc ptb13 bgi18">没有数据</div>
      </div>
    </div>
		<!-- 底部 -->
		<aa-foot></aa-foot>
    <Add @init="init" :state="state" ref="addRef" />
    <!-- 新增ImportData组件 -->
    <ImportData @init="init" :state="state" ref="importRef"/>
  </div>
</template>

<script lang="ts" setup>
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const dictStore = proxy.dictStore()
  let addRef = $ref()
  // 在setup中声明importRef
  let importRef = $ref()
  const state = reactive({
	  ...publicStore.$state,
    ...dictStore.$state,
    content: [
      { width: 'w50x4', show: true, align: 'left', key: 'code', name: '关联', type: 'select', list: [], value: 'code', label: 'name' },
      { width: 'w50x4', show: true, align: 'left', key: 'name', name: '名称' },
      { width: 'w50x6', show: true, align: 'left', key: 'description', name: '描述' },
      { width: 'flex1', show: true, align: 'right', key: {add: '新增', upd:'编辑', del: '删除'},  name: '操作' },
    ],
    editFrom: [
      // 公用
      { required: true,  editshow: 'none', name: '上级', key: 'sensor_type', type: 'input'},
      { required: true,  editshow: true, name: '关联', key: 'code', type: 'select', list: [], value: 'code', label: 'name' }, 
      { required: true,  editshow: true,  name: '名称', key: 'name',  type: 'input' },
      { required: false, editshow: true,  name: '描述', key: 'description',  type: 'input' },
      { required: false, editshow: true, name: '排序', key: 'order', type: ['input'] },
      { required: false, editshow: 'none', name: 'json', key: 'calcRuleExpres', type: 'josnstr' },
      // 告警
      { required: false, editshow: true, name: '告警', key: 'alarm', type: 'alarm', list: dictStore.statisticsType, list1: dictStore.leftRangeType, list2: dictStore.leftRangeType }, 
    ],
    addItem: {},
  })
	onMounted(async() => {
    if(proxy.isNull(publicStore.active)) return
    state.form = Object.assign({}, publicStore.active)
    state.addItem = {sensor_type: state.form.type}
    state.query = {args: `sensor_type='${state.form.type}'`}
	  init()
	})

  watch(() => publicStore.active, async(val) => {
    await nextTick()
    if(proxy.isNull(val)) return
    state.form = Object.assign({}, val)
    state.addItem = {alarm_class: state.form.type}
    state.query = {args: `sensor_type='${state.form.type}'`}
    init()
  }, {immediate: false, deep: true})

  const init = async(key) => {
    if(publicStore.actIndex != 4) return
    let query = proxy.find(dictStore.typeSelect, ['value', publicStore.actIndex], 'query')
    state.model = query.model
    let query_mea = proxy.find(dictStore.typeSelect, ['value', 2], 'query')
    let params = {Api1: Object.assign(query, state.query), Api2: Object.assign(query_mea, state.query)}
    let res = await publicStore.http(params)
    let list = proxy.isNull(res.Api1)? [] : res.Api1
    state.list = list.map(v => {
      if(v.calcRuleExpres){
        try {
          v.calcRuleExpres = JSON.parse(v.calcRuleExpres)
          Object.assign(v, v.calcRuleExpres)
          delete v.calcRuleExpres
        } catch (err) {
          console.error(err)
        }
      }
      return v
    })
    state.empty = proxy.isNull(res.Api1)? true : false
    state.meaList = proxy.isNull(res.Api2)? [] : res.Api2
    publicStore._public.alarmList = state.list
    state.content.forEach(v => {
      if(v.key == 'code' && v.name == '关联') v.list = state.meaList
    })
    state.editFrom.forEach(v => {
      if(v.key == 'code' && v.name == '关联') v.list = state.meaList
    })
  }

  const handleClick = (remark, val) => {
    if(remark == 'add' || remark == 'upd'){
      addRef.onVisable(val)
    }
    if(remark == 'child'){
      let vall = proxy.varObj(state.parent, val[state.key])
      addRef.onVisable(vall)
    }
    if(remark == 'del'){
      addRef.del(val)
    }
    if (remark == 'out') {
      // 准备导出内容
      let content = [...state.editFrom] 
      let list = [...state.list] 
      console.log(list, '打印梳理2')
      console.log(content, '打印梳理1')
       // 根据页面类型设置导出名称 
      const pageNames = {
        2: '测量',
        3: '配置',
        4: '告警',
        5: '控制'
      }
      let name = `${publicStore.active.name  || ''}${pageNames[publicStore.actIndex]}数据`
      // 调用导出方法
      proxy.handleExport(content,  list, name)
    }
    if (remark == 'in') {
      // 准备导入配置
      let content = [...state.editFrom] 
      let ctx = {
        content: content,
        key: state.key, 
        query: state.query, 
        unique: '' // 根据实际情况设置唯一键
      }
      importRef.onVisable(ctx) 
    }
  }
</script>
  
<style scoped lang="scss">

</style>
  