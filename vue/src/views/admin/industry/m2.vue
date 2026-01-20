<template>
  <div class="layout-col flex3 ml16">
    <!-- 标题 -->
    <div class="h40 ww100 flex-sc relative mb10">
      <img class="hh100" src="@/assets/imgs/title3.png" />
      <div class="ww100 hh100 flex-sc absolute pl35">
        <span class="fw flex1 ptb5">{{isNull(publicStore.active)?'':publicStore.active.name}}-CO2因子</span>
        <div class="flex-ec flex1">
          <div class="flex-sc">
            <span>年份：</span>
            <span class="w50x3">
              <el-select v-model="state.year" placeholder="请选择" style="width:100%" clearable filterable @change="init()">
                <el-option label="全部" value="0" />
                <el-option v-for="v in state.years" :key="v.value" :value="String(v.value)" :label="v.name" />
              </el-select>
            </span>
          </div>
          <div class="rad4 ptb5 plr8 flex-cc cursor bgi22 i21 ml10 bo-i21-1" 
            v-if="state.content.find(v=>{return typeof(v.key) == 'object'}) && state.content.find(v=>{return typeof(v.key) == 'object'})['key'].hasOwnProperty('add')" 
            @click.stop="handleClick('add', state.addItem)">
            <i-ep-plus class="f12 fw" /><span class="f14 ml4">{{state.content.find(v=>{return typeof(v.key) == 'object'})['key'].add}}</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 内容 -->
    <div class="row bgi22">
      <div :style="{textAlign: v.align}" v-for="(v, i) in state.content" :key="i" v-show="v.show" :class="typeof(v.key) == 'object'?v.width +' '+ 'mlr5':v.width">{{v.name}}</div>
    </div>
    <div class="table bss">
      <div class="row cursor" :class="publicStore.active[state.key] == item[state.key]?'active':index%2 == 1?'bgi23':'bgi18'" v-for="(item, index) in state.list" :key="index" @click="handleClick('active', item)">
        <div v-show="v.show" :class="v.width" :style="{textAlign: v.align}" v-for="(v, i) in state.content" :key="i">
          <span v-if="typeof(v.key) == 'object'" class="cursor mlr5" :class="kk=='add'||state.auth[kk] == false?'none':kk=='del'?'i8':'i21'" v-for="(vv, kk, ii) in v.key" :key="ii" @click.stop="handleClick(kk, item)">{{vv}}</span>
          <span v-else-if="v.key=='*'">{{(state.page-1)*state.limit + index+1}}</span>
          <span v-else-if="v.type == 'time'">{{item[v.key] == 0?'/':parseTime(item[v.key])}}</span>
          <span v-else-if="v.type == 'select'" :class="find(v.list, [v.value, item[v.key]], 'color')?find(v.list, [v.value, item[v.key]], 'color'):''">
            {{find(v.list, [v.value, item[v.key]], v.label)}}
          </span>
          <span v-else-if="v.type == 'switch'">
            <el-switch v-model="item[v.key]" :active-text="v.value[1].name" :inactive-text="v.value[0].name" :active-value="v.value[1].value" :inactive-value="v.value[0].value" inline-prompt @change="handleClick('switch', item)"></el-switch>
          </span>
          <span v-else-if="v.type == 'input'"><el-input v-model="item[v.value]" placeholder="请输入" style="width: 150px;" size="small" /></span>
          <span v-else-if="v.type == 'preload'&&v.filed">{{item[v.key]?item[v.key][v.filed]:''}}</span>
          <span v-else-if="v.type == 'image'" class="flex-sc warp">
            <div class="flex-sc" v-if="typeof(item[v.key]) == 'string'">
              <el-image class="w25 h25 m2 rad3 cursor" v-if="item[v.key].length!=0" :src="I(item[v.key])" :preview-src-list="state.srcList" @click.stop="state.srcList= [];state.srcList.push(I(item[v.key]))" />
              <span class="w50 h25 ca flex-sc" v-else>暂无</span>
            </div>
            <div class="flex-sc" v-else v-for="(img, ii) in item[v.key]" :key="ii">
              <el-image :class="ii==0?'':'ml5'" class="w25 h25 rad3 cursor" :src="I(img)" :preview-src-list="state.srcList" @click.stop="state.srcList= [];state.srcList.push(I(img))" />
            </div>
          </span>
          <span v-else>{{isNull(item[v.key]) && v.key!=''? '/' : item[v.key]}}</span>
        </div>
      </div>
      <div v-if="state.empty" class="flex-cc ww100 tc ptb13 bgi18">没有数据</div>
    </div>
    <Add @init="init" :state="state" ref="addRef" />
  </div>
