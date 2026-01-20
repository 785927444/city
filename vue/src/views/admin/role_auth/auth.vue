<template>
  <div class="layout-col flex3 ml15">
    <!-- 标题 -->
    <div class="h40 ww100 flex-sc relative mb10">
      <img class="hh100" src="@/assets/imgs/title3.png" />
      <div class="ww100 hh100 flex-sc absolute pl35">
        <span class="fw flex1 ptb5">{{isNull(publicStore.active)?'':publicStore.active.name + ' - 权限配置'}}</span>
        <div class="flex-ec flex1">
          <el-form class="ww100 flex-ec" :model="state.from" label-width="115px" v-if="state.auth.upd">
            <div class="rad4 ptb5 plr8 flex-cc cursor bgi22 i21 ml10 bo-i21-1" @click.stop="handleSubmit(formRef)">
              <i-ep-connection class="f12 fw" /><span class="f14 ml2">保存</span>
            </div>
          </el-form>
        </div>
      </div>
    </div>
    <!-- 内容 -->
    <div class="layout-col p10 bss">
      <div class="flex-sc mb10">
        <div class="rad4 ptb5 plr8 flex-cc cursor bgi22 i21 ml10 bo-i21-1" @click.stop="state.auths.map(a=>a.select = true)">
          <i-ep-connection class="f12 fw" /><span class="f14 ml2">全选</span>
        </div>
        <div class="rad4 ptb5 plr8 flex-cc cursor bgi22 i21 ml10 bo-i21-1" @click.stop="state.auths.map(a=>a.select = false)">
          <i-ep-connection class="f12 fw" /><span class="f14 ml2">反选</span>
        </div>
        <div class="plr8"><el-input v-model="state.text" placeholder="请输入关键字" /></div>
      </div>
      <div class="flex1 overlay ww100 flex-ss warp">
        <div class="p8 ww cursor" v-for="(item, index) in isNull(state.auths)? [] : state.auths.filter((a:any)=> !state.text || a.name.toLowerCase().indexOf(state.text.toLowerCase()) != -1)" 
        :key="index" @click.stop="item.select = !item.select">
          <div class="flex-sc">
            <div :class="item.select?'bgi1':'bo-cb-1'" class="rad2 w13 h13 mr5 p2 flex-cc"><i-ep-select v-if="item.select" class="f12" /></div>
            <div>{{item.name}}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import api from '@/api'
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const state = reactive({
	  ...publicStore.$state,
  })

  watch(() => publicStore.active, async(val) => {
    await nextTick()
    if(proxy.isNull(val)) return
    setInit()
    init()
  }, {immediate: false, deep: true})

  const setInit = async() => {
    let authList = publicStore.active[state.key] == 1 || (configStore.user&&configStore.user.role_id == '1')? publicStore._public.authList : publicStore._public.authList.filter(a=>a.model != 't_route' && a.model != 't_auth')
    state.auths = authList.sort((a, b) => a.order - b.order).map(item => {
      item.select = false
      return item
    })
  }

  const init = async(key) => {
    state.query = {model: "t_role_auth", args: `role_id='${publicStore.active[state.key]}'`, field: "auth_id"}
    state.params = {Api: state.query}
    let res = await publicStore.http(state.params)
    state.list = proxy.isNull(res)? [] : proxy.isNull(res)? [] : res
    setKey(key)
  }

  const setKey= async(key) => {
    state.active = state.list.map(item => item.auth_id)
    state.auths.forEach(item => {
      let auth = state.list.find(a=>a.auth_id == item.id)
      if(auth) {
        item.select = true
      } else {
        item.select = false
      }
    })
  }

  const handleSubmit = async(formEl) => {
    let list = state.auths.filter(a=>a.select).map(a => a.id)
    const addedItems = list.filter(item => !state.active.includes(item))
    const deletedItems = state.active.filter(item => !list.includes(item))
    if(!proxy.isNull(addedItems)) await setAdd(addedItems)
    if(!proxy.isNull(deletedItems)) await setDel(deletedItems)
  }

  const setAdd = async(items) => {
    let query = {model: "t_role_auth", list: []}
    query.list = items.map(v => { return {role_id: publicStore.active[state.key], auth_id: v}})
    api.addApi(query).then(res => {
      if(res.code == 200){
        init()
        ElNotification({ title: '提示', message: '添加成功', type: 'success' })
      }else{
        ElNotification({ title: '提示', message: '添加失败', type: 'error' })
      }
    }).catch((err) => {
        ElNotification({ title: '提示', message: '添加失败', type: 'error' })
    })
  }

  const setDel = async(items) => {
    let query = {model: "t_role_auth", list: []}
    query.list = items.map(v => { return {role_id: publicStore.active[state.key], auth_id: v}})
    api.delApi(query).then(res => {
      if(res.code == 200){
        init()
        ElNotification({ title: '提示', message: '删除成功', type: 'success' })
      }
    }).catch((err) => {
        ElNotification({ title: '提示', message: '删除失败', type: 'error' })
    })
  }
</script>
  
<style scoped lang="scss">
.ww{
  width: 120px;
}
</style>
  