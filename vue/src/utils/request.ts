  import axios, { AxiosInstance, AxiosRequestConfig } from "axios"
  import router from '@/router'
  import configStore from '../stores/configStore'
  import publicStore from '../stores/publicStore'
  import { isNull, getHttp, toPath, encryptData, decryptData, encrypt, setLog } from "../utils/common"
  // 基础配置
  const service = axios.create({
    baseURL: "",
    timeout: 60000,
    withCredentials: true,
    credentials: 'include', 
  })
  // 刷新 CSRF Token 的标记和队列
  let isRefreshing = false
  let refreshSubscribers = []
  // 添加请求拦截器
  service.interceptors.request.use((req: any) => {
    const headers = req.headers
    headers['X-CSRF-Token'] = configStore().csrfToken
    headers['AuthToken'] = configStore().secret_key? 'xyz'+ encrypt('xyz'+configStore().secret_key) : ''
    headers['Authorization'] = configStore().token || ''
    req.baseURL = getHttp(req)
    if(configStore().secret_key){
      if (!req.status && !configStore().debugapi && configStore().config && !configStore().config.secret) {
        if(req.url.indexOf('/terminal') != -1){
          headers['Content-Type'] = 'text/plain'
          req.data = encryptData(req.data)
        }
      }
    }
    delete headers.ip 
    return req
    }, (error) => {
    return Promise.reject(error);
  })
 
  // 添加响应拦截器
  service.interceptors.response.use((res: any) => {
    if(res.headers && res.headers['x-csrf-token']) configStore().csrfToken = res.headers['x-csrf-token']
    if(configStore().secret_key){
      if (!configStore().debugapi && configStore().config && !configStore().config.secret) {
        if(res.request.responseURL.indexOf('/terminal') != -1){
          if(typeof res.data === 'string') {
            res.data = decryptData(res.data)
            res.config.data = decryptData(res.config.data)
          }
        }
      }
    }
    setLog(res)
    let code = res.data.code
    let errcode = res.data.errcode
    if (code === 200 || code === '200' || code === 400 || code === '400' || errcode === 0 || errcode === '0') {
      return res.data
    } else if (code === 600 || code === '600') {
      ElNotification({ title: '提示', message: '请重新登录', type: 'error' })
      configStore().token = ''
      configStore().user = ''
      configStore().routes = []
      const timeoutId = setTimeout(() => {
        // 获取当前路由信息
        const currentRoute = router.currentRoute.value
        // 获取当前路由的组件
        const matchedRoute = currentRoute.matched.length > 0 ? currentRoute.matched[0] : null
        if (matchedRoute && matchedRoute.components && matchedRoute.components.default) {
          const componentPath = matchedRoute.components.default.__file
          if(componentPath.indexOf('admin') != -1){
            router.push({path: configStore().loginRoute})
          }
        }
        clearTimeout(timeoutId)
      }, 1000);
      return Promise.reject(res)
    } else if (code === 601 || code === '601') {
      ElNotification({ title: '提示', message: '账号或密码错误', type: 'error' })
      return Promise.reject(res)
    } else if (code === 606 || code === '606') {
      ElNotification({ title: '提示', message: '账号或密码错误', type: 'error' })
      return Promise.reject(res)
    } else if (code === 700 || code === '700') {
      ElNotification({ title: '提示', message: res.data.msg, type: 'error' })
      return Promise.reject(res)
    } else {
      return Promise.reject('error')
    }
  }, error => {
    if(error.response.headers && error.response.headers['x-csrf-token']) configStore().csrfToken = error.response.headers['x-csrf-token']
    // 处理 CSRF Token 过期
    if (error.response?.status === 403 && error.response.data?.msg === 'CSRF token invalid') {
      return handleCsrfTokenExpired(error)
    }
    // 处理 网络错误
    if (error.message === 'Network Error') {
      console.log('服务器连接异常，请检查服务器！ --------------- ')
      return false
    }
    return Promise.reject(error)
  })

  // 处理 CSRF Token 过期
  async function handleCsrfTokenExpired(error) {
    const originalRequest = error.config
    // 所有请求（包括第一个）都进入队列
    return new Promise((resolve, reject) => {
      // 将请求加入队列
      refreshSubscribers.push(() => {
        originalRequest.status = true
        service(originalRequest).then(resolve).catch(reject)
      })
      // console.log(`请求进入队列，当前队列大小: ${refreshSubscribers.length}`)
      // 如果是第一个请求，触发Token刷新
      if (!isRefreshing) {
        isRefreshing = true
        publicStore().http({Api: {}}, '/api/v1/terminal/base/csrfToken', {}, 'get').then(() => {
            // 成功时开始所有请求
            console.log("开始...")
            refreshSubscribers.forEach(fn => fn())
          }).catch(err => {
            // 失败时拒绝所有请求
            console.log("拒绝...")
            refreshSubscribers.forEach(fn => { reject(err) })
          })
        .finally(() => {
          console.log("结束...")
          isRefreshing = false
          refreshSubscribers = []
        })
      }
    })
  }

  export default service;

 
