import request from '@/utils/request'

const api:any = {
  httpApi(data: any, url: any = "/api/v1/terminal/base/handleHttp", headers: any = {}, method: any = 'post') {
    return request({
      headers: headers,
      url: url,
      method: method,
      data: data
    })
  },

  systemApi(data: any, url: any = "/api/v1/terminal/base/system", headers: any = {}, method: any = 'post') {
    return request({
      headers: headers,
      url: url,
      method: method,
      data: data
    })
  },

  codeApi(data: any, url: any = "/api/v1/terminal/user/code", headers: any = {}, method: any = 'post') {
    return request({
      headers: headers,
      url: url,
      method: method,
      data: data
    })
  },

  sendCodeApi(data: any, url: any = "/api/v1/terminal/user/sendCode", headers: any = {}, method: any = 'post') {
    return request({
      headers: headers,
      url: url,
      method: method,
      data: data
    })
  },

  loginApi(data: any, url: any = "/api/v1/terminal/user/login", headers: any = {}, method: any = 'post') {
    return request({
      headers: headers,
      url: url,
      method: method,
      data: data
    })
  },

  uploadApi(data: any, url: any = "/api/v1/terminal/base/uploadFile", headers: any = {}, method: any = 'post') {
    return request({
      headers: headers,
      url: url,
      method: method,
      data: data
    })
  },

  getApi(data: any, url: any = "/api/v1/terminal/high/get", headers: any = {}, method: any = 'post') {
    return request({
      headers: headers,
      url: url,
      method: method,
      data: data
    })
  },

  setApi(data: any, url: any = "/api/v1/terminal/high/set", headers: any = {}, method: any = 'post') {
    return request({
      headers: headers,
      url: url,
      method: method,
      data: data
    })
  },

  addApi(data: any, url: any = "/api/v1/terminal/middle/add", headers: any = {}, method: any = 'post') {
    return request({
      headers: headers,
      url: url,
      method: method,
      data: data
    })
  },

  updApi(data: any, url: any = "/api/v1/terminal/middle/upd", headers: any = {}, method: any = 'post') {
    return request({
      headers: headers,
      url: url,
      method: method,
      data: data
    })
  },

  delApi(data: any, url: any = "/api/v1/terminal/middle/del", headers: any = {}, method: any = 'post') {
    return request({
      headers: headers,
      url: url,
      method: method,
      data: data
    })
  },

  logApi(data: any, url: any = "/api/v1/terminal/middle/log", headers: any = {}, method: any = 'post') {
    return request({
      headers: headers,
      url: url,
      method: method,
      data: data
    })
  },

  Api(data: any, url: any = "/api/v1/terminal/middle/query", headers: any = {}, method: any = 'post') {
    return request({
      url: url,
      headers: headers,
      method: method,
      data: data
    })
  },

  Api1(data: any, url: any = "/api/v1/terminal/middle/query", headers: any = {}, method: any = 'post') {
    return request({
      url: url,
      headers: headers,
      method: method,
      data: data
    })
  },

  Api2(data: any, url: any = "/api/v1/terminal/middle/query", headers: any = {}, method: any = 'post') {
    return request({
      url: url,
      headers: headers,
      method: method,
      data: data
    })
  },

  Api3(data: any, url: any = "/api/v1/terminal/middle/query", headers: any = {}, method: any = 'post') {
    return request({
      url: url,
      headers: headers,
      method: method,
      data: data
    })
  },

  Api4(data: any, url: any = "/api/v1/terminal/middle/query", headers: any = {}, method: any = 'post') {
    return request({
      url: url,
      headers: headers,
      method: method,
      data: data
    })
  },

  Api5(data: any, url: any = "/api/v1/terminal/middle/query", headers: any = {}, method: any = 'post') {
    return request({
      url: url,
      headers: headers,
      method: method,
      data: data
    })
  },

  queryApi(data: any, url: any = "/api/v1.0/p3000/middata/query", headers: any = {}, method: any = 'post') {
    return request({
      url: url,
      headers: headers,
      method: method,
      data: data
    })
  },

  remote(data: any, url: any = "/api/v1.0/p3000/monitorOnline/commFrontEndProcessor/sensor/remoteCtrl", headers: any = {}, method: any = 'post') {
    return request({
      headers: headers,
      url: url,
      method: method,
      data: data
    })
  },
  
  remotes(data: any, url: any = "/api/v1.0/p3000/monitorOnline/commFrontEndProcessor/sensor/remoteCtrls", headers: any = {}, method: any = 'post') {
    return request({
      headers: headers,
      url: url,
      method: method,
      data: data
    })
  },

  // remotes(data: any, url: any = "/api/v1.0/p3000/monitorOnline/commFrontEndProcessor/sensor/dlqremoteCtrl", headers: any = {}, method: any = 'post') {
  //   return request({
  //     headers: headers,
  //     url: url,
  //     method: method,
  //     data: data
  //   })
  // },

}

export default api
