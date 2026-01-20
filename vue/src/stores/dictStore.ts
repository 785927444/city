const dictStore = defineStore('dict', {
  state: () => ({
		colorLists: [
			// {color: '#037796', start: 'rgba(3, 119, 150, 1)', end: 'rgba(3, 119, 150, 0.1)'},
			{color: '#60E7FF', start: 'rgba(96, 231, 255, 0.5)', end: 'rgba(96, 231, 255, 0.1)'},
			{color: '#FFC860', start: 'rgba(255, 200, 96, 0.5)', end: 'rgba(255, 200, 96, 0.1)'}, 
			{color: '#F45C5C', start: 'rgba(244, 92, 92, 0.5)', end: 'rgba(244, 92, 92, 0.1)'},
			{color: '#6097FF', start: 'rgba(96, 151, 255, 1)', end: 'rgba(96, 151, 255, 0.1)'}, 
			{color: '#00B578', start: 'rgba(96, 231, 255, 1)', end: 'rgba(96, 231, 255, 0)'}, 
			{color: '#FF41A4', start: 'rgba(96, 231, 255, 1)', end: 'rgba(96, 231, 255, 0)'}, 
			{color: '#60E7FF', start: 'rgba(96, 231, 255, 1)', end: 'rgba(96, 231, 255, 0)'}, 
			{color: '#FA8A94', start: 'rgba(96, 231, 255, 1)', end: 'rgba(96, 231, 255, 0)'}, 
			{color: '#B1C9F1', start: 'rgba(96, 231, 255, 1)', end: 'rgba(96, 231, 255, 0)'},  
		],
		authList:  [
			{name: '添加',   code: 'add',   value: "/api/v1/terminal/middle/add"},
			{name: '删除',   code: 'del',   value: "/api/v1/terminal/middle/del"},
			{name: '编辑',   code: 'upd',   value: "/api/v1/terminal/middle/upd"},
			{name: '查询',   code: 'query', value: "/api/v1/terminal/middle/query"}, 
			{name: '子添加', code: 'child', value: "/api/v1/terminal/middle/child"},
			{name: '重置', code: 'setpd', value: "/api/v1/terminal/middle/setpd"},
			{name: '解锁', code: 'unlock', value: "/api/v1/terminal/middle/unlock"},
			{name: '行业', code: 'industry', value: "/api/v1/terminal/middle/industry"},
			{name: '地区', code: 'area', value: "/api/v1/terminal/middle/area"},
			{name: '配置', code: 'sensorset', value: "/api/v1/terminal/middle/sensorset"},
			{name: '告警', code: 'sensoralarm', value: "/api/v1/terminal/middle/sensoralarm"},
			{name: '控制', code: 'sensorcontrol', value: "/api/v1/terminal/middle/sensorcontrol"},
			{name: '批删', code: 'dels', value: "/api/v1/terminal/middle/dels"},
			{name: '模板', code: 'actives', value: "/api/v1/terminal/middle/template"},
			{name: '导入', code: 'in', value: "/api/v1/terminal/middle/in"},
			{name: '导出', code: 'out', value: "/api/v1/terminal/middle/out"},
		],
		isList: [
			{name: '是', value: 1}, 
			{name: '否', value: 0}
		],
		isNormal: [
			{name: '正常', value: '0'},
			{name: '异常', value: '1'},
		],
		organ: [
			{name: '储能站', type: 1},
			{name: '充电站', type: 2},
			{name: '光伏站', type: 3},
		],
		classify: [
			{name: '设备', value: 0},
			{name: '节点', value: 1},
			{name: '前置', value: 2},
		],
    typeSelect: [
      {name: '测 量', value: 2, query: {"model":"t_sensor_template_measure_point"}},
      {name: '配 置', value: 3, query: {"model":"t_sensor_template_cfg_point"}},
      {name: '告 警', value: 4, query: {"model":"t_sensor_template_alarm_point"}},
      {name: '控 制', value: 5, query: {"model":"t_sensor_template_control_point"}},
    ],
		valueType: [
      {name: '字符串', value: 'string'},
      {name: '浮点', value: 'float'},
      {name: '整型', value: 'int'},
    ],
		agreement: [
			{name: '无', value: 0},
			{name: 'modbus-TCP', value: 1},
			{name: 'modbus-RTU', value: 2},
			{name: '104', value: 3},
			{name: '645', value: 4},
			{name: 'lonwork', value: 5},
		],
    measureType: [
      {name: '物理', value: 'physical'},
      {name: '逻辑', value: 'logic'},
      {name: '计算', value: 'calc'},
      {name: '统计', value: 'count'},
      {name: '累计', value: 'statistics'},
    ],
    cygType: [
      {name: '关联', type: '1'},
      // {name: '互联', type: '2'},
      // {name: '图谱', type: '3'},
      {name: '自定义', type: '4'},
    ],
		cfgShow: [
			{name: '无',        value: '0'},
      {name: '列表监控值', value: '1'},
      {name: '详情监控值', value: '2'},
      {name: '公共监控值', value: '3'},
		],
		statisticsType: [
			{value: '0', name: '累计'},
			{value: '1', name: '单次'},
		],
		leftRangeType: [
			{value: '0', name: '开区间'},
			{value: '1', name: '闭区间'},
		],
		rightRangeType: [
			{value: '0', name: '开区间'},
			{value: '1', name: '闭区间'},
		],
		actionType: [
			{name: '开关', value: 'kg'},
			{name: '计数', value: 'count'},
			{name: '模式', value: 'mode'},
			{name: '速度', value: 'speed'},
		],
	})
})

export default dictStore