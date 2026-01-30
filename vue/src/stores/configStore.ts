 import axios from 'axios'
 const config = await axios.get('./config.json')
 console.log('config---', config)
 const configStore = defineStore('config', {
    state: () => ({
		init: '',
		// 项目KEY
		key: import.meta.env.VITE_KEY,
		// 未知参数
		secret_key: import.meta.env.VITE_SECRET_KEY,
		// 动态http地址
		produrl: import.meta.env.VITE_URL,
		// 动态mqtt地址
		wsurl: import.meta.env.VITE_WS,
		// 动态图片地址
		imageurl: import.meta.env.VITE_IMAGE,
		// 开启登录
		isLogin: import.meta.env.VITE_LOGIN,
		// 登录地址
		loginRoute: import.meta.env.VITE_LOGINROUTE,
		// 开启mqtt
		isMqtt: import.meta.env.VITE_MQTT,
		// 开启动态路由
		isRoute: import.meta.env.VITE_ROUTE,
		// 动态路由
		routes: [],
		// 权限列表
		auths: [],
		// 是否模拟
		isMock: false,
		// 是否展开
		isCollapse: false,
		// 展开宽度
		asideWidth: '280px',
		// 是否全屏
		ifFullScreen: false,
		// 是否联网
		netStatus: true,
		// 面包屑
		crumbList: [],
		// 配置信息
		config: config.data,
		configs: {},
		// CSRF凭证
		csrfToken: '',
		// 登录凭证
		token: '',
		// 登录信息
		user: '',
		password: '',
		tourist: '',
		// 动态地址
		ip: '',
		main: '',
		// 状态
		actStatus: false,
		// 选中对象
		active: {},
		// 选中对象序号
		actIndex: -1,
		// 调试
		debugger: false,
		debugapi: false,
		// 地图
		adcode: '100000',
		adcodes: [],
		provinceId: config.data.level[0],
		cityId: config.data.level[1],
		districtId: config.data.level[2],
		distributId: config.data.level[3],
	}),
	persist: {
		paths: [
			'init',
			'isMock',
			'isCollapse', 
			'asideWidth',
			'ifFullScreen', 
			'netStatus',
			'crumbList',
			'debugger',
			'debugapi',
			'token', 
			'user', 
			'password',
			'tourist',
			'ip', 
			'main',
			'actStatus',
			'active',
			'actIndex',
			'adcode',
			'adcodes',
			'provinceId',
			'cityId',
			'districtId',
			'distributId',
		],
	},
})

export default configStore