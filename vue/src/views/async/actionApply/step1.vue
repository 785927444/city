<template>
  <div class="layout-col overlay">
    <div class="hh100 ww100 flex-sc warp">
      <el-form class="ww100 pplr15" ref="formRef" :model="publicStore.form" :rules="ruleList" label-width="120">
        <div class="flex-sc warp ww100">
          <!-- 项目信息 -->
          <el-form-item label="项目信息" prop="" class="ww100 flex-sc">
            <div class="w50x3 tc rad3 ptb6 bgi1 white cursor" @click.stop="projectRef.onVisable(publicStore.form)">专项与片区项目库</div>
          </el-form-item>
          <!-- <el-form-item label="项目编号" prop="num" class="ww50 flex-sc" :rules="[{ required: true, message: '请输入', trigger: 'blur' }]">
            <el-input size="large" v-model="publicStore.form.num" placeholder="请输入" />
          </el-form-item> -->
          <el-form-item label="统一项目代码" prop="code" class="ww50 flex-sc">
            <el-input size="large" v-model="publicStore.form.code" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="项目名称" prop="name" class="ww50 flex-sc" :rules="[{ required: true, message: '请输入', trigger: 'blur' }]">
            <el-input size="large" v-model="publicStore.form.name" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="所属等级" prop="level" class="ww50 flex-sc" :rules="[{ required: true, message: '请选择', trigger: 'blur' }]">
            <el-select v-model="publicStore.form.level" placeholder="请选择" size="large" style="width:100%" filterable clearable>
              <el-option v-for="(v, i) in dictStore.levels||[]" :key="v.value" :value="String(v.value)" :label="v.name" />
            </el-select> 
          </el-form-item>  
          <el-form-item label="所属区域" prop="area" class="ww50 flex-sc" :rules="[{ required: true, message: '请输入', trigger: 'blur' }]">
            <el-cascader v-model="publicStore.form.area" size="large" :options="setAreaLevel(publicStore.form.level?publicStore.form.level:'') " :props="cascaderProps" placeholder="请选择" clearable style="width: 100%" />
          </el-form-item>
          <el-form-item label="所属专项规划" prop="parent_id" class="ww50 flex-sc">
            <el-select v-model="publicStore.form.parent_id" placeholder="请选择" size="large" style="width:100%" filterable clearable>
              <el-option v-for="(v, i) in publicStore._public?.schemePlans?publicStore._public.schemePlans:[]" :key="v.id" :value="String(v.id)" :label="v.name" />
            </el-select> 
          </el-form-item>
          <el-form-item label="所属片区策划" prop="parent_area" class="ww50 flex-sc">
            <el-select v-model="publicStore.form.parent_area" placeholder="请选择" size="large" style="width:100%" filterable clearable>
              <el-option v-for="(v, i) in publicStore._public?.schemeAreas?publicStore._public.schemeAreas:[]" :key="v.id" :value="String(v.id)" :label="v.name" />
            </el-select> 
          </el-form-item>
          <el-form-item label="建设单位" prop="construct_unit" class="ww50 flex-sc" :rules="[{ required: true, message: '请输入', trigger: 'blur' }]">
            <el-input size="large" v-model="publicStore.form.construct_unit" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="施工阶段" prop="completion_status" class="ww50 flex-sc">
            <el-select v-model="publicStore.form.completion_status" placeholder="请选择" size="large" style="width:100%" filterable clearable>
              <el-option v-for="(v, i) in dictStore.project_completion_statuss||[]" :key="v.value" :value="String(v.value)" :label="v.name" />
            </el-select> 
          </el-form-item> 
          <el-form-item label="主管单位" prop="construct_main" class="ww50 flex-sc" :rules="[{ required: true, message: '请输入', trigger: 'blur' }]">
            <el-input size="large" v-model="publicStore.form.construct_main" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="总投资" prop="construct_price" class="ww50 flex-sc" :rules="[{ required: true, message: '请输入', trigger: 'blur' }]">
            <el-input size="large" v-model="publicStore.form.construct_price" placeholder="请输入" />
          </el-form-item> 
          <el-form-item label="本年度计划投资" prop="estimate_year" class="ww50 flex-sc" :rules="[{ required: true, message: '请输入', trigger: 'blur' }]">
            <div class="flex-sc ww100">
              <el-date-picker class="w100 mr15" v-model="publicStore.form.estimate_year" size="large" type="year" placeholder="请选择" value-format="YYYY" format="YYYY" />
              <el-input size="large" v-model="publicStore.form.estimate_price" placeholder="请输入">
                <template #suffix>
                  <span class="unit-text">万元</span>
                </template>
              </el-input>   
            </div>
          </el-form-item>   
          <el-form-item label="累计下达投资" prop="total_put_price" class="ww50 flex-sc" :rules="[{ required: true, message: '请输入', trigger: 'blur' }]">
            <el-input size="large" v-model="publicStore.form.total_put_price" placeholder="请输入">
              <template #suffix>
                <span class="unit-text">万元</span>
              </template>
            </el-input>    
          </el-form-item>  
          <el-form-item label="累计完成投资" prop="total_completion_price" class="ww50 flex-sc" :rules="[{ required: true, message: '请输入', trigger: 'blur' }]">
            <el-input size="large" v-model="publicStore.form.total_completion_price" placeholder="请输入">
              <template #suffix>
                <span class="unit-text">万元</span>
              </template>
            </el-input>   
          </el-form-item> 
          <el-form-item label="预计开工时间" prop="estimated_start_time" class="ww50 flex-sc" :rules="[{ required: true, message: '请输入', trigger: 'blur' }]">
            <el-date-picker v-model="publicStore.form.estimated_start_time" style="width: 100%;" size="large" type="datetime" placeholder="请选择" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
          </el-form-item>
          <el-form-item label="预计完工时间" prop="estimated_end_time" class="ww50 flex-sc" :rules="[{ required: true, message: '请输入', trigger: 'blur' }]">
            <el-date-picker v-model="publicStore.form.estimated_end_time" style="width: 100%;" size="large" type="datetime" placeholder="请选择" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
          </el-form-item> 
          <el-form-item label="项目阶段" prop="" class="ww50 flex-sc">
            <el-select v-model="publicStore.form.stage" placeholder="请选择" size="large" style="width:100%" filterable clearable>
              <el-option v-for="(v, i) in dictStore.project_stages||[]" :key="v.value" :value="String(v.value)" :label="v.name" />
            </el-select> 
          </el-form-item>
          <el-form-item label="项目收益" prop="total_income_price" class="ww50 flex-sc" :rules="[{ required: true, message: '请输入', trigger: 'blur' }]">
            <el-input size="large" v-model="publicStore.form.total_income_price" placeholder="请输入">
              <template #suffix>
                <span class="unit-text">万元</span>
              </template>
            </el-input> 
          </el-form-item> 
          <el-form-item label="" prop="" class="ww50 flex-ss">
          </el-form-item>
          <el-form-item label="任务类型" prop="task_type" class="ww33 flex-sc" :rules="[{ required: true, message: '请选择', trigger: 'blur' }]">
            <el-select size="large" v-model="publicStore.form.task_type" placeholder="请选择" style="width:100%" clearable filterable @change="publicStore.form.task_class='';publicStore.form.construct_content=''">
              <el-option v-for="(v, i) in publicStore._public.task_types" :key="i" :label="v.name" :value="v.id.toString()" />
            </el-select>
          </el-form-item>
          <el-form-item label="类型中类" prop="task_class" class="ww33 flex-sc" :rules="[{ required: true, message: '请选择', trigger: 'blur' }]">
            <el-select size="large" v-model="publicStore.form.task_class" placeholder="请选择" style="width:100%" clearable filterable @change="publicStore.form.construct_content=''">
              <el-option v-for="(v, i) in publicStore.form.task_type&&publicStore._public.task_classs?publicStore._public.task_classs.filter(a=>a.parent_id == publicStore.form.task_type):[]" :key="i" :label="v.name" :value="v.id.toString()" />
            </el-select>
          </el-form-item>
          <el-form-item label="建设内容" prop="construct_content" class="ww33 flex-sc" :rules="[{ required: true, message: '请选择', trigger: 'blur' }]">
            <el-select size="large" v-model="publicStore.form.construct_content" placeholder="请选择" style="width:100%" clearable filterable>
              <el-option v-for="(v, i) in publicStore.form.task_type&&publicStore.form.task_class&&publicStore._public.construct_contents?publicStore._public.construct_contents.filter(a=>a.parent_id == publicStore.form.task_class):[]" :key="i" :label="v.name" :value="v.id.toString()" />
            </el-select>
          </el-form-item>
          <el-form-item label="备注" prop="construct_note" class="ww100 flex-ss">
            <el-input size="large" v-model="publicStore.form.construct_note" style="width: 100%;" type="textarea" :rows="4" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="资金来源" prop="fund_source" class="ww100 flex-ss">
            <div class="ww100 plr30 ptb22 bo-i16-1 rad5 flex-sc warp bg-white" v-if="!isNull(publicStore.form.fund_source)">
              <div class="ww50 flex-sc ptb8 pl30" v-for="(v, i) in fund_sources" :key="i">
                <span class="w50x5 line2">{{ v.name }}</span>
                <span class="flex1 flex-sc ml15">
                  <el-input style="width: 100%;" size="large" v-model="publicStore.form.fund_source[v.key]" placeholder="请输入">
                    <template #suffix>
                      <span class="unit-text">万元</span>
                    </template>
                  </el-input>
                </span>
              </div>
            </div>
          </el-form-item>
          <el-form-item label="项目责任人" prop="response_person" class="ww50 flex-sc" :rules="[{ required: true, message: '请输入', trigger: 'blur' }]">
            <el-input size="large" v-model="publicStore.form.response_person" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="项目联系人" prop="contact_person" class="ww50 flex-sc" :rules="[{ required: true, message: '请输入', trigger: 'blur' }]">
            <el-input size="large" v-model="publicStore.form.contact_person" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="项目联系方式" prop="contact_phone" class="ww50 flex-sc" :rules="[{ required: true, message: '请输入', trigger: 'blur' }]">
            <el-input size="large" v-model="publicStore.form.contact_phone" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="符合最大战略" prop="vast_scheme" class="ww50 flex-sc">
            <el-input size="large" v-model="publicStore.form.vast_scheme" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="符合产业政策" prop="industrial_policy" class="ww50 flex-sc">
            <el-input size="large" v-model="publicStore.form.industrial_policy" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="政府投资方向" prop="gc_investmentd_irection" class="ww50 flex-sc">
            <el-input size="large" v-model="publicStore.form.gc_investmentd_irection" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="阶段量化目标" prop="qu_stage_objective" class="ww50 flex-sc">
            <el-input size="large" v-model="publicStore.form.qu_stage_objective" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="其他信息" prop="orther_text" class="ww100 flex-ss">
            <div class="ww100 plr30 ptb22 bo-i16-1 rad5 flex-sc warp bg-white" v-if="!isNull(publicStore.form.orther_text)">
              <div class="ww50 flex-sc ptb8 pl30" v-for="(v, i) in orther_texts" :key="i">
                <span class="w50x5 line2">{{ v.name }}</span>
                <span class="flex1 flex-sc ml15">
                  <el-radio-group v-model="publicStore.form.orther_text[v.key]" size="large">
                    <el-radio  v-for="sel in dictStore.isList || []"  :key="sel.value" :value="sel.value">
                      {{ sel.name }}
                    </el-radio>
                  </el-radio-group>
                </span>
              </div>
            </div>
          </el-form-item>
          <el-form-item label="项目范围" prop="mapdata" class="ww100 flex-ss">
            <div class="ww100 plr30 ptb22 bo-i16-1 rad5 flex-col warp bg-white">
              <div class="ww100 flex-sc">
                <el-input class="flex1" size="large" v-model="publicStore.form.mapdata" placeholder="请输入" />
                <div class="plr10 ptb4 rad5 cursor bgi1 white ml15" @click.stop="publicStore.check=!publicStore.check; gisRef.onVisable(publicStore.form)">地图绘制</div>
                <div class="plr10 ptb4 rad5 cursor bgi1 white ml15">矢量文件上传</div>
              </div>
              <div class="ww100 h50x6 flex-sc rad5 hidden relative mt20">
