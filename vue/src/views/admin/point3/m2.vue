<template>
  <div class="layout-col flex5 ml16">
    <!-- 标题 -->
    <div class="h40 ww100 flex-sc relative mb10">
      <img class="hh100" src="@/assets/imgs/title3.png" />
      <div class="ww100 hh100 flex-sc absolute pl35">
        <span class="fw ptb5">配置 - {{isNull(publicStore.active)?'':publicStore.active.name}}</span>
        <span class="fw" v-if="!isNull(publicStore.active)&&!isNull(publicStore.active.instlPos)"> - {{publicStore.active.instlPos}}</span>
        <span class="fw" v-if="!isNull(state.timestamp)"> - {{state.timestamp}}</span>
        <span class="fw" v-if="!isNull(publicStore.active)&&!isNull(publicStore.active.scale)&&!isNull(state.scale)&&state.scale.data">
          <span>【最大下调：{{state.scale.data}} 最大上调：{{Math.floor(100*(Number(publicStore.active.scale) - Number(state.scale.data)))/100 }}】</span>
        </span>
        <div class="flex-ec flex1">
          <div class="rad4 ptb5 plr8 flex-cc cursor bgi22 i21 ml10 bo-i21-1" @click.stop="handleClick('out')">
            <i-ep-filter class="f12 fw" /><span class="f14 ml5">导出</span>
          </div>
          <!-- <div class="rad4 ptb5 plr8 flex-cc cursor bgi22 i21 ml10 bo-i21-1" @click.stop="handleClick('in')">
            <i-ep-switch class="f12 fw" /><span class="f14 ml5">导入</span>
          </div> -->
          <div class="rad4 ptb5 plr8 flex-cc cursor bgi22 i21 ml10 bo-i21-1 relative" @click.stop="state.tempele = !state.tempele">
            <i-ep-compass class="f12 fw" /><span class="f14 ml5">模板</span>
            <div class="rad4 bgi22 bo-i21-1 absolute l0 t40 w100 z1 flex-col-cs" v-if="state.tempele">
              <div class="hover1 plr8 ptb8 cursor ww100"  @click.stop="handleClick('tempeleOn')">设置模板</div>
              <div class="bot-i21-1 ww100 "></div>
              <div class="hover1 plr8 ptb8 cursor ww100" @click.stop="handleClick('tempeleIn')">模板导入</div>
            </div>
          </div>
          <div class="rad4 ptb5 plr8 flex-cc cursor bgi22 i21 ml10 bo-i21-1" 
            v-if="state.content.find(v=>{return typeof(v.key) == 'object'}) && state.content.find(v=>{return typeof(v.key) == 'object'})['key'].hasOwnProperty('add')" 
            @click.stop="handleClick('add', state.addItem)">
            <i-ep-plus class="f12 fw" /><span class="f14 ml4">{{state.content.find(v=>{return typeof(v.key) == 'object'})['key'].add}}</span>
          </div>
          <div class="rad4 ptb5 plr8 flex-cc cursor bgi22 i21 ml10 bo-i21-1" @click.stop="handleClick('dels')">
            <i-ep-delete class="f12 fw" /><span class="f14 ml5">删除</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 内容 -->
    <div class="layout-col bss">
      <div class="row bgi22">
        <div :style="{textAlign: v.align}" v-for="(v, i) in state.content" :key="i" v-show="v.show" :class="typeof(v.key) == 'object'?v.width +' '+ 'mlr5':v.width">{{v.name}}</div>
      </div>
      <div class="table">
        <div class="row cursor" :class="publicStore.active[state.key] == item[state.key]?'active':index%2 == 1?'bgi23':'bgi18'" v-for="(item, index) in state.list" :key="index" @click.stop="handleClick('active', item)">
          <div v-show="v.show" :class="v.width" :style="{textAlign: v.align}" v-for="(v, i) in state.content" :key="i">
            <span v-if="typeof(v.key) == 'object'" class="cursor mlr5" :class="kk=='add'|| state.auth[kk] == false || (kk=='crl'&&(item['mode']!=31&&item['mode']!=41))?'none':kk=='del'?'i8':'i21'" v-for="(vv, kk, ii) in v.key" :key="ii" @click.stop="handleClick(kk, item)">{{vv}}</span>
            <span v-else-if="v.key=='*'">{{(state.page-1)*state.limit + index+1}}</span>
            <span v-else-if="v.type == 'time'">{{item[v.key] == 0?'/':parseTime(item[v.key])}}</span>
            <!-- <span v-else-if="v.type == 'select'" :class="find(v.list, [v.value, item[v.key]], 'color')?find(v.list, [v.value, item[v.key]], 'color'):''">
              {{find(v.list, [v.value, item[v.key]], v.label)}}
            </span> -->
            <span v-else-if="v.type == 'switch'">
              <el-switch v-model="item[v.key]" :active-text="v.value[1].name" :inactive-text="v.value[0].name" :active-value="v.value[1].value" :inactive-value="v.value[0].value" inline-prompt @change="handleClick('switch', item)"></el-switch>
            </span>
            <el-select v-else-if="v.type == 'select'" v-model="item[v.key]" placeholder="暂无" :multiple="v.multiple?true:false" style="width: 90%" @focus="state.tempKey = v.key; state.tempValue = item[v.key]" @blur="handleChange(item)" filterable>
              <el-option v-for="sel in v.filt?v.list.filter(a=>a[v.filt[0]] == item[v.filt[1]]) : v.list" :key="sel[v.value]" :value="sel[v.value]" :label="sel[v.label]" />
            </el-select>
            <span v-else-if="v.type == 'input'" class="i12 fw">
              <span v-if="item.mode==1&&v.key=='value'" :class="item[v.key]?'':'c9'">{{item[v.key]?item[v.key]:'/'}}</span>
              <el-input v-else v-model="item[v.key]" placeholder="暂无" style="width: 90%;" @focus="state.tempKey = v.key; state.tempValue = item[v.key]" @blur="handleChange(item)" />
            </span>
            <!-- 控制 -->
            <span v-else-if="v.type == 'select_input'" class="i12 select_input">
              <div class="flex-sc ww100" v-if="item.code && !isNull(state.cfgs) && state.cfgs.find(a=>a.code==item.code)">
                <div class="flex1" v-if="!isNull(find(state.cfgs, ['code', item.code], 'attr'))">
                  <!-- <span v-if="item.mode==1&&v.key=='value'" :class="item[v.key]?'':'c9'">{{item[v.key]?item[v.key]:'/'}}</span> -->
                  <el-select :disabled="true" v-model="item[v.key]" placeholder="暂无" style="width: 100%;" @focus="state.temp = true; state.tempKey = v.key; state.tempValue = item[v.key]" @blur="state.temp = false; handleControl(item)" filterable  :class="state.cfgs&&item.code?find(find(state.cfgs, ['code', item.code], 'attr'), ['value', item[v.key]], 'color'):'white'">
                    <el-option v-for="sel in state.cfgs&&item.code?find(state.cfgs, ['code', item.code], 'attr'):[]" :key="sel['value']" :value="sel['value']" :label="sel['name']" />
                  </el-select>
                </div>
                <div class="flex1" v-else>
                  <!-- <span v-if="item.mode==1&&v.key=='value'" :class="item[v.key]?'':'c9'">{{item[v.key]?item[v.key]:'/'}}</span> -->
                  <el-input :disabled="true" v-model="item[v.key]" placeholder="暂无" style="width: 100%;" @focus="state.temp = true; state.tempKey = v.key; state.tempValue = item[v.key]" @blur="state.temp = false; handleControl(item)" />
                </div>
                <span class="f12 ml5">{{find(state.cfgs, ['code', item.code], 'dw')}}</span>
              </div>
              <div v-else>
                <!-- <span v-if="item.mode==1&&v.key=='value'" :class="item[v.key]?'':'c9'">{{item[v.key]?item[v.key]:'/'}}</span> -->
                <el-input :disabled="true" v-model="item[v.key]" placeholder="暂无" style="width: 90%;" @focus="state.temp = true; state.tempKey = v.key; state.tempValue = item[v.key]" @blur="state.temp = false; handleControl(item)" />
              </div>
            </span>
            <span v-else-if="v.type == 'preload'&&v.filed">{{item[v.key]?item[v.key][v.filed]:''}}</span>
            <span v-else-if="v.type == 'image'" class="flex-sc warp">
              <div class="flex-sc" v-if="typeof(item[v.key]) == 'string'">
                <el-image class="w25 h25 m2 rad3 cursor" v-if="item[v.key].length!=0" :src="I(item[v.key])" :preview-src-list="state.srcList" @click.stop="state.srcList= [];state.srcList.push(I(item[v.key]))" />
                <span class="w50 h25 ca flex-sc" v-else>暂无</span>
              </div>
              <div class="flex-sc" v-else v-for="(img, ii) in item[v.key]" :key="ii">
                <el-image :class="ii==0?'':'ml5'" class="w25 h25 rad3 cursor" :src="I(img)" :preview-src-list="state.srcList" @click.stop="state.srcList= [];state.srcList.push(I(img))" />
              </div>
            </span>
            <span v-else>{{isNull(item[v.key]) && v.key!=''? '/' : item[v.key]}}</span>
          </div>
        </div>
        <div v-if="state.empty" class="flex-cc ww100 tc ptb13 bgi18">没有数据</div>
      </div>
      <Pagination class="plr20" style="padding: 10px; " v-show="state.total>0" :total="state.total" v-model:page.sync="state.page" v-model:limit.sync="state.limit" @pagination="init" />
    </div>
    <PointAdd @init="init" :state="state" ref="pointRef" />
    <PointAdd2 @init="init" :state="state" ref="pointRef2" />
    <control @init="init" :state="state" ref="controlRef" />
  </div>
