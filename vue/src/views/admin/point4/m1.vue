<template>
  <div class="layout-col flex1">
    <!-- 标题 -->
    <div class="h40 ww100 flex-sc relative mb10">
      <img class="hh100" src="@/assets/imgs/title2.png" />
      <div class="ww100 hh100 flex-sc absolute pl35">
        <span class="fw ptb5">设备</span>
        <div class="flex-ec flex1">
          <div class="rad4 ptb5 plr8 flex-cc cursor bgi22 i21 ml10 bo-i21-1" @click.stop="handleClick('out')">
            <i-ep-filter class="f12 fw" /><span class="f14 ml5">导出</span>
          </div>
          <div class="rad4 ptb5 plr8 flex-cc cursor bgi22 i21 ml10 bo-i21-1" @click.stop="handleClick('in')">
            <i-ep-switch class="f12 fw" /><span class="f14 ml5">导入</span>
          </div>
          <div class="rad4 ptb5 plr8 flex-cc cursor bgi22 i21 ml10 bo-i21-1" 
            v-if="state.content.find(v=>{return typeof(v.key) == 'object'}) && state.content.find(v=>{return typeof(v.key) == 'object'})['key'].hasOwnProperty('add')" 
            @click.stop="addRef.onVisable(state.addItem)">
            <i-ep-plus class="f12 fw" /><span class="f14 ml4">{{state.content.find(v=>{return typeof(v.key) == 'object'})['key'].add}}</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 内容 -->
    <div class="row bgi22">
      <div :style="{textAlign: v.align, paddingRight: v.name=='操作'?'10px': 'inherit'}" v-for="(v, i) in state.content" :key="i" v-show="v.show" :class="v.width">{{v.name}}</div>
    </div>
    <div class="table-col bss">
      <el-tree 
      class="ww100" 
      ref="treeRef" 
      :data="state.tree"
      :node-key="state.key" 
      :current-node-key="defaultId"
      :props="defaultProps"
      highlight-current    
      @node-click="handleNodeClick"
      empty-text="暂无数据">
        <template #default="{ node, data }">
          <span class="row">
            <div v-show="v.show" :class="v.width" :style="{textAlign: v.align}" v-for="(v, i) in state.content" :key="i">
              <span v-if="typeof(v.key) == 'object'" class="cursor mlr5" v-for="(vv, kk, ii) in v.key" :key="ii" 
              :class="state.auth[kk] == false||data['parent_id']=='0'?'none':kk=='del'?'i8':'i21'" @click.stop="handleClick(kk, data)">{{vv}}</span>
              <span v-else-if="v.type == 'select'" :class="find(v.list, [v.value, data[v.key]], 'color')?find(v.list, [v.value, data[v.key]], 'color'):''">
                {{find(v.list, [v.value, data[v.key]], v.label)}}
              </span>
              <span v-else-if="v.type == 'icon5'" class="flex-sc">
                <img v-if="data.parent_id == 0" class="mr5" src="@/assets/imgs/ic8.png" />
                {{data[v.key]}}
              </span>
              <span v-else>{{isNull(data[v.key]) && v.key!=''? '/' : data[v.key]}}</span>
            </div>
          </span>
        </template>
      </el-tree>
    </div>
    <ImportData @init="init" :state="state" ref="importRef"/>
  </div>
</template>

