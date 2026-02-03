<template>
  <div class="layout-col pplr15">
    <div class="hh100 ww100 flex-sc warp hidden">
      <!-- 项目信息 -->
      <div class="ww100 flex-sc ptb10 ppr5">
        <div class="flex-sc w50x2 mr20"><span class="w50x2">项目信息</span></div>
        <div class="flex1 ">
          <div class="w50x3 tc rad3 ptb6 bgi1 white cursor" @click.stop="projectRef.onVisable(publicStore.form)">专项与片区项目库</div>
        </div>
      </div>
      <!-- 项目编号 -->
      <div class="ww50 flex-sc ptb10 ppr5">
        <div class="flex-sc w50x2 mr20"><span class="w50x2">项目编号</span></div>
        <div class="flex1 flex-sc">
          <el-input class="ww100" v-model="publicStore.form.num" placeholder="请输入" size="large" />
        </div>
      </div>
      <!-- 统一项目代码 -->
      <div class="ww50 flex-sc ptb10 ppr5">
        <div class="flex-sc w50x2 mr20"><span class="w50x2">统一项目代码</span></div>
        <div class="flex1 flex-sc">
          <el-input disabled class="ww100" v-model="publicStore.form.code" placeholder="请输入" size="large" />
        </div>
      </div>
      <!-- 项目名称 -->
      <div class="ww50 flex-sc ptb10 ppr5">
        <div class="flex-sc w50x2 mr20"><span class="mr3 i8 f20">*</span><span class="w50x2">项目名称</span></div>
        <div class="flex1 flex-sc">
          <el-input class="ww100" v-model="publicStore.form.name" placeholder="请输入" size="large" />
        </div>
      </div> 
      <!-- 所属区域 -->
      <div class="ww50 flex-sc ptb10 ppr5">
        <div class="flex-sc w50x2 mr20"><span class="mr3 i8 f20">*</span><span class="w50x2">所属区域</span></div>
        <div class="flex1 flex-sc">
          <el-input class="ww100" v-model="publicStore.form.area" placeholder="请输入" size="large" />
        </div>
      </div>
      <!-- 所属专项规划 -->
      <div class="ww50 flex-sc ptb10 ppr5">
        <div class="flex-sc w50x2 mr20"><span class="mr3 i8 f20">*</span><span class="w50x2">所属专项规划</span></div>
        <div class="flex1 flex-sc">
          <el-select v-model="publicStore.form.parent_id" placeholder="请选择" size="large" style="width:100%" filterable clearable>
            <el-option v-for="(v, i) in state.schemePlans?state.schemePlans:[]" :key="v.id" :value="String(v.id)" :label="v.name" />
          </el-select>        
          </div>
        </div>

      <!-- 规划名称、规划周期 -->
      <!-- <div class="ww50 flex-sc ptb10">
        <div class="flex-sc flex1 pr30">
          <div class="flex-sc mr20">
            <span class="mr3 i8 f20">*</span>
            <span>专项规划名称</span>
          </div>
          <div class="flex1">
            <el-input class="ww100" v-model="publicStore.form.name" placeholder="请输入" size="large" />
          </div>
        </div>
        <div class="flex-sc flex1 pr30">
          <div class="flex-sc mr20">
            <span class="mr3 i8 f20">*</span>
            <span>规划周期</span>
          </div>
          <div class="flex1">
            <el-date-picker style="width: 100%;" v-model="publicStore.form.datetime" start-placeholder="开始周期" end-placeholder="结束周期" size="large" type="yearrange" value-format="YYYY" format="YYYY" />
          </div>
        </div>
      </div> -->

      <!-- 片区名称、片区编号 -->
      <!-- <div class="ww50 flex-sc ptb10">
        <div class="flex-sc flex1 mr30">
          <div class="flex-sc mr20">
            <span class="mr3 i8 f20">*</span>
            <span class="w50x2">片区名称</span>
          </div>
          <div class="flex1">
            <el-input class="ww100" v-model="publicStore.form.name" placeholder="请输入" size="large" />
          </div>
        </div>
        <div class="flex-sc flex1 ml30">
          <div class="flex-sc mr20">
            <span class="mr3 i8 f20">*</span>
            <span class="w50x2">片区编号</span>
          </div>
          <div class="flex1">
            <el-input class="ww100" v-model="publicStore.form.num" placeholder="请输入" size="large" />
          </div>
        </div>
      </div> -->
      <!-- 所属专项规划、所属专项片区 -->
      <!-- <div class="ww100 flex-sc mt20" v-if="props.state.type == 'design'">
        <div class="flex-sc flex1 mr30">
          <div class="flex-sc mr20">
            <span class="mr3 i8 f20">*</span>
            <span class="w50x2">所属专项规划</span>
          </div>
          <div class="flex1">
            <el-select v-model="publicStore.form.parent_id" placeholder="请选择" size="large" style="width:100%" filterable clearable>
              <el-option v-for="(v, i) in state.schemePlans?state.schemePlans:[]" :key="v.id" :value="String(v.id)" :label="v.name" />
            </el-select>          
          </div>
        </div>
        <div class="flex-sc flex1 ml30">
          <div class="flex-sc mr20">
            <span class="mr3 i8 f20">*</span>
            <span class="w50x2">所属专项片区</span>
          </div>
          <div class="flex1">
            <el-select v-model="publicStore.form.parent_area" placeholder="请选择" size="large" style="width:100%" filterable clearable>
              <el-option v-for="(v, i) in state.schemeAreas?state.schemeAreas:[]" :key="v.value" :value="String(v.value)" :label="v.name" />
            </el-select> 
          </div>
        </div>
      </div> -->

    </div>
    <project :state="state" @init="init" ref="projectRef" />
  </div>
