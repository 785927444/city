<template>
  <div class="layout-col flex1">
    <!-- 标题 -->
    <div class="h40 ww100 flex-sc relative mb10">
      <img class="hh100" src="@/assets/imgs/title2.png" />
      <div class="ww100 hh100 flex-sc absolute pl35">
        <span class="fw flex1 ptb5">角色列表</span>
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
</template>

<script lang="ts" setup>
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  let addRef = $ref()
  const state = reactive({
	  ...publicStore.$state,
    content: [
      { width: 'w70',   show: true, align: 'center', key: '*', name: '序号' },
      { width: 'w50x3', show: true, align: 'left', key: 'name', name: '名称' },
      { width: 'flex1', show: true, align: 'left', key: 'description', name: '描述' }, 
    ],
    editFrom: [
      { required: true,  editshow: true, key: 'name', name: '名称', type: 'input' },
      { required: false, editshow: true, key: 'description', name: '描述', type: 'input' },
    ],
  })

  onMounted(async() => {
    init()
  })

  const setInit = (key) => {
    let exist = state.list.find(a=>a[state.key] == key)
    handleClick('active', proxy.isNull(exist)?state.list[0] : exist)
  }

  const init = async(key) => {
    let query1 = {model: "t_role", args: `CAST(id AS SIGNED)>${configStore.user.role_id}`, order: `CAST(id AS SIGNED) ASC`}
    let query2 = {model: "t_auth"}
    let params = {Api1: query1, Api2: query2}
    let res = await publicStore.http(params)
    state.empty = proxy.isNull(res.Api1)? true : false
    state.list = proxy.isNull(res.Api1)? [] : res.Api1
    publicStore._public.list = state.list
    publicStore._public.authList = proxy.isNull(res.Api2)? [] : res.Api2
    setInit(key)
  }

  const handleClick = (remark, val) => {
    if(remark == 'add' || remark == 'upd'){
      addRef.onVisable(val)
    }
    if(remark == 'del'){
      addRef.del(val, state.key, state.url.del)
    }
    if(remark == 'active'){
      publicStore.active = val
    }
  }
</script>
  
<style scoped lang="scss">

</style>
  