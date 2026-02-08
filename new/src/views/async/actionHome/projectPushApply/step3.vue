<template>
  <div class="layout-col overlay">
    <div class="hh100 ww100 flex-sc warp">
      <el-form class="ww100 pplr15" ref="formRef" :model="publicStore.form" :rules="ruleList" label-width="120">
        <div class="flex-sc warp ww100">
          <el-form-item label="项目状态" prop="project_status" class="ww50 flex-sc">
            <el-select v-model="publicStore.form.project_status" placeholder="请选择" style="width: 100%">
              <el-option label="实施中" value="实施中" />
              <el-option label="已完成" value="已完成" />
              <el-option label="暂停" value="暂停" />
            </el-select>
          </el-form-item>
          <el-form-item label="已投资金额" prop="invested_amount" class="ww50 flex-sc">
            <el-input v-model="publicStore.form.invested_amount" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="已建设规模" prop="constructed_scale" class="ww50 flex-sc">
            <el-input v-model="publicStore.form.constructed_scale" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="实施成效说明" prop="implementation_effect" class="ww100 flex-sc">
            <el-input v-model="publicStore.form.implementation_effect" type="textarea" :rows="4" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="项目任务" prop="progress_tasks" class="ww100 flex-ss">
            <div class="ww100 flex-sc pb20">
              <div
                class="mr40 pb10 f18 relative cursor actfont"
                :class="currentTab.value == v.value ? 'i1 bob-i1-2' : 'bob-tt-2'"
                v-for="(v, i) in activeTab"
                :key="i"
                @click.stop="currentTab = v"
              >
                <span>{{ v.name }}</span>
              </div>
            </div>
            <el-table :data="filteredTasks" border stripe header-cell-class-name="bgi16 c3">
              <el-table-column type="index" label="序号" align="center" width="60" />
              <el-table-column label="中央《意见》任务名称" align="center">
                <template #default="{ row }">
                  <el-input v-model="row.task_name" placeholder="请输入" />
                </template>
              </el-table-column>
              <el-table-column label="涉及的重点建设内容" align="center">
                <template #default="{ row }">
                  <el-input v-model="row.construction_content" placeholder="请输入" />
                </template>
              </el-table-column>
              <el-table-column label="项目建设目标" align="center">
                <template #default="{ row }">
                  <el-input v-model="row.project_goal" placeholder="请输入" />
                </template>
              </el-table-column>
              <el-table-column label="已完成目标" align="center">
                <template #default="{ row }">
                  <el-input v-model="row.completed_goal" placeholder="请输入" />
                </template>
              </el-table-column>
            </el-table>
          </el-form-item>
          <el-form-item label="过程材料上传" prop="process_files" class="ww100 flex-ss">
            <FileList v-model:files="publicStore.form.process_files" :contents="processContents" :active="processActive" />
          </el-form-item>
          <el-form-item label="实施成效文件上传" prop="effect_files" class="ww100 flex-ss">
            <FileList v-model:files="publicStore.form.effect_files" :contents="effectContents" :active="effectActive" />
          </el-form-item>
          <el-form-item label="审批意见" prop="approval_opinion" class="ww100 flex-sc">
            <el-input v-model="publicStore.form.approval_opinion" type="textarea" :rows="4" placeholder="请输入" />
          </el-form-item>
        </div>
      </el-form>
      <div class="ww100 flex-cc f18 p40 bot-i16-1 mt20">
        <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" @click.stop="publicStore.actIndex--">上一步</div>
        <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" @click.stop="onSave(formRef)">保 存</div>
        <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" @click.stop="onSubmit(formRef)">提 交</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const formRef = ref()
  const ruleList = {
    project_status: [{ required: true, message: '请选择', trigger: 'change' }],
    invested_amount: [{ required: true, message: '请输入', trigger: 'blur' }],
    constructed_scale: [{ required: true, message: '请输入', trigger: 'blur' }],
  }
  const activeTab = [
    {value: '1', name: '重点落实任务'},
    {value: '2', name: '体检整改任务'},
  ]
  const currentTab = ref(activeTab[0])
  const processActive = reactive({ id: 'process-files' })
  const effectActive = reactive({ id: 'effect-files' })
  const processContents = ref([
    { id: 'process-file-1', parent_id: 'process-files', name: '过程材料', type: 'process_file' }
  ])
  const effectContents = ref([
    { id: 'effect-file-1', parent_id: 'effect-files', name: '实施成效', type: 'effect_file' }
  ])

  const createEmptyTask = (type: string) => ({
    id: `${type}-${Date.now()}`,
    task_type: type,
    task_name: '',
    construction_content: '',
    project_goal: '',
    completed_goal: '',
  })

  const ensureTasks = (type: string) => {
    if (!Array.isArray(publicStore.form.progress_tasks)) publicStore.form.progress_tasks = []
    const has = publicStore.form.progress_tasks.some((item: any) => String(item.task_type) === String(type))
    if (!has) publicStore.form.progress_tasks.push(createEmptyTask(type))
  }

  const filteredTasks = computed(() => {
    const list = Array.isArray(publicStore.form.progress_tasks) ? publicStore.form.progress_tasks : []
    return list.filter((item: any) => String(item.task_type) === String(currentTab.value.value))
  })

  onMounted(() => {
    if (!publicStore.form.process_files) publicStore.form.process_files = {}
    if (!publicStore.form.effect_files) publicStore.form.effect_files = {}
    ensureTasks(currentTab.value.value)
  })

  watch(() => currentTab.value.value, (val) => {
    ensureTasks(val)
  })

  const onSave = (formEl) => {
    if (!formEl) return
    formEl.validate((valid) => {
      if (!valid) return
      ElMessageBox.confirm('是否确定保存?', '温馨提示', {confirmButtonText: '确定', cancelButtonText: '关闭', type: 'warn'}).then(() => {
        ElNotification({ title: '提示', message: '保存成功', type: 'success' })
      })
    })
  }

  const onSubmit = (formEl) => {
    if (!formEl) return
    formEl.validate((valid) => {
      if (!valid) return
      ElMessageBox.confirm('是否确定提交?', '温馨提示', {confirmButtonText: '确定', cancelButtonText: '关闭', type: 'warn'}).then(() => {
        ElNotification({ title: '提示', message: '提交成功', type: 'success' })
        proxy.toPath('/project-push')
      })
    })
  }
</script>

<style scoped lang="scss">

</style>
