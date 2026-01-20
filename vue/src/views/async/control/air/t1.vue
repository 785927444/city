<template>
    <div class="flex-cc ww100 i15">
        <div class="flex-sc flex1">
            <img class="w70" src="@/assets/imgs/con1.png"/>
            <div class="flex-col-cc flex-sc bgbox11 ml10 mr30 plr5 ptb5 ww100">
                <span class="pt5 pb5">总数量<span></span></span>
                <span class="pb5 f16 fw white">{{!isNull(publicStore._public.homeInfo)&&publicStore._public.homeInfo.sum?publicStore._public.homeInfo.sum:'0'}}</span>
            </div>
        </div>
        <div class="flex-sc flex1">
            <img class="w70" src="@/assets/imgs/con2.png"/>
            <div class="flex-col-cc flex-sc bgbox11 ml10 mr30 plr5 ptb5 ww100">
                <span class="pt5 pb5">通信正常<span></span></span>
                <span class="pb5 f16 fw white">{{!isNull(publicStore._public.homeInfo)&&publicStore._public.homeInfo.offline0?publicStore._public.homeInfo.offline0:'0'}}</span>
            </div>
        </div>
        <div class="flex-sc flex1">
            <img class="w70" src="@/assets/imgs/con3.png"/>
            <div class="flex-col-cc flex-sc bgbox11 ml10 mr30 plr5 ptb5 ww100">
                <span class="pt5 pb5">通信异常<span></span></span>
                <span class="pb5 f16 fw white">{{!isNull(publicStore._public.homeInfo)&&publicStore._public.homeInfo.sum&&publicStore._public.homeInfo.offline0?publicStore._public.homeInfo.sum-publicStore._public.homeInfo.offline0:'0'}}</span>
            </div>
        </div>
        <!-- <div class="flex-sc flex1">
            <img class="w70" src="@/assets/imgs/con4.png"/>
            <div class="flex-col-cc flex-sc bgbox11 ml10 mr30 plr5 ptb5 ww100">
                <span class="pt5 pb5">通信故障<span></span></span>
                <span class="pb5 f16 fw white">{{!isNull(publicStore._public.homeInfo)&&publicStore._public.homeInfo.sum&&publicStore._public.homeInfo.offline0&&publicStore._public.homeInfo.offline1?
                    publicStore._public.homeInfo.sum - publicStore._public.homeInfo.offline0 - publicStore._public.homeInfo.offline1:'0'}}</span>
            </div>
        </div> -->
        <div class="flex-sc flex1">
            <img class="w70" src="@/assets/imgs/con5.png"/>
            <div class="flex-col-cc flex-sc bgbox11 ml10 mr30 plr5 ptb5 ww100">
                <span class="pt5 pb5">开机设备<span></span></span>
                <span class="pb5 f16 fw white">{{!isNull(publicStore._public.homeInfo)?
                    publicStore._public.homeInfo['20221']&&publicStore._public.homeInfo['20223']?publicStore._public.homeInfo['20221']+publicStore._public.homeInfo['20223']:
                    publicStore._public.homeInfo['20221']?publicStore._public.homeInfo['20221']:
                    publicStore._public.homeInfo['20223']?publicStore._public.homeInfo['20223']:'0':'0'}}</span>
            </div>
        </div>
        <div class="flex-sc flex1">
            <img class="w70" src="@/assets/imgs/con6.png"/>
            <div class="flex-col-cc flex-sc bgbox11 ml10 mr30 plr5 ptb5 ww100">
                <span class="pt5 pb5">关机设备<span></span></span>
                <span class="pb5 f16 fw white">{{!isNull(publicStore._public.homeInfo)?
                    publicStore._public.homeInfo['20220']&&publicStore._public.homeInfo['20222']?publicStore._public.homeInfo['20220']+publicStore._public.homeInfo['20222']:
                    publicStore._public.homeInfo['20220']?publicStore._public.homeInfo['20220']:
                    publicStore._public.homeInfo['20222']?publicStore._public.homeInfo['20222']:'0':'0'}}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const { proxy }: any = getCurrentInstance();
const publicStore = proxy.publicStore();
const state = reactive({
    ...publicStore.$state,
})

</script>