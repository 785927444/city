<template>
  <div class="layout-col overlay">
    <div class="hh100 ww100 flex-sc warp">
      <el-form class="ww100 pplr15" ref="formRef" :model="publicStore.form" :rules="ruleList" label-width="120" :disabled="props.isReadonly">
        <div class="flex-sc warp ww100">
          <el-form-item label="项目状态" prop="completion_status" class="ww50 flex-sc" :rules="[{ required: true, message: '请选择', trigger: 'blur' }]">
            <el-select v-model="publicStore.form.completion_status" placeholder="请选择" style="width:100%" filterable clearable>
              <el-option v-for="(v, i) in dictStore.project_completion_statuss" :key="v.value" :value="String(v.value)" :label="v.name" />
            </el-select>
          </el-form-item>
          <el-form-item label="已投资金额（万元）" prop="has_construct_price" class="ww50 flex-sc">
            <el-input size="large" v-model="publicStore.form.has_construct_price" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="已建设规模" prop="has_construct_scale" class="ww50 flex-sc">
            <el-input size="large" v-model="publicStore.form.has_construct_scale" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="实施成效说明" prop="has_construct_effect" class="ww100 flex-ss">
            <el-input size="large" v-model="publicStore.form.has_construct_effect" style="width: 100%;" type="textarea" :rows="4" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="过程材料上传" prop="has_attr" class="ww100 flex-ss">
            <div class="ww100 plr30 ptb22 bo-i16-1 rad8 bg-white">
              <FileList v-if="publicStore.form?.has_attr" v-model:files="publicStore.form.has_attr" parent-field="has_attr" :plans="props.plans" :contents="props.contents" :active="props.active"  />
            </div>
          </el-form-item>
          <el-form-item label="实施成效材料上传" prop="effect_attr" class="ww100 flex-ss">
            <div class="ww100 plr30 ptb22 bo-i16-1 rad8 bg-white">
              <FileList v-if="publicStore.form?.effect_attr" v-model:files="publicStore.form.effect_attr" parent-field="effect_attr" :plans="props.plans1" :contents="props.contents1" :active="props.active1"  />
            </div>
          </el-form-item>
          <!-- <el-form-item v-if="route.query.key == 'enterprise'" label="审核结果" prop="reserve_res" class="ww100 flex-ss" :rules="[{ required: true, message: '请输入', trigger: 'blur' }]">
            <el-input size="large" v-model="publicStore.form.reserve_res" style="width: 100%;" type="textarea" :rows="4" placeholder="请输入" />
          </el-form-item> -->
        </div>
      </el-form>
      <div class="ww100 flex-cc f18 p40 bot-i16-1 mt20">
        <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" @click.stop="publicStore.actIndex--">上一步</div>
        <!-- 新增项目 -->
        <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" @click.stop="onSave(formRef)" v-if="!publicStore.form.id">保 存</div>
        <!-- 非新增项目 -->
        <div v-else>
          <!-- 企业申请储备 -->
          <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" @click.stop="onSave(formRef)" v-if="route.query.action=='1f1000c7-5def-66b0-bc96-dc4dc45fb98c'">申请储备</div>
          <!-- 企业重新申请 -->
          <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" @click.stop="onSave(formRef)" v-if="route.query.action=='1f1000c7-5def-66b0-bc96-dc4dc45fb99c'">重新申请</div>
          <!-- 部门开始储备 -->
          <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" @click.stop="onSave(formRef)" v-if="route.query.action=='1f1000c7-5def-66b0-bc96-dc4dc45fb98d'">开始储备</div>
          <!-- 更新进度 -->
          <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" @click.stop="onSave(formRef)" v-if="route.query.action=='1f10502a-e388-6850-8aa3-265c92863865'">更新进度</div>
        </div>
        <!-- <template v-if="route.query.action != '019c03f8-971e-72a5-8dc3-82f1a1fc2758'">
          <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" v-if="route.query.action == '1f10502a-e388-6850-8aa3-265c92863866'" @click.stop="onSave(formRef, '1')">更 新</div>
          <div class="flex-sc" v-else>
            <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" @click.stop="onSave(formRef, '1')">保 存</div>
          </div>
        </template> -->
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
  const route = useRoute()
  // 1. 先定义响应式数据 (提升到顶部)
  let tabKey = $ref('key')
  const checkPage = reactive({ page: 1, limit: 10, total: 0 })
  const keyPage = reactive({ page: 1, limit: 10, total: 0 })
  
  // 使用 publicStore._public 来共享数据，确保从 step2 填写的数据能带到 step3
  if (!publicStore._public.checkTasks) publicStore._public.checkTasks = []
  if (!publicStore._public.keyTasks) publicStore._public.keyTasks = []
  if (!publicStore._public.timelineRows) publicStore._public.timelineRows = []

  const checkTasks = $ref(publicStore._public.checkTasks)
  const keyTasks = $ref(publicStore._public.keyTasks)
  const timelineRows = $ref(publicStore._public.timelineRows)

  // 监听并同步到 store
  watch(() => checkTasks, (val) => { publicStore._public.checkTasks = val }, { deep: true })
  watch(() => keyTasks, (val) => { publicStore._public.keyTasks = val }, { deep: true })
  watch(() => timelineRows, (val) => { publicStore._public.timelineRows = val }, { deep: true })

  let keySel = $ref([])
  let checkSel = $ref([])

  const dimensionList = ref<any[]>([])
  const problemItems = ref<any[]>([])
  const taskProblems = ref<any[]>([])
  const pickVisible = ref(false)
  const keyword = ref('')
  const pickSelection = ref<any[]>([])

  // 获取明细数据 (初始化回填)
  const getDetailData = async () => {
    if (!publicStore.form || !publicStore.form.id) return
    const pid = publicStore.form.id
    
    console.log('--- step3 开始加载三表明细数据 ---', pid);
    const query = {
      keyApi: { model: 't_project_task_key', args: `project_id='${pid}'`, limit: 1000 },
      checkApi: { model: 't_project_task_check', args: `project_id='${pid}'`, limit: 1000 },
      timeApi: { model: 't_project_task_timeline', args: `project_id='${pid}'`, limit: 1000 }
    }
    
    publicStore.http(query).then(res => {
      console.log('step3 三表明细返回数据:', res);
      
      // 1. 回填重点任务
      if (res.keyApi && Array.isArray(res.keyApi) && res.keyApi.length > 0) {
        keyTasks.splice(0, keyTasks.length, ...res.keyApi)
      }

      // 2. 回填体检任务
      if (res.checkApi && Array.isArray(res.checkApi) && res.checkApi.length > 0) {
        checkTasks.splice(0, checkTasks.length, ...res.checkApi.map(item => ({
          ...item,
          type: item.dimension,
          range: item.rectify_range,
          content: item.rectify_content
        })))
      }

      // 3. 回填时序管理
      if (res.timeApi && Array.isArray(res.timeApi) && res.timeApi.length > 0) {
        const sorted = [...res.timeApi].sort((a, b) => Number(a.year) - Number(b.year))
        timelineRows.splice(0, timelineRows.length, ...sorted.map(item => ({
          ...item,
          desc: item.construct_content
        })))
      }
    }).catch(err => {
      console.error('step3 加载三表明细失败:', err);
    })
  }

  onMounted(() => {
    getDetailData() // 仅加载明细数据，不需要 UI 联动相关的数据
  })

  watch(() => publicStore.form.id, () => {
    getDetailData()
  })

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
    isReadonly: {
      type: Boolean,
      default: false
    },
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
    contents1: {
      type: Array,
      default: []
    },
    plans1: {
      type: Array,
      default: []
    },
    active1: {
      type: [Object, Array],
      default: ()=>{return {}}
    },
  })

  const onSave = (formEl, status) => {
    formEl.validate (async valid => {
      if (valid) {
        console.log("publicStore.form---3", publicStore.form)
        ElMessageBox.confirm('是否确定操作继续', '温馨提示', {confirmButtonText: '确定', cancelButtonText: '关闭', type: 'warn'}).then(async() => {
          // 防干扰
          let form = JSON.parse(JSON.stringify(publicStore.form)) 
          // 当前时间
          let nowtime = Date.now() + ''
          // 更新时间
          form.update_time = nowtime
          // 判断新增与编辑
          let apikey = form.id?'updApi':'addApi'
          //这里需要判断到哪一个步骤 全局标志符
          // 1.新建项目
          if(apikey == 'addApi'){
            console.log("新增项目")
            // 设置所属
            form.user_id = configStore.user.id
            form.user_name = configStore.user.name
            form.user_role = configStore.user.role_id
            form.user_province = configStore.user.province
            form.user_city = configStore.user.city
            form.user_district = configStore.user.district
            // 默认类型
            form.type = route.query&&route.query.key? route.query.key : ''
            // 默认状态
            form.reserve_status = '0'
            form.apply_status = '0'
            form.push_status = '-1'
            // 编号规则
            const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
            form.num_title = 'SX'
            form.num_date = today
            let query = {model: 't_project_report', args: `num_title='${form.num_title}' and num_date='${form.num_date}'`, field: `num_number`, order: `num_number asc`}
            let temp = await publicStore.http({Api: query})
            form.num_number = proxy.isNull(temp)? '000001': String(parseInt(temp[0]['num_number'], 10) + 1).padStart(6, '0')
          }else{
            if(proxy.isNull(route.query)) return console.log("传值缺失")
            // 2.申请储备 
            if(route.query.action == '1f1000c7-5def-66b0-bc96-dc4dc45fb98c'){
              if(form.apply_status == '0') {
                console.log("申请储备")
                form.apply_status = '1'
                form.apply_time = nowtime
              }else{
                console.log('状态错误2')
              }
            }
            // 2.开始储备 
            if(route.query.action == '1f1000c7-5def-66b0-bc96-dc4dc45fb98d'){
              if(form.apply_status == '0') {
                console.log("开始储备")
                form.apply_status = '2'
                form.apply_time = nowtime
                form.reserve_status = '1'
                form.reserve_time = nowtime
              }else{
                console.log('状态错误2')
              }
            }
            
            // 3. 重新申请储备
            if(route.query.action == '1f1000c7-5def-66b0-bc96-dc4dc45fb99c'){
              if(form.apply_status == '3') {
                console.log("重新申请储备")
                form.apply_status = '1'
                form.apply_time = nowtime
                form.reserve_status = '0'
              }else{
                console.log('状态错误2')
              }
            }
            // 4.更新项目进度
            if(route.query.action == '1f10502a-e388-6850-8aa3-265c92863866'){
               if(form.apply_status == '2' && form.reserve_status == '1') {
                console.log("更新信息")
              }else{
                console.log('状态错误3')
              }
            }
            // 4储备审批操作
            if(route.query.action== '019c041a-9f8c-7e9e-91eb-0ae051e6f324'){
              if(form.reserve_status == '0' && form.push_status == '0'){
                console.log("审批储备")
                form.reserve_status = status
                form.reserve_time = nowtime
                if(status == '1') form.apply_status = '2'
                if(status == '2') form.apply_status = '3'
              }else{
                console.log('状态错误4')
              }
            }
            // 5推送审核操作
            if(route.query.action == '019c03f8-971e-72a5-8dc3-82f1a1fc2758'){
              if(form.reserve_status == '1' && form.push_status == '0'){
                console.log("审批推送")
                form.push_status = status
                form.push_time = nowtime
              }else{
                console.log('状态错误5')
              }
            }
          }
          // 生成带排序的uuid作为id
          if(!form.id) form.id=uuidv6()
          // 主管单位决定项目所属 *重要（非选择地区 非操作用户地区）
          if(form.construct_main && !proxy.isNull(publicStore._public.construct_mains)){
            let construct_main = publicStore._public.construct_mains.find(a=>a.id == form.construct_main)
            if(construct_main){
              form.construct_main_province = construct_main.province
              form.construct_main_city = construct_main.city
              form.construct_main_district = construct_main.district
            }
          }
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
          // 多选内容类型
          form.task_content = !proxy.isNull(form.task_content)? JSON.stringify(form.task_content) : ''
          // 资金来源 10个值
          form.fund_source = !proxy.isNull(form.fund_source)? JSON.stringify(form.fund_source) : ''
          // 其他信息 15个值
          form.orther_text = !proxy.isNull(form.orther_text)? JSON.stringify(form.orther_text) : ''
          // 基础文件
          let changeFile1 = []
          if(!proxy.isNull(form.attr)){
            form.attr.forEach(v => {
              if(v.data.indexOf('/uploads')!=-1){
                let content = publicStore._public.contents1.find(a=>a.type == v.type)
                let oldlData = v.data;
                v.data = `${content.parent_type}/${form.id}_${v.time}_${v.name}`
                changeFile1.push({oldfile: oldlData, newfile: v.data})
              }
            })
          }
          let addFile1 = []
          let delFile1 = []
          let updFile1 = []
          if(JSON.stringify(form.attr) != JSON.stringify(publicStore._public.attr)) {
            addFile1 = form.attr.filter(a=>!a.id).map(item => ({ ...item, parent_id: form.id }))
            delFile1 = publicStore._public.attr.filter(a => !form.attr.some(b => b.id === a.id))
            updFile1 = form.attr.filter(a => publicStore._public.attr.some(b => b.id === a.id && b.data !== a.data))
          }
          delete form.attr
          // 方案文件
          let changeFile2 = []
          if(!proxy.isNull(form.plan_attr)){
            form.plan_attr.forEach(v => {
              if(v.data.indexOf('/uploads')!=-1){
                let content = publicStore._public.contents2.find(a=>a.type == v.type)
                let oldlData = v.data;
                v.data = `${content.parent_type}/${form.id}_${v.time}_${v.name}`
                changeFile2.push({oldfile: oldlData, newfile: v.data})
              }
            })
          }
          let addFile2 = []
          let delFile2 = []
          let updFile2 = []
          if(JSON.stringify(form.plan_attr) != JSON.stringify(publicStore._public.plan_attr)) {
            addFile2 = form.plan_attr.filter(a=>!a.id).map(item => ({ ...item, parent_id: form.id }))
            delFile2 = publicStore._public.plan_attr.filter(a => !form.plan_attr.some(b => b.id === a.id))
            updFile2 = form.plan_attr.filter(a => publicStore._public.plan_attr.some(b => b.id === a.id && b.data !== a.data))
          }
          delete form.plan_attr
          // 过程文件
          let changeFile3 = []
          if(!proxy.isNull(form.has_attr)){
            form.has_attr.forEach(v => {
              if(v.data.indexOf('/uploads')!=-1){
                let content = publicStore._public.contents3.find(a=>a.type == v.type)
                let oldlData = v.data;
                v.data = `${content.parent_type}/${form.id}_${v.time}_${v.name}`
                changeFile3.push({oldfile: oldlData, newfile: v.data})
              }
            })
          }
          let addFile3 = []
          let delFile3 = []
          let updFile3 = []
          if(JSON.stringify(form.has_attr) != JSON.stringify(publicStore._public.has_attr)) {
            addFile3 = form.has_attr.filter(a=>!a.id).map(item => ({ ...item, parent_id: form.id }))
            delFile3 = publicStore._public.has_attr.filter(a => !form.has_attr.some(b => b.id === a.id))
            updFile3 = form.has_attr.filter(a => publicStore._public.has_attr.some(b => b.id === a.id && b.data !== a.data))
          }
          delete form.has_attr
          // 实施成效文件
          let changeFile4 = []
          if(!proxy.isNull(form.effect_attr)){
            form.effect_attr.forEach(v => {
              if(v.data.indexOf('/uploads')!=-1){
                let content = publicStore._public.contents4.find(a=>a.type == v.type)
                let oldlData = v.data;
                v.data = `${content.parent_type}/${form.id}_${v.time}_${v.name}`
                changeFile4.push({oldfile: oldlData, newfile: v.data})
              }
            })
          }
          let addFile4 = []
          let delFile4 = []
          let updFile4 = []
          if(JSON.stringify(form.effect_attr) != JSON.stringify(publicStore._public.effect_attr)) {
            addFile4 = form.effect_attr.filter(a=>!a.id).map(item => ({ ...item, parent_id: form.id }))
            delFile4 = publicStore._public.effect_attr.filter(a => !form.effect_attr.some(b => b.id === a.id))
            updFile4 = form.effect_attr.filter(a => publicStore._public.effect_attr.some(b => b.id === a.id && b.data !== a.data))
          }
          delete form.effect_attr
          // 组合
          let addFile = [...addFile1, ...addFile2, ...addFile3, ...addFile4]
          let delFile = [...delFile1, ...delFile2, ...delFile3, ...delFile4]
          let updFile = [...updFile1, ...updFile2, ...updFile3, ...updFile4]
          // console.log("addFile---", addFile)
          // console.log("delFile---", delFile)
          // console.log("updFile---", updFile)

          // 序列化对象和数组字段 (参考 step2)
          Object.keys(form).forEach((key:any) => {
            const value = form[key]
            if (value === null || value === undefined) return
            if (Array.isArray(value)) {
              form[key] = value.length > 0 ? JSON.stringify(value) : ''
              return
            }
            if (typeof value === 'object' && key !== 'attr' && key !== 'plan_attr' && key !== 'has_attr' && key !== 'effect_attr') {
              const hasKeys = Object.keys(value).length > 0
              form[key] = hasKeys ? JSON.stringify(value) : ''
            }
          })

          // 开始请求
          let params = {model: 't_project_report', list: [form]}
          console.log("params", params)
          console.log("changeFile1", changeFile1)
          console.log("changeFile2", changeFile2)
          console.log("changeFile3", changeFile3)
          console.log("changeFile4", changeFile4)
          api[apikey](params).then(async(res:any) => {
            if(res.code == 200){
              let message = apikey == 'updApi'? '操作成功' : '保存成功'
              ElNotification({ title: '提示', message: message, type: 'success' })
              // 转移基础文件
              if(!proxy.isNull(changeFile1)) setChangeFile(changeFile1)
              // 转移方案文件
              if(!proxy.isNull(changeFile2)) setChangeFile(changeFile2)
              // 转移过程文件
              if(!proxy.isNull(changeFile3)) setChangeFile(changeFile3)
              // 转移实施成效文件
              if(!proxy.isNull(changeFile4)) setChangeFile(changeFile4)
              // 文件保存
              if(!proxy.isNull(updFile) || !proxy.isNull(addFile) || !proxy.isNull(delFile)) {
                if(!proxy.isNull(addFile)) setAdd(addFile, form.id)
                if(!proxy.isNull(delFile)) setDel(delFile, form.id)
                if(!proxy.isNull(updFile)) setUpd(updFile, form.id)
              }
              
              // 三表保存逻辑 (参考 step2)
              const reportId = await resolveReportId(res, form.id)
              await saveThreeTables(form, reportId)

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
      }else{
        ElNotification({ title: '提示', message: '任务信息不完整，请继续补充', type: 'error' })
      }
    })
  }

  const resolveReportId = async (res, projectId) => {
    let reportId = res?.data?.id
    if (!reportId && res?.data?.list?.length) reportId = res.data.list[0]?.id
    if (!reportId && res?.data?.length) reportId = res.data[0]?.id
    if (!reportId && projectId) reportId = projectId
    return reportId
  }

  const saveThreeTables = async (form, projectId) => {
    if (!projectId) {
      console.warn('saveThreeTables: projectId is missing')
      return
    }

    // 1. 重点落实任务数据
    const keyList = keyTasks.map(row => ({
      id: row.id || uuidv6(),
      project_id: projectId,
      task_type: row.task_type,
      construct_content: row.construct_content,
      construct_scale: row.construct_scale,
      t2026: row.t2026,
      t2027: row.t2027,
      t2028: row.t2028
    }))

    // 2. 体检整改任务数据
    const checkList = checkTasks.map(row => ({
      id: row.id || uuidv6(),
      project_id: projectId,
      dimension: row.type,
      indicator: row.indicator,
      problem: row.problem,
      rectify_range: row.range,
      rectify_content: row.content
    }))

    // 3. 时序管理数据
    const timelineList = timelineRows.filter(r => r.desc || r.investment).map(row => ({
      id: row.id || uuidv6(),
      project_id: projectId,
      year: row.year,
      construct_content: row.desc,
      investment: row.investment
    }))

    try {
      // 先删除旧数据
      await Promise.all([
        api.delApi({ model: 't_project_task_key', args: `project_id='${projectId}'` }),
        api.delApi({ model: 't_project_task_check', args: `project_id='${projectId}'` }),
        api.delApi({ model: 't_project_task_timeline', args: `project_id='${projectId}'` })
      ])
      
      // 批量新增新数据
      const addPromises = []
      if (keyList.length > 0) {
        addPromises.push(api.addApi({ model: 't_project_task_key', list: keyList }))
      }
      if (checkList.length > 0) {
        addPromises.push(api.addApi({ model: 't_project_task_check', list: checkList }))
      }
      if (timelineList.length > 0) {
        addPromises.push(api.addApi({ model: 't_project_task_timeline', list: timelineList }))
      }
      
      if (addPromises.length > 0) {
        await Promise.all(addPromises)
      }
      
      console.log('重点任务、体检任务、时序管理并行保存成功')
    } catch (e) {
      console.error('三表保存失败:', e)
      ElNotification({ title: '错误', message: '保存任务数据失败', type: 'error' })
    }
  }

  const setAdd = async(addFile, scheme_id) => {
    let params = {}
    if(!proxy.isNull(addFile)) params.addApi = {model: 't_file', list: addFile}
    let res = await publicStore.http(params)
    console.log('新增res---', res)
  } 

  const setDel = async(delFile, scheme_id) => {
    let params = {}
    if(!proxy.isNull(delFile)) params.delApi = {model: 't_file', list: delFile}
    let res = await publicStore.http(params)
    console.log('删除res---', res)
  } 

  const setUpd = async(updFile, scheme_id) => {
    let params = {}
    if(!proxy.isNull(updFile)) params.updApi = {model: 't_file', list: updFile}
    let res = await publicStore.http(params)
    console.log('更新res---', res)
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
  
