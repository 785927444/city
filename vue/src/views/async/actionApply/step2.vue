<template>
  <div class="layout-col overlay">
    <div class="hh100 ww100 flex-sc warp">
      <el-form class="ww100 pplr15" ref="formRef" :model="publicStore.form" :rules="ruleList" label-width="120">
        <div class="flex-sc warp ww100">
          <el-form-item label="方案名称" prop="plan_name" class="ww50 flex-sc">
            <el-input size="large" v-model="publicStore.form.plan_name" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="方案编制单位" prop="plan_unit" class="ww50 flex-sc">
            <el-input size="large" v-model="publicStore.form.plan_unit" placeholder="请输入" />
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

          <el-form-item label="项目任务" prop="tasks" class="ww100 flex-ss">
            <div class="ww100 flex-sc pb20">
              <div class="mr40 pb10 f18 relative cursor actfont" 
              :class="publicStore.current.value == v.value?'i1 bob-i1-2':'bob-tt-2'" 
              v-for="(v, i) in activeTab" :key="i" @click.stop="publicStore.current = {...v}" >
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
            <List @handleClick="handleClick" :state="state" :hasLists="true" :lists="filteredTasks" />
          </el-form-item>
          <SchemeAutoFill
            :scheme-id="publicStore.form.parent_id"
            :area-value="publicStore.form.parent_area"
            :task-type="publicStore.form.task_type"
            :draft="publicStore.form"
            :scheme-plans="publicStore._public?.schemePlans ? publicStore._public.schemePlans : []"
            :scheme-areas="publicStore._public?.schemeAreas ? publicStore._public.schemeAreas : []"
          />

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
  import SchemeAutoFill from '@/components/SchemeAutoFill.vue'
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
    content: [
      { name: '任务中类', key: 'task_class', type: 'input', width: 'flex1' },
      { name: '建设内容', key: 'construct_content', type: 'input', width: 'w300' },
      { name: '年份', key: 'year', type: 'input', width: 'w100' },
      { name: '值', key: 'value', type: 'input', width: 'w100' },
      { name: '操作', key: { add: '新增', del: '删除' }, width: 'w100' },
    ]
  })
  const createEmptyTask = (type: any) => ({
    id: uuidv6(),
    task_type: type,
    task_class: '',
    construct_content: '',
    year: '',
    value: '',
  })

  const ensureTaskArray = () => {
    if (!publicStore.form) return
    if (!Array.isArray(publicStore.form.task)) publicStore.form.task = []
  }

  const ensureTaskRowForType = (type: any) => {
    ensureTaskArray()
    if (!type) return
    const list = publicStore.form.task as any[]
    const exists = list.some((t: any) => String(t.task_type) === String(type))
    if (!exists) list.push(createEmptyTask(type))
  }

  if (!publicStore.current || !publicStore.current.value) publicStore.current = activeTab[0]
  ensureTaskRowForType(publicStore.current.value)

  watch(
    () => publicStore.current?.value,
    (type) => {
      ensureTaskRowForType(type)
    },
    { immediate: true }
  )

  watch(
    () => publicStore.form?.task,
    () => {
      ensureTaskRowForType(publicStore.current?.value)
    },
    { immediate: true }
  )

  const filteredTasks = computed(() => {
    const type = publicStore.current?.value
    const list = Array.isArray(publicStore.form?.task) ? publicStore.form.task : []
    const filtered = (list as any[]).filter((item: any) => String(item.task_type) === String(type))
    return filtered.length > 0 ? filtered : [createEmptyTask(type)]
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
        ElMessageBox.confirm('否确定操作继续', '温馨提示', {confirmButtonText: '确定', cancelButtonText: '关闭', type: 'warn'}).then(() => {
          // 防干扰
          let form = JSON.parse(JSON.stringify(publicStore.form)) 
          // 设置默认类型
          form.type = 'report'
          // 设置所属
          form.user_id = configStore.user.id
          form.user_name = configStore.user.name
          // 判断新增与编辑
          let apikey = form.id?'updApi':'addApi'
          // 如果是申请储备
          if(apikey == 'updApi'){
            form.apply_status = '1'
            form.apply_time = Date.now() + ''
          }
          // 生成带排序的uuid作为id
          if(!form.id) form.id=uuidv6()
          // 所属地区 省市区
          if(!proxy.isNull(form.area)){
            if(form.area.length>0){
              form.province = form.area.length>0? form.area[0] : ''
              let province = proxy.findNode(areaOptions, (node) => { return node.code == form.province })
              console.log("province---", province)
            }

            form.city = form.area.length>1? form.area[1] : ''
            form.district = form.area.length>2? form.area[2] : ''
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
                const newfile = `${content.parent_type}/${configStore.user.id}_${key}_${form.plan_attr[key]['name']}`
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
          return
          api[apikey](params).then(async(res:any) => {
            if(res.code == 200){
              ElNotification({ title: '提示', message: '保存成功', type: 'success' })
              // 转移基础文件
              if(!proxy.isNull(changeFile1)) setChangeFile(changeFile1)
              // 转移方案文件
              if(!proxy.isNull(changeFile2)) setChangeFile(changeFile2)
              const projectId = form.id
              if (Array.isArray(publicStore.form.task) && publicStore.form.task.length > 0) {
                const tasksToSave = publicStore.form.task.filter((t: any) => {
                  return t.task_class || t.construct_content || t.year || t.value
                }).map((t: any) => {
                  t.project_id = projectId
                  if (!t.id) t.id = uuidv6()
                  return t
                })
                if (tasksToSave.length > 0) {
                  const taskParams = { model: 't_project_task', list: tasksToSave }
                  api.addApi(taskParams).catch(() => {
                    api.updApi(taskParams)
                  })
                }
              }

              // 刷新页面
              // emit('init', form.id)
              // 如果没有id 跳转到首页
              // 如果有id需要把数据复制到储备库
              if(publicStore.form.id){

              }
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

  const handleClick = (key, val) => {
    ensureTaskArray()
    if (key === 'add') {
      publicStore.form.task.push({
        id: uuidv6(),
        task_type: publicStore.current.value,
        task_class: '',
        construct_content: '',
        year: '',
        value: ''
      })
    } else if (key === 'del') {
      const index = publicStore.form.task.indexOf(val)
      if (index > -1) {
        publicStore.form.task.splice(index, 1)
      }
      if (val.id) {
        publicStore.http({ deleteApi: { model: 't_project_task', list: [val.id] } })
      }
    }
  }
</script>
  
<style scoped lang="scss">
.bob-tt-2 { border-bottom: 2px solid transparent; }
.r-18{ right: -18px; }
.autoHeight{min-height: 100%; height: 3000px;}
</style>
  
