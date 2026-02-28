<template>
  <div class="layout-col">
    <div class="hh100 flex-col pplr15">
      <!-- 规划名称、规划周期 -->
      <div class="ww100 flex-sc" v-if="props.state.type == 'plan'">
        <div class="flex-sc flex1 mr30">
          <div class="flex-sc mr20">
            <span class="mr3 i8 f20">*</span>
            <span>专项规划名称</span>
          </div>
          <div class="flex1">
            <el-input class="ww100" v-model="publicStore.form.name" placeholder="请输入" size="large" />
          </div>
        </div>
        <div class="flex-sc flex1 ml30">
          <div class="flex-sc mr20">
            <span class="mr3 i8 f20">*</span>
            <span>规划周期</span>
          </div>
          <div class="flex1">
            <el-date-picker style="width: 100%;" v-model="publicStore.form.datetime" start-placeholder="开始周期" end-placeholder="结束周期" size="large" type="yearrange" value-format="YYYY" format="YYYY" />
          </div>
        </div>
      </div>

      <!-- 片区名称、片区编号 -->
      <div class="ww100 flex-sc" v-if="props.state.type == 'design'">
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
            <el-input class="ww100" v-model="publicStore.form.num" placeholder="请输入英文或数字" size="large" @input="publicStore.form.num = publicStore.form.num.replace(/[^a-zA-Z0-9]/g, '')" />
          </div>
        </div>
      </div>
      <!-- 所属专项规划、所属专项片区 -->
      <div class="ww100 flex-sc mt20" v-if="props.state.type == 'design'">
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
            <el-input class="ww100" v-model="publicStore.form.parent_area" placeholder="请输入" size="large" />
            <!-- <el-select v-model="publicStore.form.parent_area" placeholder="请选择" size="large" style="width:100%" filterable clearable>
              <el-option v-for="(v, i) in state.schemeAreas?state.schemeAreas:[]" :key="v.value" :value="String(v.value)" :label="v.name" />
            </el-select>  -->
          </div>
        </div>
      </div>

      <!-- 切换 -->
      <!-- <div class="ww100 flex-sc pt40 pb15 plr15">
        <div class="mr40 ptb10 f18 relative cursor actfont" :class="state.active.name == v.name?'i1 bob-i1-2':'bob-tt-2'" v-for="(v, i) in state.plans?state.plans:[]" :key="i" @click.stop="state.active = {...v}" >
        <el-popover :content="v.describe" placement="top-start">
            <template #reference>
              <div class="absolute f14 t10 r-18">
                <i-ep-questionFilled v-show="v.describe" />
              </div>
            </template>
          </el-popover>
          <span>{{ v.name }}</span>
        </div>
      </div> -->
      <!-- 列表 -->

      <div class="ww100 plr30 ptb22 bo-i16-1 rad8 bg-white mt30">
        <FileList v-if="publicStore.form?.attr" v-model:files="publicStore.form.attr" parent-field="attr" :plans="props.plans" :contents="props.contents" :active="props.active"  />
      </div>

      <!-- <div class="table flex-sc warp">
        <div class="ww25 cursor p8" v-if="state.active&&publicStore.form.attr" v-for="(v, i) in state.contents?state.contents.filter(a=>a.parent_id==state.active.id):[]" :key="i">
          <div class="ww100 bs bo-i16-1 relative rad8">
            <div class="ww100 flex-sc p12 bob-ce-1">
              <span class="f15">{{ v.name }}</span>
              <span class="flex1 flex-ec">
                <UploadText v-if="v.type" v-model:model="publicStore.form.attr[v.type]" />
              </span>
            </div>
            <div class="ww100 flex-col p12">
              <div class="ww100 flex-sc">
                <span class="w90 c8">上传状态</span>
                <span class="flex1 line1">{{ publicStore.form.attr[v.type]&&publicStore.form.attr[v.type]['status']?publicStore.form.attr[v.type]['status']=='success'?'成功':'失败':'-' }}</span>
              </div>
              <div class="ww100 flex-sc mt12">
                <span class="w90 c8">文件类型</span>
                <span class="flex1 line1">{{ publicStore.form.attr[v.type]&&publicStore.form.attr[v.type]['type']?publicStore.form.attr[v.type]['type']:'-' }}</span>
              </div>
              <div class="ww100 flex-sc mt12">
                <span class="w90 c8">上传时间</span>
                <span class="flex1 line1">{{ publicStore.form.attr[v.type]&&publicStore.form.attr[v.type]['time']?parseTime(publicStore.form.attr[v.type]['time']):'-' }}</span>
              </div>
              <div class="ww100 flex-ec mt12">
                <span v-if="publicStore.form.attr[v.type]" class="ml12 i1" @click.stop="viewFile(v)">预览</span>
                <span v-else class="ml12 ca">预览</span>
                <span v-if="publicStore.form.attr[v.type]" class="ml12 i9" @click.stop="delFile(v)">删除</span>
                <span v-else class="ml12 ca">删除</span>
              </div>
            </div>
          </div>
        </div>
      </div> -->
    </div>
    <ViewFiles ref="viewRef" />
  </div>
</template>

<script lang="ts" setup>
  import api from '@/api'
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  let viewRef = $ref()
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
    contents: {
      type: Array,
      default: []
    },
    plans: {
      type: Array,
      default: []
    },
    active: {
      type: [Object, Array],
      default: ()=>{return {}}
    },
  })

  onMounted(async() => {
    getPlan()
    // init()
  })

  const getPlan = async() => {
    if(props.state.type != 'design') return
    let query = {model: 't_scheme_plan', args: `user_id='${configStore.user.id}' and type='plan'`, field: `id, name`}
    publicStore.http({Api: query}).then(res=>{
      state.schemePlans = proxy.isNull(res)? [] : res
    })
  }

  // const init = async() => {
  //   let query1 = {model: 't_file_type'}
  //   let query2 = {model: 't_file_content'}
  //   let res = await publicStore.http({Api1: query1, Api2: query2})
  //   let list1 = proxy.isNull(res.Api1)? [] : res.Api1.sort((a, b) => a.orderd - b.orderd)
  //   let list2 = proxy.isNull(res.Api2)? [] : res.Api2.sort((a, b) => a.orderd - b.orderd)
  //   let id = props.state.type=='plan'? "019be0b6-a467-7a5e-8ad9-6ba600813fa5" : "019be0b6-e9f9-7081-b4a3-d808e0bc96ca"
  //   let plan = list1.find(a=>a.id==id)
  //   if(plan){
  //     let contents = []
  //     state.plans = list1.filter(a=>a.parent_id == id)
  //     state.plans.forEach(v => { 
  //       v.parent_type = `${plan.type}/${v.type}`
  //       let content = list2.filter(a=>a.parent_id == v.id)
  //       if(!proxy.isNull(content)){
  //         content.forEach(vv => {
  //           vv.parent_type = `${v.parent_type }/${vv.type}`
  //           contents.push(vv)
  //         })
  //       }
  //     })
  //     state.contents = contents
  //     publicStore._public.contents = contents
  //     state.active = proxy.isNull(state.plans)? {} : {...state.plans[0]}
  //   }
  // }

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
  