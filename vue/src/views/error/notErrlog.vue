<template>
  <div class="layout">
    <div class="layout-col p20">
      <!-- 头部 -->
      <div class="ww100 flex-sc mb20">
        <div class="rad4 ptb5 plr8 flex-cc cursor bgi22 i21 ml10 bo-i21-1" @click.stop="handleClick('err', {path: './log/log'})">
          <i-ep-chatSquare class="f12 fw" />
          <span class="f14 ml4">日志1</span>
        </div>
        <div class="rad4 ptb5 plr8 flex-cc cursor bgi22 i21 ml10 bo-i21-1" @click.stop="handleClick('err', {path: './logs/cyg-main.log'})">
          <i-ep-chatLineRound class="f12 fw" />
          <span class="f14 ml4">日志2</span>
        </div>
        <div class="rad4 ptb5 plr8 flex-cc cursor bgi22 i21 ml10 bo-i21-1" @click.stop="handleClick('err', {path: './logs/cyg-main-err.log'})">
          <i-ep-chatLineSquare class="f12 fw" />
          <span class="f14 ml4">日志3</span>
        </div>
        <div class="rad4 ptb5 plr8 flex-cc cursor bgi22 i21 ml10 bo-i21-1" @click.stop="handleClick('err', {path: './logs/supervisord.log'})">
          <i-ep-chatDotSquare class="f12 fw" />
          <span class="f14 ml4">日志4</span>
        </div>
        <div class="flex1 flex-ec">
          <el-input class="w50x4" v-model="state.query.path" placeholder="路径..." />
          <div class="rad4 ptb5 plr8 flex-cc cursor bgi22 i21 ml10 bo-i21-1" @click.stop="init()">
            <i-ep-search class="f12 fw" />
            <span class="f14 ml4">查看</span>
          </div>
        </div>
      </div>
      <!-- 内容 -->
      <div class="ww100 flex-col overlay pb5 relative">
        <div class="absolute t10 r10 cursor z1 i1" @click.stop="delAll()">清空</div>
        <el-input v-model="state.data.content" style="width: 100%" autosize type="textarea" placeholder="内容..." />
      </div>
   </div>
  </div>
</template>

<script lang="ts" setup>
  import scheduled from "@/utils/scheduled"
  const { createScheduled } = scheduled()
  const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
	const configStore = proxy.configStore()
  const state = reactive({
	  ...publicStore.$state,
    query: {path: './log/log'},
  })

  onMounted(async() => {
    init()
    // createScheduled('clock', 5000, () => { init() })
	})

  const init = async() => {
    let res = await publicStore.http({Api: state.query}, '/api/v1/terminal/base/errlog')
    state.data = proxy.isNull(res)? [] : res
    console.log("data", state.data)
  }

  const delAll = async => {
    ElMessageBox.confirm('是否确定删除?', '删除提示', {confirmButtonText: '确定', cancelButtonText: '关闭', type: 'error'}).then(() => {
      let query =  {path: state.query.path, del: true}
      publicStore.http({Api: query}, '/api/v1/terminal/base/errlog').then(res=>{
        init()
      })
    })
  }

  const handleClick = async(remark, val) => {
    if(remark == 'err'){
      state.query = {...val}
      init()
    }
  }
</script>
  
<style scoped lang="scss">

</style>
  