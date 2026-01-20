<template>
    <div class="layout-row">
        <!-- 列表 -->
        <div class="flex-col flex1 mr5" >
            <div class="ww100 flex-bc pl5 pr15 bgi22 i15">  
              <span class="flex-sc h46 f16"><img class="w30" src="@/assets/imgs/title-dot.png"/><span>{{!isNull(publicStore._public.DevicesPowerList)?parseTime(publicStore._public.DevicesPowerList[0]['timestamp']):'实时'}}总功率</span></span>
              <span class="flex-sc">
                <span class="i21 f16 fw mr5">
                {{ isNull(publicStore._public.DevicesPowerList)&&!isNull(publicStore._public.homeInfo)&&publicStore._public.homeInfo.Total_Power?Math.floor(100*Number(publicStore._public.homeInfo.Total_Power))/100:
                !isNull(publicStore._public.DevicesPowerList)?publicStore._public.DevicesPowerList.reduce((sum, item)=>sum+item.value,0):'0' }}
                </span> (kW)
              </span>
            </div>
            <div class="table ba1">
                <div class="row" :class="index%2 == 1?'bgi23':'bgi18'" v-for="(item, index) in 
                isNull(publicStore._public.DevicesPowerList)&&!isNull(publicStore._public.homeDevices)?
                publicStore._public.homeDevices.sort((a, b) => a.Total_Power - b.Total_Power):
                !isNull(publicStore._public.DevicesPowerList)?publicStore._public.DevicesPowerList.sort((a, b) => a.Total_Power - b.Total_Power):[]" 
                :key="index" @click="handleClick('active', item)">
                <div v-show="v.show" :class="v.width" :style="{textAlign: v.align}" v-for="(v, i) in state.content" :key="i">
                    <span v-if="typeof(v.key) == 'object'" class="cursor mlr5" :class="kk=='add'||state.auth[kk] == false?'none':kk=='del'?'i8':'i21'" 
                    v-for="(vv, kk, ii) in v.key" :key="ii" @click.stop="handleClick(kk, item)">{{vv}}</span>
                    <span v-else-if="v.key=='*'">{{(state.page-1)*state.limit + index+1}}</span>
                    <span v-else-if="v.type == 'time'">{{item[v.key] == 0?'/':parseTime(item[v.key])}}</span>
                    <span v-else-if="v.type == 'select'" :class="find(v.list, [v.value, item[v.key]], 'color')?find(v.list, [v.value, item[v.key]], 'color'):''">
                    {{find(v.list, [v.value, item[v.key]], v.label)}}
                    </span>
                    <span v-else-if="v.type == 'switch'">
                    <el-switch v-model="item[v.key]" :active-text="v.value[1].name" :inactive-text="v.value[0].name" :active-value="v.value[1].value" :inactive-value="v.value[0].value" inline-prompt @change="handleClick('switch', item)"></el-switch>
                    </span>
                    <span v-else-if="v.type == 'input'"><el-input v-model="item[v.value]" placeholder="请输入" style="width: 150px;" size="small" /></span>
                    <span v-else-if="v.type == 'preload'">{{item[v.filed]}}</span>
                    <span v-else>{{isNull(item[v.key]) && v.key!=''? '/' : item[v.key]}}</span>
                </div>
                </div>
                <div v-if="state.empty" class="flex-cc ww100 tc ptb13 bgi18">没有数据</div>
            </div>
        </div>
        <!-- 图表 -->
        <div class="flex-col flex3 ba1">
            <div class="ww100 flex-bc pl5 pr15 bgi22 i15">  
                <span class="flex-sc h46 f16"><img class="w30" src="@/assets/imgs/title-dot.png"/><span>总功率趋势</span></span>
                <span class="flex-sc ml20">
                    <span class="plr10">时间</span>
                    <span class="w50x8">
                    <el-date-picker style="width:100%;" v-model="publicStore.datetime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
                        type="datetimerange" range-separator="-" start-placeholder="开始时间" end-placeholder="结束时间" />
                    </span>
                </span>
            </div>
            <div class="flex1 hh100 flex-col ptb10 pl10 pr20">
                <div class="hh100 ww100" id="Line_DevicesPower"></div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import ec from "@/utils/chart";
    const { drawChart } = ec();
    const { proxy }: any = getCurrentInstance();
    const publicStore = proxy.publicStore();
    const state = reactive({
        ...publicStore.$state,
        content: [
        { width: 'w70',   show: true, align: 'center', key: '*', name: '序号' },
        { width: 'w50x3', show: true, align: 'left', key: 'name', name: '名称' },
        { width: 'flex1', show: true, align: 'right', key: 'Total_Power', name: '功率' }, 
        ],
    })

    watch(() => publicStore._public.DevicesPower, async(val, old) => {
        if(proxy.isNull(val)) return
        if(JSON.stringify(val) == JSON.stringify(old)) return
        await nextTick();
        setChart(val);
    }, { immediate: false, deep: true });

    const setChart = async(data) => {
        let chart = 'Line'
        let id = 'Line_DevicesPower'
        let attr = {
            min: 0, 
            // max: 100,
            extent: 4, 
            colorList: [{color: '#60E7FF', start: 'rgba(96, 231, 255, 1)', end: 'rgba(96, 231, 255, 0)'}],
            legendArr: [],
            legendShow: false,
            labelShow: false,
            areaShow: false,
            y_name: '数值',
            tool_dw: '', 
            tool_name_x: '日期：', 
            tool_name_y: '数值：', 
        }
        let series = {data: []}
        series = data.map(v => {
            attr.legendArr.push(v.name)
            let data = v.data
            return {data}
        })
        drawChart(chart, id, attr, {series: series, xAxis: {}}, {});
    }

    const handleClick = async(remark, val) => {
        if(remark == 'add' || remark == 'upd'){
        val.bayNum = publicStore.active.bayNum
        addRef.onVisable(val)
        }
        if(remark == 'del'){
        addRef.del(val)
        }
    }
</script>