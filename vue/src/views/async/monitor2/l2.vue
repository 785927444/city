<template>
  <div class="layout-col">
    <!-- 标题 -->
    <div class="h40 ww100 flex-sc relative mb10">
      <img class="hh100" src="@/assets/imgs/title3.png" />
      <div class="ww100 hh100 flex-sc absolute pl35">
        <span class="fw ptb5">最新告警</span>
        <div class="flex-ec flex1">
        </div>
      </div>
    </div>
    <!-- 内容 -->
    <div class="row bgi22">
      <div :style="{textAlign: v.align}" v-for="(v, i) in state.content" :key="i" v-show="v.show" :class="typeof(v.key) == 'object'?v.width +' '+ 'mlr5':v.width">{{v.name}}</div>
    </div>
    <div class="table ba1">
      <div class="row cursor" :class="index%2 == 1?'bgi23':'bgi18'" v-for="(item, index) in !isNull(publicStore._public.alarmLog)?publicStore._public.alarmLog:[]" :key="index" @click="handleClick('active', item)">
        <div v-show="v.show" :class="v.width" :style="{textAlign: v.align}" v-for="(v, i) in state.content" :key="i">
          <span v-if="typeof(v.key) == 'object'" class="i21 cursor mlr5" :class="kk=='add'||state.auth[kk] == false?'none':''" v-for="(vv, kk, ii) in v.key" :key="ii" @click.stop="handleClick(kk, item)">{{vv}}</span>
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
    <Deal @init="init" title="告警处理" ref="dealRef" />
  </div>
</template>

<script lang="ts" setup>
  const { proxy }:any = getCurrentInstance()
  const configStore = proxy.configStore()
  const publicStore = proxy.publicStore()
  const dictStore = proxy.dictStore()
  const emit = defineEmits(['getLog'])
  const state = reactive({
	  ...publicStore.$state,
    content: [
      { width: 'w70',   show: true, align: 'center', key: '*', name: '序号' },
      { width: 'w50x4', show: true, align: 'left', key: 'sensor_name', name: '告警设备' },
      { width: 'w50x4', show: true, align: 'left', key: 'sensor_instlPos', name: '安装位置' },
      { width: 'w50x4', show: true, align: 'left', key: 'alarm_name', name: '告警名称' }, 
      { width: 'w50x4', show: true, align: 'left', key: 'alarm_time', name: '初次告警时间', type: 'time' }, 
      { width: 'w50x4', show: true, align: 'left', key: 'last_activation_time', name: '最后告警时间', type: 'time' }, 
      { width: 'w50x3', show: true, align: 'center', key: 'activation_count', name: '告警次数' }, 
      { width: 'flex1', show: true, align: 'right', key: {deal: '处理'},  name: '操作' },
    ],
  })
  let dealRef = $ref()
  const handleClick = (remark, val) => {
    if(remark == 'deal'){
      dealRef.onVisable(val)
    }
  }

  const init = async() => {
    emit('getLog')
  }
</script>
 
<style scoped lang="scss">

</style>

