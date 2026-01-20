<template>
    <div class="layout-col flex1">
      <!-- 标题 -->
      <div class="h40 ww100 flex-sc relative mb5 i15">
          <img class="hh100" src="@/assets/imgs/title2.png" />
          <div class="ww100 hh100 flex-sc absolute pl35">
              <span class="fw ptb5">区域</span>
              <div class="flex-ec flex1">
              </div>
          </div>
      </div>
      <!-- 内容 -->
      <div class="row bgi22">
        <div :style="{textAlign: v.align}" v-for="(v, i) in state.content" :key="i" v-show="v.show" :class="typeof(v.key) == 'object'?v.width +' '+ 'mlr5':v.width">{{v.name}}</div>
      </div>
      <div class="table-col ba1">
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
                :class="((data['classify']==2&&kk!='add') || data['classify']==1 || (data['classify']!=2&&kk=='add') || state.auth[kk] == false)?'none':kk=='del'?'i8':'i21'" @click.stop="handleClick(kk, data)">{{vv}}</span>
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
    </div>
</template>

<script lang="ts" setup>
  const { proxy }: any = getCurrentInstance();
  const publicStore = proxy.publicStore();
  const configStore = proxy.configStore();
  const state = reactive({
    ...publicStore.$state,
    content: [
      { width: 'flex1', show: true, align: 'start', key: 'station_name', name: '名称', type: 'icon2' }, 
    ],
  })
  const defaultProps = {
    children: 'children',
    label: 'station_name',
  }
  let treeRef = $ref()
  let defaultId = $ref()

  const getInit = async (key) => {
    let query = proxy.isNull(configStore.distributId) || configStore.distributId=='0'? { model: "t_sensor", args: `type='${publicStore.actIndex}'`} : { model: "t_sensor", args: `stationNum='${configStore.distributId}' and type='${publicStore.actIndex}'`}
    let res = await publicStore.http({ Api: query })
    publicStore._public.allDevices = proxy.isNull(res)? [] : res
    let stationNums = [...new Set(publicStore._public.allDevices.filter(a => a.stationNum).map(a => a.stationNum))]
    state.stationNums = stationNums.map(a => `'${a}'`).join(',')
    state.bayNums = [...new Set(publicStore._public.allDevices.filter(a => a.bayNum).map(a => a.bayNum))]
    getStation(key)
  }

  watch(() => publicStore.actIndex, async (val) => {
    if(proxy.isNull(val)) return
    if(val == -1) return
    getInit()
  },{ immediate: true, deep: true })
  
  const getStation = async (key) => {
    let query = {model: "t_station", args: `id IN (${state.stationNums}) OR parent_id IN (${state.stationNums})`}
    let res = await publicStore.http({ Api: query })
    let list = proxy.isNull(res)? [] : res
    state.list = list.filter(a => a.parent_id=='0' || state.bayNums.find(b=>b==a.id))
    setTree(key)
  }

  const setTree = async(key) => {
    state.tree = proxy.treeData(state.list, state.key, state.parent, 'children')
    let node1 = proxy.findNode(state.tree, (node) => { return !node.children })
    let node2 = proxy.findNode(state.tree, (node) => { return node[state.key] == key })
    let node = proxy.isNull(node2)? node1 : node2
    await nextTick()
    defaultId = node[state.key]
    treeRef.setCurrentKey(defaultId, true)
    publicStore.active = Object.assign({}, node)
  }

  const handleNodeClick = async(node) => {
    defaultId = node[state.key]
    publicStore.active = Object.assign({}, node)
  }

  const handleClick = (remark, val) => {
    if(remark == 'active'){
      publicStore.active = Object.assign({}, val)
    }
  }

</script>