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
		roles: [
			{name: '管理员', id: '1'},
			{name: '省级部门', id: '2'}, 
			{name: '市级部门', id: '3'},
			{name: '区级部门', id: '4'}, 
			{name: '企业单位', id: '5'},
		],
		isList: [
			{name: '是', value: 1}, 
			{name: '否', value: 0}
		],
		isNormal: [
			{name: '正常', value: '0'},
			{name: '异常', value: '1'},
		],
		// 上报状态
		release_statuss: [
			{value: '0', name: '待上报'},
			{value: '1', name: '已上报'},
		],
		// 完成状态
		completion_statuss: [
			{value: '0', name: '未开始'},
			{value: '1', name: '进行中'},
			{value: '2', name: '已完成'},
		],
		// 审核状态
    examine_statuss: [
			{value: '0', name: '待审核'},
			{value: '1', name: '审核中'},
			{value: '2', name: '已通过'},
			{value: '3', name: '不通过'},
		],
		// 项目实施状态
		project_completion_statuss: [
			{value: '0', name: '未开始'},
			{value: '1', name: '谋划中'},
			{value: '2', name: '实施中'},
			{value: '3', name: '已竣工'},
		],
		// 项目阶段
		project_stages: [
			{value: '0', name: '无'},
			{value: '1', name: '储备阶段'},
			{value: '2', name: '开工阶段'},
			{value: '3', name: '续建阶段'},
			{value: '4', name: '完工阶段'},
		],
		// 所属等级
		levels: [
			{value: '1', name: '省级'},
			{value: '2', name: '市级'},
			{value: '3', name: '区级'},
		],
		fileType: [
			{value: '', name: '无'},
      {value: 'text/plain', name: '文本文档'},
			{value: 'application/pdf', name: 'PDF文件'},
		],
	})
})

export default dictStore