<<<<<<< Updated upstream
<<<<<<< Updated upstream
                <GisShow class="ww100 hh100" v-if="!publicStore.check" v-model:mapdata="publicStore.form.mapdata"  />
=======
=======
>>>>>>> Stashed changes
                <!-- <img class="ww100" src="@/assets/images/mapdata.png" /> -->
                <GisShow class="ww100 hh100" v-if="!publicStore.check" v-model:mapdata="publicStore.form.mapdata"  />
                <!-- <div class="ww100 flex-ec absolute b10 r10">
                  <div class="plr10 ptb4 rad5 cursor bgi1 white ml15">完成绘制</div>
                </div> -->
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
              </div>
            </div>
          </el-form-item>
          <el-form-item label="文件上传" prop="files" class="ww100 flex-ss">
            <div class="ww100 plr30 ptb22 bo-i16-1 rad8 bg-white">
              <FileList v-if="publicStore.form?.attr" v-model:files="publicStore.form.attr" :plans="props.plans" :contents="props.contents" :active="props.active"  />
            </div>
          </el-form-item>
        </div>
      </el-form>
      <div class="ww100 flex-cc f18 p40 bot-i16-1 mt20">
        <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" @click.stop="onStepNext(formRef)">下一步</div>
      </div>
    </div>
    <projects :state="state" ref="projectRef" />
    <view-gis :state="state" ref="gisRef" />
  </div>
