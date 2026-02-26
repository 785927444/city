<template>
  <div class="absolute t0 r0 ww14 hh100 bg-white rad8 bo-i16-1 p15">
    <!--只读状态 重新申请储备 -->
    <div class="layout-col" v-if="route.query.action == '1f1000c7-5def-66b0-bc96-dc4dc45fb99c'">
      <div class="flex-sc warp ww100">
        <div class="ww100 mb15 flex-sc">
          <span class="i8 mr5">*</span>
          <span>储备审核意见</span>
        </div>
        <div class="ww100 flex-ss c6">{{ publicStore.form.reserve_res?publicStore.form.reserve_res:'暂无' }}</div>
      </div>
    </div>
    <!-- 审核储备 -->
    <div class="layout-col" v-if="route.query.action == '019c041a-9f8c-7e9e-91eb-0ae051e6f324'">
      <el-form class="ww100" ref="formRef" :model="publicStore.form" :rules="ruleList" label-width="0" :disabled="props.isReadonly">
        <div class="flex-sc warp ww100">
          <div class="ww100 mb15 flex-sc">
            <span class="i8 mr5">*</span>
            <span>储备审核意见</span>
          </div>
          <el-form-item label="" prop="reserve_res" class="ww100 flex-ss" :rules="[{ required: true, message: '请输入', trigger: 'blur' }]">
            <el-input size="large" v-model="publicStore.form.reserve_res" style="width: 100%;" type="textarea" :rows="10" placeholder="请输入" />
          </el-form-item>
        </div>
      </el-form>
      <div class="flex-sc">
        <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" @click.stop="onSave(formRef, '1')">通 过</div>
        <div class="plr14 ptb5 rad4 ml15 cursor white bgi8 bo-i8-1" @click.stop="onSave(formRef, '2')">驳 回</div>
      </div>
    </div>
    <!-- 审核推送 -->
    <div class="layout-col" v-if="route.query.action == '019c03f8-971e-72a5-8dc3-82f1a1fc2758'">
      <div class="ww100 mb15">
         <el-button color="#266FFF" class="ww100 white" @click="showAudit = !showAudit">{{ showAudit ? '收起审核意见' : '填写审核意见' }}</el-button>
      </div>
      
      <div v-if="showAudit">
        <div class="ww100 mb15 flex-bc">
          <div class="flex-sc">
            <span class="i8 mr5">*</span>
            <span>推送审核流程</span>
          </div>
        </div>

        <!-- 区级卡片 -->
        <div class="audit-card mb15 p10 rad4 bo-cc-1" v-if="canShow(4)">
          <div class="card-header flex-bc mb10">
            <span class="f14 fw c-blue">区级</span>
            <span class="f12" :class="getStatusClass(publicStore.form.push_status)">{{ getStatusText(publicStore.form.push_status) }}</span>
          </div>
          <div class="card-content">
            <template v-if="canEdit(4)">
              <el-input v-model="auditRes.district" type="textarea" :rows="3" placeholder="请输入意见" class="mb10" />
              <div class="flex-bc">
                <el-button size="small" @click="handleAuditSave(4)">保存</el-button>
                <div>
                  <el-button size="small" type="danger" @click="handleAuditSubmit(4, 2)">驳回</el-button>
                  <el-button size="small" type="primary" @click="handleAuditSubmit(4, 1)">通过</el-button>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="f12 c6">
                <div class="mb5">审核人：{{ userMap[publicStore.form.push_user] || '-' }}</div>
                <div class="mb5">时间：{{ publicStore.form.push_time || '-' }}</div>
                <div>意见：{{ publicStore.form.push_res || '-' }}</div>
              </div>
            </template>
          </div>
        </div>

        <!-- 市级卡片 -->
        <div class="audit-card mb15 p10 rad4 bo-cc-1" v-if="canShow(3)">
          <div class="card-header flex-bc mb10">
            <span class="f14 fw c-green">市级</span>
            <span class="f12" :class="getStatusClass(publicStore.form.push_status2)">{{ getStatusText(publicStore.form.push_status2) }}</span>
          </div>
          <div class="card-content">
            <template v-if="canEdit(3)">
              <el-input v-model="auditRes.city" type="textarea" :rows="3" placeholder="请输入意见" class="mb10" />
              <div class="flex-bc">
                <el-button size="small" @click="handleAuditSave(3)">保存</el-button>
                <div>
                  <el-button size="small" type="danger" @click="handleAuditSubmit(3, 2)">驳回</el-button>
                  <el-button size="small" type="primary" @click="handleAuditSubmit(3, 1)">通过</el-button>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="f12 c6">
                <div class="mb5">审核人：{{ userMap[publicStore.form.push_user2] || '-' }}</div>
                <div class="mb5">时间：{{ publicStore.form.push_time2 || '-' }}</div>
                <div>意见：{{ publicStore.form.push_res2 || '-' }}</div>
              </div>
            </template>
          </div>
        </div>

        <!-- 省级卡片 -->
        <div class="audit-card mb15 p10 rad4 bo-cc-1" v-if="canShow(2)">
          <div class="card-header flex-bc mb10">
            <span class="f14 fw c-orange">省级</span>
            <span class="f12" :class="getStatusClass(publicStore.form.push_status3)">{{ getStatusText(publicStore.form.push_status3) }}</span>
          </div>
          <div class="card-content">
            <template v-if="canEdit(2)">
              <el-input v-model="auditRes.province" type="textarea" :rows="3" placeholder="请输入意见" class="mb10" />
              <div class="flex-bc">
                <el-button size="small" @click="handleAuditSave(2)">保存</el-button>
                <div>
                  <el-button size="small" type="danger" @click="handleAuditSubmit(2, 2)">驳回</el-button>
                  <el-button size="small" type="primary" @click="handleAuditSubmit(2, 1)">通过</el-button>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="f12 c6">
                <div class="mb5">审核人：{{ userMap[publicStore.form.push_user3] || '-' }}</div>
                <div class="mb5">时间：{{ publicStore.form.push_time3 || '-' }}</div>
                <div>意见：{{ publicStore.form.push_res3 || '-' }}</div>
              </div>
            </template>
          </div>
        </div>
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
  const state = reactive({
	  ...publicStore.$state,
  })

  const props = defineProps({
    state: {
      type: [Object, Array],
      default: ()=>{return {}}
    },
  })

  // 1. 先定义响应式数据 (提升到顶部)
  let tabKey = $ref('key')
  const checkPage = reactive({ page: 1, limit: 10, total: 0 })
  const keyPage = reactive({ page: 1, limit: 10, total: 0 })
  
  // 使用 publicStore._public 来共享数据，确保 step2 和 step3 数据同步
  if (!publicStore._public.checkTasks) publicStore._public.checkTasks = [{
    type: '',
    indicator: '',
    problem: '',
    range: '',
    content: '',
    indicatorOptions: [],
    problemOptions: []
  }]
  if (!publicStore._public.keyTasks) publicStore._public.keyTasks = [{ 
    task_type: '', 
    construct_content: '', 
    construct_scale: '', 
    t2026: '', 
    t2027: '',
    t2028: ''
  }]
  if (!publicStore._public.timelineRows) publicStore._public.timelineRows = [
    { year: '2026', desc: '', investment: '' },
    { year: '2027', desc: '', investment: '' },
    { year: '2028', desc: '', investment: '' },
  ]

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
  let projectRef = $ref()
  let formRef = ref()
  let ruleList= $ref({})

  // 新增：推送审核相关逻辑
  const showAudit = ref(false)
  const auditRes = reactive({
    district: '',
    city: '',
    province: ''
  })

  const userMap = reactive({})

  const fetchAuditUsers = async () => {
    const ids = [
      publicStore.form.push_user,
      publicStore.form.push_user2,
      publicStore.form.push_user3
    ].filter(id => id && id !== '0' && id !== 0)
    
    if (ids.length === 0) return
    const uniqueIds = [...new Set(ids)]
    const args = `id in ('${uniqueIds.join("','")}')`
    const res = await api.Api({ model: 't_user', args: args })
    if (res && res.code == 200 && res.data) {
       res.data.forEach(u => {
         userMap[u.id] = proxy.decrypt(u.name)
       })
    }
  }

  watch(() => publicStore.form, (val) => {
    if (val) {
      auditRes.district = val.push_res || ''
      auditRes.city = val.push_res2 || ''
      auditRes.province = val.push_res3 || ''
      fetchAuditUsers()
    }
  }, { deep: true, immediate: true })

  const canShow = (level) => {
    const roleId = Number(configStore.user.role_id)
    if (roleId === 4) return level === 4
    if (roleId === 3) return level >= 3
    if (roleId === 2) return level >= 2
    return false
  }

  const canEdit = (level) => {
    const roleId = Number(configStore.user.role_id)
    // 只要是对应层级的用户，就始终可以编辑自己的审核框
    // 下级状态不影响上级编辑权限
    return roleId === level
  }

  const getStatusText = (status) => {
    if (status == '1') return '通过'
    if (status == '2') return '驳回'
    return '待审核'
  }

  const getStatusClass = (status) => {
    if (status == '1') return 'c-green'
    if (status == '2') return 'c-red'
    return 'c-orange'
  }

  const handleAuditSave = async (level) => {
    const updateData: any = { id: publicStore.form.id }
    if (level === 4) updateData.push_res = auditRes.district
    if (level === 3) updateData.push_res2 = auditRes.city
    if (level === 2) updateData.push_res3 = auditRes.province
    
    // 使用 api 直接请求
    let res = await api.updApi({ model: 't_project_report', list: [updateData] })
    if (res && res.code == 200) {
      ElNotification({ title: '提示', message: '意见已保存', type: 'success' })
      // 更新本地 form
      if (level === 4) publicStore.form.push_res = auditRes.district
      if (level === 3) publicStore.form.push_res2 = auditRes.city
      if (level === 2) publicStore.form.push_res3 = auditRes.province
    } else {
      ElNotification({ title: '提示', message: '保存失败', type: 'error' })
    }
  }



  const onSave = (formEl, status, isPushAudit = false) => {
    // 构造一个模拟的 validation 方法，如果 formEl 不存在（例如在 stepFoot 中没有对应的 form ref）
    const validate = formEl ? formEl.validate : (cb) => cb(true)
    
    validate(async valid => {
      if (valid) {
        const executeSave = async () => {
          // 防干扰
          let form = JSON.parse(JSON.stringify(publicStore.form)) 
          // 当前时间
          let nowtime = Date.now() + ''
          // 更新时间
          form.update_time = nowtime
          // 判断新增与编辑
          let apikey = form.id?'updApi':'addApi'
          //这里需要判断到哪一个步骤 全局标志符
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
          // 3.更新信息
          if(route.query.action == '1f10502a-e388-6850-8aa3-265c92863866'){
              if(form.apply_status > '1') {
              console.log("更新信息")
            }else{
              console.log('状态错误3')
            }
          }
          // 4储备审批操作
          if(route.query.action== '019c041a-9f8c-7e9e-91eb-0ae051e6f324'){
            if(form.reserve_status == '0' && (!form.push_status || form.push_status == '0' || form.push_status == '-1')){
              console.log("审批储备")
              if(form.apply_status == '0' || form.apply_status == '3') {
                if(status == '1') {
                  form.apply_status = '1'
                  form.apply_time = nowtime
                }
              }else{
                form.reserve_status = status
                form.reserve_time = nowtime
                if(status == '1') {
                  form.apply_status = '2'
                  form.push_status = '-1'
                }
                if(status == '2') {
                  form.apply_status = '3'
                  form.push_status = '-1'
                }
              }
            }else{
              console.log('状态错误4')
            }
          }
          // 5推送审核操作
          if(route.query.action == '019c03f8-971e-72a5-8dc3-82f1a1fc2758'){
            const roleId = configStore.user.role_id
            const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
            const userId = configStore.user.id
            const statusStr = String(status)

            if (roleId == '4') { // District
               // 如果是初次提交(0)或者驳回后重新提交，或者就是单纯的更新状态
               // 这里我们不再限制 push_status == '0'，允许重复提交/修改意见
               form.push_status = statusStr
               form.push_time = now
               form.push_user = userId
               form.push_res = auditRes.district || (status == '1' ? '通过' : '驳回')
               
               if (status == '2') {
                   form.push_status2 = '0'; form.push_time2 = null; form.push_res2 = null; form.push_user2 = null;
                   form.push_status3 = '0'; form.push_time3 = null; form.push_res3 = null; form.push_user3 = null;
               }
            }
            else if (roleId == '3') { // City
               form.push_status2 = statusStr
               form.push_time2 = now
               form.push_user2 = userId
               form.push_res2 = auditRes.city || (status == '1' ? '通过' : '驳回')
               if (status == '2') {
                   form.push_status3 = '0'; form.push_time3 = null; form.push_res3 = null; form.push_user3 = null;
               }
            }
            else if (roleId == '2') { // Province
               form.push_status3 = statusStr
               form.push_time3 = now
               form.push_user3 = userId
               form.push_res3 = auditRes.province || (status == '1' ? '通过' : '驳回')
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
        }

        if (isPushAudit) {
          executeSave()
        } else {
          ElMessageBox.confirm('是否确定操作继续', '温馨提示', {confirmButtonText: '确定', cancelButtonText: '关闭', type: 'warn'}).then(executeSave)
        }
      }
    })
  }

  const handleAuditSubmit = async (level, status) => {
    ElMessageBox.confirm('是否确定提交审核结果？', '提示', {confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'}).then(async () => {
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
      const user = configStore.user.id
      const resText = level===4 ? auditRes.district : (level===3 ? auditRes.city : auditRes.province)
      const finalRes = resText || (status === 1 ? '通过' : '驳回')
      const statusStr = String(status)

      if (level === 4) {
        publicStore.form.push_status = statusStr
        publicStore.form.push_time = now
        publicStore.form.push_user = user
        publicStore.form.push_res = finalRes
        if (status === 2) {
          publicStore.form.push_status2 = '0'; publicStore.form.push_time2 = null; publicStore.form.push_res2 = null; publicStore.form.push_user2 = null;
          publicStore.form.push_status3 = '0'; publicStore.form.push_time3 = null; publicStore.form.push_res3 = null; publicStore.form.push_user3 = null;
        }
      }
      if (level === 3) {
        publicStore.form.push_status2 = statusStr
        publicStore.form.push_time2 = now
        publicStore.form.push_user2 = user
        publicStore.form.push_res2 = finalRes
        if (status === 2) {
          publicStore.form.push_status3 = '0'; publicStore.form.push_time3 = null; publicStore.form.push_res3 = null; publicStore.form.push_user3 = null;
        }
      }
      if (level === 2) {
        publicStore.form.push_status3 = statusStr
        publicStore.form.push_time3 = now
        publicStore.form.push_user3 = user
        publicStore.form.push_res3 = finalRes
      }
      
      // 调用 onSave，传入 dummy form 和 isPushAudit=true
      // 注意：这里没有真实的 formEl，所以验证会直接通过，主要利用 onSave 的保存逻辑
      onSave(null, status, true)
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
 console.log("projectId", projectId)
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

.audit-card {
  border: 1px solid #dcdfe6;
  background-color: #fff;
  transition: all .3s;
  &:hover {
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
  }
}
.level-tag {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  &.level-district { background: #ecf5ff; color: #409eff; }
  &.level-city { background: #f0f9eb; color: #67c23a; }
  &.level-province { background: #fdf6ec; color: #e6a23c; }
}
.c-blue { color: #409eff; }
.c-green { color: #67c23a; }
.c-red { color: #f56c6c; }
.c-orange { color: #e6a23c; }
</style>
  