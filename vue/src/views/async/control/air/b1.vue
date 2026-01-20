<template>
    <div class="layout-col ba1">
        <div class="ww100 flex-bc pl5 pr15 bgi22 i15">  
            <span class="flex-sc h46 f16"><img class="w30" src="@/assets/imgs/title-dot.png"/><span>设备监控</span></span>
            <div class="flex-ec">
                <span class="mr5 ml15 i15">状态：</span>
                <div class="w50x4 m">
                    <el-select v-model="state.active" placeholder="请选择" filterable>
                        <el-option v-for="(v, i) in state.actives" :key="v.value" :label="v.name" :value="v.value" />
                    </el-select>
                </div>
                <span class="mr5 ml15 i15">名称：</span>
                <div class="w50x4">
                    <el-input v-model="state.airName" placeholder="请输入"></el-input>
                </div>
                <el-button class="rad4 ptb5 plr8 flex-cc cursor bgi1 i15 ml10" @click.stop="handleClick('controls')">批量控制</el-button>
            </div>
        </div>

        <div class="layout-row overlay warp p8">
            <div class="p8 ww20" v-for="(v, i) in !isNull(publicStore._public.homeDevices)?
            // state.active=='All'&&state.bay!='All'&&!state.airName?publicStore._public.homeDevices.filter(a =>a.bayNum==state.bay) :
            // state.active!='All'&&state.bay!='All'&&!state.airName?publicStore._public.homeDevices.filter(a =>a.bayNum==state.bay&&a['2022']==state.active) :
            // state.active=='All'&&state.bay!='All'&&state.airName?publicStore._public.homeDevices.filter(a =>a.bayNum==state.bay&&a.name.indexOf(state.airName)!=-1) :
            state.active!='All'&&state.bay=='All'&&!state.airName?publicStore._public.homeDevices.filter(a =>a['2022']==state.active) : 
            state.active=='All'&&state.bay=='All'&&state.airName?publicStore._public.homeDevices.filter(a => a.name.indexOf(state.airName)!=-1) :
            state.active!='All'&&state.bay=='All'&&state.airName?publicStore._public.homeDevices.filter(a =>a['2022']==state.active&&a.name.indexOf(state.airName)!=-1) :
            state.active=='All'&&state.bay=='All'&&!state.airName?publicStore._public.homeDevices : [] : []" :key="i">
                <div class="ww100 flex-col air-itembox rad6 i15 hidden">
                    <div class="flex-bc ww100 p12 fw">
                        <span class="flex1">{{v.name}}</span>
                        <span v-if="v.offline&&v.offline=='0'" :class="find(state.actives, ['value', v['2022']], 'color')?find(state.actives, ['value', v['2022']], 'color'):'ca'">
                          · {{find(state.actives, ['value', v['2022']], 'name')?find(state.actives, ['value', v['2022']], 'name'):'暂无'}}
                        </span>
                        <span class="ca" v-else>· 离线</span>
                    </div>
                    <div class="flex-bc ww100 mb15 bodt-i21-1 bodb-i21-1">
                        <div class="flex2 flex-cc relative">
                            <img class="ww100 p5" src="@/assets/imgs/cons1.png" />
                            <div class="flex-col-cc absolute-cc">
                                <img class="w15" src="@/assets/imgs/cons2.png" />
                                <span class="f12 mt2"><span class="f18">{{v["Temperature"]?Math.floor(Number(v["Temperature"]*10))/10 + '℃':'--'}}</span></span>
                            </div>
                        </div>
                        <div class="flex3 flex-col-cs p12 bodl-i21-1">
                            <div class="flex-sc ww100">
                                <span class="i21 w42">风速</span>
                                <span class="white flex1">
                                   <span v-if="v['2025']">
                                      <span v-if="v['2025'] == '4'">自动</span>
                                      <span v-if="v['2025'] == '2'" class="flex-sc">
                                        <img class="w15 mr5" src="@/assets/imgs/cons3.png" />
                                      </span>
                                      <span v-if="v['2025'] == '3'" class="flex-sc">
                                        <img class="w15 mr5" src="@/assets/imgs/cons3.png" />
                                        <img class="w15 mr5" src="@/assets/imgs/cons3.png" />
                                      </span>
                                      <span v-if="v['2025'] == '4'" class="flex-sc">
                                        <img class="w15 mr5" src="@/assets/imgs/cons3.png" />
                                        <img class="w15 mr5" src="@/assets/imgs/cons3.png" />
                                        <img class="w15 mr5" src="@/assets/imgs/cons3.png" />
                                      </span>
                                   </span>
                                   <span v-else>--</span>
                                </span>
                            </div>
                            <div class="flex-sc ww100 mt12">
                                <span class="i21 w42">模式</span>
                                <span class="white flex1">
                                    <span v-if="v['2023']">
                                        <span v-if="v['2023'] == '1'">自动</span>
                                        <span v-if="v['2023'] == '2'">制冷</span>
                                        <span v-if="v['2023'] == '3'">除湿</span>
                                        <span v-if="v['2023'] == '4'">通风</span>
                                        <span v-if="v['2023'] == '5'">制热</span>
                                    </span>
                                    <span v-else>--</span>
                                </span>
                            </div>
                            <!-- <div class="flex-sc ww100 mt12">
                                <span class="i21 w42">室温</span>
                                <span class="white flex1">{{v.Temperature?(Math.round(v.Temperature*100)/100)+' ℃':'--'}}</span>
                            </div> -->
                            <div class="flex-sc ww100 mt12">
                                <span class="i21 w42">湿度</span>
                                <span class="white flex1">{{v.Humility?(Math.round(v.Humility*100)/100)+' %':'--'}}</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex-col ww100 pl12 pb12">
                        <div class="flex-sc ww100 pb10">
                            <span class="i21">累计用电</span>
                            <span class="pl10 ww40">{{v.Total_Electricity?Math.round(v.Total_Electricity*100)/100:'0'}} kWh</span>
                        </div>
                        <div class="flex-sc ww100 pb10">
                            <span class="i21">用电时长</span>
                            <span class="pl10 ww40">{{v.Total_Duration?Math.round(v.Total_Duration*100)/100:'0'}} 小时</span>
                        </div>
                        <div class="flex-sc ww100">
                            <span class="i21">采集时间</span>
                            <span class="pl10">{{v.timestamp?proxy.parseTime(v.timestamp):'暂无'}}</span>
                        </div>
                    </div>
                    <div class="flex1 flex-cc pt15 bgi22 ptb12">
                        <div class="flex1 flex-cc">
                            <div class="flex-sc btn-bg2 cursor ptb5 pl5 pr12" @click.stop="toPath('/detail', {id: v.id, stationNum: v.stationNum, type: v.type, code: 'Total_Power', code2: 'Signal'})">
                                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="14.933328628540039" height="13.25653076171875" viewBox="0 0 14.933328628540039 13.25653076171875">
                                    <g>
                                        <path d="M12.5216,9.71945L14.9333,6.18986L13.2277,6.18986C13.0005,2.736,10.1323,0,6.6208,0C2.96,0,0,2.96747,0,6.62933C0,10.288,2.96747,13.2565,6.62827,13.2565C8.26986,13.2565,9.76853,12.656,10.9269,11.6661L10.0405,10.5248C9.12853,11.3227,7.936,11.8123,6.62827,11.8123C3.76427,11.8123,1.4432,9.49012,1.4432,6.62933C1.4432,3.76427,3.76534,1.44319,6.62827,1.44319C9.34294,1.44319,11.5605,3.53278,11.7835,6.18986L10.1099,6.18986L12.5216,9.71945L12.5216,9.71945Z" fill="#EFF5FF" fill-opacity="1"/>
                                    </g>
                                </svg>
                                <span class="pl5">详情</span>
                            </div>
                        </div>
                        <div class="flex1 flex-cc">
                            <div class="flex-sc btn-bg2 cursor ptb5 pl5 pr12" @click.stop="logRef.onVisable(v)">
                                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="16" height="16" viewBox="0 0 16 16">
                                    <defs>
                                        <clipPath id="master_svg0_11_026110"><rect x="0" y="0" width="16" height="16" rx="0"/></clipPath>
                                    </defs>
                                    <g clip-path="url(#master_svg0_11_026110)">
                                        <g>
                                            <path d="M14.3807259765625,7.5525965625C15.2815259765625,5.3278765625,13.8267259765625,2.8542125625,11.4446259765625,2.5602178625C10.4842659765625,2.4404344625,9.5157559765625,2.7081715625,8.7532859765625,3.3042185625C6.8604259765625,4.7799965625,6.8827559765625,7.6496565625,8.7983359765625,9.0958065625C10.0247359765625,10.0216665625,11.5997259765625,10.041356562499999,12.8106259765625,9.3518665625L13.8873259765625,10.7298865625C14.1138259765625,11.0203065625,14.5330259765625,11.0719565625,14.8233259765625,10.8452165625C15.1135259765625,10.6184565625,15.1648259765625,10.199336562500001,14.9379259765625,9.9092165625L13.8288259765625,8.4898065625C14.0518259765625,8.2153565625,14.2392259765625,7.9019865625,14.3807259765625,7.5525965625ZM8.7076459765625,6.505496562499999C8.4951659765625,4.9974765625,9.7710059765625,3.6983565625,11.2826259765625,3.8835565625C11.8926259765625,3.9566465625,12.4480259765625,4.2706165625,12.8253259765625,4.7555465625C13.7635259765625,5.9551365625,13.3084259765625,7.7182065625,11.9068259765625,8.3138565625C10.5052559765625,8.9095165625,8.9201259765625,8.013516562500001,8.7076459765625,6.505496562499999ZM1.3332929765625,4.552246562500001L4.6666259765625,4.552246562500001Q5.3332959765625,4.552246562500001,5.3332959765625,5.2189165625000005Q5.3332959765625,5.8855765625,4.6666259765625,5.8855765625L1.3332929765625,5.8855765625Q0.6666259765625,5.8855765625,0.6666259765625,5.2189165625000005Q0.6666259765625,4.552246562500001,1.3332929765625,4.552246562500001ZM1.3332929765625,8.552246562499999L5.3332959765625,8.552246562499999Q5.9999559765625,8.552246562499999,5.9999559765625,9.218916562499999Q5.9999559765625,9.885576562499999,5.3332959765625,9.885576562499999L1.3332929765625,9.885576562499999Q0.6666259765625,9.885576562499999,0.6666259765625,9.218916562499999Q0.6666259765625,8.552246562499999,1.3332929765625,8.552246562499999ZM1.3332929765625,12.5522265625L13.9999259765625,12.5522265625Q14.6666259765625,12.5522265625,14.6666259765625,13.2189265625Q14.6666259765625,13.8856265625,13.9999259765625,13.8856265625L1.3332929765625,13.8856265625Q0.6666259765625,13.8856265625,0.6666259765625,13.2189265625Q0.6666259765625,12.5522265625,1.3332929765625,12.5522265625Z" fill-rule="evenodd" fill="#EFF5FF" fill-opacity="1"/>
                                        </g>
                                    </g>
                                </svg>
                                <span class="pl5">记录</span>
                            </div>
                        </div>
                        <div class="flex1 flex-cc">
                            <div class="flex-sc btn-bg1 cursor ptb5 pl5 pr12"  @click.stop="publicStore._public.init = !publicStore._public.init; ctrlRef.onVisable(v)">
                                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="10.666666984558105" height="9.333333969116211" viewBox="0 0 10.666666984558105 9.333333969116211">
                                    <g>
                                        <path d="M8,7.33333L8,6.66667L9.33333,6.66667L9.33333,7.33333L10.6667,7.33333L10.6667,8.66667L9.33333,8.66667L9.33333,9.33333L8,9.33333L8,8.66667L0,8.66667L0,7.33333L8,7.33333ZM4.66667,4L4.66667,3.33333L6,3.33333L6,4L10.6667,4L10.6667,5.33333L6,5.33333L6,6L4.66667,6L4.66667,5.33333L0,5.33333L0,4L4.66667,4ZM1.33333,0.666667L1.33333,0L2.66667,0L2.66667,0.666667L10.6667,0.666667L10.6667,2L2.66667,2L2.66667,2.66667L1.33333,2.66667L1.33333,2L0,2L0,0.666667L1.33333,0.666667Z" fill="#EFF5FF" fill-opacity="1" style="mix-blend-mode:passthrough"/>
                                    </g>
                                </svg>
                                <span class="pl5">控制</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <Ctrl :state="state" ref="ctrlRef" />
        <Ctrls :state="state" ref="ctrlsRef" />
        <CtrlLog :state="state" ref="logRef" />
    </div>
