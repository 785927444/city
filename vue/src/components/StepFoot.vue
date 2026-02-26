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
import { isNull } from '@/utils/common'
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
    console.log("publicStore.form", publicStore.form)

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
      if(props.state.type=='plan' && publicStore.actIndex == 2) {
        if(isNull(publicStore.form.attr)) return ElNotification({ title: '提示', message: '规划文本与规划图表为必须', type: 'error' })
        // if(!publicStore.form.attr.plan_text1) return ElNotification({ title: '提示', message: '规划文本必须', type: 'error' })
        // if(!publicStore.form.attr.plan_text2) return ElNotification({ title: '提示', message: '规划说明必须', type: 'error' })
        // if(!publicStore.form.attr.plan_echart1) return ElNotification({ title: '提示', message: '规划图纸必须', type: 'error' })
        // if(!publicStore.form.attr.plan_echart2) return ElNotification({ title: '提示', message: '规划图表必须', type: 'error' })
      }
      let form = JSON.parse(JSON.stringify(publicStore.form))
      let apikey = form.id?'updApi':'addApi'
      if(!form.id) form.id=uuidv6()
      // 图片转移
      let changeFile = []
      if(!proxy.isNull(form.attr)){
        form.attr.forEach(v => {
          if(v.data.indexOf('/uploads')!=-1){
            let content = publicStore._public.contents1.find(a=>a.type == v.type)
            let oldlData = v.data;
            v.data = `${content.parent_type}/${form.id}_${v.time}_${v.name}`
            changeFile.push({oldfile: oldlData, newfile: v.data})
          }
        })
      }
      // 项目文件
      let addFile = []
      let delFile = []
      let updFile = []
      if(JSON.stringify(form.attr) != JSON.stringify(publicStore._public.attr)) {
        addFile = form.attr.filter(a=>!a.id).map(item => ({ ...item, parent_id: form.id }))
        delFile = publicStore._public.attr.filter(a => !form.attr.some(b => b.id === a.id))
        updFile = form.attr.filter(a => publicStore._public.attr.some(b => b.id === a.id && b.data !== a.data))
      }
      delete form.attr
      // console.log("addFile---", addFile)
      // console.log("delFile---", delFile)
      // console.log("updFile---", updFile)
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
          if(!proxy.isNull(updFile) || !proxy.isNull(addFile) || !proxy.isNull(delFile) || !proxy.isNull(addProject) || !proxy.isNull(delProject) || !proxy.isNull(addTask) || !proxy.isNull(delTask)) {
            if(!proxy.isNull(addFile) || !proxy.isNull(addProject) || !proxy.isNull(addTask)) await setAdd(addFile, addProject, addTask, form.id)
            if(!proxy.isNull(delFile) || !proxy.isNull(delProject) || !proxy.isNull(delTask)) await setDel(delFile, delProject, delTask, form.id)
            if(!proxy.isNull(updFile)) await setUpd(updFile, form.id)
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

  const setAdd = async(addFile, addProject, addTask, scheme_id) => {
    let query = {model: 't_scheme_plan', args: `id='${scheme_id}'`}
    let scheme = await publicStore.http({Api: query})
    if(proxy.isNull(scheme)) return
    addProject.forEach(v => {
      v.id = ''
      v.scheme_id = scheme[0]['id']
      v.scheme_name = scheme[0]['name']
      v.user_id = configStore.user.id
      v.user_name = configStore.user.name
      v.province = configStore.user.province?configStore.user.province:''
      v.city = configStore.user.city?configStore.user.city:''
      v.district = configStore.user.district?configStore.user.district:''
      v.province_name = configStore.user.province_name?configStore.user.province_name:''
      v.city_name = configStore.user.city_name?configStore.user.city_name:''
      v.district_name = configStore.user.district_name?configStore.user.district_name:''
    })
    addTask.forEach(v => {
      v.id = ''
      v.scheme_id = scheme[0]['id']
      v.scheme_name = scheme[0]['name']
      v.user_id = configStore.user.id
      v.user_name = configStore.user.name
      v.province = configStore.user.province?configStore.user.province:''
      v.city = configStore.user.city?configStore.user.city:''
      v.district = configStore.user.district?configStore.user.district:''
      v.province_name = configStore.user.province_name?configStore.user.province_name:''
      v.city_name = configStore.user.city_name?configStore.user.city_name:''
      v.district_name = configStore.user.district_name?configStore.user.district_name:''
    })
    let params = {}
    if(!proxy.isNull(addProject)) params.addApi = {model: 't_scheme_project', list: addProject}
    if(!proxy.isNull(addTask)) params.addApi1 = {model: 't_scheme_task', list: addTask}
    if(!proxy.isNull(addFile)) params.addApi2 = {model: 't_file', list: addFile}
    let res = await publicStore.http(params)
    console.log('新增res---', res)
  } 

  const setDel = async(delFile, delProject, delTask, scheme_id) => {
    let params = {}
    if(!proxy.isNull(delProject)) params.delApi = {model: 't_scheme_project', list: delProject}
    if(!proxy.isNull(delTask)) params.delApi1 = {model: 't_scheme_task', list: delTask}
    if(!proxy.isNull(delFile)) params.delApi2 = {model: 't_file', list: delFile}
    let res = await publicStore.http(params)
    console.log('删除res---', res)
  } 

  const setUpd = async(updFile, scheme_id) => {
    let params = {}
    if(!proxy.isNull(updFile)) params.updApi = {model: 't_file', list: updFile}
    let res = await publicStore.http(params)
    console.log('更新res---', res)
  } 

</script>
  
<style scoped lang="scss">

</style>
  
