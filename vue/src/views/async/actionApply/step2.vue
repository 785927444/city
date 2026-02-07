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
          <el-form-item label="实施方案文件上传" prop="files2" class="ww100 flex-ss">
            <div class="ww100 plr30 ptb22 bo-i16-1 rad8 bg-white">
              <FileList v-if="publicStore.form?.plan_attr" v-model:files="publicStore.form.plan_attr" :plans="props.plans" :contents="props.contents" :active="props.active"  />
            </div>
            </el-form-item>
        </div>
      <div class="ww100 white-rgba50 rad8 p15 mt16">
        <div class="flex-sc f18 plr10">
          <span>项目任务</span>
        </div>
        <div class="ww100 flex-sc pb20 mt10">
          <div class="mr40 pb10 f18 relative cursor actfont" :class="tabKey==='key'?'i1 bob-i1-2':'bob-tt-2'" @click.stop="tabKey='key'">
            <span>重点落实任务</span>
          </div>
          <div class="mr40 pb10 f18 relative cursor actfont" :class="tabKey==='check'?'i1 bob-i1-2':'bob-tt-2'" @click.stop="tabKey='check'">
            <span>体检整改任务</span>
          </div>
        </div>
        <div v-show="tabKey==='check'" class="layout-col white-rgba50 rad8 p15">
          <el-table
            header-cell-class-name="bgi16 c3"
            :cell-style="{'background-color': '#FFFFFF', 'color': '#626366'}"
            border
            empty-text="暂无数据"
            :data="checkTasksPage"
            stripe
            @selection-change="onCheckSelChange">
            <el-table-column type="selection" width="60" />
            <el-table-column type="index" label="序号" align="center" width="60" />
            <el-table-column prop="type" label="体检类型" align="center" width="140">
              <template #default="scope">
                <el-input v-model="scope.row.type" size="small" />
              </template>
            </el-table-column>
            <el-table-column prop="indicator" label="指标项" align="center" width="200">
              <template #default="scope">
                <el-input v-model="scope.row.indicator" size="small" />
              </template>
            </el-table-column>
            <el-table-column prop="problem" label="存在问题">
              <template #default="scope">
                <el-input v-model="scope.row.problem" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="100">
              <template #default="scope"><span class="i1 cursor" @click.stop="onChoose(scope.row)">选择</span></template>
            </el-table-column>
            <el-table-column label="内容" align="center" width="140">
              <template #default="scope">
                <el-input v-model="scope.row.content" size="small" />
              </template>
            </el-table-column>
          </el-table>
          <div class="ww100 flex-cc mt10"><span class="i1 cursor" @click.stop="onAddCheckTask">添加+</span></div>
          <div class="ww100 flex-sb mt10">
            <div class="flex-sc">
              <div class="rad4 ptb5 plr15 cursor bo-c8-1 c8 mr10" @click.stop="onCheckSelectAll">全选</div>
              <div class="rad4 ptb5 plr15 cursor bgi13 i15 mr10" @click.stop="onCheckDelete">删除</div>
              <div class="rad4 ptb5 plr15 cursor bgi10 i12 mr10" @click.stop="onCheckImport">导入</div>
            </div>
            <el-pagination
              layout="prev, pager, next"
              :page-count="5"
              :page-size="checkPage.limit"
              :current-page="checkPage.page"
              @current-change="p=>{checkPage.page=p}">
            </el-pagination>
          </div>
        </div>
        <div v-show="tabKey==='key'" class="layout-col white-rgba50 rad8 p15">
          <el-table
            header-cell-class-name="bgi16 c3"
            :cell-style="{'background-color': '#FFFFFF', 'color': '#626366'}"
            border
            empty-text="暂无数据"
            :data="keyTasksPage"
            stripe
            @selection-change="onKeySelChange">
            <el-table-column type="selection" width="60" />
            <el-table-column type="index" label="序号" align="center" width="60" />
            <el-table-column prop="task_type" label="任务类型" align="center" width="140">
              <template #default="scope">
                <el-input v-model="scope.row.task_type" size="small" />
              </template>
            </el-table-column>
            <el-table-column prop="construct_content" label="建设内容">
              <template #default="scope">
                <el-input v-model="scope.row.construct_content" size="small" />
              </template>
            </el-table-column>
            <el-table-column prop="construct_scale" label="建设规模" align="center" width="120">
              <template #default="scope">
                <el-input v-model="scope.row.construct_scale" size="small" />
              </template>
            </el-table-column>
            <el-table-column prop="t2026" label="2026年目标" align="center" width="120">
              <template #default="scope">
                <el-input v-model="scope.row.t2026" size="small" />
              </template>
            </el-table-column>
            <el-table-column prop="t2027" label="2027年目标" align="center" width="120">
              <template #default="scope">
                <el-input v-model="scope.row.t2027" size="small" />
              </template>
            </el-table-column>
          </el-table>
          <div class="ww100 flex-se mt10">
            <div></div>
            <div class="i1 cursor" @click.stop="onAddYear">添加年度</div>
          </div>
          <div class="ww100 flex-sb mt10">
            <div class="flex-sc">
              <div class="rad4 ptb5 plr15 cursor bo-c8-1 c8 mr10" @click.stop="onKeySelectAll">全选</div>
              <div class="rad4 ptb5 plr15 cursor bgi13 i15 mr10" @click.stop="onKeyDelete">删除</div>
              <div class="rad4 ptb5 plr15 cursor bgi10 i12 mr10" @click.stop="onKeyImport">导入</div>
            </div>
            <el-pagination
              layout="prev, pager, next"
              :page-count="5"
              :page-size="keyPage.limit"
              :current-page="keyPage.page"
              @current-change="p=>{keyPage.page=p}">
            </el-pagination>
          </div>
        </div>
      </div>
      <div class="ww100 white-rgba50 rad8 p15 mt16">
        <div class="flex-sc f18 plr10">
          <span>时序管理</span>
        </div>
        <div class="layout-col white-rgba50 rad8 p15 mt10">
          <el-table
            header-cell-class-name="bgi16 c3"
            :cell-style="{'background-color': '#FFFFFF', 'color': '#626366'}"
            border
            empty-text="暂无数据"
            :data="timelineRows"
            stripe>
            <el-table-column type="index" label="序号" align="center" width="80" />
            <el-table-column prop="year" label="年度" align="center" width="120" />
            <el-table-column prop="desc" label="阶段任务描述" />
            <el-table-column prop="investment" label="阶段投资" align="center" width="140" />
            <el-table-column label="操作" align="center" width="120">
              <template #default="scope"><span class="i1 cursor" @click.stop="onTimelineOp(scope.row)">查看</span></template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      </el-form>
      <div class="ww100 white-rgba50 rad8 p15 mt16">
        <div class="flex-sc f18 plr10">
          <span>项目任务</span>
        </div>
        <div class="ww100 flex-sc pb20 mt10">
          <div class="mr40 pb10 f18 relative cursor actfont" :class="tabKey==='key'?'i1 bob-i1-2':'bob-tt-2'" @click.stop="tabKey='key'">
            <span>重点落实任务</span>
          </div>
          <div class="mr40 pb10 f18 relative cursor actfont" :class="tabKey==='check'?'i1 bob-i1-2':'bob-tt-2'" @click.stop="tabKey='check'">
            <span>体检整改任务</span>
          </div>
        </div>
        <div v-show="tabKey==='check'" class="layout-col white-rgba50 rad8 p15">
          <el-table
            header-cell-class-name="bgi16 c3"
            :cell-style="{'background-color': '#FFFFFF', 'color': '#626366'}"
            border
            empty-text="暂无数据"
            :data="checkTasksPage"
            stripe
            @selection-change="onCheckSelChange">
            <el-table-column type="selection" width="60" />
            <el-table-column type="index" label="序号" align="center" width="60" />
            <el-table-column prop="type" label="体检类型" align="center" width="140">
              <template #default="scope">
                <el-input v-model="scope.row.type" size="small" />
              </template>
            </el-table-column>
            <el-table-column prop="indicator" label="指标项" align="center" width="200">
              <template #default="scope">
                <el-input v-model="scope.row.indicator" size="small" />
              </template>
            </el-table-column>
            <el-table-column prop="problem" label="存在问题">
              <template #default="scope">
                <el-input v-model="scope.row.problem" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="100">
              <template #default="scope"><span class="i1 cursor" @click.stop="onChoose(scope.row)">选择</span></template>
            </el-table-column>
            <el-table-column label="内容" align="center" width="140">
              <template #default="scope">
                <el-input v-model="scope.row.content" size="small" />
              </template>
            </el-table-column>
          </el-table>
          <div class="ww100 flex-cc mt10"><span class="i1 cursor" @click.stop="onAddCheckTask">添加+</span></div>
          <div class="ww100 flex-sb mt10">
            <div class="flex-sc">
              <div class="rad4 ptb5 plr15 cursor bo-c8-1 c8 mr10" @click.stop="onCheckSelectAll">全选</div>
              <div class="rad4 ptb5 plr15 cursor bgi13 i15 mr10" @click.stop="onCheckDelete">删除</div>
              <div class="rad4 ptb5 plr15 cursor bgi10 i12 mr10" @click.stop="onCheckImport">导入</div>
            </div>
            <el-pagination
              layout="prev, pager, next"
              :page-count="5"
              :page-size="checkPage.limit"
              :current-page="checkPage.page"
              @current-change="p=>{checkPage.page=p}">
            </el-pagination>
          </div>
        </div>
        <div v-show="tabKey==='key'" class="layout-col white-rgba50 rad8 p15">
          <el-table
            header-cell-class-name="bgi16 c3"
            :cell-style="{'background-color': '#FFFFFF', 'color': '#626366'}"
            border
            empty-text="暂无数据"
            :data="keyTasksPage"
            stripe
            @selection-change="onKeySelChange">
            <el-table-column type="selection" width="60" />
            <el-table-column type="index" label="序号" align="center" width="60" />
            <el-table-column prop="task_type" label="任务类型" align="center" width="140">
              <template #default="scope">
                <el-input v-model="scope.row.task_type" size="small" />
              </template>
            </el-table-column>
            <el-table-column prop="construct_content" label="建设内容">
              <template #default="scope">
                <el-input v-model="scope.row.construct_content" size="small" />
              </template>
            </el-table-column>
            <el-table-column prop="construct_scale" label="建设规模" align="center" width="120">
              <template #default="scope">
                <el-input v-model="scope.row.construct_scale" size="small" />
              </template>
            </el-table-column>
            <el-table-column prop="t2026" label="2026年目标" align="center" width="120">
              <template #default="scope">
                <el-input v-model="scope.row.t2026" size="small" />
              </template>
            </el-table-column>
            <el-table-column prop="t2027" label="2027年目标" align="center" width="120">
              <template #default="scope">
                <el-input v-model="scope.row.t2027" size="small" />
              </template>
            </el-table-column>
          </el-table>
          <div class="ww100 flex-se mt10">
            <div></div>
            <div class="i1 cursor" @click.stop="onAddYear">添加年度</div>
          </div>
          <div class="ww100 flex-sb mt10">
            <div class="flex-sc">
              <div class="rad4 ptb5 plr15 cursor bo-c8-1 c8 mr10" @click.stop="onKeySelectAll">全选</div>
              <div class="rad4 ptb5 plr15 cursor bgi13 i15 mr10" @click.stop="onKeyDelete">删除</div>
              <div class="rad4 ptb5 plr15 cursor bgi10 i12 mr10" @click.stop="onKeyImport">导入</div>
            </div>
            <el-pagination
              layout="prev, pager, next"
              :page-count="5"
              :page-size="keyPage.limit"
              :current-page="keyPage.page"
              @current-change="p=>{keyPage.page=p}">
            </el-pagination>
          </div>
        </div>
      </div>
      <div class="ww100 white-rgba50 rad8 p15 mt16">
        <div class="flex-sc f18 plr10">
          <span>时序管理</span>
        </div>
        <div class="layout-col white-rgba50 rad8 p15 mt10">
          <el-table
            header-cell-class-name="bgi16 c3"
            :cell-style="{'background-color': '#FFFFFF', 'color': '#626366'}"
            border
            empty-text="暂无数据"
            :data="timelineRows"
            stripe>
            <el-table-column type="index" label="序号" align="center" width="80" />
            <el-table-column prop="year" label="年度" align="center" width="120" />
            <el-table-column prop="desc" label="阶段任务描述" />
            <el-table-column prop="investment" label="阶段投资" align="center" width="140" />
            <el-table-column label="操作" align="center" width="120">
              <template #default="scope"><span class="i1 cursor" @click.stop="onTimelineOp(scope.row)">查看</span></template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <div class="ww100 flex-cc f18 p40 bot-i16-1 mt20">
        <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" @click.stop="publicStore.actIndex--">上一步</div>
        <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" @click.stop="onSave(formRef)" v-if="publicStore.title!='reserve'">保 存</div>
        <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" @click.stop="publicStore.actIndex++" v-if="publicStore.title=='reserve'">下一步</div>
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
    plans: {
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
<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
            console.log("新增项目")
            // 编号规则
>>>>>>> Stashed changes
=======
            console.log("新增项目")
            // 编号规则
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
              console.log("申请储备")
>>>>>>> Stashed changes
=======
              console.log("申请储备")
>>>>>>> Stashed changes
              form.apply_status = '1'
              form.apply_time = nowtime
            }
            // 2.2更新信息
            if(form.apply_status = '1'){
<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
              console.log("更新信息")
>>>>>>> Stashed changes
=======
              console.log("更新信息")
>>>>>>> Stashed changes
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
              let message = apikey == 'updApi'? '操作成功' : '保存成功'
              ElNotification({ title: '提示', message: message, type: 'success' })
              // 转移基础文件
              if(!proxy.isNull(changeFile1)) setChangeFile(changeFile1)
              // 转移方案文件
              if(!proxy.isNull(changeFile2)) setChangeFile(changeFile2)
              // 三表保存逻辑
              const reportId = await resolveReportId(res, form.id)
              await saveThreeTables(form, reportId)
<<<<<<< Updated upstream
<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  let tabKey = $ref('key')
  const checkPage = reactive({ page: 2, limit: 10, total: 30 })
  const keyPage = reactive({ page: 2, limit: 10, total: 30 })
  const checkTasks = $ref([
    { type: '危险性排查', indicator: 'DR设备检定完成', problem: '部分设备未完成检定，影响年度达标', content: '整改10条' },
    { type: '危险性排查', indicator: 'CB设备检定完成', problem: '检定记录缺失，需补录并复核', content: '整改10条' },
    { type: '危险性排查', indicator: '住宅隐患排查（车东米）', problem: '老旧小区隐患较多，需分批治理', content: '整改10条' },
  ])
  const checkTasksPage = computed(() => checkTasks)
  const keyTasks = $ref([
    { task_type: '危险性改造', construct_content: 'DR设备检定改造（套）', construct_scale: '10', t2026: '10', t2027: '' },
    { task_type: '危险性改造', construct_content: 'CB设备检定改造（套）', construct_scale: '10', t2026: '10', t2027: '' },
    { task_type: '民住改造', construct_content: '居住隐患改造（车东米）', construct_scale: '10', t2026: '10', t2027: '' },
  ])
  const keyTasksPage = computed(() => keyTasks)
  let keySel = $ref([])
  let checkSel = $ref([])
  const onKeySelChange = (val) => { keySel = val }
  const onCheckSelChange = (val) => { checkSel = val }
  const onAddCheckTask = () => { checkTasks.push({ type: '危险性排查', indicator: '新增指标项', problem: '请填写问题描述', content: '整改' }) }
  const onCheckSelectAll = () => { checkSel = [...checkTasks] }
  const onCheckDelete = () => { checkTasks.splice(0, checkTasks.length, ...checkTasks.filter(a => !checkSel.includes(a))) }
  const onCheckImport = () => { checkTasks.push({ type: '危险性排查', indicator: '新增指标项', problem: '请填写问题描述', content: '整改' }) }
  const onChoose = (row) => {}
  const onViewRectify = (row) => {}
  const onAddYear = () => {}
  const onKeySelectAll = () => { keySel = [...keyTasks] }
  const onKeyDelete = () => { keyTasks.splice(0, keyTasks.length, ...keyTasks.filter(a => !keySel.includes(a))) }
  const onKeyImport = () => { keyTasks.push({ task_type: '新增任务类型', construct_content: '请输入建设内容', construct_scale: '', t2026: '', t2027: '' }) }
  const timelineRows = $ref([
    { year: '2026', desc: '', investment: '' },
    { year: '2027', desc: '', investment: '' },
    { year: '2028', desc: '', investment: '' },
  ])
  const onTimelineOp = (row) => {}
=======
=======
>>>>>>> Stashed changes
    let tabKey = $ref('key')
    const checkPage = reactive({ page: 2, limit: 10, total: 30 })
    const keyPage = reactive({ page: 2, limit: 10, total: 30 })
    const checkTasks = $ref([
      { type: '危险性排查', indicator: 'DR设备检定完成', problem: '部分设备未完成检定，影响年度达标', content: '整改10条' },
      { type: '危险性排查', indicator: 'CB设备检定完成', problem: '检定记录缺失，需补录并复核', content: '整改10条' },
      { type: '危险性排查', indicator: '住宅隐患排查（车东米）', problem: '老旧小区隐患较多，需分批治理', content: '整改10条' },
    ])
    const checkTasksPage = computed(() => checkTasks)
    const keyTasks = $ref([
      { task_type: '危险性改造', construct_content: 'DR设备检定改造（套）', construct_scale: '10', t2026: '10', t2027: '' },
      { task_type: '危险性改造', construct_content: 'CB设备检定改造（套）', construct_scale: '10', t2026: '10', t2027: '' },
      { task_type: '民住改造', construct_content: '居住隐患改造（车东米）', construct_scale: '10', t2026: '10', t2027: '' },
    ])
    const keyTasksPage = computed(() => keyTasks)
    let keySel = $ref([])
    let checkSel = $ref([])
    const onKeySelChange = (val) => { keySel = val }
    const onCheckSelChange = (val) => { checkSel = val }
    const onAddCheckTask = () => { checkTasks.push({ type: '危险性排查', indicator: '新增指标项', problem: '请填写问题描述', content: '整改' }) }
    const onCheckSelectAll = () => { checkSel = [...checkTasks] }
    const onCheckDelete = () => { checkTasks.splice(0, checkTasks.length, ...checkTasks.filter(a => !checkSel.includes(a))) }
    const onCheckImport = () => { checkTasks.push({ type: '危险性排查', indicator: '新增指标项', problem: '请填写问题描述', content: '整改' }) }
    const onChoose = (row) => {}
    const onViewRectify = (row) => {}
    const onAddYear = () => {}
    const onKeySelectAll = () => { keySel = [...keyTasks] }
    const onKeyDelete = () => { keyTasks.splice(0, keyTasks.length, ...keyTasks.filter(a => !keySel.includes(a))) }
    const onKeyImport = () => { keyTasks.push({ task_type: '新增任务类型', construct_content: '请输入建设内容', construct_scale: '', t2026: '', t2027: '' }) }
    const timelineRows = $ref([
      { year: '2026', desc: '', investment: '' },
      { year: '2027', desc: '', investment: '' },
      { year: '2028', desc: '', investment: '' },
    ])
    const onTimelineOp = (row) => {}
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
</script>
  
<style scoped lang="scss">
.bob-tt-2 { border-bottom: 2px solid transparent; }
.r-18{ right: -18px; }
.autoHeight{min-height: 100%; height: 3000px;}
</style>
  