</template>

<script lang="ts" setup>
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const dictStore = proxy.dictStore()
  let addRef = $ref()
  const state = reactive({
	  ...publicStore.$state,
    content: [
      { width: 'w70',   show: true, align: 'center', key: '*', name: '序号' },
      { width: 'w50x5', show: true, align: 'left', key: 'adcode', name: '区域', type: 'select', list: [], value: 'adcode', label: 'name' }, 
      { width: 'w50x5', show: true, align: 'left', key: 'year', name: '年份', type: 'select', list: [], value: 'value', label: 'name' }, 
      { width: 'w50x5', show: true, align: 'left', key: 'value', name: 'CO2因子' }, 
      { width: 'w50x5', show: true, align: 'left', key: 'order', name: '排序' }, 
      { width: 'flex1', show: true, align: 'right', key: {add: '添加', upd:'编辑', del: '删除'}, name: '操作' },
    ],
    editFrom: [
      { required: true, editshow: 'none', name: '上级', key: 'parent_id', type: 'input' },
      { required: true, editshow: 'none', name: '特征码', key: 'code', type: 'input' },
      { required: true, editshow: true,  name: '区域', key: 'adcode', type: 'select', list: [], value: 'adcode', label: 'name' },
      { required: true, editshow: true,  name: '年份', key: 'year', type: 'select', list: [], value: 'value', label: 'name' },
      { required: false, editshow: true,  name: '数值', key: 'value', type: 'input' },
      { required: false, editshow: true,  name: '排序', key: 'order',  type: 'input' },
    ],
    addItem: {},
  })

  onMounted(async() => {
    let year = proxy.parseTime(new Date(), '{y}')
    let years = []
    for (let i = 0; i < 5; i++) {
      let v = year-i
      years.push({name: v+'年', value: v})
    }
    state.year = year
    state.years = years
  })

  watch(() => publicStore.active, async(val) => {
    await nextTick()
    if(proxy.isNull(val)) return
    state.addItem = {parent_id: publicStore.active.id,  type: 1, code: 'CO2'}
    state.content.forEach(v => { 
      if(v.key == 'adcode') v.list = publicStore._public.provinces
      if(v.key == 'year') v.list = state.years
     })
    state.editFrom.forEach(v => { 
      if(v.key == 'adcode') v.list = publicStore._public.provinces
      if(v.key == 'year') v.list = state.years
     })
    init()
  }, {immediate: false, deep: true})

  const init = async() => {
    let args = state.year? `type='1' and code='CO2' and parent_id='${publicStore.active.id}' and year=${state.year}` : `type='1' and code='CO2' and parent_id='${publicStore.active.id}'`
    state.query = {model: state.model, args: args}
    state.params = {Api: state.query}
    let res = await publicStore.http(state.params)
    state.empty = proxy.isNull(res)? true : false
    state.list = proxy.isNull(res)? [] : res.sort((a, b) => a.order - b.order)
  }

  const handleClick = async(remark, val) => {
    if(remark == 'add' || remark == 'upd'){
      addRef.onVisable(val)
    }
    if(remark == 'del'){
      addRef.del(val)
    }
  }

</script>
  
<style scoped lang="scss">

</style>
  