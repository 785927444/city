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
    Pie(attr:any, data:any, pramas:any) {
      let colorList = !isNull(pramas.colorList)? pramas.colorList : colorLists
      let values = data?data.filter(a=>a.value>0):[]
      let borderWidth = values.length==1?0:1
      let series = [{
        name: pramas.name?pramas.name:'统计',
        type: 'pie',
        radius: pramas.radius?pramas.radius:['50%', '64%'],
        center : pramas.center?pramas.center:[ '50%', '50%'],
        label: { show: pramas.labelShow, color: '#ffffff', fontSize: newSize(12)},   
        avoidLabelOverlap: false,
        itemStyle: {borderRadius: 1, borderColor: '#021033', borderWidth: borderWidth, color: (list:any, index:any) => {return data[list.dataIndex]['color']?data[list.dataIndex]['color']:colorList[list.dataIndex]['color']}},
        data: data,
      }]
      let tooltip = {backgroundColor:'rgba(0,0,0,0.5)', textStyle : {color: '#FFFFFF'}, trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)'}
      const option = {
        animation: false,
        tooltip: tooltip,
        series: series
      };
      return option
    },
    PieMul(attr:any, data:any[], pramas:any[]){
      if(pramas.length==0||pramas.length!=data.length){
        throw new Error("参数错误");
      }
      let serise = pramas.map((item,index)=>{
        return {
          type: 'pie',
          radius:item.radius?item.radius:['50%', '64%'],
          center:item.center?item.center:["50%","50%"],
          label:{
            fontSize: newSize(14),
            show:item.labelShow,
            ...item.labelExtension
          },
          itemStyle:{borderRadius: 1, borderColor: '#021033', borderWidth: 1, color:(list)=>{return item.colorList[list.dataIndex]}},
          data:data[index]
        }
      });
      const opts = {
        animation: false,
        series: serise
      }
      return opts
    }
  }
  export default setOption

