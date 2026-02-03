  import { isNull, parseTime } from '@/utils/common'
  import { treeData, findNode } from '@/utils/tree'
  import configStore from '@/stores/configStore'
	import publicStore from '@/stores/publicStore'
	import router from '@/router'
	import api from '@/api'

  export default class Devices {
    constructor(options = {}) {
      this.options = options
      this.key = 'id'
      this.parent = 'parent_id'
      this.type = undefined
      this.today = {}
      this.stationNums = undefined
      this.bayNums = []
      this.defaultProps = {
        children: 'children',
        label: 'station_name',
      }
      this.query = {}
      this.ids = []
      this.init()
    }
    init() {
      if(this.options && this.options.type){
        if(this.options.type == 'all' || this.options.type == 'none') return
        this.type = this.options.type
      }else{
        let path =  router.currentRoute.value.path
        this.type = path.split('/').pop()
      }
      this.getToday()
      this.getInit()
    }

    // 获取今日
    getToday() {
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0); // 精确到毫秒为 0
      const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999); // 精确到毫秒为 999
      this.today = {start: startOfToday.getTime(), end: endOfToday.getTime()}
    }
  
    // 获取基础数据
    async getInit(key, type) {
      let query = isNull(configStore().distributId) || configStore().distributId=='0'? { model: "t_sensor", args: `type='${this.type+'_node'}'`} : { model: "t_sensor", args: `stationNum='${configStore().distributId}' and type='${this.type+'_node'}'`}
      let query1 = isNull(configStore().distributId) || configStore().distributId=='0'?{ model: "t_sensor", args: `type='${this.type}'`} : { model: "t_sensor", args: `stationNum='${configStore().distributId}' and type='${this.type}'`}
      let query2 = {model: "t_sensor_template_cfg_point", args: `sensor_type='${this.type}' and type='1'`}
      let query3 = { model: "t_sensor_template_control_point"}
      let res = {}
      if(this.options && this.options.node){
        res = await publicStore().http({ Api: query, Api1: query1, Api2: query2, Api3: query3})
        publicStore()._public.sensorNode = isNull(res.Api)? [] : res.Api
      }else{
        res = await publicStore().http({ Api1: query1, Api2: query2, Api3: query3})
      }
      publicStore()._public.templateCfgs = isNull(res.Api2)? [] : res.Api2
      publicStore()._public.templateControls = isNull(res.Api3)? [] : res.Api3.sort((a, b) => a.order - b.order)
      publicStore()._public.allDevices = isNull(res.Api1)? [] : res.Api1
      this.stationNums = [...new Set(publicStore()._public.allDevices.filter(a => a.stationNum).map(a => a.stationNum))].map(a => `'${a}'`).join(',')
      this.bayNums = [...new Set(publicStore()._public.allDevices.filter(a => a.bayNum).map(a => a.bayNum))]
      this.getStation(key)
    }

    // 获取厂站
    async getStation(key) {
      let query = {model: "t_station", args: `id IN (${this.stationNums}) OR parent_id IN (${this.stationNums})`, field: "id, parent_id, station_name, `order`, mark, instlPos"}
      let res = await publicStore().http({ Api: query })
      let list = isNull(res)? [] : res
      let datas = list.filter(a => a.parent_id=='0' || this.bayNums.find(b=>b==a.id))
      let data = datas.find(a=>a.parent_id == '0')
      // data.images = datas.filter(a=>a.images).map(a => {return a.images})
      this.setTree(datas, data[this.key])
    }

    // 设置厂站树，获取默认站点
    async setTree(datas, key) {
      publicStore()._public.tree = treeData(datas, this.key, this.parent, 'children')
      this.getImages(datas)
      let node1 = findNode(publicStore()._public.tree, (node) => { return !node.children })
      let node2 = findNode(publicStore()._public.tree, (node) => { return node[this.key] == key })
      let node = isNull(node2)? node1 : node2
      await nextTick()
      // defaultId = node[state.key]
      // treeRef.setCurrentKey(defaultId, true)
      if(this.options && this.options.treeRef){
        publicStore().actIndex = JSON.parse(JSON.stringify(node))
      }else{
        publicStore().active = JSON.parse(JSON.stringify(node))
      }
    }

    // 设置图片
    async getImages(datas) {
      let ids = [...new Set(datas.filter(a => a.parent_id!='0').map(a => a.id))].map(a => `'${a}'`).join(',')
      let query = {model: "t_station", args: `id IN (${ids})`, field: "id, parent_id, images"}
      let res = await publicStore().http({ Api: query })
      publicStore()._public.images = res.filter(a=>a.images).map(a => {return a.images})
      if(!isNull(publicStore()._public.tree)){
        publicStore()._public.tree.forEach(v => {
          if(isNull(v.images)){
            v.images = res.filter(a=>a.images&&a.parent_id==v.id).map(a => {return a.images})
          }
          if(!isNull(v.children)){
            v.children.forEach(vv => {
              if(isNull(vv.images)){
                let station = res.find(a=>a.id == vv.id)
                if(station) vv.images = [station.images]
              }
            })
          }
        })
      }
    }

    // 选择站点
    async changeSelect(val) {
      let node = findNode(publicStore()._public.tree, (node) => { return node[this.key] == val })
      if(node) publicStore().active = Object.assign({}, node)
    }

    // 获取设备信息
    async getDevices() {
      if(isNull(publicStore().active)) return
      publicStore()._public.devices = publicStore().active.parent_id == '0'? 
      publicStore()._public.allDevices.filter(a=>a.stationNum == publicStore().active.id) :
      publicStore()._public.allDevices.filter(a=>a.bayNum == publicStore().active.id)
      this.query = {model: "redis"}
      this.ids = []
      this.query.key = publicStore()._public.devices.map((a) => {
        // ids
        let id = this.ids.find(b=>b == a.id)
        if(!id) this.ids.push(a.id)
        // 属性
        a.cfgs = []
        let templateCfgs = publicStore()._public.templateCfgs.filter(b=>b.sensor_type == a.type)
        if(!isNull(templateCfgs)){
          templateCfgs.forEach(c => {
            if(!isNull(c.calcRuleExpres)){
              try {
                let temp = JSON.parse(c.calcRuleExpres)
                a.cfgs.push(temp)
              } catch (error) {
                console.error("解析失败:", error.message)
              }
            }
          })
        }
        // 控制
        a.control = []
        let templateControls = publicStore()._public.templateControls.filter(b=>b.sensor_type == a.type)
        if(!isNull(templateControls)){
          templateControls.forEach(c => {
            if(!isNull(c.calcRuleExpres)){
              try {
                let temp = JSON.parse(c.calcRuleExpres)
                a.control.push(temp)
              } catch (error) {
                console.error("解析失败:", error.message)
              }
            }
          })
        }
        // 实时
        return "mo:Hash:sensor:" + a.id;
      });
      // console.log("publicStore()._public.templateCfgs---", publicStore()._public.templateCfgs)
    };

    // 实时请求设置信息
    async getDevicesData() {
      if (!isNull(publicStore()._public.devices)){
        let params = {getApi: this.query}
        let res = await publicStore().http(params)
        let homeInfo = {}
        let homeDevices = []
        let sensorNodes = []
        publicStore()._public.devices.forEach(vv => {
          // 重置实时
          let device =  Object.assign({}, vv)
          let redis_exist = res.find(a=>a.sensor_id == vv.id)
          let redis_data = redis_exist? redis_exist : {}
          Object.assign(device, redis_data)
          if(device.isAlarm) device.alarm = device.isAlarm>0? '1' : '0'
          this.setData(homeInfo, redis_data)
          // 获取设备
          homeDevices.push(device)
          // 组装上级
          if(!isNull(publicStore()._public.sensorNode)){
            let exist = sensorNodes.find(o=>o.id == device.parent_id)
            if(exist){
              exist.children.push(device)
            }else{
              let node = publicStore()._public.sensorNode.find(o=>o.id == device.parent_id)
              if(node) {
                node.children = [device]
                sensorNodes.push(node)
              }
            }
          }
        })
        publicStore()._public.homeInfo = homeInfo
        publicStore()._public.homeDevices = homeDevices
        publicStore()._public.sensorNodes = sensorNodes
        // console.log("publicStore._public.homeInfo---", publicStore()._public.homeInfo)
        // console.log("publicStore._public.homeDevices---", publicStore()._public.homeDevices)
      } else{
        publicStore()._public.homeInfo = {};
        publicStore()._public.homeDevices = [];
      }
    }

    // 设置数据
    setData(info, data) {
      info['sum'] = !info['sum'] ? 1 : info['sum'] + 1
      Object.keys(data).forEach((key)=>{
        if (key.indexOf('_tc')==-1 && (typeof data[key] === 'number' || (typeof data[key] === 'string' && data[key].trim() !== '' && !isNaN(Number(data[key].trim()))))) {
          if(key == 'timestamp'){
            // 最大
            if(!info[key] || info[key] && info[key]<data[key]) info[key] = data[key]
          }else{
            // 累计
            info[key] = !info[key] ? Number(data[key]) : Number(info[key]) + Number(data[key])
          }
          // 告警
          if(key == 'isAlarm') {
            if(data[key] > 0) info['alarm1'] = !info['alarm1'] ? 1 : info['alarm1'] + 1
            if(data[key] == 0) info['alarm0'] = !info['alarm0'] ? 1 : info['alarm0'] + 1
          }
          // 工况 
          if(key == 'offline') {
            info[key+data[key]] = !info[key+data[key]] ? 1 : info[key+data[key]] + 1
          }
          // 逆变器\充电桩\空调
          if(key == 'pv_inverter_status' || key == 'Operation_State' || key == '2022' || key == 'hvac_on_off_status' || key == 'loadStatus' || key == 'fanStatus') {
            info[key+data[key]] = !info[key+data[key]] ? 1 : info[key+data[key]] + 1
          }
        } 
      })
    }

    // 柱状图 name: 名称（数据+dom） chart: 数据  format：时间格式  status： 1累计/其他统计
    async getDevicesBar(name, chart, status='0', type='', limit = 10, format='{m}-{d} {h}:{i}:{s}', gray='') {
      let chartType = 'day'
      let code = ''
      if (!chart) return 
      if (chart.length == 0) return 
      if (chart.length == 1) code = chart[0].code
      if (chart.length > 1) code = chart.map((v, i) =>`'${v.code}'`).join(',').slice(1, -1)
      if (!isNull(publicStore()._public.devices)){
        limit = gray == ''||gray == '-1'? limit : gray == '2'? 360 : gray == '3'? 1000 : 10
        const day = this.getDatetimes(gray)
        let query = this.getCodeQuery(code, status, type, limit, day)
        let res = await publicStore().http({ Api: query })
        let list = isNull(res)? [] : res
        if (isNull(publicStore().datetimes)){
          if(gray == '2') chartType = 'month' 
          if(gray == '3') chartType = 'year' 
        } else{
          if(gray == '2') chartType = 'day' 
          if(gray == '3') chartType = 'month' 
        }
        this.getChart(chart, code, list, chartType)
      } 
      publicStore()._public[name] = chart
    }
    // 附带1
    getDatetimes(gray) {
      if(gray && !isNull(publicStore().datetimes)) {
        const date = new Date(publicStore().datetimes);
        const year = date.getFullYear();
        const month = date.getMonth();
        const fmt = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        if (gray === '2') return { start: fmt(new Date(year, month, 1)), end: fmt(new Date(year, month + 1, 0)) };
        if (gray === '3') return { start: fmt(new Date(year, 0, 1)), end: fmt(new Date(year, 11, 31)) };
        return ''
      } 
      return ''
    }
    // 附带2
    getChart(chart, code, list, chartType) {
      const timekey = !isNull(publicStore().active) && publicStore().active.parent_id == '0'?'date':'date'
      const codekey = !isNull(publicStore().active) && publicStore().active.parent_id == '0'?'code':'code'
      if(chartType == 'day') {
        list.forEach((v, i)=> {
          const value = Math.floor(100*Number(v.value))/100
          const timestamp = v[timekey]
          const time = !isNaN(parseFloat(timestamp)) && isFinite(timestamp)? parseTime(timestamp, format) : timestamp.split('T')[0].slice(5)
          const item = [time, value, timestamp]
          const chartTemp = chart.find(a=>a.code == v[codekey]) 
          if(chartTemp){
            let exist = chartTemp.data.find(a=>a[2]==timestamp)
            v[code] = value
            if(exist){
              exist[1] += value
            }else{
              chartTemp.data.unshift(item)
            }
          }
        })
      } 
      if(chartType == 'month') {
        list = Object.values(list.reduce((acc, {code, date, value, station_num, type}) => {
          const month = date.substring(0, 7);
          if (!acc[month]) acc[month] = {code, date: month, value: 0, station_num, type};
          acc[month].value += value;
          return acc;
        }, {})).sort((a, b) => b.date.localeCompare(a.date))
        list.forEach((v, i)=> {
          const value = Math.floor(100*Number(v.value))/100
          const timestamp = v[timekey]
          const time = timestamp
          const item = [time, value, timestamp]
          const chartTemp = chart.find(a=>a.code == v[codekey]) 
          if(chartTemp){
            let exist = chartTemp.data.find(a=>a[2]==timestamp)
            v[code] = value
            if(exist){
              exist[1] += value
            }else{
              chartTemp.data.unshift(item)
            }
          }
        })
      }
     if(chartType == 'year') {
        list = Object.values(list.reduce((acc, {code, date, value, station_num, type}) => {
          const year = date.substring(0, 4);
          if (!acc[year]) acc[year] = {code, date: year, value: 0, station_num, type};
          acc[year].value += value;
          return acc;
        }, {})).sort((a, b) => b.date.localeCompare(a.date))
        list.forEach((v, i)=> {
          const value = Math.floor(100*Number(v.value))/100
          const timestamp = v[timekey]
          const time = timestamp
          const item = [time, value, timestamp]
          const chartTemp = chart.find(a=>a.code == v[codekey]) 
          if(chartTemp){
            let exist = chartTemp.data.find(a=>a[2]==timestamp)
            v[code] = value
            if(exist){
              exist[1] += value
            }else{
              chartTemp.data.unshift(item)
            }
          }
        })
      }
    }

    // 折线图 name: 名称（数据+dom） chart: 数据  format：时间格式  status： 1累计/其他统计
    async getDevicesLine(name, chart, status='0', type='', limit = 200, format='{m}-{d} {h}:{i}:{s}') {
      let code = ''
      if (!chart) return 
      if (chart.length == 0) return 
      if (chart.length == 1) code = chart[0].code
      if (chart.length > 1) code = chart.map((v, i) =>`'${v.code}'`).join(',').slice(1, -1)
      if (!isNull(publicStore()._public.devices)){
        let query = this.getCodeQuery(code, status, type, limit)
        let res = await publicStore().http({ Api: query })
        let list = isNull(res)? [] : res
        const timekey = !isNull(publicStore().active) && publicStore().active.parent_id == '0'?'date':'date'
        const codekey = !isNull(publicStore().active) && publicStore().active.parent_id == '0'?'code':'code'
        list.forEach((v, i)=> {
          const value = Math.floor(100*Number(v.value))/100
          const timestamp = v[timekey]
          const time = !isNaN(parseFloat(timestamp)) && isFinite(timestamp)? parseTime(timestamp, format) : timestamp.split('T')[0].slice(5)
          const item = [time, value, timestamp]
          const chartTemp = chart.find(a=>a.code == v[codekey]) 
          if(chartTemp){
            let exist = chartTemp.data.find(a=>a[2]==timestamp)
            v[code] = value
            if(exist){
              exist[1] += value
            }else{
              chartTemp.data.unshift(item)
            }
          }
        })
      } 
      publicStore()._public[name] = chart
    }

    // 光伏预测-折线图 name: 名称（数据+dom） chart: 数据  format：时间格式  status： 1累计/其他统计
    async getDevicesGfLine(name, chart, status='0', type='', limit = 200, format='{m}-{d} {h}:{i}:{s}') {
      let code = "pv_active_power"
      if (!isNull(publicStore()._public.devices)){
        let query1 = { model: "t_sensortype_star", args: `stationnum='${configStore().distributId}' and type='PV' and code='FD' and timestamp > ${this.today.start} and timestamp < ${this.today.end}`, limit: 1 }
        let query2 = this.getCodeQuery(code, status, type, limit, this.today)
        let res = await publicStore().http({ Api1: query1, Api2: query2 })
        let list1 = isNull(res.Api1)? [] : JSON.parse(res.Api1[0]['value'])
        let list2 = isNull(res.Api2)? [] : res.Api2
        if(!isNull(res.Api1)){
          chart[1].data = list1.predictions.map((v, i)=> {
            const value = Math.floor(100*Number(v.value))/100
            const timestamp = Date.parse(v.time)+''
            return [parseTime(v.time, format), v.power, timestamp]
          })
        }
        let timekey = !isNull(publicStore().active) && publicStore().active.parent_id == '0'?'date':'date'
        list2.forEach((v, i)=> {
          const value = Math.floor(100*Number(v.value))/100
          const timestamp = v[timekey]
          const time = !isNaN(parseFloat(timestamp)) && isFinite(timestamp)? parseTime(timestamp, format) : timestamp.split('T')[0].slice(5)
          const item = [time, value, timestamp]
          const exist = chart[0].data.find(a=>a[2]==timestamp)
          v[code] = value
          if(exist){
            exist[1] += value
          }else{
            chart[0].data.unshift(item)
          }
        })
      } 
      publicStore()._public[name] = chart
    }

    // 获取测点参数
    getCodeQuery(code, status, type, limit = 200, day) {
      let query = {}
      if(!isNull(publicStore().active) && publicStore().active.parent_id == '0'){
        let model = status == '1'? 't_sensor_measure_float_day_station' : status == '0'? 't_sensor_measure_float_station' : ''
        let args = `code IN ('${code}') and station_num='${publicStore().active.id}' and type='${type?type:this.type}'`
        if(!isNull(day)) args += ` and date>='${day.start}' and date<='${day.end}'`
        if(isNull(day) && !isNull(publicStore().datetime)) args += ` and date>='${publicStore().datetime.start}' and date<='${publicStore().datetime.end}'`
        query = day? { model: model, args: args, order: "(date + 0) desc" } : { model: model, limit: limit, args: args, order: "(date + 0) desc" }
      } else {
        let model = status == '1'? 't_sensor_measure_float_day_bay' : status == '0'? 't_sensor_measure_float_bay' : ''
        let args = `code IN ('${code}') and bay_num='${publicStore().active.id}' and type='${type?type:this.type}'`
        if(!isNull(day)) args += ` and timestamp>='${day.start}' and timestamp<='${day.end}'`
        if(isNull(day) && !isNull(publicStore().datetime)) args += ` and timestamp>='${publicStore().datetime.start}' and timestamp<='${publicStore().datetime.end}'`
        query = day? { model: model, args: args, order: "(date + 0) desc" } : { model: model, limit: limit, args: args, order: "(date + 0) desc" }
      }
      return query
    }
  } 
