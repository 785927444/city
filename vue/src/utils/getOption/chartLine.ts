  import * as echarts from 'echarts'
  import dictStore from '@/stores/dictStore'
  import { isNull, newSize } from "@/utils/common"
  /* 
  参数
  id      dom节点
  data    数据
  params  可选参数
  attr    属性  
          最大值：  max: 0,           （空：取最大值）   
          最小值：  min: 0,           （空：取最大值负值）
          幅度值：  extent: 4         （空：默认4 min、max空有效）
          颜色列表: colorList: []     （空：默认）
          图例列表：legendArr: []     （空：默认）
          图例显隐：legendShow: false （空：隐藏）
          点值显隐：labelShow: false  （空：隐藏）
          面积显隐：areaShow: false   （空：隐藏）
          线上圆点：symbol：false     （空：圆点）
          y轴名称： y_name: '温度'    （空：无）
          窗单位：  tool_dw： '°C'    （空：无）
          窗x名称： tool_name_x '时间'（空：无）
          窗y名称： tool_name_y '值'  （空：无）
  */
  const colorLists = dictStore().colorLists
  const setOption = {
    Line(attr:any, data:any, pramas:any){
      var extent = attr.extent?attr.extent:4
      var colorList = !isNull(attr.colorList)? attr.colorList : colorLists
      var legendArr = !isNull(attr.legendArr)?attr.legendArr:['']
      var seriesArr = []
      var visualMap = []
			for (var i = 0; i <= legendArr.length-1; i++) {
        let series = {
					name: legendArr[i],type: 'line',connectNulls:true,smooth: attr.smooth?false:true,sampling: 'average',large: true,animation: false,clip: true, 
          symbolSize: attr.symbol? 0 : function (d) {if (d[4] && d[4] > 0) {return 6} else {return 5}},
					itemStyle: {color:colorList[i].color},
          label: {show: attr.labelShow,position: 'top',color: '#1BFFDF',fontSize: newSize(12),fontWeight: 'bold', 
            rich:{ 
              a:{fontSize: newSize(12), padding: [0, 0, 8, 0]},
              b:{fontSize: newSize(12), padding: [0, 0, 8, 0], color: '#FF4D4F'},
              c:{fontSize: newSize(12), padding: [0, 0, 8, 0], color: '#DC1185'},
              d:{fontSize: newSize(12), padding: [0, 0, 8, 0], color: '#FEC746'},
            },
					  // formatter: function(p) {
            //   if (p.value[2] == 'isAlarm') {
            //     return `${p.value[4]}`
            //   }else if (p.value[2] == 'offline') {
            //     if(p.value[1] == 0) return `在线`
            //     else if(p.value[1] == 1) return `{c|离线}`
            //     else return `{d|故障}`
            //   } else {
            //     if(p.value[3] == 0) return Math.floor((p.value[1]*100))/100
            //     if(p.value[3] == 1) return `{b|${Math.floor((p.value[1]*100))/100}}`
            //   }
            // }
					},
          yAxisIndex: attr.y_name2&&i==1? i : 0,
					data: [],
				}
        // if(!isNull(attr.symbol)) series.symbol = 'none'
        if(isNull(attr.visualMap)) series.lineStyle = {color:colorList[i].color, type: colorList[i].type?colorList[i].type:'solid'}
        if(attr.areaShow) series.areaStyle = {color: {type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: colorList[i].start}, { offset: 1, color: colorList[i].end}], global: false}} 
        seriesArr.push(series)
			}
      if(!isNull(attr.visualMap)){
        visualMap = attr.visualMap.map(v => {
          let t = {pieces: [], top: 0, right: 0, itemHeight: 2, itemWidth: 20, textStyle: {color: '#FFFFFF', fontSize: newSize(12)},}
          v.pieces.forEach((vv,ii) => {
            let tt = {color: vv.color, label: vv.label}
            if(ii==0){
              tt.lte = vv.value[0]
            }else if(ii!=0&&ii==v.pieces.length-1){
              tt.gt = vv.value[0]
            }else{
              tt.gt = vv.value[0]
              tt.lte = vv.value[1]
            }
            t.pieces.push(tt)
          })
          return t
        })
      }
      let allShow = attr.allAxisShow===false?false:true;
			let grid = [{top: 30, bottom: '0', left: '0', right: newSize(24), containLabel: true}]
			let tooltip = {show: true, backgroundColor:'rgba(0,0,0,0.5)', textStyle: {color: '#FFFFFF'}, trigger: 'item', 
			formatter: function (p:any) {return (attr.tool_name_x?attr.tool_name_x:'x：') + p.value[0] + '<br />' + (attr.tool_name_y?attr.tool_name_y:'y：') + (Math.floor((p.value[1]*100))/100) + ' ' + (attr.tool_dw?attr.tool_dw:'')}}
			// let tooltip = {show: true, backgroundColor:'rgba(0,0,0,0.5)', textStyle: {color: '#FFFFFF'}, trigger: 'axis', axisPointer: {type: 'line', lineStyle: {color: '#6f8dcb'}}}
      let legend = {show: attr.legendShow,data: legendArr,align:'left',x:attr.legendX?attr.legendX:'right',y: 'top',top: -2,icon: "roundRect",itemWidth: 18,itemHeight: 1,
				textStyle: {color: '#FFFFFF',rich: {a: {verticalAlign: 'middle'}},padding:[4,0,0,0]}}
			let dataZoom = [{type: 'inside',show : true,realtime : true,startValue: attr.zoomStart?attr.zoomStart:0,endValue: attr.zoomEnd?attr.zoomEnd:1000}]
			let xAxis = {
				type: 'category',
        boundaryGap: false,
 				//刻度线
        axisTick: {show: false},
				// 轴线
				axisLine: {lineStyle: {color: '#6f8dcb',fontSize: newSize(12)},show:true},
				// 分割线
				splitLine: {show: false,lineStyle: {color: '#6f8dcb'}},
				// 轴文字
				axisLabel: {color: '#6f8dcb',show: true,fontSize: newSize(12),formatter:function(value:any) {return value.replace(' ', '\n')}},
				z: 10
			}
      
      let yLineShow  = attr.yAxisShow===false?false:true;
			let yAxis = [{
				name: attr.y_name,
				type: 'value',
				min: attr.min == 0 || attr.min ? attr.min : (value) => {
          // 对于负值数据，确保min比数据最小值更小
          if (value.min < 0) {
            return Math.floor(value.min * 1.1); // 向下扩展10%
          }
          return 0; // 正值数据从0开始
        },
				max: attr.max == 0 || attr.max ? attr.max : (value) => {
          // 确保max比数据最大值更大
          const padding = Math.abs(value.max) * 0.1; // 10%的padding
          return Math.ceil(value.max + padding);
        },
        //刻度线
        axisTick: {show: false},
        // 轴线
				axisLine: {show: yLineShow,lineStyle: {color: '#6f8dcb'}},
        // 分割线
				splitLine: {show: !yLineShow,lineStyle: {color: '#939393'}},
        // 轴文字
				axisLabel: {color: '#6f8dcb',fontSize: newSize(12),formatter: '{value}'}
			}]
      // 双y轴
      if(attr.y_name2){
        let yAxis2 = {
          name: attr.y_name2,
          type: 'value',
          min: attr.min2==0||attr.min2?attr.min2:(value) => {
            // 对于负值数据，确保min比数据最小值更小
            if (value.min < 0) {
              return Math.floor(value.min * 1.1); // 向下扩展10%
            }
            return 0; // 正值数据从0开始
          },
          max: attr.max2==0||attr.max2?attr.max2:(value) => {
            // 确保max比数据最大值更大
            const padding = Math.abs(value.max) * 0.1; // 10%的padding
            return Math.ceil(value.max + padding);
          },
          //刻度线
          axisTick: {show: false},
          // 轴线
          axisLine: {show: yLineShow,lineStyle: {color: '#6f8dcb'}},
          // 分割线
          splitLine: {show: !yLineShow,lineStyle: {color: '#939393'}},
          // 轴文字
          axisLabel: {color: '#6f8dcb',fontSize: newSize(12),formatter: '{value}'}
        }
        yAxis.push(yAxis2)
      }
      if(!allShow){
       xAxis.axisLabel.formatter=()=>""
       yAxis.forEach(item=>{ item.show=false})
      }
			const option = {
				grid: grid,
				tooltip: tooltip,
				legend: legend,
				dataZoom: dataZoom,
        visualMap: visualMap,
				xAxis: xAxis,
				yAxis: yAxis,
				series: seriesArr
			};
			return option
		},
  }
  export default setOption

