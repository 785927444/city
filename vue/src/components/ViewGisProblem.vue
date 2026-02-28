<template>
  <!-- 弹窗 -->
  <div class="topclass">
    <el-dialog v-model="state.isFalse" title="" :draggable="true" :fullscreen="true" :destroy-on-close="true" :before-close="onClose" :show-close="false">
      <!-- 自定义头部 -->
      <template #header="{ close, titleId, titleClass }">
        <div class="ww100 flex-sc">
          <span>展示区域</span>
          <div class="flex1 flex-ec">
            <el-button type="info" @click="onClose">关闭</el-button>
          </div>
        </div>
      </template>
      <div class="layout-col">
        <GisShow class="ww100 hh100" v-if="publicStore.check" v-model:mapdata="state.active.mapdata" />
        <!-- 左边 -->
        <div class="hh100 ww22 absolute pl20 ptb50 hidden">
          <div class="layout-col bg-white p15 rad5 c6">
            <div class="fw f16 mb10">问题清单</div>
            <ListTree @handleNodeClick="handleNodeClick" @handleClick="handleClick" :state="state" ref="listTreeRef"/>
          </div>
        </div>
        <!-- 右边 -->
        <div class="hh100 ww25 absolute pr20 ptb50 hidden r1" style="z-index: 999999;">
          <div class="layout-col bg-white p15 rad5 c6">
            <div class="ww100 flex-bc mb10">
              <span class="fw f16 ">整改区域</span>
              <span class="flex-ec">
                <el-input v-model="state.search" placeholder="请输入关键字" clearable />
                <span class="bgi1 ptb6 w70 tc rad3 white ml5">搜索</span>
              </span>
            </div>
            <div class="layout-col">
              <el-table 
              v-if="!isNull(state.lists)"
              v-loading.fullscreen.lock="state.loading" 
              header-cell-class-name="bgi16 c3"
              :cell-style="{'background-color': '#FFFFFF', 'color': '#626366'}"
              border
              empty-text="暂无数据" 
              :data="state.lists" stripe>
              <el-table-column type="index" :index="indexMethod" label="序号" align="center" width="50" />
              <el-table-column prop="name" label="小区" align="center" />
              <el-table-column label="匹配状态" width="80">
                <template #default="scope, $index">
                  <span>{{find(types, ['value', scope.row.set], 'name')}}</span>
                </template>
              </el-table-column>
              </el-table>
              <Pagination class="" style="padding-bottom: 0;" v-show="state.total>0" :layout="state.layout" :total="state.total" v-model:page.sync="state.page" v-model:limit.sync="state.limit" @pagination="init" />
              </div>
              <div class="ww100 flex-ec mt15 white">
                <span class="bgi1 ptb5 plr12 rad3 mlr5">全选</span>
                <span class="bgi1 ptb5 plr12 rad3 mlr5">删除</span>
                <span class="bgi1 ptb5 plr12 rad3 mlr5">上传对比</span>
                <span class="bgi1 ptb5 plr12 rad3 mlr5">保存</span>
              </div>
          </div>
        </div>
      </div>
    </el-dialog> 
  </div>
</template>

<script lang="ts" setup>
  const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const types = [
    {value: '0', name: '未匹配', color: 'i5'},
    {value: '1', name: '已匹配', color: 'i11'},
  ]
  const state = reactive({
	  ...publicStore.$state,
    listRow: true,
    listExpand: true,
    content: [
      { width: 'flex1', show: true, align: 'left',  key: 'name', name: '名称', type: 'icon' },
    ],
    lists: [],
    layout: `total, prev, pager, next, jumper`,
  })
  let listTreeRef = $ref()
  const indexMethod = (index) => { return parseInt(state.page) + index }

  // 打开关闭弹窗
  const onVisable = async (val) => {
    state.isFalse = !state.isFalse
    if(!state.isFalse) return
    state.active = {...val}
    init()
    init2()
  }

  const init = async(key) => {
    let query1 = {model: 't_problem_type'}
    let query2 = {model: 't_task_problem'}
    let res = await publicStore.http({Api1: query1, Api2: query2})
    let list0 = proxy.isNull(res.Api1)? [] : res.Api1.sort((a, b) => a.orderd - b.orderd).filter(a=>a.parent_id!=0)
    let list1 = list0.map(a => ({ ...a, parent_id: '0' }))
    let list2 = proxy.isNull(res.Api2)? [] : res.Api2.sort((a, b) => a.orderd - b.orderd)
    state.list = [...list1, ...list2]
    setTree(key)
  }

   const init2 = async(key) => {
    state.lists = [
      {id: '1', name: '精英时代城', set: '0' },
      {id: '2', name: '复兴小区', set: '0' },
      {id: '3', name: '旧二轻小区', set: '0' },
      {id: '4', name: '城市家园小区', set: '1' },
      {id: '5', name: '顶山国际', set: '1' },
      {id: '6', name: '梅院小区', set: '1' },
    ]
    state.total = state.lists.length
   }

   const setTree = async(key) => {
    state.tree = proxy.treeData(state.list, state.key, state.parent, 'children')
    console.log("state.tree", state.tree)
    let node1 = proxy.findNode(state.tree, (node) => { return !node.children })
    let node2 = proxy.findNode(state.tree, (node) => { return node[state.key] == key })
    let node = proxy.isNull(node2)? node1 : node2
    if(!node) return
    await nextTick()
    listTreeRef.handleNodeClick(node)
  }

  const handleNodeClick = (val) => { 
    if(!val.children) publicStore.active = {...val} 
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

  const onClose = () => { 
    state.isFalse = !state.isFalse; 
     setTimeout(() => {
      publicStore.check=!publicStore.check;
    }, 1000);
  }
  const handleDraw = () => { 
    publicStore.form.mapdata = state.active.mapdata
    onClose()
  }

  // 暴露给父组件
  defineExpose({
    onVisable
  })
</script>

<style scoped lang="scss">
:deep(.el-dialog__body){padding: 0 !important;}
</style>