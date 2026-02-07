<template>
  <div class="layout-col">
    <!-- 标题 -->
    <aa-title title="">
      <template #left-content>
        <div class="flex-sc flex4 hidden warp">
          <div class="flex-sc ww25 pr30">
            <span class="mr10">项目周期</span>
            <span class="flex1 flex-sc hidden">
              <el-date-picker style="width: 100%;" v-model="state.construct_datetime" start-placeholder="开始周期" end-placeholder="结束周期" type="yearrange" value-format="YYYY" format="YYYY" />
            </span>
          </div>        
          <div class="flex-sc ww25 pr30">
            <span class="mr10">所属行政</span>
            <span class="flex1 flex-sc hidden">
              <el-select v-model="state.province" placeholder="请选择" style="width:100%" filterable>
                <el-option v-for="(v, i) in state.provinces" :key="v.value" :value="String(v.value)" :label="v.name" />
              </el-select>
            </span>
          </div>
          <div class="flex-sc ww25 pr30">
            <span class="mr10">所属地市</span>
            <span class="flex1 flex-sc hidden">
              <el-select v-model="state.city" placeholder="请选择" style="width:100%" filterable :clearable="configStore.user.parent_id == '0'">
                <el-option v-for="(v, i) in state.citys" :key="v.value" :value="String(v.value)" :label="v.name" />
              </el-select>
            </span>
          </div>
          <div class="flex-sc ww25 pr30">
            <span class="mr10">项目阶段</span>
            <span class="flex1 flex-sc hidden">
              <el-select v-model="state.stage" placeholder="请选择" style="width:100%" filterable clearable>
                <el-option v-for="(v, i) in dictStore.project_stages" :key="v.value" :value="String(v.value)" :label="v.name" />
              </el-select>
            </span>
          </div>
          <div class="flex-sc ww25 pr30 mt10">
            <span class="mr10">项目类型</span>
            <span class="flex1 flex-sc hidden">
              <el-select v-model="state.task_type" placeholder="请选择" style="width:100%" filterable clearable>
                <el-option v-for="(v, i) in state.task_typess?state.task_typess:[]" :key="v.id" :value="String(v.id)" :label="v.name" />
              </el-select>
            </span>
          </div>
          <div class="flex-sc ww25 pr30 mt10">
            <span class="mr10">投资金额</span>
            <span class="flex1 flex-sc hidden">
              <el-select v-model="state.construct_price" placeholder="请选择" style="width:100%" filterable clearable>
                <el-option v-for="(v, i) in construct_prices?construct_prices:[]" :key="v.value" :value="String(v.value)" :label="v.name" />
              </el-select>
            </span>
          </div>
          <div class="flex-sc ww25 pr30 mt10">
            <span class="mr10">项目名称</span>
            <span class="flex1 flex-sc hidden">
              <el-input v-model="state.search" style="width: 100%;" placeholder="请输入" />
            </span>
          </div>
          <div class="rad4 ptb6 plr12 flex-cc cursor bgi1 white mt10" @click.stop="init()">
            <i-ep-filter class="f12 fw" /><span class="f14 ml5">搜索</span>
          </div>
        </div>
      </template>
      <template #right-content>
        <!-- <div class="flex-ec flex1 hidden">
          <div class="rad4 ptb10 w100 tc flex-cc cursor ml15 bg-white c8 bo-cc-1" @click.stop="toPath('/actionApply')">项目台账</div>
          <div class="rad4 ptb10 w100 tc flex-cc cursor ml15 bg-white c8 bo-cc-1" @click.stop="toPath('/actionApply')">项目实施跟踪</div>
        </div> -->
      </template>
    </aa-title>
    <!-- 内容 -->
    <div class="layout-col bg-white rad8 p8">
      <!-- 头部 -->
      <div class="ww100 flex-sc p8">
        <div class="flex-sc fw f16 tc">
          <div class="mr40 cursor flex-col-cc relative" v-for="(v, i) in state.types" :key="i" @click.stop="toPath(v.path)">
            <span v-if="v.total" class="w20 h20 rad2 lh20 tc bgi13 i15 b20 l50 absolute">{{ v.total }}</span>
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
                <span v-if="v.completion_status" class="rad3 ptb3 plr6" :class="v.completion_status=='1'?'bgi10 bo-i11-1 i12':'bgi13 bo-i14-1 i15'">
                {{ find(dictStore.completion_statuss, ['value', v.completion_status], 'name') }}
                </span>
                <span class="w18 h18 tc lh18 rad3 ml10 white f12" :class="v.click?'bgi1 bo-i1-1':'bo-cc-1'" @click.stop="v.click = !v.click"><i-ep-check v-if="v.click"  /></span>
              </span>
            </div>
            <div class="ww100 flex-col p12 c6">
              <div class="ww100 flex-sc">
                <span class="w110">所属地区</span>
                <span>{{ v.province_name?v.province_name:'' }}{{ v.city_name?`-${v.city_name}`:'' }}{{ v.district_name?`-${v.district_name}`:'' }}</span>
              </div>
              <div class="ww100 flex-sc mt10">
                <span class="w110">征资条件</span>
                <span class="flex-sc i12">
                  <svg xmlns="http://www.w3.org/2000/svg" class="success-icon svg-icon-path-icon fill" viewBox="0 0 32 32" width="13" height="13"><defs></defs><g><path d="M29.333 26.667h-26.667v-2.667h1.333v-9.292c0-6.651 5.373-12.041 12-12.041s12 5.391 12 12.041v9.292h1.333v2.667zM12.667 28h6.667c0 1.841-1.492 3.333-3.333 3.333s-3.333-1.492-3.333-3.333v0z"></path></g></svg>
                  <span class="ml5">符合</span> 
                </span>
              </div>
              <div class="ww100 flex-sc mt10">
                <span class="w110">项目周期</span>
                <span>{{ v.construct_datetime_start&&v.construct_datetime_end?`${v.construct_datetime_start}-${v.construct_datetime_end}`:'-' }}</span>
              </div>
               <div class="ww100 flex-sc mt10">
                <span class="w110">项目规模</span>
                <span>{{ v.construct_scale?`${v.construct_scale}`:'-' }}</span>
              </div>
              <div class="ww100 flex-sc mt10">
                <span class="w110">预估投入</span>
                <span>{{ v.construct_price?`${v.construct_price} 万元`:'-' }}</span>
              </div>
              <div class="ww100 flex-sc mt10">
                <span class="w110">项目性质</span>
                <span>{{ v.construct_nature?decrypt(v.construct_nature):'-' }}</span>
              </div>
              <div class="ww100 flex-sc mt10">
                <div class="flex-sc flex1">
                  <span class="w110">更新进度时间</span>
                  <span>{{ v.update_time?parseTime(v.update_time):'-' }}</span>
                </div>
                <div class="rad5 ptb5 plr12 cursor bgi1 white" @click.stop="toPath('/actionApply', {id: v.id})">进度更新</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 分页 -->
      <Pagination class="" style="padding-bottom: 0;" v-show="state.total>0" :total="state.total" v-model:page.sync="state.page" v-model:limit.sync="state.limit" @pagination="init" />
    </div>
    <!-- 弹窗 -->
    <!-- <el-dialog v-model="state.isFalse" title="温馨提示" :draggable="true" width="30%">
      <div class="ww100 flex-col-cc">
        <div class="f20 tc ptb30">是否将该项目申请纳入储备</div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button size="large" class="bgc white" @click="state.isFalse = !state.isFalse">取 消</el-button>
          <el-button size="large" class="bgi1 white" @click.stop="toPath('/actionApply', {id: state.active.id})">确 定</el-button>
        </div>
      </template>
    </el-dialog> -->
  </div>
