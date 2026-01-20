  import configStore from '@/stores/configStore'
	import publicStore from '@/stores/publicStore'
  import CryptoJS from 'crypto-js'
	import router from '@/router'
	import api from '@/api'
	// 权限
	export function isAuth() {
    let auth:any = router.currentRoute.value.meta.auth
    if(auth && auth.length != 0 && configStore().token){
      let time = new Date().getTime() - parseInt(configStore().token)
      if(time >= 60*60*1000){ 
        configStore().token = ''
        configStore().user = ''
        router.push({path: '/home'})
      }else{
        configStore().token = new Date().getTime() + ''
      }
    }else{
      if(configStore().token){
        let time = new Date().getTime() - parseInt(configStore().token)
        if(time >= 60*60*1000){ 
          configStore().token = ''
          configStore().user = ''
        }
      }
    }
	}
	// 请求ip
	export function getIp() {
		let ip = configStore().ip.trim()
		if(ip.indexOf('http') == -1) {
			ip = 'http://' + ip
		}
		return ip
	}
  // 请求地址
  export function getHttp(type:any='') {
    // isAuth()
    // 绑定ip和端口
    if(type == 'origin' || type == 'url' || type == 'ip' || type == 'prot'){
      let origin = import.meta.env.MODE != 'development'? window.location.origin : import.meta.env.VITE_BASE_URL
      // 使用正则表达式替换所有协议（http:// 和 https://）
      let req = origin.replace(/^(http:\/\/|https:\/\/)/, "")
      let i = req.indexOf(':')
      if(type == 'origin') return origin
      if(type == 'url') return req
      if(type == 'ip') return req.substring(0, i)
      if(type == 'prot') return req.substring(i+1, req.length)
    }else{
      // 临时动态ip
      if(type.headers && type.headers.ip) return type.headers.ip.indexOf('http') == -1? 'http://' + type.headers.ip : type.headers.ip
      // 切换动态ip
      let ip = configStore().ip.trim()
      if(ip) return ip.indexOf('http') == -1? 'http://' + ip : ip
      // 生产环境ip
      let produrl = configStore().produrl
      if(import.meta.env.MODE != 'development' && produrl) return produrl.indexOf('http') == -1? 'http://' + produrl : produrl
      // 生产环境默认ip
      if(import.meta.env.MODE != 'development' && !produrl) return window.location.origin
      // 开发环境ip
      return ''
    }      
  }
	// 公用属性
	export function setPublic(obj:any) {
	  publicStore()._public = Object.assign(publicStore()._public, obj)
	}
  // 跳转页面
  export function toPath(path:any, query:any = '', type:any = '') {
    if(type == 1){
      window.location.href = path
    }else{
      if(query){
        router.push({ path: path, query: query })
      }else{
        router.push({ path: path })
      }
    }
  }
  // 判断空
  export function isNull(val:any) {
    let valString = typeof(val) == 'object'? JSON.stringify(val) : val + ""
    let verificationType = ["", "null", "undefined", "{}", "[]"]
    return verificationType.includes(valString)
  }
  // 对象转换
  export function varObj(name:any, val:any) {
    var objName = name
    var objValue = val
    var obj:any = {}
    obj[objName] = objValue
    return obj
  }
  // 数组条件取值
  export function find(array:any, condition:any, name:any) {
    let value = array.find((a:any) => { return a[condition[0]] == condition[1] })
    return value != undefined? name != undefined? value[name]: value : ""
  }
  // 数组条件取下标
  export const findIndex = (array:any, condition:any) => {
    let index = array.findIndex((a:any) => { return a[condition[0]] == condition[1] })
    return index != -1? index : ""
  }
  // 数组去重
  export function findReduct(array:any, condition:any) {
    let obj:any = {};
    let arr = array.reduce((cur:any, item:any) => {
      obj[item[condition]] ? "" : obj[item[condition]] = true && cur.push(item)
      return cur;
    },[]) 
    return arr
  }
  // 两数组并集
  export function findUnion(array:any, array2:any, condition:any) {
    let arr = Array.from(new Set([...array, ...array2]))
    return findReduct(arr, condition)
  }
  // 两数组交集
  export function findInter(array:any, array2:any, condition:any, condition2:any) {
    let arr = [...array].filter(x => [...array2].some(y => y[condition] === x[condition2?condition2:condition]));
    return arr
  }
  // 两数组补集
  export function findDiffer(array:any, array2:any, condition:any, condition2:any) {
    let arr = [...array].filter(x => [...array2].every(y => y[condition] !== x[condition2?condition2:condition]));
    return arr
  }
  // 选择全部
  export function checkAll(state: any, array:any) {
    state.check = !state.check
    array.forEach((item:any) => item.check = state.check)
  }
  // 当前时间
  export function clock() {
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
    const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
    const hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
    const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
    const seconds = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
    // let week = date.getDay() // 星期
    // let weekArr = [ '星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六' ]
    const time = { ymd: year + '-' + month + '-' + day, sfm: hours + ':' + minutes + ':' + seconds}
    return time
  }
  // 日期格式化
  export function parseTime(time: any, pattern: any) {
    if (arguments.length === 0 || !time) {
      return null
    }
    const format = pattern || '{y}-{m}-{d} {h}:{i}:{s}'
    let date
    if (typeof time === 'object') {
      date = time
    } else {
      if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
        time = parseInt(time)
      }
      if ((typeof time === 'number') && (time.toString().length === 10)) {
        time = time * 1000
      }
      date = new Date(time)
    }
    const formatObj:any = {
      y: date.getFullYear(),
      m: date.getMonth() + 1,
      d: date.getDate(),
      h: date.getHours(),
      i: date.getMinutes(),
      s: date.getSeconds(),
      a: date.getDay()
    }
    const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result: any, key: any) => {
      let value = formatObj[key]
      // Note: getDay() returns 0 on Sunday
      if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value] }
      if (result.length > 0 && value < 10) {
        value = '0' + value
      }
      return value || 0
    })
    return time_str
  }
  // 替换对象字段名称
  export function renameProperty(obj:any, oldName:any, newName:any) {
    let rest 
    // 检查对象中是否有旧属性名
    if (obj.hasOwnProperty(oldName)) {
      // 使用解构语法将旧属性名重命名为新属性名
      ({ [oldName]: obj[newName], ...rest } = obj);
      // 将对象的属性重新组装
      obj = { [newName]: obj[newName], ...rest };
    }
    return obj;
  }
  // 判断对象是否相同
  export function deepObjectEquals(obj1:any, obj2:any) {
    if (Object.keys(obj1).length !== Object.keys(obj2).length) {
      return false;
    }
    for (let key in obj1) {
      if (typeof obj1[key] === "object" && typeof obj2[key] === "object") {
        if (!deepObjectEquals(obj1[key], obj2[key])) {
          return false;
        }
      }
      else if (obj1[key] !== obj2[key]) {
        return false;
      }
    }
    return true;
  }
  // 判断数组是否相同
  export function deepArrayEquals(arr1:any, arr2:any) {
    if (arr1.length !== arr2.length) {
      return false;
    }
    for (let i = 0; i < arr1.length; i++) {
      if (Array.isArray(arr1[i]) && Array.isArray(arr2[i])) {
        if (!deepArrayEquals(arr1[i], arr2[i])) {
          return false;
        }
      }
      else if (arr1[i] !== arr2[i]) {
        return false;
      }
    }
    return true;
  }
  // 解码json
  export function resolveJSON(str:any) {
    try {
      const result = JSON.parse(str)
      return result
    } catch(e) {
      console.error(e)
      return str
    }
  }
  // 判断json
  export function isJSON(str:any) {
    if (typeof str != 'string') {
      console.log('It is not a string! [' + str + ']')
      return false;
    } try {
      var obj = JSON.parse(str);
      if (typeof obj == 'object' && obj) {
        console.log('转换成功：' + str);
        return true;
      } else {
        console.log('转换失败：' + str);
        return false;
      }
    } catch (e) {
      console.log('error：[' + str + '] !!! ' + e);
      return false;
    }
    return false;
  }
  // 判断数组
  export function isArray(str:any) {
    if(str.constructor === Array){
      return true
    }else{
      return false
    }
  }
  // 判断对象
  export function isObject (str:any) {
    return isType('Object', str);
  }
  export function isType (type:any, value:any) {
    return Object.prototype.toString.call(value) === `[object ${type}]`;
  }
  // 图片
  export function I(url: any) {
    if(configStore().imageurl) return configStore().imageurl.indexOf('http') == -1? `http://${configStore().imageurl}/${url}` : `${configStore().imageurl}/${url}`
    if(configStore().ip) return configStore().ip.indexOf('http') == -1? `http://${configStore().ip}/${url}` : `${configStore().ip}/${url}`
    if(configStore().produrl && import.meta.env.MODE != 'development') return configStore().produrl.indexOf('http') == -1? `http://${configStore().produrl}/${url}` : `${configStore().produrl}/${url}`
    return `${import.meta.env.VITE_BASE_URL}/${url}`
  }
  // 多图上传处理
  export function file(list: any) {
    if(!list) return
    if(typeof(list)=='string') return
    return list.map((item: any) => {
      return { url: I(item), response: {data: item} }
    })
  }
  // 列表图片字段处理url
  export function listUrl(list:any, key:any) {
    list.forEach((a:any) => { a[key] = a[key] && typeof(a[key] == 'string')? JSON.parse(a[key]) : [] })
    return list
  }
  // 获取路径资源
  export function fetchData(url:any) {
    return new Promise((resolve, reject) => {
      fetch(url)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          resolve(data ? data : {});
        })
        .catch((error) => {
          // 处理任何错误并拒绝 Promise
          reject(`Fetch failed: ${error.message}`);
        });
    });
  }
  // 判断日志
  export async function setLog(response:any) {
    const url:any = response.request.responseURL
    const data = response.config && response.config.data? typeof response.config.data === 'string'? JSON.parse(response.config.data) : response.config.data : ''
    const keys = ['add', 'upd', 'del', 'login']
    const key = keys.find(a => url.includes(a))
    if(key) {
      let type = ''
      let mark = ''
      let msg  = ''
      let user = ''
      let username = ''
      let stationnum = ''
      let res = response.data&&response.data.code==200? '1':'0'
      let resmsg = res == '1'? '成功' : '失败'
      // 系统日志
      if(key == 'login'){
        type = '2'
        mark = '登录'
        if(res == '1' && response.data.data && response.data.data.user){
          user = response.data.data.user.name
          username = response.data.data.user.username
          stationnum = response.data.data.user.station_num
          msg += `${mark}` 
          msg += resmsg
        }else{
          let request = configStore().config && configStore().config.secret?decryptData(response.config.data) : JSON.parse(response.config.data)
          const usernameMatch = request?.args?request.args.match(/username=['"]([^'"]+)['"]/) : ''
          username = usernameMatch ? usernameMatch[1] : null
          msg = `${response.data.msg}`
        }
      }else{
        // 操作日志
        type = '1'
        mark = key=='add'?'新增':key=='upd'?'修改':key=='del'?'删除':'暂无'
        user = !isNull(configStore().user)?configStore().user.name:''
        username = !isNull(configStore().user)?configStore().user.username:''
        stationnum = configStore().distributId
        const matched = router.currentRoute.value.matched
        const routeNames = matched.map(v => v.name).filter(Boolean)
        if (routeNames.length > 0) msg = routeNames.join(' - ')
        msg += ` - ${mark}` 
        msg += resmsg
        if(data && data.model=='t_config') msg = `全局配置 - ${mark}${resmsg}`
      }
      let logs = []
      if(data && data.list) {
        logs = data.list.map(v => {
          return {level: 'info', type: type, name: mark, msg: v.name? msg + ` : ${decrypt(v.name)}` : msg, res: res, user: user, username: username, stationnum: stationnum}
        })
      } else {
        logs.push({level: 'info', type: type, name: mark, msg: msg, res: res, user: user, username: username, stationnum: stationnum})
      }
      log(logs)
    }
  }
  // 记录日志
  export async function log(list:any) {
    let time = new Date().getTime() + ''
    let params = {model: 't_log', list: []}
    params.list = list.map(v => {
      let temp = {id: '', time: time}
      Object.assign(temp, v)
      return temp
    })
    api.logApi(params).then((res:any) => {
      if(res.code == 200){
        console.log('写入日志成功')
      }else{
        console.log('写入日志失败1')
      }
    }).catch((err) => {
      console.log('写入日志失败2')
    })
  }
  // 增删改
  export async function handleApi(remark:any, val:any, model:any) {
    let apii = remark == 'add'?'addApi':remark == 'upd'?'updApi':remark == 'del'?'delApi':''
    let params = {model: model ?? '', list: [val]}
    let res = await api[apii](params)
    return res
  }
	// 更新
  export async function update(form:any) {
    let result:any = '';
    await api.updApi(form).then((res:any) => {
    if(res.code == 200){
        result = true
      }
    }).catch((err:any) => {
      console.log('err', err)
      result = false
    })
    return result
  }
  // 导出功能
  export function handleExport(content:any, list:any, name:any, fn:any) {
    import('@/utils/Export2Excel').then(excel => {
      const tHeader:any  = []
      const filterVal:any = []
      content.forEach((item:any) => {
        tHeader.push(item.name)
        filterVal.push(item.key)
      })
      const data:any = fn? fn(filterVal, list) : formatJsons(filterVal, list)
      excel.export_json_to_excel({
        header: tHeader,
        data,
        filename: name?name : '导出'
      })
    })
  }
  const formatJsons = (filterVal, list) => {
    list = list? list : []
    return list.map(v => filterVal.map(j => {
        return v[j]
    }))
  }
  // 字体自适应
  export function newSize(res:any) {
    let clientWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    if (!clientWidth) return;
    let fontSize = clientWidth / 1920; //设计稿尺寸
    return res * fontSize;  //转换为 rem的布局返回出去
  }
  // 节流
  let lastCall = 0;
  export function throttle(func:any, delay:any) {
    return function (...args) {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        return func.apply(this, args);
      }
    }
  }
  /**
 * @description deepClone() 深拷贝-最终版：解决循环引用的问题
 * @param {*} target 对象
 * @example
 *      const obj1 = {
 *          a: 1,
 *          b: ["e", "f", "g"],
 *          c: { h: { i: 2 } },
 *      };
 *      obj1.b.push(obj1.c);
 *      obj1.c.j = obj1.b;
 *
 *      const obj2 = deepClone(obj1);
 *      obj2.b.push("h");
 *      console.log(obj1, obj2);
 *      console.log(obj2.c === obj1.c);
 */
  export function deepClone(target, map = new Map()) {
    // target 不能为空，并且是一个对象
    if (target != null && isObject(target)) {
      // 在克隆数据前，进行判断是否克隆过,已克隆就返回克隆的值
      let cache = map.get(target);
      if (cache) {
        return cache;
      }
      // 判断是否为数组
      const isArray = Array.isArray(target);
      let result = isArray ? [] : {};
      // 将新结果存入缓存中
      cache = map.set(target, result);
      // 如果是数组
      if (isArray) {
        // 循环数组，
        target.forEach((item, index) => {
          // 如果item是对象，再次递归
          result[index] = deepClone(item, cache);
        });
      } else {
        // 如果是对象
        Object.keys(target).forEach((key) => {
          if (isObject(result[key])) {
            result[key] = deepClone(target[key], cache);
          } else {
            result[key] = target[key];
          }
        });
      }
      return result;
    } else {
      return target;
    }
  }
  export function deepMerge(target, source) {
    target = deepClone(target);
    for (let key in source) {
      if (key in target) {
        // 对象的处理
        if (isObject(source[key])) {
          if (!isObject(target[key])) {
            target[key] = source[key];
          } else {
            target[key] = deepMerge(target[key], source[key]);
          }
        } else {
          target[key] = source[key];
        }
      } else {
        target[key] = source[key];
      }
    }
    return target;
  }
  // 随机数
  export function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  /**
   * 获取样式
   * @param {*} el
   * @param {*} ruleName
   * @returns
   */
  export function getStyle(el, ruleName) {
    return window.getComputedStyle(el)[ruleName];
  }

  // 密码规则
  export function checkPassword(val) {
    if (!val || val.trim() === '') {
      return '密码为必填项'
    }
    const trimmedValue = val.trim()
    if (trimmedValue.length <= 8) {
      return '密码长度必须大于8位'
    }
    const hasLetter = /[a-zA-Z]/.test(trimmedValue)
    const hasNumber = /\d/.test(trimmedValue)
    const hasSymbol = /[~`!@#$%^&*()_+\-=\[\]{}|;':",.<>\/?\\]/.test(trimmedValue)
    if (!hasLetter || !hasNumber || !hasSymbol) {
      return '密码必须同时包含字母、数字和特殊符号'
    }
    return '' // 空字符串表示验证通过
  }

  // 加密函数（AES-CBC模式） (用于加密前端请求后端的参数)
  export function encryptData(data) {
    // 密钥
    const key = CryptoJS.enc.Utf8.parse(configStore().secret_key)
    // 数据
    const dataStr = typeof data == 'string'? data : JSON.stringify(data)
    // 获取当前毫秒级时间戳
    const timestamp = Date.now().toString()
    // 将时间戳和数据一起加密
    const dataToEncrypt = timestamp + '|' + dataStr;
    // 随机生成IV（CBC模式必需）
    const iv = CryptoJS.lib.WordArray.random(16)
    // 加密（自动使用PKCS7填充）
    const encrypted = CryptoJS.AES.encrypt(dataToEncrypt, key, { 
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })
    // 组合IV和密文（IV + ciphertext）
    return iv.toString() + ':' + encrypted.toString()
  }

  // 解密函数（AES-CBC模式） (用于解密前端请求后端的参数)
  export function decryptData(encryptedData) {
    try {
      // 密钥（必须与加密时相同）
      const key = CryptoJS.enc.Utf8.parse(configStore().secret_key);
      
      // 分割IV和密文
      const parts = encryptedData.split(':');
      const iv = CryptoJS.enc.Hex.parse(parts[0]);
      const ciphertext = parts[1];
      
      // 解密
      const decrypted = CryptoJS.AES.decrypt(
        ciphertext,
        key,
        { 
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        }
      );
      
      // 转为UTF-8字符串
      const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8);
      
      // 分割时间戳和原始数据
      const [timestamp, dataStr] = decryptedStr.split('|');
      
      // 返回解析后的数据（自动处理JSON或字符串）
      try {
        return JSON.parse(dataStr);
      } catch {
        return dataStr; // 纯字符串直接返回
      }
      
    } catch (err) {
      console.error('解密失败:', err);
      return null;
    }
  }

  // 加密函数 (用于前端加密)
  export function encrypt(data) {
    try {
      // const dataStr = typeof data == 'string'? data : JSON.stringify(data)
      // const result = CryptoJS.AES.encrypt(dataStr, configStore().secret_key).toString();
      // return result
      // 准备数据
      const dataStr = typeof data === 'string' ? data : JSON.stringify(data)
      // 先进行URI编码，确保所有字符都在Latin1范围内
      const encodedUri = encodeURIComponent(dataStr)
      return btoa(encodedUri)
      } catch (err) { 
      return data
    }
  }

  // 解密函数 (用于前端解密)
  export function decrypt(data) {
    try {
      // const bytes = CryptoJS.AES.decrypt(data, configStore().secret_key);
      // const result = bytes.toString(CryptoJS.enc.Utf8);
      // return result;
      // Base64解码
      const decodedUri = atob(data)
      // URI解码还原原始字符串
      return decodeURIComponent(decodedUri)
    } catch (err) { 
      return data
    }
  }

  // 电话脱敏
  export function encryptPhone(phoneNumber) {
    // 1. 判断是否是数字字符串
    if (/^\d+$/.test(phoneNumber)) {
      // 2. 脱敏处理（4-7位替换为*）
      const prefix = phoneNumber.slice(0, 3); // 前3位
      const suffix = phoneNumber.slice(7);     // 第8位及之后
      phoneNumber = `${prefix}****${suffix}`;
    }
    return phoneNumber
  }

  // 随机数
  export function generateRandomString(num, type) {
    let result = '';
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const chars1 = '0123456789'
    const chars2 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const chartStr = {number: chars1, letter: chars2}[type] || chars
    for (let i = 0; i < num; i++) {
      result += chartStr[Math.floor(Math.random() * 36)];
    }
    return result;
  }

  export const install = (app:any) => {
    app.config.globalProperties.I = I;
    app.config.globalProperties.file = file;
    app.config.globalProperties.listUrl = listUrl;
    app.config.globalProperties.fetchData = fetchData;
    app.config.globalProperties.toPath = toPath;
    app.config.globalProperties.isNull = isNull;
    app.config.globalProperties.varObj = varObj;
    app.config.globalProperties.find = find;
    app.config.globalProperties.findIndex = findIndex;
    app.config.globalProperties.findReduct = findReduct;
    app.config.globalProperties.findInter = findInter;
    app.config.globalProperties.findDiffer = findDiffer;
    app.config.globalProperties.handleExport = handleExport;
    app.config.globalProperties.clock = clock;
    app.config.globalProperties.parseTime = parseTime;
    app.config.globalProperties.renameProperty = renameProperty
    app.config.globalProperties.resolveJSON = resolveJSON;
    app.config.globalProperties.isJSON = isJSON;
    app.config.globalProperties.isArray = isArray;
    app.config.globalProperties.isObject = isObject;
		app.config.globalProperties.isAuth = isAuth;
		app.config.globalProperties.getIp = getIp;
    app.config.globalProperties.getHttp = getHttp;
		app.config.globalProperties.setPublic = setPublic;
    app.config.globalProperties.log = log;
    app.config.globalProperties.handleApi = handleApi;
		app.config.globalProperties.update = update;
    app.config.globalProperties.checkAll = checkAll;
    app.config.globalProperties.newSize = newSize;
    app.config.globalProperties.throttle = throttle;
    app.config.globalProperties.deepClone = deepClone;
    app.config.globalProperties.deepMerge = deepMerge;
    app.config.globalProperties.random = random;
    app.config.globalProperties.checkPassword = checkPassword;
    app.config.globalProperties.encryptData = encryptData;
    app.config.globalProperties.encrypt = encrypt;
    app.config.globalProperties.decrypt = decrypt;
    app.config.globalProperties.encryptPhone = encryptPhone;
    app.config.globalProperties.generateRandomString = generateRandomString;
  }

