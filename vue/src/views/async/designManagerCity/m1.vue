<template>
  <div class="layout-col">
    <!-- 标题 -->
    <aa-title title="">
      <template #left-content>
        <div class="flex-sc mr30">
          <span class="mr10">上报地区</span>
          <span class="w50x3">
            <el-select v-model="state.province" placeholder="请选择" style="width:100%" filterable>
              <el-option v-for="(v, i) in state.provinces" :key="v.value" :value="String(v.value)" :label="v.name" />
            </el-select>
          </span>
        </div>
        <div class="flex-sc mr30">
          <span class="mr10">编制单位</span>
          <span class="w50x3">
            <el-select v-model="state.city" placeholder="请选择" style="width:100%" filterable :clearable="configStore.user.parent_id == '0'">
              <el-option v-for="(v, i) in state.citys" :key="v.value" :value="String(v.value)" :label="v.name" />
            </el-select>
          </span>
        </div>
        <div class="flex-sc mr30">
          <span class="mr10">上报时间</span>
          <span class="w50x8">
            <el-date-picker style="width:100%" v-model="state.datetime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
            type="datetimerange" range-separator="-" start-placeholder="开始时间" end-placeholder="结束时间" clearable />
          </span>
        </div>
        <div class="flex-sc mr15">
          <span class="mr10">审核状态</span>
          <span class="w50x3">
            <el-select v-model="state.examine_status" placeholder="请选择" style="width:100%" filterable clearable>
              <el-option v-for="(v, i) in examine_statuss" :key="v.value" :value="String(v.value)" :label="v.name" />
            </el-select>
          </span>
        </div>
        <div class="rad4 ptb6 plr12 flex-cc cursor bgi1 white" @click.stop="init()">
          <i-ep-filter class="f12 fw" /><span class="f14 ml5">搜索</span>
        </div>
      </template>
      <template #right-content></template>
    </aa-title>
    <!-- 内容 -->
    <div class="layout-col bg-white rad8 p8">
      <!-- 头部 -->
      <div class="ww100 flex-sc p8">
        <div class="flex-sc fw f16 tc">
          <div class="mr20 cursor flex-col-cc" v-for="(v, i) in types" :key="i" @click.stop="toPath(v.path)">
            <span class="mb5">{{ v.name }}</span>
            <span class="ww100 h3 rad10" :class="v.type == state.type?'bgi2':'black-rgba0'"></span>
          </div>
        </div>
        <div class="flex-ec flex1">
          <div class="rad4 ptb5 plr12 flex-cc cursor bg-white c8 bo-cc-1 ml15" @click.stop="handleClick('selectAll')">全选</div>
          <div class="rad4 ptb5 plr12 flex-cc cursor bgi1 white bo-i1-1 ml15" @click.stop="handleClick('remind')">提醒</div>
        </div>
      </div>
      <!-- 主体 -->
      <div class="table flex-sc warp">
        <div class="ww25 cursor p8" v-for="(v, i) in state.list" :key="i">
          <div class="ww100 bs bo-i16-1 relative rad8">
            <div class="ww100 flex-sc p12 bob-ce-1">
              <span class="f15">{{ v.name }}</span>
              <span class="flex1 flex-ec">
                <span class="w18 h18 tc lh18 rad3 ml10 white f12" :class="v.click?'bgi1 bo-i1-1':'bo-cc-1'" @click.stop="v.click = !v.click"><i-ep-check v-if="v.click"  /></span>
              </span>
            </div>
            <div class="ww100 flex-col p12 c6" @click.stop="toPath('/schemeDesignView', {id: v.id})">
              <div class="ww100 flex-sc">
                <span class="w110">上报时间</span>
                <span>{{ v.release_time?parseTime(v.release_time):'-' }}</span>
              </div>
              <!-- <div class="ww100 flex-sc mt10">
                <span class="w110">规划周期</span>
                <span class="flex1 line1">{{ v.datetime?v.datetime:'-' }}</span>
              </div> -->
              <div class="ww100 flex-sc mt10">
                <span class="w110">包含项目数</span>
                <span class="flex1 line1">{{ v.project?v.project.length:'-' }}</span>
              </div>
              <div class="ww100 flex-sc mt10">
                <span class="w110">所属专项规划</span>
                <span class="flex1 line1">{{ !isNull(state.schemePlans)&&v.parent_id?find(state.schemePlans, ['id', v.parent_id], 'name'):'-' }}</span>
              </div>
              <div class="ww100 flex-sc mt10">
                <span class="w110">所属专项片区</span>
                <span class="flex1 line1">{{ !isNull(state.schemeAreas)&&v.parent_area?find(state.schemeAreas, ['value', v.parent_area], 'name'):'-' }}</span>
              </div>
              <div class="ww100 flex-sc mt10">
                <span class="w110">上报单位</span>
                <span class="flex1 line1">{{ v.user_name?decrypt(v.user_name):'-' }}</span>
              </div>
              <!-- <div class="ww100 flex-sc mt10">
                 <div class="flex1">
                  <div class="ww100 flex-col-cc rad4 rad4" :class="v.release_status == '0'?'bo-c9-1':v.release_status == '1'?'bo-i11-1':''">
                    <span class="ww100 hh100 flex-cc ptb5" :class="v.release_status == '0'?'bge c9':v.release_status == '1'?'bgi10 i12':''">{{ find(release_statuss, ['value', v.release_status], 'name') }}</span>
                    <span class="ptb5">发布状态</span>
                  </div>
                </div>
                <div class="flex1 mlr12">
                  <div class="ww100 flex-col-cc rad4 rad4" :class="v.completion_status == '0'?'bo-c9-1':v.completion_status == '2'?'bo-i14-1':v.completion_status == '2'?'bo-i11-1':''">
                    <span class="ww100 hh100 flex-cc ptb5" :class="v.completion_status == '0'?'bge c9':v.completion_status == '2'?'bgi13 i15':v.completion_status == '2'?'bgi10 i12':''">{{ find(completion_statuss, ['value', v.completion_status], 'name') }}</span>
                    <span class="ptb5">完成状态</span>
                  </div>
                </div>
                <div class="flex1">
                  <div class="ww100 flex-col-cc rad4 rad4" :class="v.examine_status == '0'?'bo-c9-1':v.examine_status == '1'?'bo-i14-1':v.examine_status == '2'?'bo-i11-1':v.examine_status == '2'?'bo-i8-1':''">
                    <span class="ww100 hh100 flex-cc ptb5" :class="v.examine_status == '0'?'bge c9':v.examine_status == '1'?'bgi13 i15':v.examine_status == '2'?'bgi10 i12':v.examine_status == '2'?'bgi7 i9':''">{{ find(examine_statuss, ['value', v.examine_status], 'name') }}</span>
                    <span class="ptb5">审核状态</span>
                  </div>
                </div>
              </div> -->
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
  const configStore = proxy.configStore()
  const dictStore = proxy.dictStore()
  const release_statuss = [
    {value: '0', name: '待上报'},
    {value: '1', name: '已上报'},
  ]
  const completion_statuss = [
    {value: '0', name: '未开始'},
    {value: '1', name: '进行中'},
    {value: '2', name: '已完成'},
  ]
  const examine_statuss = [
    {value: '0', name: '待审核'},
    {value: '1', name: '审核中'},
    {value: '2', name: '已通过'},
    {value: '3', name: '不通过'},
  ]
  const types = [
    {type: 'special', name: '专项规划', path: '/schemePlansManagerCity'},
    {type: 'region', name: '片区策划', path: '/schemeDesignsManagerCity'},
  ]
  const state = reactive({
	  ...publicStore.$state,
    click: false,
    clickArr: [],
    status: '1',
    type: 'region',
    provinces: [],
    province: '',
    citys: [],
    city: '',
    schemeAreas: [
     {value: '1', name: '龙城片区'}
    ],
  })

  onMounted(async() => {
    await getInit()
    getPlan()
    init()
  })

  const getPlan = async() => {
    let query = {model: 't_scheme_plan', args: `user_id='${configStore.user.id}'`, field: `id, name`}
    publicStore.http({Api: query}).then(res=>{
      state.schemePlans = proxy.isNull(res)? [] : res
    })
  }

  const getInit = async() => {
    // 获取地区
    state.provinces = [{name: configStore.user.province_name, value: configStore.user.province}]
    state.province = state.provinces[0]['value']
    // 获取单位
    let query = configStore.user.parent_id == '0'? {model: 't_station', args: `parent_id='${configStore.user.station_num}'`} : {model: 't_station', args: `id='${configStore.user.station_num}'`}
    let res = await publicStore.http({Api: query})
    let list = proxy.isNull(res)? [] : res.sort((a, b) => a.order - b.order)
    state.citys = list.map(v => {
      return {name: v.station_name, value: v.city}
    })
    if(!proxy.isNull(state.citys) && configStore.user.parent_id != '0') state.city = state.citys[0]['value']
  }

  const init = async(key) => {
    let query = {model: `t_scheme_design`}
    if(state.province) {
      query.args = `province='${state.province}'`
      if(state.city) query.args += ` and city='${state.city}'`
      if(!proxy.isNull(state.datetime)) {
        let start = Date.parse(state.datetime[0]) + ''
        let end = Date.parse(state.datetime[1]) + ''
        query.args += ` and release_time>='${start}' and release_time<='${end}'`
      }
      if(state.examine_status) query.args += ` and examine_status='${state.examine_status}'`
    }
    let res = await publicStore.http({Api: query})
    let list = proxy.isNull(res)? [] : res
    state.list = list.map(v => {
      try {
        if(v.datetime){
          v.datetime = JSON.parse(v.datetime)
          v.datetime = `${v.datetime[0]}-${v.datetime[1]}`
        }else{
          v.datetime = ''
        }
        v.attr = v.attr? JSON.parse(v.attr) : {}
        v.project = v.project? JSON.parse(v.project) : []
      } catch (error) {
        console.error("解析失败:", error.message)
      }
      return v
    })
    // console.log("state.list", state.list)
    // 专属规划上报情况
    getData1()
    // 专属规划上报情况
    getData2()
  }

  const getData1 = () => {
    let release = state.list.filter(a=>a.release_status == '1')
    let data1 = {sum: state.list.length, release: release.length }
    publicStore._public.percent = data1.sum? Math.floor((data1.release/data1.sum)*100)/100 : 0
    publicStore._public.data1 = data1
  }

   const getData2 = async() => {
    // state.responses = [
    //   {name: '片区数量',   data: [['太原六城区','10'],['太原','2'],['六城区','3']]}, 
    //   {name: '实施中项目', data: [['太原六城区','20'],['太原','2'],['六城区','3']]},
    //   {name: '项目数量',   data: [['太原六城区','30'],['太原','2'],['六城区','3']]},
    // ]
    // const ids = state.list.map(item => `'${item.id}'`).join(', ')
    // let query = {
    //   model: `t_scheme_design`, 
    //   field: `parent_id, COUNT(*) AS design_num`, 
    //   args: `parent_id  IN (${ids})`, 
    //   group: `parent_id`
    // }
    // let res = await publicStore.http({Api: query})
    let res = []
    let designs = proxy.isNull(res)? [] : res
    let responses = [
      {name: '片区数量',   data: []}, 
      {name: '实施中项目', data: []},
      {name: '项目数量',   data: []},
    ]
    state.list.forEach(v => {
      let design_num = '0'
      let design = designs.find(a=>a.parent_id == v.id)
      if(design) design_num = design.design_num
      responses.forEach(vv => {
        // 片区数量
        if(vv.name=='片区数量'){
          vv.data = [...vv.data, [proxy.decrypt(v.user_name), design_num]]
        }
        // 实施中项目
        if(vv.name=='实施中项目'){
          vv.data = [...vv.data, [proxy.decrypt(v.user_name), '10']]
        }
        // 项目数量
        if(vv.name=='项目数量'){
          vv.data = [...vv.data, [proxy.decrypt(v.user_name), v.project?v.project.length:'0']]
        }
      })
    })
    publicStore._public.responses = responses
  }

  const handleClick = (remark, val) => {
    if(remark == 'remind') {
      ElMessageBox.confirm('是否确定提醒?', '温馨提示', {confirmButtonText: '确定', cancelButtonText: '关闭', type: 'warn'}).then(() => { 
        let clickIndex = state.list.findIndex(a=>{ return a['click'] })
        if(clickIndex == -1) return ElNotification({ title: '提示', message: '请选择至少一个', type: 'error' })
        ElNotification({ title: '提示', message: '提醒成功', type: 'success' })
      })
    }
    if(remark == 'selectAll'){
      let clickIndex = state.list.findIndex(a=>{ return a['click'] })
      if(clickIndex == -1){
        state.click = true
        state.list.forEach(item => {
          item.click = true
          state.clickArr.push(item)
        })
      }else{
        state.click = false
        state.clickArr = []
        state.list.forEach(item => {delete item['click']})
      }
    }
  }
</script>
  
<style scoped lang="scss">
.w110 { width: 110px; }
</style>
  