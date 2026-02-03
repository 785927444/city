<template>
  <!-- 生成弹窗 -->
  <el-dialog v-model="state.isFalse" title="配置生成" :draggable="true" width="40%">
    <div class="layout-col p20">
      <!-- 标题 -->
      <div class="h40 ww100 flex-sc relative mb10">
        <!-- <img class="hh100" src="@/assets/imgs/title4.png" /> -->
        <div class="ww100 hh100 flex-sc absolute">
          <span class="fw flex1 ptb5"></span>
          <div class="flex-ec flex1">
            <div class="rad4 ptb5 plr8 flex-cc cursor bgi22 i21 ml10 bo-i21-1" 
              v-if="state.content.find(v=>{return typeof(v.key) == 'object'}) && state.content.find(v=>{return typeof(v.key) == 'object'})['key'].hasOwnProperty('add')" 
              @click.stop="state.list.push({...state.addItem})">
              <i-ep-plus class="f12 fw" /><span class="f14 ml4">{{state.content.find(v=>{return typeof(v.key) == 'object'})['key'].add}}</span>
            </div>
            <div class="rad4 ptb5 plr8 flex-cc cursor bgi22 i21 ml10 bo-i21-1" 
              @click.stop="handleClick('submit')">
              <i-ep-pointer class="f12 fw" /><span class="f14 ml5">保存</span>
            </div>
          </div>
        </div>
      </div>
      <!-- 内容 -->
      <div class="row bgi22">
        <div :style="{textAlign: v.align}" v-for="(v, i) in state.content" :key="i" v-show="v.show" :class="typeof(v.key) == 'object'?v.width +' '+ 'mlr5':v.width">{{v.name}}</div>
      </div>
      <div class="table bss">
        <div class="flex-col" :class="index%2 == 1?'bgi23':'bgi18'" v-for="(item, index) in state.list" :key="index" @click="handleClick('active', item)">
          <div class="row cursor">
            <div v-show="v.show" :class="v.width" :style="{textAlign: v.align}" v-for="(v, i) in state.content" :key="i">
              <span v-if="typeof(v.key) == 'object'" class="i21 cursor mlr5" :class="kk=='add'||state.auth[kk] == false?'none':''" v-for="(vv, kk, ii) in v.key" :key="ii" @click.stop="handleClick(kk, item, index)">{{vv}}</span>
              <span v-else-if="v.key=='*'" class="flex-cc h32 rad2" style="background: rgba(39, 109, 214, 0.5)">{{(state.page-1)*state.limit + index+1}}</span>
              <span v-else-if="v.type == 'time'">{{item[v.key] == 0?'/':parseTime(item[v.key])}}</span>
              <span v-else-if="v.type == 'select'">
                <el-select v-model="item[v.key]" placeholder="暂无" style="width: 100%" filterable>
                  <el-option v-for="sel in v.list" :key="sel[v.value]" :value="sel[v.value]" :label="sel[v.label]" />
                </el-select>
              </span>
              <span v-else-if="v.type == 'input'">
                <el-input v-model="item[v.key]" placeholder="请输入" style="width: 100%" />
              </span>
              <span v-else-if="v.type == 'arr'">
                <span class="flex-cc plr10 h32 rad2 i21 cursor" style="background: rgba(39, 109, 214, 0.5)" @click.stop="isNull(item.arr)?item.arr=[{value: '', name: ''}]:item.arr.push({value: '', name: ''})">
                  <i-ep-plus class="f12 mr2" /><span>添加</span>
                </span>
              </span>
              <span v-else>{{isNull(item[v.key]) && v.key!=''? '/' : item[v.key]}}</span>
            </div>
          </div>
          <div v-if="!isNull(item.arr)" v-for="(vvv, iii) in item.arr" :key="iii" class="flex-sc plr10 pb10">
            <span class="w50 pr10"></span>
            <span class="w50x3 pr10"></span>
            <span class="w50x3 pr10"><el-input v-model="vvv.name" placeholder="名称" style="width: 100%" /></span>
            <span class="w50x3 pr10"><el-input v-model="vvv.value" placeholder="数值" style="width: 100%" /></span>
            <span class="w50x2 pr10">
              <span class="flex-cc plr10 h32 rad2 i21 cursor" style="background: rgba(39, 109, 214, 0.5)" @click.stop="item.arr.splice(iii, 1)">
                <i-ep-delete class="f12 mr2" /><span>删除</span>
              </span>
            </span>
          </div>
        </div>
        <div v-if="state.empty" class="flex-cc ww100 tc ptb13 bgi18">没有数据</div>
      </div>
    </div>
  </el-dialog>
