import { storage } from "@/utils/storage"
import { isNull } from "@/utils/common"
import api from "@/api/index"
import configStore from "@/stores/configStore"
import dictStore from "@/stores/dictStore"
const publicStore = defineStore('public', {
	state: () => ({
		// 当前路径
		model: '' as string,
		// 当前权限
		auth: {},
		// 公共集合
		_public: {},
		_model: {},
		// 请求页码
		page: 1,
		// 请求数量
		limit: 20,
		// 请求参数
		query: {},
        // 请求体
		params: {},
		// 响应总数
		total: 0,
		// 列表数组
		list: [],
		// 树数组
		tree: [],
		// 数据对象
		data: {},
		// 选中对象
		active: {},
		// 选中对象序号
		actIndex: -1,
		// 当前对象
		current: {},
		// 表单
		form: {},
		// 时间选择
		datetime: [],
		// 定时器
		timer: null,
		// 加载状态
		loading: false,
		// 空状态
		empty: false,
		// 更多状态
		more: false,
		// 默认true
		isTrue: true,
    // 默认false
		isFalse: false,
		// 默认选中
		check: false,
		// 默认状态
		status: 0,
		// 标题
		title: '',
		// 关键字
		text: '',
		// 主键
		key: 'id',
		// 树-父级
		parent: 'parent_id',
    // 树-父子
		defaultProps: { children: 'children', label: 'name'},
		// 树-id
		defaultId: '',
		// 添加项
		addItem: {parent_id: '0'},
		// 编辑字段
		editField: {},
		// 图片
		srcList: [''],
		// 图表
		chartArr: [],
		chartDot: '',
		legendName: '',
		barDate: '', 
		visualMap: [],
		inRangeColors: [],
		// 三维
		viewer: {},
		mapAdcodes: [],
	}),
	actions: {
	patch(contxt:any) {
		Object.keys(contxt).forEach((key:any)=>{
			storage.set(key, contxt[key])
		})
		this.$patch(contxt)
	},
	async init(contex:any, state:any) {
		// 获取模型
		const model = 't_' + contex.path.split('/').pop()
		state ? state.model = model : this.model = model
		// 动态权限
		const key = {}
		if(configStore().auths && configStore().auths.length != 0){
			let auths:any = configStore().auths.filter((item:any) => item.model==model)
			if (auths && auths.length != 0) {
				dictStore().authList.slice().reverse().forEach(v => {
					let auth = auths.find(a=>a.path == v.value)
					if(auth) key[v.code] = v.name
				})
			}
			state ? state.auth = key : this.auth = key
			if(state && state.content) {
				let content = state.content.find(a=>a.name=='操作')
				if(content) content.key = key
			}
		}
	},
	async rechart(id:any){
		if(this.chartArr.length == 0) return
		if(id){
			let index = this.chartArr.findIndex(a=>a.id == id)
			if(index!=-1){
				const chartDom = document.getElementById(id)
				if(chartDom) chartDom.innerHTML = ''
				this.chartArr[index].myChart.dispose()
				this.chartArr.splice(index, 1)
				// let inx = id.indexOf('_')
				// if(!isNull(this._public) && inx != -1) {
				// 	let key = id.slice(inx+1)
				// 	if(key && !isNull(this._public[key])) {
				// 		this._public[key] = ''
				// 	}
				// }
				console.log(`触发消毁【${id}】成功`)
			}
		}else{
			for(var i =0; i < this.chartArr.length; i++){
				const chartDom = document.getElementById(this.chartArr[i].id)
				if(chartDom) chartDom.innerHTML = ''
				this.chartArr[i].myChart.dispose()
				let inx = this.chartArr[i].id.indexOf('_')
				if(!isNull(this._public) && inx != -1) {
					let key = this.chartArr[i].id.slice(inx+1)
					if(key && !isNull(this._public[key])) {
						this._public[key] = ''
					}
				}
				console.log(`触发消毁【${this.chartArr[i].id}】成功`)
			}
			this.chartArr = []
		}
	},
	async http(contxt:any, url: any, headers:any = {}, method:any = 'post') {
		return new Promise((resolve) => {
			let strat = new Date().getTime()
			let promiseAll:any = []
			Object.keys(contxt).forEach((key:any)=>{
				promiseAll.push(
					new Promise((resolve, reject) => {
						api[key[0] == '_'?key.slice(1):key](contxt[key], url?typeof(url) == 'object'?url[key]:url:undefined, headers, method).then((res:any) => {
							resolve([key, res.data? res.data : res.respond? res.respond : []]);
							// resolve([key, res.respond? res.respond : []]);
						}).catch((err:any) => {
							console.log('err', err)
							reject(key)
						})
					})   
				)       
			})
			Promise.all(promiseAll.map((promise:any) => promise.catch((err:any) => console.log(err + "---请求错误: " )))).then(res => { 
				let obj:any = {}
				res.forEach((item:any, index:any) => { 
					if(item && item[0][0] == '_') this._public[item[0].slice(1)] = item[1]
					if(item) obj[item[0][0] == '_'?item[0].slice(1):item[0]] = item[1]; else obj[Object.keys(contxt)[index]] = []
				})
				// console.log(` %c请求成功 | 耗时------, ${new Date().getTime() - strat}ms`,'color: green;background: #b4f7d6;padding:2px','\n',
				// '接口------', url, '\n','参数------', contxt, '\n','结果------', Object.keys(obj).length ==1?Object.values(obj)[0]:obj),
				resolve(Object.keys(obj).length ==1?Object.values(obj)[0]:obj)
				})
		})  
	},
	}
})

export default publicStore