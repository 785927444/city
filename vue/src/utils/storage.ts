export const storage = {
  //存储
  set(key: string, value: any) {
    window.localStorage.setItem(key, JSON.stringify(value))
  },

  //取出数据
  get<T>(key: string, field: any = '') {
    const value = window.localStorage.getItem(key)
    if (value && value != "undefined" && value != "null"){
      let val = JSON.parse(value)
      if(field) return <T>val[field]
      return <T>val
    }
    else return "{}"
  },

  // 删除数据
  remove(key: string) {
    window.localStorage.removeItem(key)
  }
};

/**
* 封装操作sessionStorage本地存储的方法
*/
export const sessionStorage = {
  //存储
  set(key: string, value: any) {
    window.sessionStorage.setItem(key, JSON.stringify(value))
  },

  //取出数据
  get<T>(key: string, field: any = '') {
    const value = window.sessionStorage.getItem(key);
    if (value && value != "undefined" && value != "null"){
      let val = JSON.parse(value)
      if(field) return <T>val[field]
      return <T>val
    }
    return null
  },

  // 删除数据
  remove(key: string) {
    window.sessionStorage.removeItem(key)
  }
}
