<template>
  <div class="layout-col overlay">
    <div class="hh100 ww100 flex-sc warp">
      <el-form class="ww100 pplr15" ref="formRef" :model="publicStore.form" :rules="ruleList" label-width="120">
        <div class="flex-sc warp ww100">
          <el-form-item label="项目状态" prop="completion_status" class="ww50 flex-sc">
            <el-select v-model="publicStore.form.completion_status" placeholder="请选择" style="width:100%" filterable clearable>
              <el-option v-for="(v, i) in dictStore.project_completion_statuss" :key="v.value" :value="String(v.value)" :label="v.name" />
            </el-select>
          </el-form-item>
          <el-form-item label="已投资金额" prop="has_construct_price" class="ww50 flex-sc">
            <el-input size="large" v-model="publicStore.form.has_construct_price" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="已建设规模" prop="has_construct_price" class="ww50 flex-sc">
            <el-input size="large" v-model="publicStore.form.has_construct_price" placeholder="请输入" />
          </el-form-item>

          <el-form-item label="复批时间" prop="approval_time" class="ww50 flex-sc">
            <el-date-picker v-model="publicStore.form.approval_time" style="width: 100%;" size="large" type="datetime" placeholder="请选择" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
          </el-form-item>
          <el-form-item label="方案摘要" prop="plan_abstract" class="ww100 flex-sc">
            <el-input size="large" v-model="publicStore.form.plan_abstract" type="textarea" :rows="4"  placeholder="请输入" />
          </el-form-item>
          <el-form-item label="基础建设条件" prop="condition" class="ww100 flex-sc">
            <el-input size="large" v-model="publicStore.form.condition" type="textarea" :rows="4"  placeholder="请输入" />
          </el-form-item>

          <!-- <el-form-item label="项目任务" prop="tasks" class="ww100 flex-ss">
            <div class="ww100 flex-sc pb20">
              <div class="mr40 pb10 f18 relative cursor actfont" 
              :class="publicStore.current.value == v.value?'i1 bob-i1-2':'bob-tt-2'" 
              v-for="(v, i) in props.state.type=='plan'?activeTab:activeTab" :key="i" @click.stop="publicStore.current = {...v}" >
              <el-popover :content="v.describe" placement="top-start">
                  <template #reference>
                    <div class="absolute f14 t10 r-18">
                      <i-ep-questionFilled v-show="v.describe" />
                    </div>
                  </template>
                </el-popover>
                <span>{{ v.name }}</span>
              </div>
            </div>
            <List @handleClick="handleClick" :state="state" :hasLists="true" :lists="publicStore.form.task" />
          </el-form-item> -->
          <!-- <SchemeAutoFill />  -->

          <el-form-item label="实施方案文件上传" prop="files" class="ww100 flex-ss">
             <FileList v-if="publicStore.form?.plan_attr" v-model:files="publicStore.form.plan_attr" :contents="props.contents" :active="props.active"  />
          </el-form-item>
        </div>
      </el-form>
      <div class="ww100 flex-cc f18 p40 bot-i16-1 mt20">
        <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" @click.stop="publicStore.actIndex--">上一步</div>
        <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" @click.stop="onSave(formRef)">保 存</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import api from '@/api'
  import { pinyin } from 'pinyin-pro'
  import { v6 as uuidv6 } from 'uuid'
  import { areaOptions } from '@/utils/areaData'
  import router from '@/router'
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const dictStore = proxy.dictStore()
  let projectRef = $ref()
  let formRef = ref()
  let ruleList= $ref({})
  const activeTab = [
    {value: '1', name: '重点落实任务'},
    {value: '2', name: '体检整改任务'},
  ]
  const files = [
    {name: '基础条件', key: 'value1'},
    {name: '更新方式', key: 'value2'},
    {name: '设计方案', key: 'value3'},
  ]
  const state = reactive({
	  ...publicStore.$state,
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
    active: {
      type: [Object, Array],
      default: ()=>{return {}}
    },
  })

  const onSave = (formEl) => {
    formEl.validate (async valid => {
      if (valid) {
        console.log("publicStore.form---2", publicStore.form)
        ElMessageBox.confirm('否确定操作继续', '温馨提示', {confirmButtonText: '确定', cancelButtonText: '关闭', type: 'warn'}).then(async() => {
          // 防干扰
          let form = JSON.parse(JSON.stringify(publicStore.form)) 
          // 当前时间
          let nowtime = Date.now() + ''
          // 默认类型
          form.type = 'report'
          // 更新时间
          form.update_time = nowtime
          // 设置所属
          form.user_id = configStore.user.id
          form.user_name = configStore.user.name
          // 判断新增与编辑
          let apikey = form.id?'updApi':'addApi'
          //这里需要判断到哪一个步骤 publicStore.title 全局标志符
          // 1.新建项目
          if(apikey == 'addApi' && publicStore.title == 'apply'){
            console.log("新增项目")
            // 编号规则
            const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
            form.num_title = 'SX'
            form.num_date = today
            let query = {model: 't_project_report', args: `num_title='${form.num_title}' and num_date='${form.num_date}'`, field: `num_number`, order: `num_number asc`}
            let temp = await publicStore.http({Api: query})
            form.num_number = proxy.isNull(temp)? '000001': String(parseInt(temp[0]['num_number'], 10) + 1).padStart(6, '0')
          }
          // 2.编辑项目 
          if(apikey == 'updApi'){  
            // 2.1申请储备
            if(form.apply_status = '0'){
              console.log("申请储备")
              form.apply_status = '1'
              form.apply_time = nowtime
            }
            // 2.2更新信息
            if(form.apply_status = '1'){
              console.log("更新信息")
            }
          }
          // 生成带排序的uuid作为id
          if(!form.id) form.id=uuidv6()
          // 所属地区 省市区
          if(!proxy.isNull(form.area)){
            if(form.area.length>0){
              form.province = form.area.length>0? form.area[0] : ''
              let province = proxy.findNode(areaOptions, (node) => { return node.code == form.province })
              if(province) form.province_name = province.name
            }
            if(form.area.length>1){
              form.city = form.area.length>1? form.area[1] : ''
              let city = proxy.findNode(areaOptions, (node) => { return node.code == form.city })
              if(city) form.city_name = city.name
            }
            if(form.area.length>2){
              form.district = form.area.length>2? form.area[2] : ''
              let district = proxy.findNode(areaOptions, (node) => { return node.code == form.district })
              if(district) form.district_name = district.name
            }
            form.area = JSON.stringify(form.area)
          }
          // 资金来源 10个值
          form.fund_source = !proxy.isNull(form.fund_source)? JSON.stringify(form.fund_source) : ''
          // 其他信息 15个值
          form.orther_text = !proxy.isNull(form.orther_text)? JSON.stringify(form.orther_text) : ''
          // 基础文件
          let changeFile1 = []
          if(!proxy.isNull(form.attr)){
            Object.keys(form.attr).forEach((key:any)=>{
              if(form.attr[key].data && form.attr[key].data.indexOf('/uploads')!=-1){
                let content = publicStore._public.contents1.find(a=>a.type == key)
                const newfile = `${content.parent_type}/${configStore.user.id}_${key}_${form.attr[key]['name']}`
                form.attr[key].data = newfile
                changeFile1.push({oldfile: publicStore.form.attr[key].data, newfile: newfile})
              }
            })
            form.attr = JSON.stringify(form.attr)
          }else{
            form.attr = ''
          }
          // 方案文件
          let changeFile2 = []
          if(!proxy.isNull(form.plan_attr)){
            Object.keys(form.plan_attr).forEach((key:any)=>{
              if(form.plan_attr[key].data && form.plan_attr[key].data.indexOf('/uploads')!=-1){
                let content = publicStore._public.contents2.find(a=>a.type == key)
                const newfile = `${content.parent_type}/${configStore.user.id}_${key}_${form.plan_attr[key]['name']}`
                form.plan_attr[key].data = newfile
                changeFile2.push({oldfile: publicStore.form.plan_attr[key].data, newfile: newfile})
              }
            })
            form.plan_attr = JSON.stringify(form.plan_attr)
          }else{
            form.plan_attr = ''
          }
          // 开始请求
          let params = {model: 't_project_report', list: [form]}
          console.log("params", params)
          console.log("changeFile1", changeFile1)
          console.log("changeFile2", changeFile2)
          api[apikey](params).then(async(res:any) => {
            if(res.code == 200){
              let message = apikey == 'updApi'? '申请成功' : '保存成功'
              ElNotification({ title: '提示', message: message, type: 'success' })
              // 转移基础文件
              if(!proxy.isNull(changeFile1)) setChangeFile(changeFile1)
              // 转移方案文件
              if(!proxy.isNull(changeFile2)) setChangeFile(changeFile2)
              // 三表保存逻辑

              // 刷新页面
              // emit('init', form.id)
              setTimeout(() => { router.back() }, 500)
            }else{
              ElNotification({ title: '提示', message: res.msg?res.msg:'保存失败(400)', type: 'error' })
            }
          }).catch((err) => {
            ElNotification({ title: '提示', message: '保存失败(500)', type: 'error' })
          })
        })
      }
    })
  }

  const setChangeFile = async(changeFile) => {
    if(proxy.isNull(changeFile)) return console.log("无需转移")
    let query = {list: changeFile}
    publicStore.http({changeFileApi: query}).then(res=>{
      console.log("转移基础文件res", res)
    })
  }

  const handleClick = (remark, val) => {}
</script>
  
<style scoped lang="scss">
.bob-tt-2 { border-bottom: 2px solid transparent; }
.r-18{ right: -18px; }
.autoHeight{min-height: 100%; height: 3000px;}
</style>
  