</template>

<script lang="ts" setup>
  import control from './control'
  import api from '@/api'
	import scheduled from "@/utils/scheduled"
	const { createScheduled } = scheduled()
	const { proxy }:any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const dictStore = proxy.dictStore()
  let pointRef = $ref()
  let pointRef2 = $ref()
  let controlRef = $ref()
  let formRef = $ref()
  let registertypes = [
    {name: '01H:读线圈', value: '1'},
    {name: '02H:读离散量输入', value: '2'},
    {name: '03H:读保持寄存器', value: '3'},
    {name: '04H:读输入寄存器', value: '4'},
    {name: '05H:写单个线圈', value: '5'},
    {name: '06H:写单个寄存器', value: '6'},
    {name: '0FH:写多个线圈', value: 'F'},
    {name: '10H:写多个寄存器', value: '10'},
  ]
  let datatypes = [
    {name: 'UTF8', value: 'UTF8'},
    {name: 'U16-H', value: 'U16-H'},
    {name: 'U16-L', value: 'U16-L'},
    {name: 'S16-H', value: 'S16-H'},
    {name: 'S16-L', value: 'S16-L'},
    {name: 'U32-H', value: 'U32-H'},
    {name: 'U32-L', value: 'U32-L'},
    {name: 'S32-H', value: 'S32-H'},
    {name: 'S32-L', value: 'S32-L'},
  ]
  let lens = [
    {name: '0', value: '0'},
    {name: '1', value: '1'},
    {name: '2', value: '2'},
    {name: '3', value: '3'},
    {name: '4', value: '4'},
    {name: '5', value: '5'},
  ]
  let modes = [
    {name: '遥信发', value: 11},
    {name: '遥信收', value: 12},
    {name: '遥测发', value: 21},
    {name: '遥测收', value: 22},
    {name: '遥控发', value: 31},
    {name: '遥控收', value: 32},
    {name: '遥调发', value: 41},
    {name: '遥调收', value: 42},
  ]
  // let modes = [
  //   {name: '只读', value: 1},
  //   {name: '读写', value: 2},
  // ]
  const state = reactive({
	  ...publicStore.$state,
    content: [
      { width: 'w70',   show: true, align: 'center', key: '*', name: '序号' },
      { width: 'w50x2', show: true, align: 'left', key: 'address', name: '通道', type: 'input'  }, 
      // { width: 'w50x3', show: true, align: 'left', key: 'registertype', name: '寄存器类型', type: 'select', list: registertypes, value: 'value', label: 'name' }, 
      // { width: 'w50x3', show: true, align: 'left', key: 'datatype', name: '数据类型', type: 'select', list: datatypes, value: 'value', label: 'name' }, 
      // { width: 'w50x2', show: true, align: 'left', key: 'len', name: '地址长度', type: 'input'  }, 
      { width: 'w50x3', show: true, align: 'left', key: 'point', name: '起始地址', type: 'input'  }, 
      { width: 'w50x3', show: true, align: 'left', key: 'mode', name: '模式', type: 'select', list: modes, value: 'value', label: 'name'  },
      { width: 'w50x3', show: true, align: 'left', key: 'scale', name: '幅度', type: 'input'  },
      { width: 'w50x3', show: true, align: 'left', key: 'offset', name: '偏移', type: 'input'  },
      { width: 'w50x6', show: true, align: 'left', key: 'code', name: '测量点', type: 'select', list: [], value: 'code', label: 'name'  },
      { width: 'w50x2', show: true, align: 'left', key: 'value', name: '实时值', type: 'select_input'  },
      { width: 'flex1', show: true, align: 'right', key: {add: '添加', crl: '控制', del: '删除'}, name: '操作' },
    ],
    editFrom: [
      { required: true, editshow: true, name: '通道', key: 'address', type: 'input' },
      // { required: true, editshow: true, name: '寄存器类型', key: 'registertype', type: 'select', list: registertypes, value: 'value', label: 'name' },
      // { required: true, editshow: true,  name: '数据类型', key: 'datatype', type: 'select', list: datatypes, value: 'value', label: 'name' },
      // { required: true, editshow: true,  name: '地址长度', key: 'len', type: 'select', list: lens, value: 'value', label: 'name' },
      { required: true, editshow: true,  name: '起始地址', key: 'point', type: 'input' },
      { required: true, editshow: true,  name: '选择模式', key: 'mode', type: 'select', list: modes, value: 'value', label: 'name' },
      { required: true, editshow: true,  name: '生成数量', key: 'pointNum', type: 'input' },
      { required: true, editshow: true,  name: '生成幅度', key: 'pointScale', type: 'input' },
      { required: true, editshow: true,  name: '幅度系数', key: 'scale', type: 'input' },
      { required: true, editshow: true,  name: '偏移系数', key: 'offset', type: 'input' },
    ],
    export: [
      { key: 'stationnum', name: '站点' }, 
      { key: 'type', name: '类型' }, 
      { key: 'sensorparents', name: '设备上级ID' },
      { key: 'sensorid', name: '设备ID' }, 
      { key: 'address', name: '通道' }, 
      // { key: 'registertype', name: '寄存器类型' }, 
      // { key: 'datatype', name: '数据类型' }, 
      // { key: 'len', name: '地址长度' }, 
      { key: 'point', name: '起始地址' }, 
      { key: 'mode', name: '模式' },
      { key: 'scale', name: '幅度' },
      { key: 'offset', name: '偏移' },
      { key: 'code', name: '测量点' },
    ],
    addItem: {},
    model: 't_v_104_point',
    modelType: 't_v_type_template',
    ruleList: {},
  })

	onMounted(async() => {
    createScheduled('104', 1*1000, () => { getReal() })
	})

  watch(() => publicStore.active, async(val) => {
    if(proxy.isNull(val)) return
    state.tempele = false
    state.timestamp = ''
    await nextTick()
    await getInit()
    // let parentsId = proxy.parentId(publicStore._public.tree, val.id, 'id')
    state.addItem = {stationnum: val.stationNum, type: val.type, sensorid: val.id+'', sensorparents: val.parent_id+''}
    if(publicStore._public.templateCfgs) state.cfgs = proxy.find(publicStore._public.templateCfgs, ['sensor_type', val.type], 'cfgs')
    init()
  }, {immediate: false, deep: true})

  const getInit = async() => {
    let query1 = {model: "t_sensor_control_property", args: `sensor_id='${publicStore.active.id}'`}
    let query2 = {model: "t_sensor_template_control_point", args: `sensor_type='${publicStore.active.type}'`}
    let query3 = {model: "t_sensor_template_measure_point", args: `sensor_type='${publicStore.active.type}'`}
    let res = await publicStore.http({Api1: query1, Api2: query2, Api3: query3})
    state.meas = proxy.isNull(res.Api3)? [] : res.Api3
    state.scale = state.meas.find(a=>a.name.indexOf('有功功率')!=-1)
    state.content.forEach(v => {
      if(v.key == 'code') v.list = [...state.meas]
    })
    let sensorControls = proxy.isNull(res.Api1)? [] : res.Api1
    let templateControls = proxy.isNull(res.Api2)? [] : res.Api2
    let controls = []
    if(!proxy.isNull(sensorControls)){
      sensorControls.forEach(c => {
        if(!proxy.isNull(c.value)){
          try {
            let temp = JSON.parse(c.value)
            controls.push(temp)
          } catch (error) {
            console.error("解析失败:", error.message)
          }
        }
      })
    }else{
      if(!proxy.isNull(templateControls)){
        templateControls.forEach(c => {
          if(!proxy.isNull(c.calcRuleExpres)){
            try {
              let temp = JSON.parse(c.calcRuleExpres)
              controls.push(temp)
            } catch (error) {
              console.error("解析失败:", error.message)
            }
          }
        })
      }
    }
    state.controls = controls
    // console.log("state.controls---", state.controls)
  }

  const init = async() => {
    let args = `sensorid='${publicStore.active.id}'`
    let q1 = {limit: state.limit, page: state.page}
    let q2 = {field: `COUNT(*)`}
    let qs = {model: state.model, args: args, order: '(point + 0) ASC' }
    let query1 = {}
    let query2 = {}
    Object.assign(query1, qs, q1)
    Object.assign(query2, qs, q2)
    let res = await publicStore.http({Api1: query1, Api2: query2})
    state.empty = proxy.isNull(res.Api1)? true : false
    state.list = proxy.isNull(res.Api1)? [] : res.Api1
    state.total = proxy.isNull(res.Api2)? 0 : res.Api2[0]['COUNT(*)']
    getReal()
  }

  const getReal = async() => {
    if(state.temp) return
    if(proxy.isNull(publicStore.active)) return
    if(proxy.isNull(state.list)) return
    let query = {model: "redis", key: ["mo:Hash:sensor:" + publicStore.active.id]}
    let params = {getApi: query}
		let res = await publicStore.http(params)
    if(proxy.isNull(res)) return
    res.forEach(v => {
      state.timestamp = proxy.parseTime(v.timestamp, '{y}-{m}-{d} {h}:{i}:{s}')
      state.list.forEach(vv => {
        if(vv.sensorid  == v.sensor_id){
          if(vv.code && v[vv.code]) {
            vv.value = v[vv.code]
          }
        }
      })
      if(!proxy.isNull(state.scale) && state.scale.code && v[state.scale.code]){
        state.scale.data = v[state.scale.code]
      }
    })
  }
  
  const handleClick = async(remark, val) => {
    if(remark == 'add'){
      let addItem = {len: '1', pointNum: '1', pointScale: '1', scale: '1', offset: '0'}
      pointRef.onVisable(addItem)
    }
    if(remark == 'del'){
      pointRef.del(val)
    }
    if(remark == 'dels'){
      pointRef.dels(state.list)
    }
    if(remark == 'crl') {
      if(val && !val.code) return ElNotification({ title: '提示', message: '请配置测量点', type: 'error' }) 
      if(val.mode != 31 && val.mode != 41) return ElNotification({ title: '提示', message: '请选择正确模式', type: 'error' })
      controlRef.onVisable(val)
    }
    if(remark == 'out'){
      let list = [...state.list]
      let name = publicStore.active.name + '-modbus数据'
      proxy.handleExport(state.export, list, name)
    }
    // if(remark == 'in'){
    //   let ctx = {content: state.export, key: state.key, query: state.query, unique: 'point'}
    //   importRef.onVisable(ctx)
    // }
    // 设置模板
    if(remark == 'tempeleOn'){
      ElMessageBox.confirm(`是否确定把【${publicStore.active.name}】设置成模板?`, '温馨提示', {confirmButtonText: '确定', cancelButtonText: '关闭', type: 'success'}).then(async() => {
        let query = {model: state.modelType, args: `sensorid='${publicStore.active.id}' and class='0'`}
        let res = await publicStore.http({Api: query})
        let value = state.list.map(v => {
          let temp = {}
          Object.assign(temp, v)
          delete temp.id
          delete temp.value
          // delete temp.point
          delete temp.sensorid
          return temp
        })
        let from = {id: proxy.isNull(res)? '' : res[0].id, class: '0', qztype: publicStore.active.qztype, type: publicStore.active.type, name: publicStore.active.name, sensorid: publicStore.active.id + '', value: JSON.stringify(value)}
        let params = {model: state.modelType, list: [from]}
        api[proxy.isNull(res)?'addApi':'updApi'](params).then((res:any) => {
          if(res.code == 200){
            ElNotification({ title: '提示', message: '设置成功', type: 'success' })
          }else{
            ElNotification({ title: '提示', message: '设置失败', type: 'error' })
          }
        }).catch((err) => {
          ElNotification({ title: '提示', message: '设置失败', type: 'error' })
        })
      })
    }
    // 模板导入
    if(remark == 'tempeleIn'){
      let addItem = {len: '1', pointNum: '1', pointScale: '1', scale: '1', offset: '0'}
      pointRef2.onVisable(addItem)
    }
  }

  const handleChange = async(item) => {
    if(state.tempKey && state.tempValue == item[state.tempKey]) return
    let params = {model: state.model, list: [item]}
    api['updApi'](params).then((res:any) => {
      if(res.code == 200){
        ElNotification({ title: '提示', message: '修改成功', type: 'success' })
        init(item[state.key])
        proxy.log([{name: '修改', msg: '修改成功', res: '1', table: state.model, stationnum: configStore.distributId, sensortype: publicStore.active.type, sensorid: publicStore.active.id+''}])
      }else{
        ElNotification({ title: '提示', message: '修改失败1', type: 'error' })
      }
    }).catch((err) => {
      ElNotification({ title: '提示', message: '修改失败2', type: 'error' })
    })
  }

  const handleControl = async(item) => {
    // if(state.tempKey && state.tempValue == item[state.tempKey]) return
    // if(item.mode == 1) return ElNotification({ title: '提示', message: '只读模式', type: 'error' })
    // ElNotification({ title: '提示', message: '控制成功', type: 'success' })
  }

  const onVisable = async (val?: any) => {
    state.isFalse = !state.isFalse
    if(!state.isFalse) return
    state.form = Object.assign({}, val)
    let control = state.controls.find(a=>a.code == state.form.code)
    if(control) state.form.control = control
    if(control && control.action) state.form.action_type = control.action[0]['action_type']
    console.log("state.form", state.form)
  }

  const handleSubmit = (formEl) => {
    console.log("state.form---", state.form)
    return false
  }

</script>
  
<style scoped lang="scss">
:deep(.el-input.is-disabled .el-input__inner){
  color: inherit;
  -webkit-text-fill-color: inherit;
}
:deep(.table .el-input__wrapper) {
  min-height: auto;
  color: inherit;
  padding: 0;
  background: none !important;
  box-shadow: 0 0 0 0px #276dd6 inset !important;
}
:deep(.select_input .el-input__inner) {
  color: inherit;
}
:deep(.table .el-select__wrapper){
  min-height: auto;
  color: inherit;
  padding: 0;
  background: none !important;
  box-shadow: 0 0 0 0px #276dd6 inset !important;
}
:deep(.select_input .el-select__input){
  color: inherit !important;
}
:deep(.select_input .el-select__selected-item){
  color: inherit !important;
}
.hover1:hover {
  color: #093a83;
  background: #3ebee3;
}
</style>
  