import router from '@/router'
import configStore from '@/stores/configStore'
import publicStore from '@/stores/publicStore'
import { isNull } from "@/utils/common"
const modules = import.meta.glob('@/views/**/**.vue')

router.beforeEach(async (to: any, from: any, next) => {
  // 仅允许字母、数字、斜杠和连字符
  if (!to.path.match(/^\/[a-zA-Z0-9\/\-_]*$/)) return next('/404')
  // 未匹配到任何路由
  if(!checkRoute(window.location.href)) return window.location.replace(`${window.location.origin}/#/404`)  
  // 消毁echarts
  publicStore().rechart()
  // 初始化
  publicStore().$reset()
  // 设置头部
  document.title = to.name? to.name : ''
  // CSRF策略
  if(!configStore().csrfToken){
    await publicStore().http({Api: {}}, '/api/v1/terminal/base/csrfToken', {}, 'get')
  }
  // 全局配置
  if(isNull(configStore().configs) && configStore().key){
    let query = {model: "t_config", args: `name='${configStore().key}'`}
    publicStore().http({Api: query}).then(res=>{
      if(isNull(res)) return
      if(!res[0].attr) return
      try {
        let attr = JSON.parse(res[0].attr)
        configStore().configs = attr.reduce((acc, {code, value}) => ({...acc, [code]: value}), {})
      } catch (err) {
        console.error(err)
      }
    })
  }
  // 无需登录
  if(!configStore().isLogin) return next() 
  // 登录地址
  let loginRoute = configStore().loginRoute? configStore().loginRoute : '/home'
  // 1.验证token
  if (!configStore().token) {
    // 默认登录
    let params = getUrlParams()
    if(params != null){
      // username: YWRtaW4= 
      // password: 23ZVR791D1D9348606965B2D829DB16693FC223ZVR
      // http://xxx/#/home?username=YWRtaW4=&password=23ZVR791D1D9348606965B2D829DB16693FC223ZVR&userid=1&link=https://www.baidu.com
      let query = {model: "t_user", args: `username='${params.username}' and password='${params.password}'`}
      let res = await publicStore().http({loginApi: query})
      if(!isNull(res)){
        configStore().$patch({token: res.token, user: res.user, distributId: res.user.station_num?res.user.station_num:configStore().distributId?configStore().distributId:'', password: 'false', tourist: params})
        return next('/home')
      }else{
        console.log("默认登录失败")
        configStore().$patch({token: '', user: {}, distributId: '', password: 'false', tourist: {}})
      }
    }
    if (to.meta.next)  return next()
    return next(loginRoute)
  } 
  // 角色动态路由
  if (configStore().isRoute && configStore().isRoute != 'false' && configStore().routes.length == 0 && !to.meta.next) {
    // 获取路由数据+权限数据
    let res:any = await publicStore().http({Api: {model: "role_route_auth"}})
    // 生成动态路由
    if(res.length != 0){
      let routes = filterRoutes(res.routes.sort((a:any, b:any) => a.order - b.order), 'id', 'parent_id', 'children', '')
      // 动态挂载路由
      routes.forEach((route:any) => {router.addRoute(route)})
      configStore().routes = routes
      // 获取权限列表
      configStore().auths = res.auths
      // 需登录 无需验证token
      if (to.meta.next) {
        return next()
      } else {
        next({ ...to, replace: true })
      }
    }else{
      // 需登录 无需验证token
      if (to.meta.next) {
        return next()
      } else {
        next(loginRoute)
      }
    }
  }else {
    publicStore().init(to)
    next()
  }
  // 2.验证角色
  // const auth = store.getters.user? store.getters.user.roles : ''
  // if (authList && !auth.some((role : any )=> authList.includes(role))) return next('/noPermission')
  // next()
})

router.afterEach(() => {
 
})

// 动态路由重组
export function filterRoutes(source:any, id:any, parentId:any, children:any, childDefault:any) {  
  let cloneData = JSON.parse(JSON.stringify(source));
  return cloneData.filter((father:any)=>{
    father.meta = { isroute: father.isroute, icon: father.icon }
    delete father.isroute
    let component = father.component.substr(0, 1) != '/'? '/' + father.component : father.component
    father.component = modules[`/src/views${component}.vue`]
    let branchArr = cloneData.filter((child:any) => father[id] == child[parentId]);
    branchArr.length>0 ? father[children] = branchArr : childDefault ? father[children] = childDefault : '';
    return father[parentId] == 0;
  })
}

// 检查动态路由
export function checkRoute(url) {  
  const paths = url.replace(/^https?:\/\//, '').split(/\/(.*)/, 2)
  if(!paths[1]) return true
  if(paths[1].length == 0) return true
  if(paths[1] && paths[1][0] == '#') return true
  return false
}

// 获取当前页面URL的查询参数
export function getUrlParams() {
  const url = window.location.href
  const queryString = url.split('?')[1]
  if (!queryString) return null
  const urlParams = new URLSearchParams(queryString)
  const params = {}
  // 检查是否包含 username 和 password
  if (urlParams.has('username') && urlParams.has('password')) {
    for (const [key, value] of urlParams.entries()) {
      params[key] = value
    }
    return params
  }
  return null
}