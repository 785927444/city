<template>
  <div class="fixed r15 ww14 bg-white rad8 bo-i16-1 p15" style="z-index: 999; max-height: 80vh; overflow-y: auto; top: 180px;">
    <!-- 审核推送预览 -->
    <div class="layout-col" v-if="publicStore.form.push_status && publicStore.form.push_status != '-1'">
      <div class="ww100 mb15">
         <el-button color="#266FFF" class="ww100 white" @click="showAudit = !showAudit">{{ showAudit ? '收起审核意见' : '查看审核意见' }}</el-button>
      </div>
      
      <div v-if="showAudit">
        <div class="ww100 mb15 flex-bc">
          <div class="flex-sc">
            <span class="i8 mr5">*</span>
            <span>推送审核流程</span>
          </div>
        </div>

        <!-- 区级卡片 -->
        <div class="audit-card mb15 p10 rad4 bo-cc-1" v-if="canShow(4)">
          <div class="card-header flex-bc mb10">
            <span class="f14 fw c-blue">区级</span>
            <span class="f12" :class="getStatusClass(publicStore.form.push_status)">{{ getStatusText(publicStore.form.push_status) }}</span>
          </div>
          <div class="card-content">
            <div class="f12 c6">
              <div class="mb5">审核人：{{ userMap[publicStore.form.push_user] || '-' }}</div>
              <div class="mb5">时间：{{ publicStore.form.push_time || '-' }}</div>
              <div>意见：{{ publicStore.form.push_res || '-' }}</div>
            </div>
          </div>
        </div>

        <!-- 市级卡片 -->
        <div class="audit-card mb15 p10 rad4 bo-cc-1" v-if="canShow(3)">
          <div class="card-header flex-bc mb10">
            <span class="f14 fw c-green">市级</span>
            <span class="f12" :class="getStatusClass(publicStore.form.push_status2)">{{ getStatusText(publicStore.form.push_status2) }}</span>
          </div>
          <div class="card-content">
            <div class="f12 c6">
              <div class="mb5">审核人：{{ userMap[publicStore.form.push_user2] || '-' }}</div>
              <div class="mb5">时间：{{ publicStore.form.push_time2 || '-' }}</div>
              <div>意见：{{ publicStore.form.push_res2 || '-' }}</div>
            </div>
          </div>
        </div>

        <!-- 省级卡片 -->
        <div class="audit-card mb15 p10 rad4 bo-cc-1" v-if="canShow(2)">
          <div class="card-header flex-bc mb10">
            <span class="f14 fw c-orange">省级</span>
            <span class="f12" :class="getStatusClass(publicStore.form.push_status3)">{{ getStatusText(publicStore.form.push_status3) }}</span>
          </div>
          <div class="card-content">
            <div class="f12 c6">
              <div class="mb5">审核人：{{ userMap[publicStore.form.push_user3] || '-' }}</div>
              <div class="mb5">时间：{{ publicStore.form.push_time3 || '-' }}</div>
              <div>意见：{{ publicStore.form.push_res3 || '-' }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 储备审核预览 -->
    <div class="layout-col mt20" v-if="publicStore.form.reserve_status && publicStore.form.reserve_status != '0'">
      <div class="ww100 mb15">
         <el-button color="#FF8C00" class="ww100 white" @click="showReserve = !showReserve">{{ showReserve ? '收起储备意见' : '查看储备意见' }}</el-button>
      </div>

      <div v-if="showReserve">
        <div class="ww100 mb15 flex-bc">
          <div class="flex-sc">
            <span class="i8 mr5">*</span>
            <span>储备审核流程</span>
          </div>
        </div>

        <div class="audit-card mb15 p10 rad4 bo-cc-1">
          <div class="card-header flex-bc mb10">
            <span class="f14 fw c-purple">部门审核</span>
            <span class="f12" :class="getStatusClass(publicStore.form.reserve_status)">{{ getStatusText(publicStore.form.reserve_status) }}</span>
          </div>
          <div class="card-content">
            <div class="f12 c6">
              <div class="mb5">时间：{{ publicStore.form.reserve_time || '-' }}</div>
              <div>意见：{{ publicStore.form.reserve_res || '-' }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import api from '@/api'
  
  const { proxy }: any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  
  const showAudit = ref(true)
  const showReserve = ref(true)
  const userMap = reactive({})

  const fetchAuditUsers = async () => {
    const ids = [
      publicStore.form.push_user,
      publicStore.form.push_user2,
      publicStore.form.push_user3
    ].filter(id => id && id !== '0' && id !== 0)
    
    if (ids.length === 0) return
    const uniqueIds = [...new Set(ids)]
    const args = `id in ('${uniqueIds.join("','")}')`
    const res = await api.Api({ model: 't_user', args: args })
    if (res && res.code == 200 && res.data) {
       res.data.forEach(u => {
         userMap[u.id] = proxy.decrypt(u.name)
       })
    }
  }

  watch(() => publicStore.form, (val) => {
    if (val) {
      fetchAuditUsers()
    }
  }, { deep: true, immediate: true })

  // 权限控制逻辑：只能看本级及以下
  // 省级(2)：看省(2)、市(3)、区(4)
  // 市级(3)：看市(3)、区(4)
  // 区级(4)：看区(4)
  const canShow = (level) => {
    const roleId = Number(configStore.user.role_id)
    
    // 省级用户：什么都能看
    if (roleId === 2) return true
    
    // 市级用户：不能看省级(2)
    if (roleId === 3) return level >= 3
    
    // 区级用户：不能看省级(2)和市级(3)
    if (roleId === 4) return level >= 4

    // 企业用户或其他：全部可见以预览流程
    return true
  }

  const getStatusText = (status) => {
    if (status == '1') return '通过'
    if (status == '2') return '驳回'
    return '待审核'
  }

  const getStatusClass = (status) => {
    if (status == '1') return 'c-green'
    if (status == '2') return 'c-red'
    return 'c-orange'
  }
</script>

<style scoped lang="scss">
.audit-card {
  border: 1px solid #dcdfe6;
  background-color: #fff;
  transition: all .3s;
  &:hover {
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
  }
}
.c-blue { color: #409eff; }
.c-green { color: #67c23a; }
.c-red { color: #f56c6c; }
.c-orange { color: #e6a23c; }
.c-purple { color: #8a2be2; }
</style>