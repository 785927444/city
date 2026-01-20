<template>
  <div class="layout-col">
    <div class="layout-col">
      <!-- 标题 -->
      <div class="h40 ww100 flex-sc relative mb10">
        <img class="hh100" src="@/assets/imgs/title4.png" />
        <div class="ww100 hh100 flex-sc absolute pl35">
          <span class="fw flex1 ptb5">权限列表</span>
          <div class="flex-ec flex1">
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
      <Add @init="init" :state="state" ref="addRef" />
    </div>
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
      { width: 'w50x4', show: true, align: 'left', key: 'model', name: '模型' },
      { width: 'w50x4', show: true, align: 'left', key: 'name', name: '名称' },
      { width: 'w50x4', show: true, align: 'left', key: 'path', name: '类型', type: 'select', list: dictStore.authList, value: 'value', label: 'name' },
      { width: 'w50x4', show: true, align: 'left', key: 'order', name: '排序' },
      { width: 'w50x4', show: true, align: 'left', key: 'type', name: '其他' }, 
      { width: 'flex1', show: true, align: 'right', key: publicStore.auth, name: '操作' },
    ],
    editFrom: [
      { required: true, editshow: true, key: 'model', name: '模型', type: 'input' },
      { required: true, editshow: true, key: 'name', name: '名称', type: 'input' },
      { required: true, editshow: true, key: 'path', name: '类型', type: 'select', list: dictStore.authList, value: 'value', label: 'name' },
      { required: false, editshow: true, key: 'order', name: '排序', type: 'input' },
      { required: false, editshow: true, key: 'type', name: '其他', type: 'input' },
    ],
  })

  onMounted(async() => {
    init()
  })

  const setInit = (key) => {}

  const init = async(key) => {
    state.query = {model: state.model}
    state.params = {Api: state.query}
    let res = await publicStore.http(state.params)
    state.empty = proxy.isNull(res)? true : false
    state.list = proxy.isNull(res)? [] : res.sort((a, b) => a.order - b.order)
    publicStore._public.list = state.list
    setInit(key)
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
  }
</script>
  
<style scoped lang="scss">

</style>
  