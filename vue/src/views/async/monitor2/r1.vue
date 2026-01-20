<template>
  <div class="layout-col">
    <!-- 标题 -->
	<div class="h40 ww100 flex-sc relative mb10">
		<img class="hh100" src="@/assets/imgs/title.png" />
		<div class="ww100 hh100 flex-sc absolute pl35">
			<span class="fw flex1 ptb5">实时资源</span>
			<div class="flex-ec flex1"></div>
		</div>
	</div>
	<div class="flex1 ww100 p15 ba1">
		<div class="layout-col i15">
			<!-- 告警 -->
			<div class="flex-cc flex1 ww100 mb2 rad2 ba2">
				<div class="flex-cc flex1 f12 tc">
					<div class="layout-col flex1 pl15 i1">
						<span class="mb5">正常</span>
						<span>
							<span class="f20 fw mr5">
								{{publicStore._public.homeInfo&&publicStore._public.homeInfo.alarm0?Math.floor((publicStore._public.homeInfo.alarm0*10))/10:'0'}}
							</span>
							<span></span>
						</span>
					</div>
					<img class="hh100" src="@/assets/imgs/line.png" />
					<div class="layout-col flex1 pl15 i8">
						<span class="mb5">告警</span>
						<span>
							<span class="f20 fw mr5 i8">
								{{publicStore._public.homeInfo&&publicStore._public.homeInfo.alarm1?Math.floor((publicStore._public.homeInfo.alarm1*10))/10:'0'}}
							</span>
							<span></span>
						</span>
					</div>
					<img class="hh100" src="@/assets/imgs/line.png" />
					<div class="layout-col flex1 pl15 i8">
						<span class="mb5">告警率</span>
						<span class="i8">
							<span class="f20 fw mr5">
								{{publicStore._public.homeInfo&&publicStore._public.homeInfo.alarm1?Math.floor((publicStore._public.homeInfo.alarm1/publicStore._public.homeInfo.sum*1000))/10:'0'}}
							</span>
							<span>%</span>
						</span>
					</div>
				</div>
			</div>
      <!-- 工况 -->
			<div class="flex-cc flex1 ww100 mb2 rad2 ba2">
				<div class="flex-cc flex1 f12 tc">
					<div class="layout-col flex1 pl15 i1">
						<span class="mb5">在线</span>
						<span>
							<span class="f20 fw mr5">
								{{publicStore._public.homeInfo&&publicStore._public.homeInfo.offline0?Math.floor((publicStore._public.homeInfo.offline0*10))/10:'0'}}
							</span>
							<span></span>
						</span>
					</div>
					<img class="hh100" src="@/assets/imgs/line.png" />
					<div class="layout-col flex1 pl15 i6">
						<span class="mb5">离线</span>
						<span>
							<span class="f20 fw mr5 i6">
								{{publicStore._public.homeInfo&&publicStore._public.homeInfo.offline1?Math.floor((publicStore._public.homeInfo.offline1*10))/10:'0'}}
							</span>
							<span></span>
						</span>
					</div>
					<img class="hh100" src="@/assets/imgs/line.png" />
					<div class="layout-col flex1 pl15 i6">
						<span class="mb5">离线率</span>
						<span class="i6">
							<span class="f20 fw mr5">
								{{publicStore._public.homeInfo&&publicStore._public.homeInfo.offline1?Math.floor((publicStore._public.homeInfo.offline1/publicStore._public.homeInfo.sum*1000))/10:'0'}}
							</span>
							<span>%</span>
						</span>
					</div>
				</div>
			</div>

		</div>
	</div>
  </div>
</template>
<script lang="ts" setup>
  const { proxy }:any = getCurrentInstance()
	const configStore = proxy.configStore()
  const publicStore = proxy.publicStore()
  const state = reactive({
	  ...publicStore.$state,
  })

  watch(() => publicStore._public.gfinfo, async (val) => {
    if(proxy.isNull(publicStore._public.gfinfo)) return
		getPies()
		getBars()
  },{ immediate: false, deep: true })

	const getPies = async() => {
		let value1 = publicStore._public.gfinfo.Output_Power? Math.floor(publicStore._public.gfinfo.Output_Power*10)/10 : 0
		let value11 = publicStore._public.gfinfo.Total_Power?Math.floor(publicStore._public.gfinfo.Total_Power*10)/10 -value1 : 1000
		let value2 = publicStore._public.gfinfo.Efficiency&&publicStore._public.gfinfo.sum?Math.floor((publicStore._public.gfinfo.Efficiency/publicStore._public.gfinfo.sum*10))/10 : 0
		let value22 = 100-value2
		let charts = [
			[{name:"功率",value: value1 + ""},{name:"",value: value11 + ""}], 
			[{name:"效率",value: value2 + ""},{name:"",value: value22 + ""}],
		]
		publicStore._public.gfpies = charts
	}

	const getBars = async() => {
		let type = 'photovoltaic'
		let code = 'Daily_Output'
		let end = new Date().getTime()
		let start = end - 7 * 24* 3600 * 1000 
		let endTime = proxy.parseTime(end, '{y}-{m}-{d}')
		let startTime = proxy.parseTime(start, '{y}-{m}-{d}')
    let query = {model: "t_sensor_measure_float_day", args: `station_num='${configStore.distributId}' and type='${type}' and date>'${startTime}' and date<='${endTime}' and code='${code}'`, order: 'date asc'}
		let res = await publicStore.http( {Api: query})
    let data1 = []
		res.forEach(v => {
			const date = proxy.parseTime(v.date, '{y}-{m}-{d}')
			let exist = data1.find(a=>a[0] == date)
			if(exist){
				exist[1] += Number(v.value)
			}else{
				data1.push([date, Number(v.value)])
			}
		})
		let charts = [
      {name: '日发电量', data: data1}, 
    ]
		publicStore._public.gfbars = charts
	}
</script>

<style scoped lang="scss">

</style>
