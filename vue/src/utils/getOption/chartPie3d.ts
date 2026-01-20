  // 饼状图
  import * as echarts from 'echarts'
  import router from '@/router'
  const setOption = {
    Pie3d(attr:any, pieData: any[], pramas1: any) {
      let internalDiameterRatio = pramas1.internalDiameterRatio
      let distance = pramas1.distance
      let alpha = pramas1.alpha
      let pieHeight = pramas1.pieHeight
      let opacity = pramas1.opacity
      const series = []
      let sumValue = 0
      let startValue = 0
      let endValue = 0
      let legendData = []
      let legendBfb: { name: any; value: string | boolean }[] = []
      let Axis3D = {}
      let path = router.currentRoute.value.path
      let titleTop = '0'
      let titleLeft = '0'
      if(path == '/monitor'){
        Axis3D = { min: -1.2, max: 2.5 }
        titleTop = '40%'
        titleLeft = '35%'
      }else if(path == '/chart'){
        Axis3D = { min: -1.5, max: 1.5 }
        titleTop = '26%'
        titleLeft = '48%'
      }else{
        Axis3D = { min: -0.8, max: 1.8 }
        titleTop = '35%'
        titleLeft = '39%'
      }
      const k = 1 - internalDiameterRatio
      pieData.sort((a: { value: number }, b: { value: number }) => {
        return b.value - a.value
      })
      // 为每一个饼图数据，生成一个 series-surface 配置
      for (let i = 0; i < pieData.length; i++) {
        sumValue += pieData[i].value
        const seriesItem = {
          name: typeof pieData[i].name === 'undefined' ? `series${i}` : pieData[i].name,
          type: 'surface',
          label: { position: 'outside', show: true}, 
          parametric: true,
          wireframe: {
            show: false
          },
          pieData: pieData[i],
          pieStatus: {
            selected: false,
            hovered: false,
            k: k
          },
          itemStyle: {},
          parametricEquation: {},
          center: ['50%', '50%'],
        }
        const itemStyle = {color: '', opacity: ''}
        itemStyle.color = colorList[i]['colorEnd']
        itemStyle.opacity = opacity
        seriesItem.itemStyle = itemStyle
        series.push(seriesItem)
      }
      // 使用上一次遍历时，计算出的数据和 sumValue，调用 getParametricEquation 函数，
      // 向每个 series-surface 传入不同的参数方程 series-surface.parametricEquation，也就是实现每一个扇形。
      legendData = []
      legendBfb = []
      for (let i = 0; i < series.length; i++) {
        endValue = startValue + series[i].pieData.value
        series[i].pieData.startRatio = startValue / sumValue
        series[i].pieData.endRatio = endValue / sumValue
        series[i].parametricEquation = getParametricEquation(
          series[i].pieData.startRatio, 
          series[i].pieData.endRatio, false, false, k, series[i].pieData.value
        )
        startValue = endValue
        const bfb = fomatFloat(series[i].pieData.value / sumValue, 4)
        legendData.push({
          name: series[i].name,
          value: bfb
        })
        legendBfb.push({
          name: series[i].name,
          value: bfb
        })
      }
      const boxHeight = getHeight3D(series, pieHeight)
      const option = {
        title: {
          show: true,
          text: pieData.reduce(function (a:any, b:any) { return a + Math.round(b.value*100)/100 }, 0),
          subtext: '总数',
          itemGap: 4,
          left: titleLeft,
          top: titleTop,
          textStyle: {
            color: '#1BFFDF',
            fontSize: newSize(40),
            fontWeight: 'bold'
          },
          subtextStyle: {
            color: '#FFFFFF',
            fontSize: newSize(12),
          },
          textAlign:'center'
        },
        tooltip: {
          backgroundColor:'rgba(0,0,0,0.5)',
          textStyle : {
              color: '#FFFFFF',
          },
          trigger: 'item',
          formatter: (params:any) => {
            if (params.seriesName !== 'mouseoutSeries' && params.seriesName !== 'pie2d') {
              let bfb = ((option.series[params.seriesIndex].pieData.endRatio - option.series[params.seriesIndex].pieData.startRatio) * 100).toFixed(2);
              return `${params.seriesName}<br/>` + `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${params.color};"></span>` + `${ bfb }`;
            }
          }
        },
        legend: {
          left: '69%',
          top: 'middle',
          // top: 'middle',
          orient: 'vertical',
          type: "scroll",
          height: '80%',
          pageButtonItemGap: 10,
          pageButtonGap: 10,
          pageIconColor: '#44e6fd',
          pageIconInactiveColor: '#fbffff',
          pageTextStyle: {
            color: '#35ffff'
          },
          // 修改小图标的大小
          itemWidth: newSize(12),
          itemHeight: newSize(12),
          itemGap: newSize(12),
          icon: 'circle',
          show: true,
          data: legendData,
          textStyle: { 
            color: '#fff',
            fontSize: newSize(12),
            rich:{
              a:{ width: newSize(75), fontSize: newSize(12)},
              b:{ color: '#ffffff ',  fontSize: newSize(12)}
            }
          },
          formatter: function (param: any) {
            const item:any = pieData.filter(item => item.name === param)[0]
            return `{a|${item.name}}{b|${item.value}}`
          }
        },
        labelLine: { show: false },
        label: { show: true, position: 'outside', formatter: '{b} \n{c} {d}%' },
        xAxis3D: Axis3D,
        yAxis3D: Axis3D,
        zAxis3D: { min: -2, max: 2 },
        grid3D: { show: false, boxWidth: 100, boxHeight: newSize(boxHeight), 
          viewControl: {
            alpha, // 角度
            distance: newSize2(150), // 调整视角到主体的距离，类似调整zoom
            rotateSensitivity: 1, // 设置为0无法旋转
            zoomSensitivity: 1, // 设置为0无法缩放
            panSensitivity: 1, // 设置为0无法平移
            autoRotate: false // 自动旋转
          }
        },
        series: series
      }
      return option
    },
  }

  // 生成扇形的曲面参数方程，用于 series-surface.parametricEquation
  const getParametricEquation = (startRatio: number, endRatio: number, isSelected: boolean, isHovered: boolean, k: number, h: number) => {
    // 计算
    const midRatio = (startRatio + endRatio) / 2
    const startRadian = startRatio * Math.PI * 2
    const endRadian = endRatio * Math.PI * 2
    const midRadian = midRatio * Math.PI * 2
    // 如果只有一个扇形，则不实现选中效果。
    if (startRatio === 0 && endRatio === 1) {
        isSelected = false
    }
    // 通过扇形内径/外径的值，换算出辅助参数 k（默认值 1/3）
    k = typeof k !== 'undefined' ? k : 1 / 3
    // 计算选中效果分别在 x 轴、y 轴方向上的位移（未选中，则位移均为 0）
    const offsetX = isSelected ? Math.cos(midRadian) * 0.1 : 0
    const offsetY = isSelected ? Math.sin(midRadian) * 0.1 : 0
    // 计算高亮效果的放大比例（未高亮，则比例为 1）
    const hoverRate = isHovered ? 1.05 : 1
    // 返回曲面参数方程
    return {
      u: {
        min: -Math.PI,
        max: Math.PI * 3,
        step: Math.PI / 32
      },
      v: {
        min: 0,
        max: Math.PI * 2,
        step: Math.PI / 20
      },
      x: function (u: number, v: number) {
        if (u < startRadian) {
          return (
            offsetX +
            Math.cos(startRadian) * (1 + Math.cos(v) * k) * hoverRate
          )
        }
        if (u > endRadian) {
          return (
            offsetX + Math.cos(endRadian) * (1 + Math.cos(v) * k) * hoverRate
          )
        }
        return offsetX + Math.cos(u) * (1 + Math.cos(v) * k) * hoverRate
      },
      y: function (u: number, v: number) {
        if (u < startRadian) {
          return (
            offsetY +
            Math.sin(startRadian) * (1 + Math.cos(v) * k) * hoverRate
          )
        }
        if (u > endRadian) {
          return (
            offsetY + Math.sin(endRadian) * (1 + Math.cos(v) * k) * hoverRate
          )
        }
        return offsetY + Math.sin(u) * (1 + Math.cos(v) * k) * hoverRate
      },
      z: function (u: number, v: number) {
        if (u < -Math.PI * 0.5) {
          return Math.sin(u)
        }
        if (u > Math.PI * 2.5) {
          return Math.sin(u) * h * 0.1
        }
        return Math.sin(v) > 0 ? 1 * h * 0.1 : -1
      }
    }
  }
  // 获取3d丙图的最高扇区的高度
  const getHeight3D = (series: any[], height: number) => {
  series.sort((a: { pieData: { value: number } }, b: { pieData: { value: number } }) => {
    return b.pieData.value - a.pieData.value
  })
  let boxHeight = (height * 25) / series[0].pieData.value 
  return boxHeight > 100 ? 100 : boxHeight
  }
  // 格式化浮点数
  const fomatFloat = (num: any, n: number) => {
  let f = parseFloat(num)
  if (isNaN(f)) {
    return false
  }
  f = Math.round(num * Math.pow(10, n)) / Math.pow(10, n) // n 幂
  let s = f.toString()
  let rs = s.indexOf('.')
  // 判定如果是整数，增加小数点再补0
  if (rs < 0) {
    rs = s.length
    s += '.'
  }
  while (s.length <= rs + n) {
    s += '0'
  }
  return s
  }

  // 字体自适应
  const newSize = (res:any) => {
    let clientWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    if (!clientWidth) return;
    let fontSize = clientWidth / 1920; //设计稿尺寸
    return res * fontSize;  //转换为 rem的布局返回出去
  }

  const newSize2 = (res:any) => {
    let clientWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    if (!clientWidth) return;
    let fontSize =  1920 / clientWidth; //设计稿尺寸
    return res * fontSize;  //转换为 rem的布局返回出去
  }

  // 颜色列表
  const colorList = [
    { colorStart:'#0033FF', colorEnd:'#00B7FF' },
    { colorStart:'#9B42FF', colorEnd:'#FF59FC' },
    { colorStart:'#E75F5F', colorEnd:'#FFCD45' },
    { colorStart:'#f7290a', colorEnd:'#f98371' },
    { colorStart:'#CE2B8D', colorEnd:'#FF9595' },
    { colorStart:'#488BFF', colorEnd:'#9abffd' },
    { colorStart:'#26CEBA', colorEnd:'#8efaed' },
    { colorStart:'#409eff', colorEnd:'#409eff' },
    { colorStart:'#FD6865', colorEnd:'#f8b2b1' },
    { colorStart:'#becce9', colorEnd:'#82a0df' },

    { colorStart:'#0033FF', colorEnd:'#00B7FF' },
    { colorStart:'#9B42FF', colorEnd:'#FF59FC' },
    { colorStart:'#E75F5F', colorEnd:'#FFCD45' },
    { colorStart:'#f7290a', colorEnd:'#f98371' },
    { colorStart:'#CE2B8D', colorEnd:'#FF9595' },
    { colorStart:'#488BFF', colorEnd:'#9abffd' },
    { colorStart:'#26CEBA', colorEnd:'#8efaed' },
    { colorStart:'#409eff', colorEnd:'#409eff' },
    { colorStart:'#FD6865', colorEnd:'#f8b2b1' },
    { colorStart:'#becce9', colorEnd:'#82a0df' },

    { colorStart:'#0033FF', colorEnd:'#00B7FF' },
    { colorStart:'#9B42FF', colorEnd:'#FF59FC' },
    { colorStart:'#E75F5F', colorEnd:'#FFCD45' },
    { colorStart:'#f7290a', colorEnd:'#f98371' },
    { colorStart:'#CE2B8D', colorEnd:'#FF9595' },
    { colorStart:'#488BFF', colorEnd:'#9abffd' },
    { colorStart:'#26CEBA', colorEnd:'#8efaed' },
    { colorStart:'#409eff', colorEnd:'#409eff' },
    { colorStart:'#FD6865', colorEnd:'#f8b2b1' },
    { colorStart:'#becce9', colorEnd:'#82a0df' },
  ]
export default setOption