</template>
<script setup lang="ts">
    const { proxy }: any = getCurrentInstance();
    const publicStore = proxy.publicStore();
    const state = reactive({
        ...publicStore.$state,
        active:"All",
        bay:"All",
        actives:[
            {name:"全部", value:"All", color: ''},
            {name:"开机", value:"1", color: 'i11'},
            {name:"关机", value:"0", color: 'i6'},
            {name:"关机中", value:"2", color: 'i6'},
            {name:"开机中", value:"3", color: 'i11'},
        ],
        types: [
            {name:"插座式", value:"1010"},
            {name:"单相导轨式", value:"1011"},
            {name:"接线盒式", value:"1012"}, 
            {name:"三相导轨式", value:"1013"}, 
        ],
        airName:"",
    })
    let ctrlRef = $ref()
    let ctrlsRef = $ref()
    let logRef = $ref()

    const handleClick = async(remark) => {
        if(remark == 'controls'){
            let val = {stationNum: publicStore.active.parent_id==0?publicStore.active.id:publicStore.active.parent_id}
            ctrlsRef.onVisable(val)
        }
    }
</script>

<style lang="scss">
.air-itembox{background: linear-gradient(180deg,rgba(20, 100, 197, 0) 0%,rgba(20, 100, 197, 0.5)100%);border:1px solid rgba(96, 231, 255, 0.6);box-sizing:border-box;}
.btn-bg1{background: linear-gradient(90deg,rgba(65, 165, 176, 1) 0%,rgba(49, 199, 209, 0) 100%);border-radius: 4px;}
.btn-bg2{background: linear-gradient(90deg,rgba(44, 115, 222, 1) 0%,rgba(162, 187, 255, 0) 100%);border-radius: 4px;}
</style>