<script lang="ts" setup>
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const dictStore = proxy.dictStore()
  let importRef = $ref()
  let treeRef = $ref()
  let defaultId = $ref()
  let defaultProps = {
    children: 'children',
    label: 'name',
  }
  const state = reactive({
	  ...publicStore.$state,
    content: [
      { width: 'flex1', show: true, align: 'left',  key: 'name', name: '名称', type: 'icon5' },
      // { width: 'w50x3', show: true, align: 'right', key: {addPoint: '添加点位'}, name: '操作' }, 
    ],
    export: [
      { key: 'stationnum', name: '站点' }, 
      { key: 'type', name: '类型' }, 
      { key: 'sensorparents', name: '设备上级ID' },
      { key: 'sensorid', name: '设备ID' }, 
      { key: 'address', name: '寄存器ID' }, 
      { key: 'registertype', name: '寄存器类型' }, 
      { key: 'datatype', name: '数据类型' }, 
      { key: 'selecttype', name: '其他类型' }, 
      { key: 'len', name: '地址长度' }, 
      { key: 'point', name: '起始地址' }, 
      { key: 'mode', name: '模式' },
      { key: 'scale', name: '幅度' },
      { key: 'offset', name: '偏移' },
      { key: 'code', name: '测量点' },
    ],
    model: 't_v_645_point',
  })

  onMounted(async() => {
    if(!configStore.distributId) configStore.distributId = '0'
    let query1 = {model: "t_station"}
    let query2 = {model: "t_sensor_template"}
    let query3 = {model: "t_sensor_template_cfg_point", args: `type='1'`}
    let res = await publicStore.http({Api1: query1, Api2: query2, Api3: query3})
    // 厂站
    publicStore._public.stations = proxy.isNull(res.Api1)? [] : res.Api1.filter(a=>a.parent_id == '0').sort((a, b) => a.order - b.order)
    // 类型
    publicStore._public.template = proxy.isNull(res.Api2)? [] : res.Api2.sort((a, b) => a.order - b.order)
    state.qztemplate = publicStore._public.template.filter(a=>a.attribute=='2'&&a.ismapping2star=='4')
    // 配置
    let list3 = proxy.isNull(res.Api3)? [] : res.Api3
		let templateCfgs = []
		list3.forEach(v => {
			if(!proxy.isNull(v.calcRuleExpres)){
				try {
					let cfg = JSON.parse(v.calcRuleExpres)
					if(!proxy.isNull(cfg)){
						let exist_cfg = templateCfgs.find(a=>a.sensor_type == v.sensor_type)
						if(exist_cfg) {
							exist_cfg.cfgs.push(cfg)
						}else{
							templateCfgs.push({sensor_type: v.sensor_type, cfgs: [cfg]})
						}
					}
				} catch (error) {
					console.error("解析失败:", error.message)
				}
			}
		})
		publicStore._public.templateCfgs = templateCfgs
    init()
  })

  watch(() => configStore.distributId, async(val, old) => {
    await nextTick()
    if(proxy.isNull(val)) return
    init()
  }, {immediate: false, deep: true})

  const init = async() => {
    let query = configStore.distributId=='0'? {model: "t_sensor"} : {model: "t_sensor", args: `stationNum='${configStore.distributId}'`}
    // 设备
    let res = await publicStore.http({Api: query})
    let list1 = proxy.isNull(res)? [] : res.sort((a, b) => a.order - b.order)
    let tree = proxy.treeData(list1, 'id', 'parent_id', 'children')
    // 获取树
    state.tree = []
    state.qztemplate.forEach(v => {
      let datas = tree.filter(a=>a.type == v.type)
      if(datas) state.tree = [...state.tree, ...datas]
    })
     publicStore._public.tree = state.tree
    let node = proxy.findNode(state.tree, (node) => { return !node.children })
    await nextTick()
    defaultId = node[state.key]
    treeRef.setCurrentKey(defaultId, true)
    if(node.class == '0') {
      const parents = proxy.parentNodes(publicStore._public.tree , node[state.key], 'id')
      if(parents) {
        const qz = parents.find(a=>a.class=='2')
        if(qz) node.qztype = qz.type
      }
      publicStore.active = Object.assign({}, node)
    } 
  }

  const handleNodeClick = async(node) => {
    defaultId = node[state.key]
    if(node.class == '0') {
      const parents = proxy.parentNodes(publicStore._public.tree , node[state.key], 'id')
      if(parents) {
        const qz = parents.find(a=>a.class=='2')
        if(qz) node.qztype = qz.type
      }
      publicStore.active = Object.assign({}, node)
    } 
  }

  const handleClick = async(remark, val) => {
    if(remark == 'out'){
      let query = {model: "t_v_645_point"}
      let res = await publicStore.http({Api: query})
      let list = [...res]
      let name = '站-645数据'
      proxy.handleExport(state.export, list, name)
    }
    if(remark == 'in'){
      let query = {model: "t_v_645_point"}
      let ctx = {content: state.export, key: state.key, query: query, unique: ''}
      importRef.onVisable(ctx)
    }
  }
</script>
  
<style scoped lang="scss">

</style>
  