</template>

<script lang="ts" setup>
	import { setAreaLevel } from '@/utils/areaData'
  import api from '@/api'
  import projects from './projects'
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const dictStore = proxy.dictStore()
  let projectRef = $ref()
  let gisRef = $ref()
  let formRef = ref()
  let ruleList= $ref({})
  const areaList = computed(() => {
    // 在这里传入你想限制的层级：'province' | 'city' | 'district'
    return setAreaLevel('city') 
  })
  const cascaderProps = {
    value: 'code',    // 指定选项的值为节点对象中的 code 属性
    label: 'name',    // 指定选项的标签为节点对象中的 name 属性
    children: 'children', // 指定子选项的字段名
    expandTrigger: 'hover', // 次级菜单的展开方式 (可选: click/hover)
  }
  const fund_sources = [
    {name: '中央预算内投资' , key: 'value1'},
    {name: '信贷融资' , key: 'value2'},
    {name: '超长期国债' , key: 'value3'},
    {name: '证券化融资' , key: 'value4'},
    {name: '专项债' , key: 'value5'},
    {name: '企业融资' , key: 'value6'},
    {name: '财政' , key: 'value7'},
    {name: '居民出资' , key: 'value8'},
    {name: '其他渠道' , key: 'value9'},
    {name: '待定' , key: 'value10'},
  ]
  const orther_texts = [
    {name: '是否申请抗疫特别国债', key: 'value1'},
    {name: '是否申请中央预算内资金', key: 'value2'},
    {name: '是否需加强用地保障的国家重大项目', key: 'value3'},
    {name: '是否申请政策性开发性金融工具（基金）', key: 'value4'},
    {name: '是否中长期贷款项目', key: 'value5'},
    {name: '是否2023年增发国债投资项目', key: 'value6'},
    {name: '是否申请列入全国重点民间投资项目', key: 'value7'},
    {name: '是否申请提级论证项目', key: 'value8'},
    {name: '是否申请重大项目', key: 'value9'},
    {name: '是否地方政府专项债券项目', key: 'value10'},
    {name: '是否申报十四五102项重大工程项目', key: 'value11'},
    {name: '是否申报十四五能源规划项目', key: 'value12'},
    {name: '是否申请科技型企业和项目融资', key: 'value13'},
    {name: '是否超长期特别国债项目', key: 'value14'},
    {name: '是否有民间投资参与', key: 'value15'},
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

  const onStepNext = (formEl) => {
    formEl.validate (async valid => {
      if (valid) {
        console.log("publicStore.form.---", publicStore.form)
        publicStore.actIndex++
      }else{
        ElNotification({ title: '提示', message: '任务信息不完整，请继续补充', type: 'error' })
      }
    })
  }
<<<<<<< Updated upstream
=======

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
  
