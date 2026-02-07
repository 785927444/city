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
        ElMessageBox.confirm('否确定操作继续', '温馨提示', {confirmButtonText: '确定', cancelButtonText: '关闭', type: 'warn'}).then(async() => {
          let form = JSON.parse(JSON.stringify(publicStore.form)) 
          let nowtime = Date.now() + ''
          form.type = 'report'
          form.update_time = nowtime
          form.user_id = configStore.user.id
          form.user_name = configStore.user.name
          let apikey = form.id?'updApi':'addApi'
          if(apikey == 'updApi'){  
            if(form.apply_status = '0'){
              form.apply_status = '1'
              form.apply_time = nowtime
            }
            if(form.apply_status = '1'){
            }
          }
          if(!form.id) form.id=uuidv6()
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
          form.fund_source = !proxy.isNull(form.fund_source)? JSON.stringify(form.fund_source) : ''
          form.orther_text = !proxy.isNull(form.orther_text)? JSON.stringify(form.orther_text) : ''
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
          let params = {model: 't_project_report', list: [form]}
          api[apikey](params).then(async(res:any) => {
            if(res.code == 200){
              let message = apikey == 'updApi'? '申请成功' : '保存成功'
              ElNotification({ title: '提示', message: message, type: 'success' })
              if(!proxy.isNull(changeFile1)) setChangeFile(changeFile1)
              if(!proxy.isNull(changeFile2)) setChangeFile(changeFile2)
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
    if(proxy.isNull(changeFile)) return
    let query = {list: changeFile}
    publicStore.http({changeFileApi: query}).then(res=>{
    })
  }

  const handleClick = (remark, val) => {}
</script>
  
<style scoped lang="scss">
.bob-tt-2 { border-bottom: 2px solid transparent; }
.r-18{ right: -18px; }
.autoHeight{min-height: 100%; height: 3000px;}
</style>
  
