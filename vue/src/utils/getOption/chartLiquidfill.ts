  import * as echarts from 'echarts'
  import dictStore from '@/stores/dictStore'
  import { isNull, newSize } from "@/utils/common"
  /* 
  参数
  id      dom节点
  data    数据
  attr    空
  params  属性
          颜色列表: colorList: []             （空：默认）
          图例列表：legendArr: []             （空：默认）
          名称：    name: '统计'              （空：默认）
          内外圈：  radius: ['30%', '38%'],   （空：默认）   
          位置：    center: [ '50%', '50%'],  （空：默认）
          点值显隐：labelShow: false          （空：隐藏）
  */
  const colorLists = dictStore().colorLists
  const setOption = {
    Liquidfill(attr:any, data:any, pramas:any) {
      let colorList = !isNull(pramas.colorList)? pramas.colorList : colorLists
      let series = [{
        type: 'liquidFill',
        name: 'Liquid Fill',
        radius: '96%',
        center: ['50%', '50%'],
        amplitude: 4,
        data: [{
          name: 'score',
          direction: 'right',
          value: data.value,
          itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,//0%时的颜色 从上往下看 最上面是0%
                color: data.status==1? '#B1C9F1': data.status==2? '#F98994' : '#fcf6c2',
              }, {
                offset: 1,//100%时的颜色 从上往下看 最上面是0%
                color: data.status==1? '#4187FF': data.status==2? '#DC1185' : '#FEC746',
              }],),
          
          }
        }],
        backgroundStyle: {
          borderWidth: 2,
          borderColor: data.status==1? '#4187FF': data.status==2? '#DC1185' : '#FEC746',
          color: '#000',
        },
        label: {
          show: pramas.labelShow?true:false, fontSize: newSize(22), insideColor: '#fff', color: data.status==1? '#4187FF': data.status==2? '#DC1185' : '#FEC746', nomal: { formatter: function(param:any) {return param.value * 100} }
        },
        outline: { show: false }
      }]
      const option = {
        animation: false,
        series: series
      };
      return option
    }
  }
  export default setOption