</template>

<script lang="ts" setup>
  import api from '@/api'
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const types = [
    {value: 'input', name: '输入'},
    {value: 'select', name: '下拉'},
    {value: 'radio', name: '单选'},
  ]
  const state = reactive({
	  ...publicStore.$state,
    content: [
      { width: 'w50', show: true, align: 'left',  key: '*', name: '' },
      { width: 'w50x3', show: true, align: 'left',  key: 'name', name: '配置名', type: 'input' },
      { width: 'w50x3', show: true, align: 'left',  key: 'code', name: '变量(key)', type: 'input' },
      // { width: 'w50x3', show: true, align: 'left',  key: 'value', name: '变量(value)' },
      { width: 'w50x3', show: true, align: 'left',  key: 'type', name: '类型', type: 'select', list: types, value: 'value', label: 'name' },
      { width: 'w50x2', show: true, align: 'left',  key: 'arr', name: '额外', type: 'arr' },
      { width: 'flex1', show: true, align: 'right', key: {add: '新增', del: '删除'},  name: '操作' },
    ],
    addItem: {name: '', code: '', value: '', type: '', arr: []},
  })
  const props = defineProps({
    state: {
      type: [Object, Array],
      default: ()=>{return {}}
    },
  })
  const emit = defineEmits(['init'])

  // 弹窗
  const onVisable = async (val?: any) => {
    state.isFalse = !state.isFalse
    if(!state.isFalse) return
    state.list = proxy.isNull(props.state.config)? [] : [...props.state.config.attr]
  }

  // 事件
  const handleClick = (remark, val, index?: any) => {
    if(remark == 'submit'){
      let attr = JSON.stringify(state.list)
      let form = {}
      if(proxy.isNull(props.state.config)) {
        form = {id: '', name: import.meta.env.VITE_BUILD_NAME, status: '1', attr: attr}
      } else {
        form = {id: props.state.config.id, attr: attr}
      }
      let params = {model: 't_config', list: [form]}
      api[form.id == ''?'addApi':'updApi'](params).then((res:any) => {
        if(res.code == 200){
          ElNotification({ title: '提示', message: '配置成功', type: 'success' })
          onVisable()
          emit('init')
        }else{
          ElNotification({ title: '提示', message: '配置失败1', type: 'error' })
        }
      }).catch((err) => {
        ElNotification({ title: '提示', message: '配置失败2', type: 'error' })
      })
    }
    if(remark == 'del'){
      state.list.splice(index, 1)
    }
  }

  // 暴露
  defineExpose({
    onVisable
  })
</script>

<style scoped lang="scss">
:deep(.table .el-input__wrapper) {
  min-height: auto;
  color: inherit;
  padding: 10;
  border-radius: 2px;
  background: rgba(39, 109, 214, 0.5) !important;
  box-shadow: 0 0 0 0px #276dd6 inset !important;
}
:deep(.table .el-select__wrapper){
  min-height: auto;
  color: inherit;
  padding: 10;
  border-radius: 2px;
  background: rgba(39, 109, 214, 0.5) !important;
  box-shadow: 0 0 0 0px #276dd6 inset !important;
}
// :deep(.select_input .el-input__inner) {
//   color: inherit;
// }
// :deep(.select_input .el-select__input){
//   color: inherit !important;
// }
// :deep(.select_input .el-select__selected-item){
//   color: inherit !important;
// }
// .hover1:hover {
//   color: #093a83;
//   background: #3ebee3;
// }
</style>