<template>
  <div class="layout-col">
    <!-- 标题 -->
    <aa-title title="">
      <template #left-content>
        <div class="flex-sc mr30">
          <span class="mr10">行政区域</span>
          <span class="w50x3">
            <el-select v-model="state.province" placeholder="请选择" style="width:100%" filterable>
              <el-option v-for="(v, i) in state.provinces" :key="v.value" :value="String(v.value)" :label="v.name" />
            </el-select>
          </span>
        </div>
        <div class="flex-sc mr30">
          <span class="mr10">体检地市</span>
          <span class="w50x3">
            <el-select v-model="state.city" placeholder="请选择" style="width:100%" filterable :clearable="configStore.user.parent_id == '0'">
              <el-option v-for="(v, i) in state.citys" :key="v.value" :value="String(v.value)" :label="v.name" />
            </el-select>
          </span>
        </div>
        <div class="flex-sc mr30">
          <span class="mr10">体检年份</span>
          <span class="w50x3">
            <el-date-picker v-model="state.datetime" type="year" placeholder="请选择" style="width:100%" />
          </span>
        </div>
        <div class="flex-sc mr15">
          <span class="mr10">体检状态</span>
          <span class="w50x3">
            <el-select v-model="state.check_status" placeholder="请选择" style="width:100%" filterable clearable>
              <el-option v-for="(v, i) in check_statuss" :key="v.value" :value="String(v.value)" :label="v.name" />
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
          <!-- <div class="rad4 ptb5 plr12 flex-cc cursor bg-white c8 bo-cc-1 ml15" @click.stop="handleClick('selectAll')">全选</div>
          <div class="rad4 ptb5 plr12 flex-cc cursor bgi1 white bo-i1-1 ml15" @click.stop="handleClick('remind')">提醒</div> -->
        </div>
      </div>
      <!-- 主体 -->
      <div class="table flex-sc warp">
        <div class="ww25 cursor p8" v-for="(v, i) in state.list" :key="i">
          <div class="ww100 bs bo-i16-1 relative rad8">
            <div class="ww100 flex-sc p12 bob-ce-1">
              <span class="f15">{{ v.name }}</span>
              <span class="flex1 flex-ec">
                <span class="hh100 flex-cc ptb5 plr12 rad5 hidden" :class="v.check_status == '0'?'bge c9 bo-c9-1':v.check_status == '1'?'bgi10 i12 bo-i11-1':''">{{ find(check_statuss, ['value', v.check_status], 'name') }}</span>
              </span>
            </div>
            <div class="ww100 flex-col p12 c6" @click.stop="toPath('/problemBank', {id: v.id})">
              <div class="ww100 flex-sc">
                <span class="w50x3">最后体检时间</span>
                <span>{{ v.check_time?parseTime(v.check_time):'2026-01-30 12:30:30' }}</span>
              </div>
              <div class="ww100 flex-sc mt10">
                <span class="w50x3">最新体检达标率</span>
                <span>{{ v.check_rate?v.check_rate:'80' }} %</span>
              </div>
              <div class="ww100 flex-sc mt10">
                <span class="w50x3">最近问题数量</span>
                <span>{{ v.check_problem_num?v.check_problem_num:'10' }}</span>
              </div>
               <div class="ww100 flex-sc mt10">
                <span class="w50x3">体检类型</span>
                <span>{{ v.check_type?find(check_types, ['value', v.check_type], 'name'):'城市自体检' }}</span>
              </div>
              <div class="ww100 flex-sc mt10">
                <span class="w50x3">体检单位</span>
                <span>{{ v.user_name?decrypt(v.user_name):'-' }}</span>
              </div>
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
  const check_statuss = [
    {value: '0', name: '待体检'},
    {value: '1', name: '已体检'},
  ]
  const check_types = [
    {value: '0', name: '城市自体检'},
    {value: '1', name: '城市自体检'},
  ]
  const types = [
    {type: 'problem', name: '问题清单跟踪', path: '/problemTrack'},
  ]
  const state = reactive({
	  ...publicStore.$state,
    click: false,
    clickArr: [],
    status: '1',
    type: 'problem',
    provinces: [],
    province: '',
    citys: [],
    city: '',
  })

  onMounted(async() => {
    await getInit()
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

  const init = async(key) => {
    let query = {model: `t_scheme_plan`}
    if(state.province) {
      query.args = `province='${state.province}'`
      if(state.city) query.args += ` and city='${state.city}'`
      if(!proxy.isNull(state.datetime)) {
        const year = new Date(state.datetime).getFullYear()
        const start = (new Date(year, 0, 1).getTime()) + ''
        const end = (new Date(year + 1, 0, 1).getTime() - 1) + ''
        query.args += ` and check_time>='${start}' and check_time<='${end}'`
      }
      if(state.check_status) query.args += ` and check_status='${state.check_status}'`
    }
    let res = await publicStore.http({Api: query})
    let list = proxy.isNull(res)? [] : res
    state.list = list.slice(0, 1).map((v, i) => {
      if(i==0) v.name = '太原市城市体检问题'
      try {
        if(v.datetime){
          v.datetime = JSON.parse(v.datetime)
          v.datetime = `${v.datetime[0]}-${v.datetime[1]}`
        }else{
          v.datetime = ''
        }
        v.attr = v.attr? JSON.parse(v.attr) : {}
        v.project = v.project? JSON.parse(v.project) : []
        v.task = v.task? JSON.parse(v.task) : []
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
    const ids = state.list.map(item => `'${item.id}'`).join(', ')
    let query = {
      model: `t_scheme_design`, 
      field: `parent_id, COUNT(*) AS design_num`, 
      args: `parent_id  IN (${ids})`, 
      group: `parent_id`
    }
    let res = await publicStore.http({Api: query})
    let designs = proxy.isNull(res) ? [] : res
    
    // 1. 使用 reduce 按 user_id 进行分组和数值累加
    const userMap = state.list.reduce((acc, item) => {
      // 查找当前项对应的 design
      const design = designs.find(d => d.parent_id == item.id)
      // 确保 design_num 是数字，如果没有则默认为 0
      const dNum = design ? (Number(design.design_num) || 0) : 0
      // 计算项目数量
      const pCount = item.project ? item.project.length : 0
      // 解密用户名
      const uName = proxy.decrypt(item.user_name)
    
      // 如果该用户ID第一次出现，初始化对象
      if (!acc[item.user_id]) {
        acc[item.user_id] = {
          name: uName,
          sumDesign: 0,
          sumProject: 0
        }
      }
    
      // 累加数值
      acc[item.user_id].sumDesign += dNum
      acc[item.user_id].sumProject += pCount
    
      return acc
    }, {})
  
    // 2. 将聚合后的对象转换为数组，并映射为最终格式
    const aggregatedList = Object.values(userMap)
    
    const responses = [
      {
        name: '第三方体检', 
        data: aggregatedList.map(u => [u.name, String(u.sumDesign)])
      }, 
      {
        name: '城市体检', 
        data: aggregatedList.map(u => [u.name, String(u.sumProject)])
      }
    ]
    console.log("responses---", responses)
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
  