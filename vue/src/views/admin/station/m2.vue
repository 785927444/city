<template>
  <div class="layout-col">
    <!-- 标题 -->
    <aa-title :title="isNull(publicStore.active)?'':publicStore.active.station_name">
      <template #left-content></template>
      <template #right-content>
        <div class="rad4 ptb5 plr8 flex-cc cursor bgi1 white ml10" 
          v-if="state.content.find(v=>{return typeof(v.key) == 'object'}) && state.content.find(v=>{return typeof(v.key) == 'object'})['key'].hasOwnProperty('add')" 
          @click.stop="handleClick('add', state.addItem)">
          <i-ep-plus class="f12 fw" /><span class="f14 ml4">{{state.content.find(v=>{return typeof(v.key) == 'object'})['key'].add}}</span>
        </div>
      </template>
    </aa-title> 
    <!-- 内容 -->
    <div class="layout-col bg-white">
      <List @handleClick="handleClick" :state="state"/>
    </div>
    <!-- 底部 -->
    <aa-foot></aa-foot>
    <Add @init="init" :state="state" ref="addRef" />
    <Area @init="init" :state="state" ref="areaRef" />
    <Industry @init="init" :state="state" ref="industryRef" />
  </div>
</template>

<script lang="ts" setup>
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const dictStore = proxy.dictStore()
  let addRef = $ref()
  let areaRef = $ref()
  let industryRef = $ref()
  const state = reactive({
	  ...publicStore.$state,
    listRow: true,
    content: [
      { width: 'w70',   show: true, align: 'center', key: '*', name: '序号' },
      { width: 'w50x5', show: true, align: 'left', key: 'station_name', name: '名称' }, 
      { width: 'w50x5', show: true, align: 'left', key: 'instlPos', name: '位置' }, 
      { width: 'w50x5', show: true, align: 'left', key: 'mark', name: '标志' }, 
      { width: 'w50x5', show: true, align: 'left', key: 'order', name: '排序' },
      // { width: 'w50x4', show: true, align: 'left', key: 'images', name: '图片', type: 'image' }, 
      { width: 'flex1', show: true, align: 'right', key: {}, name: '操作' },
    ],
    editFrom: [
      { required: true,  editshow: 'none', name: '上级', key: 'parent_id', type: 'input' },
      { required: true,  editshow: true,  name: '名称', key: 'station_name', type: 'input' },
      { required: false, editshow: true,  name: '位置', key: 'instlPos', type: 'input' },
      { required: false, editshow: true,  name: '标志', key: 'mark', type: 'input' },
      { required: false, editshow: true,  key: 'images', name: '图片', type: 'base64' },
      { required: false, editshow: true,  name: '排序', key: 'order',  type: 'input' },
    ],
    addItem: {},
    srcList: [''],
  })

  onMounted(async() => {
    await publicStore.init({path: '/station'}, state)
    let content = state.content.find(a=>a.name == '操作')
    // if(content && !proxy.isNull(content.key)){
    //   if ('industry' in content.key) delete content.key.industry
    //   if ('area' in content.key) delete content.key.area
    // }
  })

  watch(() => publicStore.active, async(val) => {
    await nextTick()
    if(proxy.isNull(val)) return
    init()
  }, {immediate: false, deep: true})

  const init = async() => {
    state.query = {model: state.model, args: `parent_id='${publicStore.active.id}'`, field: "id, parent_id, station_name, `order`, mark, instlPos, province, province_name, city, city_name, district, district_name"}
    state.params = {Api: state.query}
    let res = await publicStore.http(state.params)
    state.empty = proxy.isNull(res)? true : false
    state.list = proxy.isNull(res)? [] : res.sort((a, b) => a.order - b.order)
    state.addItem = {parent_id: publicStore.active.id}
  }

  const handleClick = async(remark, val) => {
    if(remark == 'add' || remark == 'upd'){
      if(!val.images){
        let query = {model: state.model, args: `id='${val.id}'`, field: "id, images"}
        let res = await publicStore.http({Api: query})
        if(!proxy.isNull(res)) val.images = res[0]['images']
      }
      addRef.onVisable(val)
    }
    if(remark == 'del'){
      addRef.del(val)
    }
    if(remark == 'area'){
      areaRef.onVisable(val)
    }
    if(remark == 'industry'){
      industryRef.onVisable(val)
    }
    if(remark == 'active'){
      publicStore.active = val
    }
  }

</script>
  
<style scoped lang="scss">

</style>
  