<template>
  <div class="layout-col">
    <!-- 标题 -->
    <div class="h40 ww100 flex-sc relative mb10">
      <img class="hh100" src="@/assets/imgs/title3.png" />
      <div class="ww100 hh100 flex-sc absolute pl35">
        <span class="fw ptb5">监控设备</span>
        <div class="flex-ec flex1 hh100">
          <div class="flex-sc mr10" v-if="!isNull(publicStore._public.templates) && publicStore._public.templates.length > 1">
            <span class="plr10">类型</span>
            <span class="w50x3">
              <el-select v-model="state.type" placeholder="请选择" style="width:100%" filterable>
                  <el-option label="全部" value="All" />
                  <el-option v-for="(v, i) in publicStore._public.templates" :key="v.type" :value="String(v.type)" :label="v.name" />
              </el-select>
            </span>
          </div>
          <div class="flex-sc mr10">
            <span class="plr10">通信</span>
            <span class="w50x3">
              <el-select v-model="state.offline" placeholder="请选择" style="width:100%" filterable>
                  <el-option label="全部" value="All" />
                  <el-option v-for="(v, i) in state.offlines" :key="v.value" :value="String(v.value)" :label="v.name" />
              </el-select>
            </span>
          </div>
          <div class="flex-sc mr10">
            <span class="plr10">诊断</span>
            <span class="w50x3">
              <el-select v-model="state.alarm" placeholder="请选择" style="width:100%" filterable>
                  <el-option label="全部" value="All" />
                  <el-option v-for="(v, i) in state.alarms" :key="v.value" :value="String(v.value)" :label="v.name" />
              </el-select>
            </span>
          </div>
        </div>
      </div>
    </div>
    <!-- 内容 -->
    <div class="flex1 layout-row ba1 i15 warp overlay p8">
      <div class="flex-cc p8 cursor" style="width: 25%" @click.stop="toPath('/detail', {id: v.id, stationNum: v.stationNum, type: v.type, code: '', code2: ''})" :key="i" v-for="(v, i) in isNull(publicStore._public.homeDevices)? [] :
      state.type!='All'&& state.offline=='All' && state.alarm=='All'?publicStore._public.homeDevices.filter(a=>a.type==state.type):
      state.type=='All' && state.offline!='All' && state.alarm=='All'?publicStore._public.homeDevices.filter(a=>a.offline==state.offline):
      state.type=='All' && state.offline=='All' && state.alarm!='All'?publicStore._public.homeDevices.filter(a=>a.alarm==state.alarm):
      state.type=='All' && state.offline!='All' && state.alarm!='All'?publicStore._public.homeDevices.filter(a=>a.offline==state.offline).filter(a=>a.alarm==state.alarm):
      state.type!='All' && state.offline=='All' && state.alarm!='All'?publicStore._public.homeDevices.filter(a=>a.type==state.type).filter(a=>a.alarm==state.alarm):
      state.type!='All' && state.offline!='All' && state.alarm=='All'?publicStore._public.homeDevices.filter(a=>a.type==state.type).filter(a=>a.offline==state.offline):
      state.type!='All' && state.offline!='All' && state.alarm=='All'?publicStore._public.homeDevices.filter(a=>a.type==state.type).filter(a=>a.offline==state.offline):
      state.type!='All' && state.offline!='All' && state.alarm!='All'?publicStore._public.homeDevices.filter(a=>a.type==state.type).filter(a=>a.alarm==state.alarm).filter(a=>a.offline==state.offline):
      publicStore._public.homeDevices">
        <div class="flex-col ww100 hh100 ba13 p15">
          <div class="flex1 flex-sc">
            <div class="w32 h32">
              <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="100%" height="100%" viewBox="0 0 32 32"><defs><clipPath id="master_svg0_5_88925"><rect x="0" y="0" width="32" height="32" rx="0"/></clipPath><linearGradient x1="1" y1="1.050394892692566" x2="-0.1456914299434196" y2="-0.298793109059701" id="master_svg1_5_75424"><stop offset="26.73705816268921%" stop-color="#3076F9" stop-opacity="1"/><stop offset="100%" stop-color="#EEF4FF" stop-opacity="1"/></linearGradient></defs><g clip-path="url(#master_svg0_5_88925)"><g><path d="M28.5,7.21890408203125L3.5,7.21890408203125C2.675,7.21890408203125,2,7.85649408203125,2,8.63581408203125L2,26.58328408203125C2,27.36258408203125,2.675,28.00018408203125,3.5,28.00018408203125L28.5,28.00018408203125C29.325,28.00018408203125,30,27.36258408203125,30,26.58328408203125L30,8.63581408203125C30,7.85649408203125,29.325,7.21890408203125,28.5,7.21890408203125ZM11.98438,5.73712408203125L11.98438,3.71368408203125C11.98438,3.30118408203125,11.64688,2.96368408203125,11.23438,2.96368408203125L6.75,2.96368408203125C6.3375,2.96368408203125,6,3.30118408203125,6,3.71368408203125L6,5.73712408203125L11.98438,5.73712408203125ZM25.9552,5.77359408203125L25.9552,3.75015308203125C25.9552,3.3376530820312498,25.6177,3.00015308203125,25.2052,3.00015308203125L20.7208,3.00015308203125C20.3083,3.00015308203125,19.9708,3.3376530820312498,19.9708,3.75015308203125L19.9708,5.77359408203125L25.9552,5.77359408203125Z" fill="url(#master_svg1_5_75424)" fill-opacity="1"/></g><g><path d="M16.848989843749997,21.891570800781253C16.78668984375,21.99985080078125,16.77018984375,22.13091080078125,16.80348984375,22.252690800781252C16.83688984375,22.37447080078125,16.916989843750002,22.47582080078125,17.02438984375,22.53182080078125L17.96658984375,23.02377080078125C18.167189843750002,23.12847080078125,18.41008984375,23.05087080078125,18.52268984375,22.84607080078125C18.899089843749998,22.161410800781248,19.45188984375,21.76876080078125,20.03908984375,21.76876080078125C20.64968984375,21.76876080078125,20.97288984375,21.97913080078125,21.46568984375,22.450630800781248C22.34988984375,23.30867080078125,23.17528984375,23.67477080078125,24.22538984375,23.67477080078125C25.52838984375,23.67477080078125,26.66518984375,22.94647080078125,27.42628984375,21.624130800781252C27.48858984375,21.51588080078125,27.50508984375,21.38479080078125,27.47168984375,21.263010800781252C27.43828984375,21.14123080078125,27.35818984375,21.039880800781248,27.25078984375,20.98388080078125L26.30868984375,20.49197080078125C26.10798984375,20.387190800781248,25.86518984375,20.464790800781252,25.75258984375,20.66963080078125C25.37608984375,21.35429080078125,24.82338984375,21.74694080078125,24.23608984375,21.74694080078125C23.62538984375,21.74694080078125,23.30228984375,21.53654080078125,22.80938984375,21.06491080078125C21.92528984375,20.20697080078125,21.09988984375,19.84088080078125,20.04978984375,19.84088080078125C18.74678984375,19.84088080078125,17.61008984375,20.56919080078125,16.848989843749997,21.891570800781253ZM4.51708984375,14.756010800781251L14.39880984375,14.756010800781251L14.39880984375,12.57257080078125L4.51708984375,12.57257080078125L4.51708984375,14.756010800781251Z" fill="#FFC860" fill-opacity="1"/></g></g></svg>
            </div>
            <span class="f15 ml10 fw white">{{v.name}}</span>
          </div>
          <div class="flex1 flex-sc mt12" v-if="!isNull(publicStore._public.templates) && publicStore._public.templates.length > 1">
            <div>类型</div>
            <div class="flex1 ml12" :class="v.type?'white':''">{{find(publicStore._public.templates, ['type', v.type], 'name')}}</div>
          </div>
          <div class="flex1 flex-sc mt12">
            <div>位置</div>
            <div class="flex1 ml12" :class="v.instlPos?'white':''">{{v.instlPos?v.instlPos : '暂无'}}</div>
          </div>
          <div class="flex1 flex-sc mt12">
            <div class="flex1 flex-sc">
              <div>通信</div>
              <div class="flex1 ml12" :class="find(state.offlines, ['value', v.offline], 'color')?find(state.offlines, ['value', v.offline], 'color'):''">
                {{isNull(v.offline)? '暂无' : find(state.offlines, ['value', v.offline], 'name')}}
              </div>
            </div>
            <div class="flex1 flex-sc">
              <div>诊断</div>
              <div class="flex1 ml12" :class="find(state.alarms, ['value', v.alarm], 'color')?find(state.alarms, ['value', v.alarm], 'color'):''">
                {{isNull(v.alarm)? '暂无' : find(state.alarms, ['value', v.alarm], 'name')}}
              </div>
            </div>
          </div>
          <div class="flex1 flex-sc warp" v-if="!isNull(v.cfgs)">
            <div class="ww50 flex-sc mt12" :key="ii" v-for="(vv, ii) in v.cfgs" v-show="vv.show && (vv.show == '1' || vv.show == '3')">
              <div>{{vv.name}}</div>
              <div class="flex1 ml12" :class="v[vv.code]?'i31':find(vv.attr, ['value', v[vv.code]], 'color')" v-if="!isNull(vv.attr)">{{find(vv.attr, ['value', v[vv.code]], 'name')}}</div>
              <div class="flex1 ml12" :class="v[vv.code]?'i31':''" v-else>{{v[vv.code]?((Math.round(v[vv.code]*100)/100) + ' ' + (vv.dw?vv.dw:'')) : '/'}}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const state = reactive({
	  ...publicStore.$state,
    type: "All",
    offline: "All",
    alarm: "All",
    offlines: [
      {name:"在线", value:"0", color: 'i11'},
      {name:"离线", value:"1", color: 'i6'},
      {name:"故障", value:"10", color: 'i8'}
    ],
    alarms: [
      {name:"正常", value:"0", color: 'i11'},
      {name:"异常", value:"1", color: 'i8'}
    ],
  })

</script>

<style scoped lang="scss">

</style>
