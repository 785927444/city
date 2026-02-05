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
            <!-- 切换 -->
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
          </el-form-item>
          <el-form-item label="实施方案文件上传" prop="files" class="ww100 flex-ss">
             <FileList v-if="publicStore.form?.plan_attr" v-model:files="publicStore.form.plan_attr" :contents="props.contents" :active="props.active"  />
          </el-form-item>
        </div>
      </el-form>
      <div class="ww100 flex-cc f18 p40 bot-i16-1 mt20">
        <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" @click.stop="onStepNext(formRef)">下一步</div>
        <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" @click.stop="publicStore.actIndex--">上一步</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import api from '@/api'
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

  const onStepNext = (formEl) => {
    formEl.validate (async valid => {
      if (valid) {
       console.log("valid", valid)
      }
    })
  }

  const handleClick = (remark, val) => {}
</script>
  
<style scoped lang="scss">
.bob-tt-2 { border-bottom: 2px solid transparent; }
.r-18{ right: -18px; }
.autoHeight{min-height: 100%; height: 3000px;}
</style>
  