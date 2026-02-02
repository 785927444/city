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
    type: 'plan'
  })

  const props = defineProps({
    state: {
      type: [Object, Array],
      default: ()=>{return {}}
    },
  })

  const emit = defineEmits(['init'])
  onMounted(async() => {})

  const onStepBack = () => {
    if(publicStore.actIndex == 1) return router.back()
    publicStore.actIndex--
  }

  const onStepNext = () => {
    // console.log("publicStore.form", publicStore.form)
    if(props.state.type=='plan' && publicStore.actIndex == 1) {
      if(!publicStore.form.name) return ElNotification({ title: '提示', message: '请输入规划名称', type: 'error' })
      if(!publicStore.form.datetime) return ElNotification({ title: '提示', message: '请选择规划周期', type: 'error' })
    }
    if(props.state.type=='design' && publicStore.actIndex == 1) {
      if(!publicStore.form.name) return ElNotification({ title: '提示', message: '请输入片区名称', type: 'error' })
      if(!publicStore.form.num) return ElNotification({ title: '提示', message: '请输入片区编号', type: 'error' })
      if(!publicStore.form.parent_id) return ElNotification({ title: '提示', message: '请选择专项规划', type: 'error' })
      if(!publicStore.form.parent_area) return ElNotification({ title: '提示', message: '请选择专项片区', type: 'error' })
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
      if(JSON.stringify(form.project) != JSON.stringify(publicStore._public.project)) {
        addProject = form.project.filter(a=>!a.id)
        delProject = publicStore._public.project.filter(a => !form.project.some(b => b.id === a.id))
      }
      // 任务更新
      let addTask = []
      let delTask = []
      if(JSON.stringify(form.task) != JSON.stringify(publicStore._public.task)) {
        addTask = form.task.filter(a=>!a.id)
        delTask = publicStore._public.task.filter(a => !form.task.some(b => b.id === a.id))
      }
      form.type = props.state.type
      form.examine_status = '0'
      form.datetime = !proxy.isNull(form.datetime)? JSON.stringify(form.datetime) : ''
      form.project_num = form.project.length
      form.task_num = form.task.length
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
      // console.log("addProject", addProject)
      // console.log("addTask", addTask)
      // console.log("delProject", delProject)
      // console.log("delTask", delTask)
      api[apikey](params).then(async(res:any) => {
        if(res.code == 200){
          ElNotification({ title: '提示', message: '保存成功', type: 'success' })
          setChangeFile(changeFile)
          if(!proxy.isNull(addProject) || !proxy.isNull(delProject) || !proxy.isNull(addTask) || !proxy.isNull(delTask)) {
            if(!proxy.isNull(addProject) || !proxy.isNull(addTask)) await setAdd(addProject, addTask, form.id)
            if(!proxy.isNull(delProject) || !proxy.isNull(delTask)) await setDel(delProject, delTask, form.id)
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

  const setAdd = async(addProject, addTask, scheme_id) => {
    let query = {model: 't_scheme_plan', args: `id='${scheme_id}'`}
    let scheme = await publicStore.http({Api: query})
    if(proxy.isNull(scheme)) return
    addProject.forEach(v => {
      v.id = ''
      v.scheme_id = scheme[0]['id']
      v.scheme_name = scheme[0]['name']
    })
    addTask.forEach(v => {
      v.id = ''
      v.scheme_id = scheme[0]['id']
      v.scheme_name = scheme[0]['name']
    })
    let params = {}
    if(!proxy.isNull(addProject)) params.addApi = {model: 't_scheme_project', list: addProject}
    if(!proxy.isNull(addTask)) params.addApi1 = {model: 't_scheme_task', list: addTask}
    let res = await publicStore.http(params)
    console.log('新增res---', res)
  } 

  const setDel = async(delProject, delTask, scheme_id) => {
    let params = {}
    if(!proxy.isNull(delProject)) params.delApi = {model: 't_scheme_project', list: delProject}
    if(!proxy.isNull(delTask)) params.delApi1 = {model: 't_scheme_task', list: delTask}
    let res = await publicStore.http(params)
    console.log('删除res---', res)
  } 

</script>
  
<style scoped lang="scss">

</style>
  