</template>

<script lang="ts" setup>
  import api from '@/api'
  import project from './project'
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  let projectRef = $ref()
  const state = reactive({
	  ...publicStore.$state,
    schemeAreas: [
     {value: '1', name: '龙城片区'}
    ],
  })
  const props = defineProps({
    state: {
      type: [Object, Array],
      default: ()=>{return {}}
    },
  })

  onMounted(async() => {
    getPlan()
    init()
  })

  const getPlan = async() => {
    if(props.state.type != 'design') return
    let query = {model: 't_scheme_plan', args: `scheme_id='${state.active.scheme_id}'`, field: `id, name`}
    publicStore.http({Api: query}).then(res=>{
      state.schemePlans = proxy.isNull(res)? [] : res
    })
  }

  const init = async() => {
    let query1 = {model: 't_file_type'}
    let query2 = {model: 't_file_content'}
    let res = await publicStore.http({Api1: query1, Api2: query2})
    let list1 = proxy.isNull(res.Api1)? [] : res.Api1.sort((a, b) => a.orderd - b.orderd)
    let list2 = proxy.isNull(res.Api2)? [] : res.Api2.sort((a, b) => a.orderd - b.orderd)
    let id = props.state.type=='plan'? "019be0b6-a467-7a5e-8ad9-6ba600813fa5" : "019be0b6-e9f9-7081-b4a3-d808e0bc96ca"
    let plan = list1.find(a=>a.id==id)
    if(plan){
      let contents = []
      state.plans = list1.filter(a=>a.parent_id == id)
      state.plans.forEach(v => { 
        v.parent_type = `${plan.type}/${v.type}`
        let content = list2.filter(a=>a.parent_id == v.id)
        if(!proxy.isNull(content)){
          content.forEach(vv => {
            vv.parent_type = `${v.parent_type }/${vv.type}`
            contents.push(vv)
          })
        }
      })
      state.contents = contents
      publicStore._public.contents = contents
      state.active = proxy.isNull(state.plans)? {} : {...state.plans[0]}
    }
  }

  // 下载
  const downLoadFile = async(v) => {
    let val = publicStore.form.attr[v.type]
    const filePath = val.data
    const url = `/api/v1/terminal/download/${encodeURIComponent(filePath)}`
    window.open(url, '_self') 
  }

  // 预览
  const viewFile = (v) => {
    let val = publicStore.form.attr[v.type]
    const filePath = val.data
    viewRef.onVisable(filePath)
  }

  // 删除
  const delFile = async(v) => {
    let val = publicStore.form.attr[v.type]
    const filePath = val.data
    publicStore.http({deleteFile: {filepath: filePath}}).then(res=>{
      if(res == 'success') {
        ElNotification({ title: '提示', message: '删除成功', type: 'success' })
        delete publicStore.form.attr[v.type]
        if(publicStore.form.id){
        // 查询原信息
        let query = {model: 't_scheme_plan', args: `id='${publicStore.form.id}'`}
          publicStore.http({Api: query}).then(ress=>{
            if(!proxy.isNull(ress)){
              let data = ress[0]
              if(data.attr){
                let attr = JSON.parse(data.attr)
                if(attr[v.type]){
                  delete attr[v.type]
                  // 更新数据库
                  let form = {id: publicStore.form.id, attr: JSON.stringify(attr)}
                  let params = {model: 't_scheme_plan', list: [form]}
                  api['updApi'](params).then((resss:any) => {
                    if(resss.code == 200){
                      ElNotification({ title: '提示', message: '清理成功', type: 'success' })
                      // init()
                    }else{
                      ElNotification({ title: '提示', message: resss.msg?resss.msg:'清理失败(400)', type: 'error' })
                    }
                  })
                }
              }
            }
          })
        }
      }else{
        ElNotification({ title: '提示', message: res.msg?res.msg:'删除失败(400)', type: 'error' })
      }
    })
  }

  const handleClick = (remark, val) => {}
</script>
  
<style scoped lang="scss">
.bob-tt-2 { border-bottom: 2px solid transparent; }
.r-18{ right: -18px; }
</style>
  