</template>

<script lang="ts" setup>
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const dictStore = proxy.dictStore()
  const route = useRoute()
  const state = reactive({
	  ...publicStore.$state,
    click: false,
    clickArr: [],
    provinces: [],
    province: '',
    citys: [],
    city: '',
    types: [
      {type: 'actionReserve', name: '待审核', path: '/actionReserve'},
      {type: 'actionReserve1', name: '已储备', path: '/actionReserve1'},
    ],
    type: 'actionReserve1',
    stage: '',
    task_type: '',
    search: '',
  })

  const construct_prices = [
    {value1: '0',    value: '5000', name: '5000万以下'},
    {value1: '5000',  value: '10000', name: '5000万-1亿'},
    {value1: '10000',  value: '100000', name: '1亿-10亿'},
    {value1: '100000',  value: '300000', name: '10亿-30亿'},
    {value1: '300000',   value: '10000000', name: '30亿以上'},
  ]

  const condition = [
    {value: '0', name: '不符合'},
    {value: '1', name: '符合'},
    {value: '2', name: '已征资'},
  ]

  onMounted(async() => {
    await getInit()
    getTaskType()
    init()
  })

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

  // 已申请储备
  const init = async(key) => {
    let model = 't_project_report'
    let field = ``
    let args = `apply_status = '1' and reserve_status ='1'`
    let args1 = `apply_status = '1' and reserve_status ='0'`
    let query = {model: model, args: args}
    let queryapi1 = {model: model, field: `COUNT(*)`, args: args1}
    getApply1(queryapi1)
    if(state.province) {
      query.args += ` and province='${state.province}'`
      if(state.city) query.args += ` and city='${state.city}'`
      if(!proxy.isNull(state.construct_datetime)) {
        const [start, end] = state.construct_datetime
        query.args += ` and construct_datetime_start>='${start}' and construct_datetime_end<='${end}'`
      }
      if(state.construct_price) {
        let price = construct_prices.find(a=>a.value == state.construct_price)
        query.args += ` and construct_price>='${price.value1}' and construct_price<='${price.value}'`
      }
      if(state.stage) query.args += ` and stage='${state.stage}'`
      if(state.task_type) query.args += ` and task_type='${state.task_type}'`
      if(state.search) query.args += ` and name LIKE '%${state.search}%'`
    }
    let q1 = {limit: state.limit, page: state.page}
    let q2 = {field: `COUNT(*)`}
    let query1 = {}
    let query2 = {}
    Object.assign(query1, query, q1)
    Object.assign(query2, query, q2)
    let res = await publicStore.http({Api1: query1, Api2: query2})
    state.total = proxy.isNull(res.Api2)? 0 : res.Api2[0]['COUNT(*)']
    let type = state.types.find(a=>a.type==state.type)
    type.total = state.total
    state.empty = proxy.isNull(res.Api1)? true : false
    state.list = proxy.isNull(res.Api1)? [] : res.Api1
    state.list.forEach(v => {
      v.area = (v.province_name||'') + (v.city_name?`-${v.city_name}`:'') + (v.district_name?`-${v.district_name}`:'')
    })
    getData1()
    getData2()
  }

  const getApply1 = (query) => {
    publicStore.http({Api: query}).then(res=>{
      state.types[0]['total'] = proxy.isNull(res)? 0 : res[0]['COUNT(*)']
    })
  }

   const getTaskType = () => {
    let query = {model: 't_task_type', args: `parent_id!='0'`}
    publicStore.http({Api: query}).then(res=>{
      state.task_typess = proxy.isNull(res)? [] : res
    })
  }

  const getData1 = () => {
    let completion_status1 =  state.list.filter(a=>a.completion_status == '1')
    let completion_status2 =  state.list.filter(a=>a.completion_status == '2')
	  let data1 = { 
      sum: state.list.length,
	    completion_status1: completion_status1.length,  
	    completion_status2: completion_status2.length 
	  }
	  publicStore._public.percent = data1.sum ? Math.floor((data1.completion_status2 / data1.sum) * 100) / 100 : 0
	  publicStore._public.data1 = data1
	}

	const getData2 = async() => {
      // 1. 使用 Map 存储统计结果，key 为城市名
    const cityMap = new Map();
    // 2. 遍历列表进行统计
    state.list.forEach(item => {
      const city = item.city_name;
      if (!city) return;
      // 如果城市第一次出现，初始化计数为 0
      if (!cityMap.has(city)) {
        cityMap.set(city, { area: 0, impl: 0 });
      }
      const status = item.completion_status;
      if (status === '1') {
        // 谋划中 (completion_status == 1)
        cityMap.get(city).area++;
      } else if (status === '2') {
        // 实施中 (completion_status == 2)
        cityMap.get(city).impl++;
      }
      // 其他状态不操作，自然保持为 0
    });
    // 3. 生成最终结果
    publicStore._public.responses = [
      { 
        name: '谋划中项目',   
        data: Array.from(cityMap).map(([name, val]) => [name, String(val.area)]) 
      },
      { 
        name: '实施中项目', 
        data: Array.from(cityMap).map(([name, val]) => [name, String(val.impl)]) 
      }
    ];
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
.success-icon { fill: #00b259; }
</style>
  