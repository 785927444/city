<template>
  <!-- 标题 -->
  <div class="ww100 flex-cc f18 p40">
    <div class="plr14 ptb5 rad4 mr15 cursor c9 bg-white bo-c9-1" v-if="publicStore.actIndex != 1" @click.stop="onStepBack()">上一步</div>
    <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" v-if="publicStore.actIndex == 1" @click.stop="onStepNext()">下一步</div>
    <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" v-if="publicStore.actIndex == 2" @click.stop="onSave()">保存</div>
  </div>
</template>

<script lang="ts" setup>
  import { v6 as uuidv6 } from 'uuid'
  import api from '@/api'
  import router from '@/router'
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const state = reactive({
	  ...publicStore.$state,
  })

  const emit = defineEmits(['init'])
  onMounted(async() => {})

  const onStepBack = () => {
    if(publicStore.actIndex == 1) return router.back()
    publicStore.actIndex--
  }

  const onStepNext = () => {
    // console.log("publicStore.form", publicStore.form)
    if(publicStore.actIndex == 1) {
      if(!publicStore.form.name) return ElNotification({ title: '提示', message: '请输入规划名称', type: 'error' })
      if(!publicStore.form.datetime) return ElNotification({ title: '提示', message: '请选择规划周期', type: 'error' })
    }
    publicStore.actIndex++
  }

  const onSave = async() => {
    ElMessageBox.confirm('保存信息后可进行上报，是否确定继续', '温馨提示', {confirmButtonText: '确定', cancelButtonText: '关闭', type: 'warn'}).then(() => {
      let form = JSON.parse(JSON.stringify(publicStore.form))
      let apikey = form.id?'updApi':'addApi'
      if(!form.id) form.id=uuidv6()
      // 图片转移
      let changeFile = []
      if(!proxy.isNull(form.attr)){
        Object.keys(form.attr).forEach((key:any)=>{
          if(form.attr[key].data.indexOf('/uploads')!=-1){
            let content = publicStore._public.contents.find(a=>a.type == key)
            const ext = '.' + publicStore.form.attr[key].data.split('.').pop()
            const newfile = `${content.parent_type}/${configStore.user.id}_${key}${ext}`
            form.attr[key].data = newfile
            changeFile.push({oldfile: publicStore.form.attr[key].data, newfile: newfile})
          }
        })
        form.attr = JSON.stringify(form.attr)
      }else{
        form.attr = ''
      }
      // 项目更新
      let addProject = []
      let delProject = []
      let project_num = 0
      if(JSON.stringify(form.project) != JSON.stringify(publicStore._public.project)) {
        const oldProjects = publicStore._public.project || []
        const newProjects = form.project || []
        project_num = newProjects.length
        addProject = newProjects.filter(id => !oldProjects.includes(id)).map(scheme_project_id => ({ scheme_plan_id: form.id, scheme_project_id }))
        delProject = oldProjects.filter(id => !newProjects.includes(id)).map(scheme_project_id => ({ scheme_plan_id: form.id, scheme_project_id }))
      } else{
        project_num = (publicStore._public.project || []).length
      }
      // 任务更新
      let addTask = []
      let delTask = []
      let task_num = 0
      if(JSON.stringify(form.task) != JSON.stringify(publicStore._public.task)) {
        const oldTasks = publicStore._public.task || []
        const newTasks = form.task || []
        task_num = newTasks.length
        addTask = newTasks.filter(id => !oldTasks.includes(id)).map(scheme_task_id => ({ scheme_plan_id: form.id, scheme_task_id }))
        delTask = oldTasks.filter(id => !newTasks.includes(id)).map(scheme_task_id => ({ scheme_plan_id: form.id, scheme_task_id }))
      }else{
        task_num = (publicStore._public.task || []).length
      }
      form.type = 'plan'
      form.examine_status = '0'
      form.datetime = !proxy.isNull(form.datetime)? JSON.stringify(form.datetime) : ''
      form.project_num = project_num
      form.task_num = task_num
      form.user_id = configStore.user.id
      form.user_name = configStore.user.name
      form.province = configStore.user.province?configStore.user.province:''
      form.city = configStore.user.city?configStore.user.city:''
      form.district = configStore.user.district?configStore.user.district:''
      form.province_name = configStore.user.province_name?configStore.user.province_name:''
      form.city_name = configStore.user.city_name?configStore.user.city_name:''
      form.district_name = configStore.user.district_name?configStore.user.district_name:''
      let params = {model: 't_scheme_plan', list: [form]}
      // console.log("params", params)
      api[apikey](params).then(async(res:any) => {
        if(res.code == 200){
          ElNotification({ title: '提示', message: '保存成功', type: 'success' })
          setChangeFile(changeFile)
          if(!proxy.isNull(addProject) || !proxy.isNull(delProject) || !proxy.isNull(addTask) || !proxy.isNull(delTask)) {
            if(!proxy.isNull(addProject) || !proxy.isNull(addTask)) await setAdd(addProject, addTask)
            if(!proxy.isNull(delProject) || !proxy.isNull(delTask)) await setDel(delProject, delTask)
            emit('init', form.id)
          } else {
            emit('init', form.id)
          }
        }else{
          ElNotification({ title: '提示', message: res.msg?res.msg:'保存失败(400)', type: 'error' })
        }
      }).catch((err) => {
        ElNotification({ title: '提示', message: '保存失败(500)', type: 'error' })
      })
    })
  }

  const setChangeFile = async(changeFile) => {
    if(proxy.isNull(changeFile)) return console.log("无需转移")
    let query = {list: changeFile}
    publicStore.http({changeFileApi: query}).then(res=>{
      console.log("转移res", res)
    })
  }

  const setAdd = async(addProject, addTask) => {
    // console.log("addProject", addProject)
    // console.log("addTask", addTask)
    let params = {}
    if(!proxy.isNull(addProject)) params.addApi = {model: 't_scheme_plan_project', list: addProject}
    if(!proxy.isNull(addTask)) params.addApi1 = {model: 't_scheme_plan_task', list: addTask}
    let res = await publicStore.http(params)
    console.log('新增res---', res)
  } 

  const setDel = async(delProject, delTask) => {
    // console.log("delProject", delProject)
    // console.log("delTask", delTask)
    let params = {}
    if(!proxy.isNull(delProject)) params.delApi = {model: 't_scheme_plan_project', list: delProject}
    if(!proxy.isNull(delTask)) params.delApi1 = {model: 't_scheme_plan_task', list: delTask}
    let res = await publicStore.http(params)
    console.log('删除res---', res)
  } 

</script>
  
<style scoped lang="scss">

</style>
  