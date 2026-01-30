import * as XLSX from 'xlsx'
import { parseTime } from "@/utils/common"
// import { Message } from 'element-ui'
/**
 * 读取Excel文件
 * @param {*} file 
 * @returns 
 */
export function readExcel(file) {
  let that = this
  return new Promise((resolve,reject)=>{
    const reader = new FileReader()
    reader.onload = (e)=>{
      var workBook
      try {
        var data = e.target.result
        workBook = XLSX.read(data, {type: 'binary'})
      } catch (error) {
        reject(error)
      }
      const excelJson = XLSX.utils.sheet_to_json(workBook.Sheets[workBook.SheetNames[0]]);
      resolve(excelJson)
    }
    reader.readAsBinaryString(file.raw)
  })
}

export function readExcel2(file) {
  let that = this
  return new Promise((resolve,reject)=>{
    const reader = new FileReader()
    reader.onload = (e)=>{
      var workBook
      try {
        var data = e.target.result
        workBook = XLSX.read(data, {type: 'binary'})
      } catch (error) {
        reject(error)
      }
      const excelJson = []
      workBook.SheetNames.forEach(v => {
        excelJson.push(XLSX.utils.sheet_to_json(workBook.Sheets[v])) 
      });
      resolve(excelJson)
    }
    reader.readAsBinaryString(file.raw)
  })
}

/**
 * Excel日期格式转化
 * @param {*} times 传入时间戳 
 * @param {*} apendTime 是否展示时、分、秒
 * @returns 
 */
export function excelDateToDate(times, apendTime) {
  var time = new Date()
  if(times){
    if(typeof times === 'number'){
      const numbList = times.toString().split('.')
      const old = numbList[0] - 1;
      const t = Math.round((old - Math.floor(old)) * 24 * 60 * 60);
      time = new Date(1900, 0, old, 0, 0, t)
  
      if(numbList[1]){
        var orginNum = numbList[1] * Math.pow(10, (12 - numbList[1].length))
        var numbTime = Math.round((orginNum * 86400) / (Math.pow(10,12)))
        time.setTime(time.getTime() + numbTime * 1000)
      }
    } else {
      time = new Date(times)
    }
  }
  const year = time.getFullYear()
  const month = (time.getMonth() + 1) < 10 ?  '0' + (time.getMonth() + 1) : (time.getMonth() + 1)
  const date = time.getDate() < 10 ? '0' + time.getDate() : time.getDate()
  const hours = time.getHours() < 10 ? '0' + time.getHours() : time.getHours()
  const minutes = time.getMinutes() < 10 ? '0' + time.getMinutes() : time.getMinutes()
  const seconds = time.getSeconds() < 10 ? '0' + time.getSeconds() : time.getSeconds()
  let timeStr = year + '-' + month + '-' + date
  if(apendTime) timeStr += ' ' + hours + ':' + minutes + ':' + seconds
  return timeStr
}

export function checkFile(file, fileList) {
  return new Promise((resolve, reject)=>{
    const isXls = /\.xls[x]*$/.test(file.name)
    if (!isXls) {
      removeFile(file, fileList)
      reject('上传文件只能是 .xls/.xlsx 格式!')
    }
    const isLt10M = file.size / 1024 / 1024  < 10;
    if (!isLt10M) {
      removeFile(file, fileList)
      reject('上传文件大小不能超过 10MB!')
    }
    for (const f of fileList) {
      if (f.name === file.name && f.uid !== file.uid) {
        removeFile(file, fileList)
        reject('该文件已在列表')
      }
    }
    resolve()
  })
}

function removeFile(file, fileList){
  for (const i in fileList) {
    if (fileList[i].name === file.name && fileList[i].uid === file.uid) {
      fileList.splice(i, 1)
    }
  }
}

/**
 * 导出Excel
 * @param {*} tHeader 头标题
 * @param {*} filterVal 属性值
 * @param {*} list 导出数据
 * @param {*} fileName 文件名
 * @returns 
 */
 export function exportExcel({tHeader, filterVal,  fileName}, list){
  return new Promise((resolve,reject)=>{
    import("@/utils/Export2Excel").then((excel) => {
      const excelData = formatJson(list, filterVal)
      excel.export_json_to_excel({
        header: tHeader,
        data: excelData,
        filename: fileName ? fileName : 'Excel文档'
      })
      resolve()
    }).catch(err=>{
      reject(err)
    })
  })
}

function formatJson(list, filterVal) {
  return list.map((v) => filterVal.map((j) => v[j] ? v[j] : ''))
}

/**
 * 导出已存在文档
 * @param {*} filePath 文件路径
 * @param {*} fileName 文件名称
 */
export function exportExistFile(filePath, fileName) {
  const link = document.createElement('a')
  link.href = filePath
  let timestamp = parseTime(new Date())
  link.setAttribute('download', fileName ? fileName : timestamp)
  document.body.appendChild(link)
  link.click()
}

/**
 * 检查参数格式
 * @param {*} filePath 参数
 */
 export function checkArg(arg) {
  if(arg.match(/[~!@#$%^&*]/)){
    ElNotification({ title: '提示', message: '数据中包含特殊字符!', type: 'error' })
    throw new Error()
  }
  if(arg.length > 36){
    ElNotification({ title: '提示', message: '数据中字符长度异常!', type: 'error' })
    throw new Error()
  }
  return arg

}