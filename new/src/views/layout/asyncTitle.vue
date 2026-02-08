<template>
  <div class="relative ww100 flex-sc bg-white bob-cd-1">
    <div class="ww100 h70"></div>
    <div class="absolute-cc tc ww100 hh100 flex-bc plr15">
      <div class="f20 flex-sc ww20 fw">
        <img class="mr10 w30" src="@/assets/images/a_logo.png" />
        <span>山西省城市体检评估管理信息平台</span>
        <span> </span>
      </div>
      <div class="hh100 flex1 flex-ec i2 f16">
        <div class="hh100 flex1 flex-sc">
          <div class="hh100 flex-col-cc relative mlr15 cursor" :class="route.path.indexOf('/scheme')!=-1?'bob-i1-1':''" @click.stop="toPath('/scheme')">
            <span class="actfont" :class="route.path.indexOf('/scheme')!=-1?'i1':''">更新规划策划</span>
          </div>
          <div class="hh100 flex-col-cc relative mlr15 cursor" :class="route.path.indexOf('/action')!=-1?'bob-i1-1':''" @click.stop="toPath('/action')">
            <span class="actfont" :class="route.path.indexOf('/action')!=-1?'i1':''">实施与调度管理</span>
          </div> 
          <div class="hh100 flex-col-cc relative mlr15 cursor" :class="route.path.indexOf('/problem')!=-1?'bob-i1-1':''" @click.stop="toPath('/problem')">
            <span class="actfont" :class="route.path.indexOf('/problem')!=-1?'i1':''">体检整改跟踪</span>
          </div>
          <div class="hh100 flex-col-cc relative mlr15 cursor" :class="route.path.indexOf('/knowledge')!=-1?'bob-i1-1':''" @click.stop="toPath('/knowledge')">
            <span class="actfont" :class="route.path.indexOf('/knowledge')!=-1?'i1':''">知识库</span>
          </div>
          <el-popover placement="bottom" width="4%">
           <div class="flex-col tc" v-if="!isNull(configStore.routes)">
             <div class="ww100 flex-sc p5 cursor actfont" v-for="(v, i) in findNode(configStore.routes, node => node.path=='/base', 'children')" :key="i" 
              :class="route.path == v.path?'i1':''" @click.stop="toPath(v.path)">{{ v.name }}</div>
           </div>
            <template #reference> 
              <div class="hh100 flex-col-cc relative mlr15 cursor" :class="route.path.indexOf('/base')!=-1?'bob-i1-1':''" @click.stop="toPath('/base')">
                <span class="actfont" :class="route.path.indexOf('/base')!=-1?'i1':''">基础数据管理</span>
              </div>
            </template>
          </el-popover>
        </div>
        <div class="flex-sc cursor relative ml20" @click.stop="">
          <div class="w12 h12 absolute t0 r0 rad50 bo-white-1 bgi3"></div>
          <i-ep-bellFilled class="f20 c6" />
        </div>
        <el-popover placement="bottom" width="12%" trigger="click" :visible="state.isFalse">
          <template #reference>
            <div class="flex-ec cursor ml20" @click="state.isFalse=!state.isFalse">
              <div class="cursor w30 h30 tc bg6 rad50 flex-cc mlr5">
                <i-ep-avatar class="white" />
              </div>
              <span class="cursor flex-cc">
                <!-- <span class="mr5 f15 title">{{configStore.user.name}}</span> -->
                <i-ep-caretBottom class="fontStyle" />
              </span>
            </div>
          </template>
          <div class="ww100 lh26">
            <div class="mb5">名称：{{configStore.user.name?decrypt(configStore.user.name):'暂无'}}</div>
            <!-- <div>角色：{{find(configStore.roleList, ['id', configStore.user.function_role], 'role_name')}}</div> -->
            <div class="mb5">电话：{{configStore.user.phone?encryptPhone(decrypt(configStore.user.phone)) : '暂无'}}</div>
            <div class="mb5 tr">
              <el-button type="primary" plain size="small" @click="toPath('/admin')">后台</el-button>
              <el-button type="info" plain size="small" @click="state.isFalse=!state.isFalse">关闭</el-button>
              <el-button type="danger" plain size="small" @click="loginOut()">退出</el-button>
            </div>
          </div>
        </el-popover>
      </div>
    </div>
    <Setting ref="setRef" />
    <Password :state="state" ref="passwordRef" />
  </div>
</template>

<script lang="ts" setup>
  import Setting from '@/components/Setting'
  const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  let setRef = $ref()
  let passwordRef = $ref()
  const route = useRoute()
  const state = reactive({
	  ...publicStore.$state,
  })

  onMounted(async() => {
    if(configStore.password && configStore.password=='true'){
      passwordRef.onVisable({password: '', passwords: ''})
    }
  })

  watch(() => configStore.user, async(val) => {
    await nextTick()
    console.log("configStore.user---改变", val)
    if(proxy.isNull(configStore.user)) state.isFalse = false
  }, {immediate: false, deep: true})

  const changeAsideWidth = () => {
    if(configStore.isCollapse){
      configStore.$patch({isCollapse: false, asideWidth: '230px'})
    }else{
      configStore.$patch({isCollapse: true, asideWidth: '64px'})
    }
  }

  const loginOut = () => {
    let user = !proxy.isNull(configStore.user)?configStore.user.name:''
    let username = !proxy.isNull(configStore.user)?configStore.user.username:''
    proxy.log([{level: 'info', type: '2', name: '退出', msg: `退出成功`, res: '1', user: user, username: username, stationnum: configStore.distributId}])   
    configStore.$patch({token: '', user: '', distributId: '', routes: []})
    proxy.toPath(configStore.loginRoute? configStore.loginRoute : '/home')
    state.isFalse = false
  }
</script>

<style scoped lang="scss">

</style>

