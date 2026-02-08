<template>
  <el-dialog v-model="state.isFalse" title="详细图片" :before-close="onVisable" :draggable="true" width="38%">
    <!-- 电机 start -->
    <el-form v-if="state.type == 'Motorsensor'" ref="formRef" :model="state.form" :rules="state.ruleList" label-width="22%">
      <el-form-item label="传感器图片" prop="picture">
        <el-upload ref="refUpload" class="avatar-uploader" :show-file-list="false" :http-request="(options) => uploadImageFile(options, 'picture')">
          <img v-if="!isNull(state.form.picture)" :src="state.form.picture" class="avatar">
          <i-ep-plus v-else />
        </el-upload>
      </el-form-item>
      <el-form-item label="现场图片" prop="pictures">
        <el-upload ref="refUploads" class="avatar-uploader" 
        :show-file-list="true" 
        multiple 
        list-type="picture-card" 
        v-model:file-list="state.fileList"
        :http-request="(options) => uploadImageFiles(options, 'pictures')"
        :on-remove="onRemove">
          <i-ep-plus />
        </el-upload>
      </el-form-item>
    </el-form>
    <!-- 电机 end -->
    <div v-if="state.empty" class="f20 fw tc white">请配置</div>
    <template #footer>
      <div class="dialog-footer">
        <el-button size="large" type="info" class="i23 bg-white" @click="onVisable">取 消</el-button>
        <el-button size="large" type="info" class="white bgi22" @click.stop="handleSubmit(formRef)">确 定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
  import api from '@/api'
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const state = reactive({
	  ...publicStore.$state,
    ruleList: [],
    form: {},
    type: '',
    fileList: [],
    delForm: [],
    addForm: [],
  })
  let formRef = ref()
  const model = defineModel()

  // 打开关闭弹窗
  const onVisable = async (val) => {
    state.type = model.value.type
    state.isFalse = !state.isFalse
    if(!state.isFalse) return state.form = {}
    let query = {"o": "o_sensor_img", "i": 2, "p": [model.value.id]}
    val.value = await publicStore.post({queryApi: query})
    console.log('val---', val)
    console.log('model.value---', model.value)
    state.delForm = []
    state.form.picture = ''
    state.form.pictures = []
    state.fileList = []
    if(!proxy.isNull(val.value)){
      let picture = val.value.find(a=>a.type == '1')
      if(!proxy.isNull(picture)){
        state.form.picture = picture.value
        let del = Object.assign({}, {o: "o_sensor_img", t: 'del', a: '删除'}, picture)
        state.delForm.push(del)
      }
      let pictures = val.value.filter(a=>a.type == '2')
      if(!proxy.isNull(pictures)){
        pictures.forEach(picture => {
          state.fileList.push({ url: picture.value, response: {data: picture.value} })
          state.form.pictures.push(picture.value)
          let del = Object.assign({}, {o: "o_sensor_img", t: 'del', a: '删除'}, picture)
          state.delForm.push(del)
        })
      }
    }
    console.log('state.delForm---', state.delForm)
    console.log('state.form---', state.form)
  }

  const uploadImageFile = async(options, key) => {
    if (options.file) {
      const reader = new FileReader()
      reader.readAsDataURL(options.file)
      reader.onload = async () => {
        const base64Data = reader.result
        state.form[key] = base64Data
      }
    }
  }

  // const uploadImageFiles = async(options, key) => {
  //   console.log('options---', options)
  //   if (options.file) {
  //     const reader = new FileReader()
  //     reader.readAsDataURL(options.file)
  //     reader.onload = async () => {
  //       const base64Data = reader.result
  //       state.form[key].push(base64Data)
  //     }
  //   }
  // }

  const uploadImageFiles = async (options, key, maxWidth = 800, maxHeight = 800) => {
    if (!options.file) return;
    if (options.file.size < 500 * 1024) {
      const reader = new FileReader()
      reader.readAsDataURL(options.file)
      reader.onload = async () => {
        const base64Data = reader.result
        state.form[key].push(base64Data)
      }
    }else{
      console.log('大于500KB开始压缩----------');
      console.log(`压缩前-: ${(options.file.size / 1024).toFixed(2)} KB`);
      try {
        const base64Data = await readFileAsDataURL(options.file);
        const compressedImage = await resizeImage(base64Data, maxWidth, maxHeight);
        const compressedSize = (compressedImage.length * (3 / 4)) / 1024
        console.log(`压缩后-: ${compressedSize.toFixed(2)} KB`);
        // 更新 Vue 的状态
        state.form[key].push(compressedImage)
      } catch (error) {
        console.error('Image upload error:', error);
      }
    }
  };

  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const resizeImage = (base64Data, maxWidth, maxHeight) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = base64Data;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // 计算新的宽高
        let width = img.width;
        let height = img.height;

        // 计算新的大小，保持纵横比
        if (width > height) {
          if (width > maxWidth) {
            height *= (maxWidth / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= (maxHeight / height);
            height = maxHeight;
          }
        }

        // 设置画布的宽高
        canvas.width = width;
        canvas.height = height;

        // 将图片绘制到画布上
        ctx.drawImage(img, 0, 0, width, height);

        // 获取压缩后的 Base64 数据
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8); // 控制质量，这里使用 0.8，可以根据需要调整
        resolve(compressedBase64);
      };

      img.onerror = (error) => reject(error);
    });
  };


  const onRemove = async(file, fileList) => {
    console.log('fileList', fileList)
    state.form.pictures = []
    fileList.forEach(file => {
      if (file.raw instanceof Blob) {
        const reader = new FileReader()
        reader.readAsDataURL(file.raw)
        reader.onload = async () => {
          const base64Data = reader.result
          state.form.pictures.push(base64Data)
        }
      }else{
        state.form.pictures.push(file.url)
      }
    })
  }

  const handleSubmit = (formEl) => {
    formEl.validate (async valid => {
      if (valid) {
        if(!proxy.isNull(state.form.picture) || !proxy.isNull(state.form.pictures)){
          console.log('state.form---------------', state.form)
          // 清空
          if(!proxy.isNull(state.delForm)) delForm()
          // 组装新增
          state.addForm = []
          if(!proxy.isNull(state.form.picture)){
            let val = {id: new Date().getTime(), sensor_type: model.value.type, sensor_id: model.value.id, stationNum: publicStore.distributId, type: '1', value: state.form.picture}
            let add = Object.assign({}, {o: "o_sensor_img", t: 'add', a: '新增'}, val)
            state.addForm.push(add)
          }
          if(!proxy.isNull(state.form.pictures)){
            state.form.pictures.forEach((picture, index) => {
              let val = {id: new Date().getTime()+index+1, sensor_type: model.value.type, sensor_id: model.value.id, stationNum: publicStore.distributId, type: '2', value: picture}
              let add = Object.assign({}, {o: "o_sensor_img", t: 'add', a: '新增'}, val)
              state.addForm.push(add)
            })
          }  
          console.log('state.addForm---------------', state.addForm)
          // 新增
          if(!proxy.isNull(state.addForm)) addForm()
        }
      }
    })
  }

  const delForm = async() => {   
    console.log('state.delForm', state.delForm)
    api.updateApi(state.delForm).then((res:any) => {
      if(res.errcode == 0){
        console.log('删除成功')
      }
    })
  }

 const addForm = async() => {   
    console.log('state.addForm', state.addForm)
    api.updateApi(state.addForm).then((res:any) => {
      if(res.errcode == 0){
        ElNotification({ title: '提示', message: '操作成功', type: 'success' })
        onVisable()
      }
    })
  }

  // 暴露给父组件
  defineExpose({
    onVisable
  })
</script>

<style scoped lang="scss">
  .avatar-uploader {
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-wrap: wrap;
  }
  :deep(.el-upload){
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    color: rgb(38, 99, 170);
    width: 120px;
    height: 120px;
    border: 1px dashed rgb(38, 99, 170);
    border-radius: 8px;
    overflow: hidden;
  }
  :deep(.el-upload--picture-card){
    background: none;
  }
  :deep(.el-upload-list__item){
    transition: all 0s cubic-bezier(.55,0,.1,1);
    background: none;
    width: 120px;
    height: 120px;
    border: 1px dashed rgb(38, 99, 170);
    border-radius: 8px;
    overflow: hidden;
  }
  :deep(.el-upload-list__item.is-ready) {
    display: none;
  }
  :deep(.el-image__error){
    font-size: 12px;
    line-height: 16px;
  }
  .avatar {
    width: 120px;
    height: 120px;
    display: block;
  }
</style>
