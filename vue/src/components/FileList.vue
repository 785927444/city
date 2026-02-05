<template>
  <div class="ww100 plr30 ptb22 bo-i16-1 rad5 flex-sc warp bg-white">
    <div class="ww25 flex-sc ptb8 pr16" v-if="props.active&&files" v-for="(v, i) in props.contents?props.contents.filter(a=>a.parent_id==props.active.id):[]" :key="i">
      <div class="ww100 bs bo-i16-1 relative rad8">
          <div class="ww100 flex-sc p12 bob-ce-1">
            <span class="f15">{{ v.name }}</span>
            <span class="flex1 flex-ec">
              <UploadText v-if="v.type" v-model:model="files[v.type]" />
            </span>
          </div>
          <div class="ww100 flex-col p12">
            <div class="ww100 flex-sc">
              <span class="w90 c8">上传状态</span>
              <span class="flex1 line1">{{ files[v.type]&&files[v.type]['status']?files[v.type]['status']=='success'?'成功':'失败':'-' }}</span>
            </div>
            <div class="ww100 flex-sc mt12">
              <span class="w90 c8">文件类型</span>
              <span class="flex1 line1">{{ files[v.type]&&files[v.type]['type']?files[v.type]['type']:'-' }}</span>
            </div>
            <div class="ww100 flex-sc mt12">
              <span class="w90 c8">上传时间</span>
              <span class="flex1 line1">{{ files[v.type]&&files[v.type]['time']?parseTime(files[v.type]['time']):'-' }}</span>
            </div>
            <div class="ww100 flex-ec mt12">
              <span v-if="files[v.type]" class="ml12 i1" @click.stop="viewFile(v)">预览</span>
              <span v-else class="ml12 ca">预览</span>
              <span v-if="files[v.type]" class="ml12 i9" @click.stop="delFile(v)">删除</span>
              <span v-else class="ml12 ca">删除</span>
            </div>
          </div>
        </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  const { proxy } = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const files = defineModel('files')
  const props = defineProps({
    contents: {
      type: Array,
      default: []
    },
    active: {
      type: [Object, Array],
      default: ()=>{return {}}
    },
  })

  const state = reactive({})

  // 预览
  const viewFile = (v) => {
    let val = files.value[v.type]
    const filePath = val.data
    viewRef.onVisable(filePath)
  }

  // 删除
  const delFile = async(v) => {
    let val = files[v.type]
    const filePath = val.data
    publicStore.http({deleteFile: {filepath: filePath}}).then(res=>{
      if(res == 'success') {
        ElNotification({ title: '提示', message: '删除成功', type: 'success' })
        delete files[v.type]
        if(publicStore.form.id){
        // 查询原信息
        let query = {model: 't_scheme_plan', args: `id='${publicStore.form.id}'`}
          publicStore.http({Api: query}).then(ress=>{
            if(!proxy.isNull(ress)){
              let data = ress[0]
              if(data.attr){
                let attr = JSON.parse(data.attr)
                if(attr[v.type]){
                  delete attr[v.type]
                  // 更新数据库
                  let form = {id: publicStore.form.id, attr: JSON.stringify(attr)}
                  let params = {model: 't_scheme_plan', list: [form]}
                  api['updApi'](params).then((resss:any) => {
                    if(resss.code == 200){
                      ElNotification({ title: '提示', message: '清理成功', type: 'success' })
                      // init()
                    }else{
                      ElNotification({ title: '提示', message: resss.msg?resss.msg:'清理失败(400)', type: 'error' })
                    }
                  })
                }
              }
            }
          })
        }
      }else{
        ElNotification({ title: '提示', message: res.msg?res.msg:'删除失败(400)', type: 'error' })
      }
    })
  }


  const onSuccess = (res, file, fileList) => {
    let data = file.response.data
    if(!data) return
    if (Object.prototype.hasOwnProperty.call(file,'response') && file.response.data){
      if(typeof(model.value)=='string'){
        model.value = data
      }else{
        if(!fileList) return
        if(fileList.length == 0) return
        if(!Object.prototype.hasOwnProperty.call(fileList[fileList.length-1],'response')) return
        model.value.push(data)
        console.log('sss', model.value)
      }
    }
  }

</script>

<style lang="scss" scoped>

</style>
