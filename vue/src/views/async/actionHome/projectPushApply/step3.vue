<template>
  <div class="layout-col overlay">
    <div class="hh100 ww100 flex-sc warp">
      <el-form class="ww100 pplr15" ref="formRef" :model="publicStore.form" :rules="ruleList" label-width="120" :disabled="props.isReadonly">
        <div class="flex-sc warp ww100">
          <el-form-item label="项目状态" prop="completion_status" class="ww50 flex-sc">
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
              <FileList v-if="publicStore.form?.has_attr" v-model:files="publicStore.form.has_attr" :plans="props.plans" :contents="props.contents" :active="props.active"  />
            </div>
          </el-form-item>
          <!--暂时不用 不知道什么时候需要 <el-form-item label="实施成效材料上传" prop="effect_attr" class="ww100 flex-ss">
            <div class="ww100 plr30 ptb22 bo-i16-1 rad8 bg-white">
              <FileList v-if="publicStore.form?.effect_attr" v-model:files="publicStore.form.effect_attr" :plans="props.plans" :contents="props.contents" :active="props.active"  />
            </div>
          </el-form-item> -->
          <el-form-item label="审核结果" prop="reserve_res" class="ww100 flex-ss">
            <el-input size="large" v-model="publicStore.form.reserve_res" style="width: 100%;" type="textarea" :rows="4" placeholder="请输入" />
          </el-form-item>
        </div>
      </el-form>
      <div class="ww100 flex-cc f18 p40 bot-i16-1 mt20">
        <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" @click.stop="publicStore.actIndex--">上一步</div>
        <template v-if="!props.isReadonly">
          <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" v-if="route.query.action == '1f10502a-e388-6850-8aa3-265c92863865'" @click.stop="onSave(formRef, '1')">更 新</div>
          <div class="flex-sc" v-else>
            <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" @click.stop="onSave(formRef, '1')">通 过</div>
            <div class="plr14 ptb5 rad4 ml15 cursor white bgi8 bo-i8-1" @click.stop="onSave(formRef, '2')">驳 回</div>
          </div>
        </template>
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
  let projectRef = $ref()
  let formRef = ref()
  let ruleList= $ref({
    completion_status: [{ required: true, message: '请选择', trigger: 'blur' }],
    reserve_res: [{ required: true, message: '请输入', trigger: 'blur' }],
  })
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
  })

  const checkTasks = $ref([
    { type: '危险性排查', indicator: 'DR设备检定完成', problem: '部分设备未完成检定，影响年度达标', content: '整改10条' },
    { type: '危险性排查', indicator: 'CB设备检定完成', problem: '检定记录缺失，需补录并复核', content: '整改10条' },
    { type: '危险性排查', indicator: '住宅隐患排查（车东米）', problem: '老旧小区隐患较多，需分批治理', content: '整改10条' },
  ])
  const keyTasks = $ref([
    { task_type: '危险性改造', construct_content: 'DR设备检定改造（套）', construct_scale: '10', t2026: '10', t2027: '' },
    { task_type: '危险性改造', construct_content: 'CB设备检定改造（套）', construct_scale: '10', t2026: '10', t2027: '' },
    { task_type: '民住改造', construct_content: '居住隐患改造（车东米）', construct_scale: '10', t2026: '10', t2027: '' },
  ])
  const timelineRows = $ref([
    { year: '2026', desc: '', investment: '' },
    { year: '2027', desc: '', investment: '' },
    { year: '2028', desc: '', investment: '' },
  ])

  const onSave = (formEl, status) => {
    console.log("sssxxx")
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
            // 3.更新信息
            if(route.query.action == '1f10502a-e388-6850-8aa3-265c92863865'){
               if(form.apply_status == '1') {
                console.log("更新信息")
              }else{
                console.log('状态错误3')
              }
            }
            // 4储备审批操作
            if(route.query.action== '019c041a-9f8c-7e9e-91eb-0ae051e6f324'){
              if(form.apply_status == '1' && form.reserve_status == '0' && form.push_status == '0'){
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
              if(form.apply_status == '1' && form.reserve_status == '1' && form.push_status == '0'){
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
            Object.keys(form.attr).forEach((key:any)=>{
              if(form.attr[key].data && form.attr[key].data.indexOf('/uploads')!=-1){
                let content = publicStore._public.contents1.find(a=>a.type == key)
                if(content){
                  const newfile = `${content.parent_type}/${form.id}_${key}_${form.attr[key]['name']}`
                  form.attr[key].data = newfile
                  changeFile1.push({oldfile: publicStore.form.attr[key].data, newfile: newfile})
                }
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
                if(content){
                  const newfile = `${content.parent_type}/${form.id}_${key}_${form.plan_attr[key]['name']}`
                  form.plan_attr[key].data = newfile
                  changeFile2.push({oldfile: publicStore.form.plan_attr[key].data, newfile: newfile})
                }
              }
            })
            form.plan_attr = JSON.stringify(form.plan_attr)
          }else{
            form.plan_attr = ''
          }
          // 过程文件
          let changeFile3 = []
          if(!proxy.isNull(form.has_attr)){
            Object.keys(form.has_attr).forEach((key:any)=>{
              if(form.has_attr[key].data && form.has_attr[key].data.indexOf('/uploads')!=-1){
                let content = publicStore._public.contents2.find(a=>a.type == key)
                if(content){
                  const newfile = `${content.parent_type}/${form.id}_${key}_${form.has_attr[key]['name']}`
                  form.has_attr[key].data = newfile
                  changeFile3.push({oldfile: publicStore.form.has_attr[key].data, newfile: newfile})
                }
              }
            })
            form.has_attr = JSON.stringify(form.has_attr)
          }else{
            form.has_attr = ''
          }
          // 实施成效文件
          let changeFile4 = []
          if(!proxy.isNull(form.effect_attr)){
            Object.keys(form.effect_attr).forEach((key:any)=>{
              if(form.effect_attr[key].data && form.effect_attr[key].data.indexOf('/uploads')!=-1){
                let content = publicStore._public.contents2.find(a=>a.type == key)
                const newfile = `${content.parent_type}/${form.id}_${key}_${form.effect_attr[key]['name']}`
                form.effect_attr[key].data = newfile
                changeFile4.push({oldfile: publicStore.form.effect_attr[key].data, newfile: newfile})
              }
            })
            form.effect_attr = JSON.stringify(form.effect_attr)
          }else{
            form.effect_attr = ''
          }

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
    if (!form.scheme_id) {
      console.warn('saveThreeTables: scheme_id is missing')
      return
    }
    const schemeId = form.scheme_id
    const userId = configStore.user.id
    const userName = configStore.user.name
    const commonFields = {
      scheme_id: schemeId,
      user_id: userId,
      user_name: userName,
      province: form.province,
      city: form.city,
      district: form.district,
      province_name: form.province_name,
      city_name: form.city_name,
      district_name: form.district_name,
    }

    // 准备批量操作数组
    const ops = {
      schemeTask: { add: [], upd: [], del: [] },
      projectTask: { add: [], upd: [], del: [] }, // 年度目标 + 时序
      problemResult: { add: [], upd: [], del: [] },
      problemItem: { add: [], upd: [], del: [] },
      problemLog: { add: [], upd: [], del: [] },
    }

    // 按 op/id 分流
    const categorize = (target, row, data) => {
      if (row.op === 'delete') {
        if (row.id) target.del.push({ id: row.id })
      } else if (row.id || row.op === 'edit') {
        target.upd.push({ ...data, id: row.id })
      } else {
        target.add.push({ ...data, id: uuidv6() })
      }
    }

    // 1. 重点落实任务 + 年度目标
    if (keyTasks && keyTasks.length > 0) {
      keyTasks.forEach(row => {
        // 重点落实任务主表
        categorize(ops.schemeTask, row, {
          ...commonFields,
          task_type: row.task_type,
          construct_content: row.construct_content,
          unit_target: row.construct_scale,
          scheme_name: form.plan_name || '',
          type: '1'
        })

        // 年度目标明细
        if (projectId) {
          ['t2026', 't2027', 't2028'].forEach(key => {
            if (row[key]) {
              const year = key.replace('t', '')
              ops.projectTask.add.push({
                id: uuidv6(),
                project_id: projectId,
                task_type: row.task_type,
                construct_content: row.construct_content,
                year: year,
                value: row[key]
              })
            }
          })
        }
      })
    }

    // 2. 体检任务三表
    if (checkTasks && checkTasks.length > 0) {
      checkTasks.forEach(row => {
        // 生成关联ID
        const resultId = row.resultId || uuidv6()
        const itemId = row.itemId || uuidv6()
        const logId = row.logId || uuidv6()

        // 指标结果
        categorize(ops.problemResult, row, {
          ...commonFields,
          id: resultId,
          class: row.type,
          name: row.indicator
        })

        // 问题项
        categorize(ops.problemItem, row, {
          ...commonFields,
          id: itemId,
          problem_id: resultId,
          problem_content: row.problem
        })

        // 整改日志
        categorize(ops.problemLog, row, {
          ...commonFields,
          id: logId,
          parent_id: itemId,
          msg: row.content
        })
      })
    }

    // 3. 时序管理
    if (timelineRows && timelineRows.length > 0 && projectId) {
      timelineRows.forEach(row => {
        if (row.desc || row.investment) {
          categorize(ops.projectTask, row, {
            id: row.id,
            project_id: projectId,
            year: row.year,
            construct_content: row.desc,
            value: row.investment
          })
        }
      })
    }

    // 执行批量保存
    const runApi = async (model, opData) => {
      try {
        if (opData.add.length > 0) await api.addApi({ model, list: opData.add })
        if (opData.upd.length > 0) await api.updApi({ model, list: opData.upd })
        if (opData.del.length > 0) await api.delApi({ model, list: opData.del })
      } catch (e) {
        console.error(`Failed to save ${model}`, e)
        ElNotification({ title: '错误', message: `保存 ${model} 失败`, type: 'error' })
      }
    }

    await runApi('t_scheme_task', ops.schemeTask)
    await runApi('t_project_task', ops.projectTask)
    await runApi('t_scheme_problem_result', ops.problemResult)
    await runApi('t_scheme_problem_item', ops.problemItem)
    await runApi('t_scheme_problem_log', ops.problemLog)
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
  