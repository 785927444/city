<template>
  <!-- 标题 -->
  <div class="ww100 flex-cc f18 p40">
    <div class="plr14 ptb5 rad4 mr15 cursor c9 bg-white bo-c9-1" v-if="publicStore.actIndex != 1" @click.stop="onStepBack()">上一步</div>
    <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" v-if="publicStore.actIndex == 1" @click.stop="onStepNext()">下一步</div>
    <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" v-if="publicStore.actIndex == 2" @click.stop="onSave()">保存</div>
  </div>
</template>

<script lang="ts" setup>
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
      if(!publicStore.form.name) return ElNotification({ title: '提示', message: '请输入片区名称', type: 'error' })
      if(!publicStore.form.num) return ElNotification({ title: '提示', message: '请输入片区编号', type: 'error' })
      if(!publicStore.form.parent_id) return ElNotification({ title: '提示', message: '请选择专项规划', type: 'error' })
      if(!publicStore.form.parent_area) return ElNotification({ title: '提示', message: '请选择专项片区', type: 'error' })
    }
    publicStore.actIndex++
  }

  const onSave = async() => {
    ElMessageBox.confirm('修改信息需重新审核，是否确定继续', '温馨提示', {confirmButtonText: '确定', cancelButtonText: '关闭', type: 'warn'}).then(() => {
      let form = JSON.parse(JSON.stringify(publicStore.form))
      let changeFile = []
      if(!proxy.isNull(form.attr)){
        // 图片转移
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
      form.type = 'design'
      form.examine_status = '0'
      // form.datetime = !proxy.isNull(form.datetime)? JSON.stringify(form.datetime) : ''
      form.project = !proxy.isNull(form.project)? JSON.stringify(form.project) : ''
      form.task = !proxy.isNull(form.task)? JSON.stringify(form.task) : ''
      form.user_id = configStore.user.id
      form.user_name = configStore.user.name
      form.province = configStore.user.province?configStore.user.province:''
      form.city = configStore.user.city?configStore.user.city:''
      form.district = configStore.user.district?configStore.user.district:''
      form.province_name = configStore.user.province_name?configStore.user.province_name:''
      form.city_name = configStore.user.city_name?configStore.user.city_name:''
      form.district_name = configStore.user.district_name?configStore.user.district_name:''
      let params = {model: 't_scheme_design', list: [form]}
      let apikey = publicStore.form.id?'updApi':'addApi'
      console.log("params", params)
      api[apikey](params).then((res:any) => {
        if(res.code == 200){
          ElNotification({ title: '提示', message: '保存成功', type: 'success' })
          setChangeFile(changeFile)
          emit('init')
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

</script>
  
<style scoped lang="scss">

</style>
  