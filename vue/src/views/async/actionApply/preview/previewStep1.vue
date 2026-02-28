<template>
  <div class="layout-col overlay">
    <div class="hh100 ww100 flex-sc warp">
      <el-form class="ww100 pplr15" label-width="120" disabled>
        <div class="flex-sc warp ww100">
          <!-- 统一项目代码 -->
          <el-form-item label="统一项目代码" class="ww50 flex-sc">
            <div class="display-value">{{ publicStore.form.code || '-' }}</div>
          </el-form-item>
          <!-- 项目名称 -->
          <el-form-item label="项目名称" class="ww50 flex-sc">
            <div class="display-value">{{ publicStore.form.name || '-' }}</div>
          </el-form-item>
          <!-- 项目类别 -->
          <el-form-item label="项目类别" class="ww50 flex-sc">
            <div class="display-value">{{ getDictName(dictStore.levels, publicStore.form.level) }}</div>
          </el-form-item>  
          <!-- 所属区域 -->
          <el-form-item label="所属区域" class="ww50 flex-sc">
            <div class="display-value">{{ publicStore.form.province_name }}{{ publicStore.form.city_name ? '/' + publicStore.form.city_name : '' }}{{ publicStore.form.district_name ? '/' + publicStore.form.district_name : '' }}</div>
          </el-form-item>
          <!-- 所属专项规划 -->
          <el-form-item label="所属专项规划" class="ww50 flex-sc">
            <div class="display-value">{{ getDictName(publicStore._public.schemePlans, publicStore.form.parent_id, 'id') }}</div>
          </el-form-item>
          <!-- 所属片区策划 -->
          <el-form-item label="所属片区策划" class="ww50 flex-sc">
            <div class="display-value">{{ getDictName(publicStore._public.schemeAreas, publicStore.form.parent_area, 'id') }}</div>
          </el-form-item>
          <!-- 建设单位 -->
          <el-form-item label="建设单位" class="ww50 flex-sc">
            <div class="display-value">{{ publicStore.form.construct_unit || '-' }}</div>
          </el-form-item>
          <!-- 施工阶段 -->
          <el-form-item label="施工阶段" class="ww50 flex-sc">
            <div class="display-value">{{ getDictName(dictStore.project_completion_statuss, publicStore.form.completion_status) }}</div>
          </el-form-item> 
          <!-- 主管单位 -->
          <el-form-item label="主管单位" class="ww50 flex-sc">
            <div class="display-value">{{ getDictName(publicStore._public.construct_mains, publicStore.form.construct_main, 'id') }}</div>
          </el-form-item>
          <!-- 总投资 -->
          <el-form-item label="总投资" class="ww50 flex-sc">
            <div class="display-value">{{ publicStore.form.construct_price || '0' }} 万元</div>
          </el-form-item> 
          <!-- 本年度计划投资 -->
          <el-form-item label="本年度计划投资" class="ww50 flex-sc">
            <div class="display-value">{{ publicStore.form.estimate_year ? publicStore.form.estimate_year + '年 / ' : '' }}{{ publicStore.form.estimate_price || '0' }} 万元</div>
          </el-form-item>   
          <!-- 累计下达投资 -->
          <el-form-item label="累计下达投资" class="ww50 flex-sc">
            <div class="display-value">{{ publicStore.form.total_put_price || '0' }} 万元</div>
          </el-form-item>  
          <!-- 累计完成投资 -->
          <el-form-item label="累计完成投资" class="ww50 flex-sc">
            <div class="display-value">{{ publicStore.form.total_completion_price || '0' }} 万元</div>
          </el-form-item> 
          <!-- 预计开工时间 -->
          <el-form-item label="预计开工时间" class="ww50 flex-sc">
            <div class="display-value">{{ publicStore.form.estimated_start_time || '-' }}</div>
          </el-form-item>
          <!-- 预计完工时间 -->
          <el-form-item label="预计完工时间" class="ww50 flex-sc">
            <div class="display-value">{{ publicStore.form.estimated_end_time || '-' }}</div>
          </el-form-item> 
          <!-- 项目阶段 -->
          <el-form-item label="项目阶段" class="ww50 flex-sc">
            <div class="display-value">{{ getDictName(dictStore.project_stages, publicStore.form.stage) }}</div>
          </el-form-item>
          <!-- 项目收益 -->
          <el-form-item label="项目收益" class="ww50 flex-sc">
            <div class="display-value">{{ publicStore.form.total_income_price || '0' }} 万元</div>
          </el-form-item> 
          <div class="ww100 flex-sc">
            <!-- 任务类型 -->
            <el-form-item label="任务类型" class="ww50 flex-sc">
              <div class="display-value">{{ getDictName(publicStore._public.task_types, publicStore.form.task_type, 'id') }}</div>
            </el-form-item>
            <!-- 类型中类 -->
            <el-form-item label="类型中类" class="ww50 flex-sc">
              <div class="display-value">{{ getDictName(publicStore._public.task_classs, publicStore.form.task_class, 'id') }}</div>
            </el-form-item>
          </div>
          <!-- 内容类型 -->
          <el-form-item label="内容类型" class="ww100 flex-sc">
            <div class="display-value">
              <span v-for="(id, index) in (Array.isArray(publicStore.form.task_content) ? publicStore.form.task_content : [])" :key="id">
                {{ id === '暂无' ? '暂无' : getDictName(publicStore._public.construct_contents, id, 'id') }}{{ index < publicStore.form.task_content.length - 1 ? '、' : '' }}
              </span>
              <span v-if="!publicStore.form.task_content || publicStore.form.task_content.length === 0">-</span>
            </div>
          </el-form-item>
          <!-- 建设内容 -->
          <el-form-item label="建设内容" class="ww100 flex-ss">
            <div class="display-value pre-wrap">{{ publicStore.form.construct_content || '-' }}</div>
          </el-form-item>
          <!-- 备注 -->
          <el-form-item label="备注" class="ww100 flex-ss">
            <div class="display-value pre-wrap">{{ publicStore.form.construct_note || '-' }}</div>
          </el-form-item>
          <!-- 资金来源 -->
          <el-form-item label="资金来源" class="ww100 flex-ss">
            <div class="ww100 plr30 ptb22 bo-i16-1 rad5 flex-sc warp bg-white">
              <div class="ww50 flex-sc ptb8 pl30" v-for="(v, i) in fund_sources" :key="i">
                <span class="w50x5 line2">{{ v.name }}</span>
                <span class="flex1 flex-sc ml15">
                  <div class="display-value">{{ publicStore.form.fund_source ? publicStore.form.fund_source[v.key] : '0' }} 万元</div>
                </span>
              </div>
            </div>
          </el-form-item>
          <!-- 项目责任人 -->
          <el-form-item label="项目责任人" class="ww50 flex-sc">
            <div class="display-value">{{ publicStore.form.response_person || '-' }}</div>
          </el-form-item>
          <!-- 项目联系人 -->
          <el-form-item label="项目联系人" class="ww50 flex-sc">
            <div class="display-value">{{ publicStore.form.contact_person || '-' }}</div>
          </el-form-item>
          <!-- 项目联系方式 -->
          <el-form-item label="项目联系方式" class="ww50 flex-sc">
            <div class="display-value">{{ publicStore.form.contact_phone || '-' }}</div>
          </el-form-item>
          <!-- 符合最大战略 -->
          <el-form-item label="符合最大战略" class="ww50 flex-sc">
            <div class="display-value">{{ publicStore.form.vast_scheme || '-' }}</div>
          </el-form-item>
          <!-- 符合产业政策 -->
          <el-form-item label="符合产业政策" class="ww50 flex-sc">
            <div class="display-value">{{ publicStore.form.industrial_policy || '-' }}</div>
          </el-form-item>
          <!-- 政府投资方向 -->
          <el-form-item label="政府投资方向" class="ww50 flex-sc">
            <div class="display-value">{{ publicStore.form.gc_investmentd_irection || '-' }}</div>
          </el-form-item>
          <!-- 阶段量化目标 -->
          <el-form-item label="阶段量化目标" class="ww50 flex-sc">
            <div class="display-value">{{ publicStore.form.qu_stage_objective || '-' }}</div>
          </el-form-item>
          <!-- 其他信息 -->
          <el-form-item label="其他信息" class="ww100 flex-ss">
            <div class="ww100 plr30 ptb22 bo-i16-1 rad5 flex-sc warp bg-white">
              <div class="ww50 flex-sc ptb8 pl30" v-for="(v, i) in orther_texts" :key="i">
                <span class="w50x5 line2">{{ v.name }}</span>
                <span class="flex1 flex-sc ml15">
                  <div class="display-value">{{ getDictName(dictStore.isList, publicStore.form.orther_text ? publicStore.form.orther_text[v.key] : '') }}</div>
                </span>
              </div>
            </div>
          </el-form-item>
          <!-- 项目范围 -->
          <el-form-item label="项目范围" class="ww100 flex-ss">
            <div class="ww100 plr30 ptb22 bo-i16-1 rad5 flex-col warp bg-white">
              <div class="ww100 flex-sc">
                <div class="display-value flex1">{{ publicStore.form.mapdata || '-' }}</div>
              </div>
              <div class="ww100 h50x6 flex-sc rad5 hidden relative mt20">
                <GisShow class="ww100 hh100" v-if="publicStore.form.init" v-model:mapdata="publicStore.form.mapdata" />
              </div>
            </div>
          </el-form-item>
          <!-- 文件上传 -->
          <el-form-item label="文件上传" class="ww100 flex-ss">
            <div class="ww100 plr30 ptb22 bo-i16-1 rad8 bg-white">
              <FileList v-if="publicStore.form?.attr" v-model:files="publicStore.form.attr" :plans="props.plans" :contents="props.contents" :active="props.active" is-readonly />
            </div>
          </el-form-item>
        </div>
      </el-form>
      <div class="ww100 flex-cc f18 p40 bot-i16-1 mt20">
        <div class="plr14 ptb5 rad4 ml15 cursor white bgi1 bo-i1-1" @click.stop="publicStore.actIndex++">下一步</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  const { proxy }: any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const dictStore = proxy.dictStore()
  const route = useRoute()

  const props = defineProps({
    contents: { type: Array, default: () => [] },
    plans: { type: Array, default: () => [] },
    active: { type: [Object, Array], default: () => ({}) },
  })

  const fund_sources = [
    { name: '中央预算内投资', key: 'value1' },
    { name: '信贷融资', key: 'value2' },
    { name: '超长期国债', key: 'value3' },
    { name: '证券化融资', key: 'value4' },
    { name: '专项债', key: 'value5' },
    { name: '企业融资', key: 'value6' },
    { name: '财政', key: 'value7' },
    { name: '居民出资', key: 'value8' },
    { name: '其他渠道', key: 'value9' },
    { name: '待定', key: 'value10' },
  ]

  const orther_texts = [
    { name: '是否申请抗疫特别国债', key: 'value1' },
    { name: '是否申请中央预算内资金', key: 'value2' },
    { name: '是否需加强用地保障的国家重大项目', key: 'value3' },
    { name: '是否申请政策性开发性金融工具（基金）', key: 'value4' },
    { name: '是否中长期贷款项目', key: 'value5' },
    { name: '是否2023年增发国债投资项目', key: 'value6' },
    { name: '是否申请列入全国重点民间投资项目', key: 'value7' },
    { name: '是否申请提级论证项目', key: 'value8' },
    { name: '是否申请重大项目', key: 'value9' },
    { name: '是否地方政府专项债券项目', key: 'value10' },
    { name: '是否申报十四五102项重大工程项目', key: 'value11' },
    { name: '是否申报十四五能源规划项目', key: 'value12' },
    { name: '是否申请科技型企业和项目融资', key: 'value13' },
    { name: '是否超长期特别国债项目', key: 'value14' },
    { name: '是否有民间投资参与', key: 'value15' },
  ]

  const getDictName = (list, value, key = 'value') => {
    // 增加对 isList 的本地 fallback
    if (!list && (value === '0' || value === '1')) {
       list = [{value: '1', name: '是'}, {value: '0', name: '否'}]
    }
    if (!list || !value) return '-'
    const item = list.find(a => String(a[key]) === String(value))
    return item ? item.name : '-'
  }
</script>

<style scoped lang="scss">
.display-value {
  padding: 8px 15px;
  background: #f5f7fa;
  border-radius: 4px;
  min-height: 40px;
  display: flex;
  align-items: center;
  width: 100%;
  color: #606266;
  &.pre-wrap {
    white-space: pre-wrap;
    align-items: flex-start;
  }
}
</style>
