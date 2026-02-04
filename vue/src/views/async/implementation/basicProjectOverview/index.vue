<template>
  <div class="layout-col">
    <aa-title title="">
      <template #left-content>
        <div class="flex-sc mr30">
          <span class="mr10">项目周期</span>
          <span class="w50x4">
            <el-date-picker
              v-model="state.filters.construct_datetime"
              style="width: 100%;"
              start-placeholder="开始周期"
              end-placeholder="结束周期"
              type="yearrange"
              value-format="YYYY"
              format="YYYY"
            />
          </span>
        </div>
        <div class="flex-sc mr30">
          <span class="mr10">所属地区</span>
          <span class="w50x3">
            <el-select v-model="state.filters.province" placeholder="请选择" style="width: 100%" filterable clearable>
              <el-option v-for="(v, i) in state.provinces" :key="i" :value="String(v.value)" :label="v.name" />
            </el-select>
          </span>
        </div>
        <div class="flex-sc mr30">
          <span class="mr10">所属地市</span>
          <span class="w50x3">
            <el-select v-model="state.filters.city" placeholder="请选择" style="width: 100%" filterable clearable>
              <el-option v-for="(v, i) in state.citys" :key="i" :value="String(v.value)" :label="v.name" />
            </el-select>
          </span>
        </div>
        <div class="flex-sc mr30">
          <span class="mr10">项目阶段</span>
          <span class="w50x3">
            <el-select v-model="state.filters.project_stage" placeholder="请选择" style="width: 100%" filterable clearable>
              <el-option v-for="(v, i) in dictStore.project_completion_statuss" :key="i" :value="String(v.value)" :label="v.name" />
            </el-select>
          </span>
        </div>
        <div class="flex-sc mr30" v-show="state.expand">
          <span class="mr10">总投资金额</span>
          <span class="w50x3">
            <el-select v-model="state.filters.invest_level" placeholder="请选择" style="width: 100%" filterable clearable>
              <el-option v-for="(v, i) in state.investLevels" :key="i" :value="String(v.value)" :label="v.name" />
            </el-select>
          </span>
        </div>
        <div class="flex-sc mr30" v-show="state.expand">
          <span class="mr10">项目类型</span>
          <span class="w50x3">
            <el-select v-model="state.filters.project_type" placeholder="请选择" style="width: 100%" filterable clearable>
              <el-option v-for="(v, i) in state.projectTypes" :key="i" :value="String(v.value)" :label="v.name" />
            </el-select>
          </span>
        </div>
        <div class="flex-sc mr15">
          <span class="mr10">关键词</span>
          <span class="w50x3">
            <el-input v-model="state.filters.keyword" style="width: 100%;" placeholder="请输入" clearable />
          </span>
        </div>
        <div class="rad4 ptb6 plr12 flex-cc cursor bg-white c8 bo-cc-1 mr10" @click.stop="toggleExpand()">
          <span class="f14">{{ state.expand ? '收起' : '展开' }}</span>
        </div>
        <div class="rad4 ptb6 plr12 flex-cc cursor bg-white c8 bo-cc-1 mr10" @click.stop="onReset()">
          <span class="f14">重置</span>
        </div>
        <div class="rad4 ptb6 plr12 flex-cc cursor bgi1 white" @click.stop="onSearch()">
          <i-ep-filter class="f12 fw" /><span class="f14 ml5">搜索</span>
        </div>
      </template>
      <template #right-content>
        <div class="plr14 ptb5 rad4 cursor white bgi1 bo-i1-1" @click.stop="onOpenCreate()">新建项目</div>
      </template>
    </aa-title>

    <div class="layout-row">
      <div class="layout-col flex1 bg-white rad8 p8">
        <div class="ww100 flex-sc p8">
          <div class="flex-sc fw f16 tc">
            <div class="mr40 cursor flex-col-cc relative" v-for="(v, i) in state.tabs" :key="i" @click.stop="onTabChange(v.value)">
              <span class="mb5">{{ v.name }}</span>
              <span class="ww100 h3 rad10" :class="v.value == state.tab ? 'bgi2' : 'black-rgba0'"></span>
            </div>
          </div>
          <div class="flex-ec flex1">
            <div class="rad4 ptb5 plr12 flex-cc cursor bg-white c8 bo-cc-1 ml15" @click.stop="onSelectAllAcrossPages()">
              {{ state.selectedAllPages ? '取消跨页全选' : '跨页全选' }}
            </div>
            <div class="rad4 ptb5 plr12 flex-cc cursor bg-white c8 bo-cc-1 ml15" @click.stop="onExport()">
              导出
            </div>
            <div class="rad4 ptb5 plr12 flex-cc cursor bgi1 white bo-i1-1 ml15" @click.stop="onRemind()">
              提醒
            </div>
          </div>
        </div>

        <div class="table flex-sc warp">
          <div class="ww25 cursor p8" v-for="(v, i) in state.list" :key="i">
            <div class="ww100 bs bo-i16-1 relative rad8 project-card" @click.stop="onToggleRow(v)">
              <div class="ww100 flex-sc p12 bob-ce-1">
                <span class="f15 line1">{{ v.name }}</span>
                <span class="flex1 flex-ec">
                  <span class="w28 h28 tc lh28 rad6 ml10 white f14" :class="v.__selected ? 'bgi1 bo-i1-1' : 'bo-cc-1 bg-white c8'">
                    <i-ep-check v-if="v.__selected" />
                  </span>
                </span>
              </div>
              <div class="ww100 flex-col p12 c6">
                <div class="ww100 flex-sc">
                  <span class="w110">所属地区</span>
                  <span class="flex1 line1">{{ v.area || '-' }}</span>
                </div>
                <div class="ww100 flex-sc mt10">
                  <span class="w110">项目周期</span>
                  <span class="flex1 line1">{{ v.construct_datetime_start && v.construct_datetime_end ? `${v.construct_datetime_start}-${v.construct_datetime_end}` : '-' }}</span>
                </div>
                <div class="ww100 flex-sc mt10">
                  <span class="w110">投资估算</span>
                  <span class="flex1 line1">{{ v.construct_price != null && v.construct_price !== '' ? `${toMoney(v.construct_price)} 万元` : '-' }}</span>
                </div>
                <div class="ww100 flex-sc mt10">
                  <span class="w110">项目性质</span>
                  <span class="flex1 line1">{{ v.construct_nature ? decrypt(v.construct_nature) : '-' }}</span>
                </div>
                <div class="ww100 flex-sc mt10">
                  <div class="flex-sc flex1">
                    <span class="w110">更新进度时间</span>
                    <span class="flex1 line1">{{ v.rate_time ? parseTime(v.rate_time) : '-' }}</span>
                  </div>
                  <div class="rad5 ptb5 plr12 cursor bgi1 white" v-if="state.tab === 'enterprise'" @click.stop="onStartReserve(v)">开始储备</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Pagination
          style="padding-bottom: 0;"
          v-show="state.total > 0"
          :total="state.total"
          v-model:page.sync="state.page"
          v-model:limit.sync="state.limit"
          @pagination="init"
        />
      </div>

      <div class="w360 ml15">
        <div class="bg-white rad8 p15 mb15">
          <div class="f16 fw mb10">项目上报情况</div>
          <div class="flex-bc mt10">
            <div class="flex1">
              <div class="c6">本月上报项目</div>
              <div class="f28 fw">{{ state.stats.monthCount }}</div>
            </div>
            <div class="flex1">
              <div class="c6">上报项目总数</div>
              <div class="f28 fw">{{ state.stats.totalCount }}</div>
            </div>
          </div>
        </div>

        <div class="bg-white rad8 p15">
          <div class="flex-bc">
            <div class="f16 fw">项目分布情况</div>
            <div class="rad4 ptb5 plr12 flex-cc cursor bg-white c8 bo-cc-1" @click.stop="downloadChartPng()">下载图片</div>
          </div>
          <div ref="barRef" class="ww100" style="height: 320px;"></div>
        </div>
      </div>
    </div>

    <el-dialog v-model="state.drawerVisible" title="新建项目" width="70%" top="5vh" append-to-body align-center custom-class="basic-project-overview-dialog">
      <div class="layout-col drawer-shell">
        <el-steps :active="state.drawerStep" finish-status="success" align-center>
          <el-step title="基础信息" />
          <el-step title="实施方案" />
        </el-steps>

        <div class="drawer-content">
          <div class="ww100 flex-bc mt15">
            <div class="fw f16">项目信息</div>
            <div class="w50x3 tc rad3 ptb6 bgi1 white cursor" @click.stop="onOpenProjectLibrary()">专项与片区项目库</div>
          </div>

          <div class="mt10" v-show="state.drawerStep === 0">
            <el-form :model="state.draft" label-width="120px">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="项目编码" required>
                  <el-input v-model="state.draft.project_code" placeholder="请输入" />
                </el-form-item>
                <el-form-item label="项目名称" required>
                  <el-input v-model="state.draft.project_name" placeholder="请输入" />
                </el-form-item>
                <el-form-item label="所属专项规划">
                  <el-select v-model="state.draft.scheme_plan_id" placeholder="请选择" style="width: 100%" filterable clearable>
                    <el-option v-for="(v, i) in state.schemePlans" :key="i" :value="String(v.id || v.value)" :label="v.name || v.label || v.id" />
                  </el-select>
                </el-form-item>
                <el-form-item label="建设单位" required>
                  <el-input v-model="state.draft.build_unit" placeholder="请输入" />
                </el-form-item>
                <el-form-item label="建设阶段">
                  <el-input v-model="state.draft.build_stage" placeholder="请输入" />
                </el-form-item>
                <el-form-item label="总投资" required>
                  <el-input v-model="state.draft.total_invest" placeholder="请输入">
                    <template #append>万元</template>
                  </el-input>
                </el-form-item>
                <el-form-item label="累计下达投资">
                  <el-input v-model="state.draft.cumulative_invest_issued" placeholder="请输入">
                    <template #append>万元</template>
                  </el-input>
                </el-form-item>
                <el-form-item label="拟开工时间">
                  <el-date-picker v-model="state.draft.planned_start_date" style="width: 100%;" type="date" value-format="YYYY-MM-DD" format="YYYY-MM-DD" placeholder="选择日期" />
                </el-form-item>
                <el-form-item label="项目阶段">
                  <el-select v-model="state.draft.project_stage" placeholder="请选择" style="width: 100%" clearable>
                    <el-option v-for="(v, i) in dictStore.project_completion_statuss" :key="i" :value="String(v.value)" :label="v.name" />
                  </el-select>
                </el-form-item>
                <el-form-item label="项目类型">
                  <el-select v-model="state.draft.project_type" placeholder="请选择" style="width: 100%" clearable>
                    <el-option v-for="(v, i) in state.projectTypes" :key="i" :value="String(v.value)" :label="v.name" />
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="统一项目代码">
                  <el-input v-model="state.draft.unified_project_code" placeholder="请输入" />
                </el-form-item>
                <el-form-item label="所属区域" required>
                  <div class="flex-sc ww100">
                    <el-select v-model="state.draft.region_level1" placeholder="请选择" style="width: 50%" filterable clearable>
                      <el-option v-for="(v, i) in state.provinces" :key="i" :value="String(v.value)" :label="v.name" />
                    </el-select>
                    <el-select v-model="state.draft.region_level2" class="ml10" placeholder="请先选择市" style="width: 50%" :disabled="!state.draft.region_level1" filterable clearable>
                      <el-option v-for="(v, i) in state.citys" :key="i" :value="String(v.value)" :label="v.name" />
                    </el-select>
                  </div>
                </el-form-item>
                <el-form-item label="所属规划片区">
                  <el-select v-model="state.draft.scheme_area" placeholder="请选择" style="width: 100%" filterable clearable>
                    <el-option v-for="(v, i) in state.schemeAreas" :key="i" :value="String(v.value)" :label="v.name" />
                  </el-select>
                </el-form-item>
                <el-form-item label="主管单位" required>
                  <el-input v-model="state.draft.supervisor_unit" placeholder="请输入" />
                </el-form-item>
                <el-form-item label="项目类别" required>
                  <div class="flex-sc ww100">
                    <el-select v-model="state.draft.project_category_level1" placeholder="选择市" style="width: 50%" filterable clearable>
                      <el-option v-for="(v, i) in state.projectCategoryLevel1Options" :key="i" :value="String(v.value)" :label="v.name" />
                    </el-select>
                    <el-select v-model="state.draft.project_category_level2" class="ml10" placeholder="请先选择市" style="width: 50%" :disabled="!state.draft.project_category_level1" filterable clearable>
                      <el-option v-for="(v, i) in state.projectCategoryLevel2Options" :key="i" :value="String(v.value)" :label="v.name" />
                    </el-select>
                  </div>
                </el-form-item>
                <el-form-item label="本年度计划投资额">
                  <div class="flex-sc ww100">
                    <el-input v-model="state.draft.plan_year" style="width: 90px" disabled />
                    <el-input v-model="state.draft.plan_year_amount" class="ml10" placeholder="请输入" style="flex: 1">
                      <template #append>万元</template>
                    </el-input>
                  </div>
                </el-form-item>
                <el-form-item label="累计完成投资">
                  <el-input v-model="state.draft.cumulative_completed_invest" placeholder="请输入">
                    <template #append>万元</template>
                  </el-input>
                </el-form-item>
                <el-form-item label="预计完成时间">
                  <el-date-picker v-model="state.draft.expected_finish_date" style="width: 100%;" type="date" value-format="YYYY-MM-DD" format="YYYY-MM-DD" placeholder="选择日期" />
                </el-form-item>
                <el-form-item label="项目收益">
                  <el-input v-model="state.draft.project_benefit" placeholder="请输入">
                    <template #append>万元</template>
                  </el-input>
                </el-form-item>
                <el-form-item label="危险住房改造">
                  <el-input v-model="state.draft.danger_house_renovation" placeholder="请输入" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="建设内容" required>
              <el-input v-model="state.draft.build_content" type="textarea" :rows="6" placeholder="请输入" />
            </el-form-item>
            <el-form-item label="备注">
              <el-input v-model="state.draft.remark" type="textarea" :rows="4" placeholder="请输入" />
            </el-form-item>

            <div class="fw f16 mt10 mb10">资金来源</div>
            <div class="rad4 bo-cc-1 p12">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="中央预算内投资" label-width="140px">
                    <el-input v-model="state.draft.funds.central_budget" placeholder="请输入"><template #append>万元</template></el-input>
                  </el-form-item>
                  <el-form-item label="超长期国债" label-width="140px">
                    <el-input v-model="state.draft.funds.ultra_long_bond" placeholder="请输入"><template #append>万元</template></el-input>
                  </el-form-item>
                  <el-form-item label="专项债" label-width="140px">
                    <el-input v-model="state.draft.funds.special_debt" placeholder="请输入"><template #append>万元</template></el-input>
                  </el-form-item>
                  <el-form-item label="财政" label-width="140px">
                    <el-input v-model="state.draft.funds.fiscal" placeholder="请输入"><template #append>万元</template></el-input>
                  </el-form-item>
                  <el-form-item label="其他渠道" label-width="140px">
                    <el-input v-model="state.draft.funds.other_channel" placeholder="请输入"><template #append>万元</template></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="信贷融资" label-width="140px">
                    <el-input v-model="state.draft.funds.credit_financing" placeholder="请输入"><template #append>万元</template></el-input>
                  </el-form-item>
                  <el-form-item label="证券化融资" label-width="140px">
                    <el-input v-model="state.draft.funds.securitization_financing" placeholder="请输入"><template #append>万元</template></el-input>
                  </el-form-item>
                  <el-form-item label="企业融资" label-width="140px">
                    <el-input v-model="state.draft.funds.enterprise_financing" placeholder="请输入"><template #append>万元</template></el-input>
                  </el-form-item>
                  <el-form-item label="居民出资" label-width="140px">
                    <el-input v-model="state.draft.funds.resident_contribution" placeholder="请输入"><template #append>万元</template></el-input>
                  </el-form-item>
                  <el-form-item label="待定" label-width="140px">
                    <el-input v-model="state.draft.funds.tbd" placeholder="请输入"><template #append>万元</template></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>

            <div class="fw f16 mt15 mb10">联系人与政策/目标</div>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="项目责任人" required>
                  <el-input v-model="state.draft.contacts.project_owner" placeholder="请输入" />
                </el-form-item>
                <el-form-item label="项目联系方式" required>
                  <el-input v-model="state.draft.contacts.project_owner_phone" placeholder="请输入" />
                </el-form-item>
                <el-form-item label="所符合的产业政策">
                  <el-input v-model="state.draft.contacts.industry_policy" placeholder="请输入" />
                </el-form-item>
                <el-form-item label="到2030年的量化目标">
                  <el-input v-model="state.draft.contacts.target_2030" placeholder="请输入" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="项目联系人" required>
                  <el-input v-model="state.draft.contacts.project_contact" placeholder="请输入" />
                </el-form-item>
                <el-form-item label="符合重大战略">
                  <el-input v-model="state.draft.contacts.major_strategy" placeholder="请输入" />
                </el-form-item>
                <el-form-item label="政府投资方向">
                  <el-input v-model="state.draft.contacts.government_invest_direction" placeholder="请输入" />
                </el-form-item>
              </el-col>
            </el-row>

            <div class="fw f16 mt15 mb10">其他信息</div>
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="flex-bc ptb6" v-for="(v, i) in state.otherInfoLeft" :key="i">
                  <span class="flex1 mr10">{{ v.label }}</span>
                  <el-radio-group v-model="state.draft.other_info[v.key]" size="small">
                    <el-radio :label="true">是</el-radio>
                    <el-radio :label="false">否</el-radio>
                  </el-radio-group>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="flex-bc ptb6" v-for="(v, i) in state.otherInfoRight" :key="i">
                  <span class="flex1 mr10">{{ v.label }}</span>
                  <el-radio-group v-model="state.draft.other_info[v.key]" size="small">
                    <el-radio :label="true">是</el-radio>
                    <el-radio :label="false">否</el-radio>
                  </el-radio-group>
                </div>
              </el-col>
            </el-row>

            <div class="fw f16 mt15 mb10">项目范围</div>
            <div class="ww100">
              <el-input v-model="state.draft.project_range" placeholder="请输入" class="mb10" />
              <div class="flex-sc mb10">
                <el-button type="primary" @click="onDrawLand()">地块绘制</el-button>
                <div class="ml10 upload-btn">
                  <UploadText v-model:model="state.draft.invalid_file" />
                </div>
              </div>
            </div>
            <div class="ww100 mt10 rad4 bo-cc-1 relative" style="height: 360px; overflow: hidden;">
              <img src="https://img0.baidu.com/it/u=3470808383,3826880860&fm=253&fmt=auto&app=138&f=JPEG?w=750&h=500" style="width: 100%; height: 100%; object-fit: cover;" alt="地图示例" />
              <div class="absolute" style="right: 15px; bottom: 15px;">
                <el-button type="primary" @click="onFinishDraw()">完成绘制</el-button>
              </div>
            </div>

            <div class="fw f16 mt15 mb10">项目文件上传</div>
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="rad4 bo-cc-1 p12">
                  <div class="flex-bc">
                    <div class="fw">更新潜力</div>
                    <UploadText v-model:model="state.draft.files.update_potential" />
                  </div>
                  <div class="mt10 c6">
                    <div class="flex-sc"><span class="w110">上传状态</span><span class="flex1">{{ uploadStatus(state.draft.files.update_potential) }}</span></div>
                    <div class="flex-sc mt6"><span class="w110">文件类型</span><span class="flex1">{{ uploadType(state.draft.files.update_potential) }}</span></div>
                    <div class="flex-sc mt6"><span class="w110">上传时间</span><span class="flex1">{{ uploadTime(state.draft.files.update_potential) }}</span></div>
                  </div>
                  <div class="flex-ec mt10">
                    <span class="ml12 i1 cursor" v-if="state.draft.files.update_potential" @click.stop="openUpload(state.draft.files.update_potential)">查看</span>
                    <span class="ml12 i9 cursor" v-if="state.draft.files.update_potential" @click.stop="clearUpload('update_potential')">删除</span>
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="rad4 bo-cc-1 p12">
                  <div class="flex-bc">
                    <div class="fw">功能业态</div>
                    <UploadText v-model:model="state.draft.files.function_format" />
                  </div>
                  <div class="mt10 c6">
                    <div class="flex-sc"><span class="w110">上传状态</span><span class="flex1">{{ uploadStatus(state.draft.files.function_format) }}</span></div>
                    <div class="flex-sc mt6"><span class="w110">文件类型</span><span class="flex1">{{ uploadType(state.draft.files.function_format) }}</span></div>
                    <div class="flex-sc mt6"><span class="w110">上传时间</span><span class="flex1">{{ uploadTime(state.draft.files.function_format) }}</span></div>
                  </div>
                  <div class="flex-ec mt10">
                    <span class="ml12 i1 cursor" v-if="state.draft.files.function_format" @click.stop="openUpload(state.draft.files.function_format)">查看</span>
                    <span class="ml12 i9 cursor" v-if="state.draft.files.function_format" @click.stop="clearUpload('function_format')">删除</span>
                  </div>
                </div>
              </el-col>
            </el-row>
          </el-form>
          </div>

          <div class="mt10" v-show="state.drawerStep === 1">
            <div class="rad4 bo-cc-1 p12 c6">实施方案</div>
          </div>

          <div class="flex-ec mt10 pb15">
            <el-button v-if="state.drawerStep === 0" @click="onDrawerClose()">返回</el-button>
            <el-button v-if="state.drawerStep === 1" @click="onDrawerPrev()">上一步</el-button>
            <el-button type="primary" v-if="state.drawerStep === 0" @click="onDrawerNext()">下一步</el-button>
            <el-button type="primary" v-if="state.drawerStep === 1" @click="onDrawerSubmit()">提交</el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
  import * as echarts from 'echarts'
  import api from '@/api'
  import router from '@/router'
  import UploadText from '@/components/UploadText.vue'
  import { exportExcel } from '@/utils/excelTools'
  import { parseTime, toPath, decrypt } from '@/utils/common'

  const { proxy }: any = getCurrentInstance()
  const publicStore = proxy.publicStore()
  const configStore = proxy.configStore()
  const dictStore = proxy.dictStore()
  const route = useRoute()

  const barRef = ref()
  let barChart: any = null

  const state = reactive({
    ...publicStore.$state,
    tab: 'enterprise',
    tabs: [
      { value: 'enterprise', name: '企业上报' },
      { value: 'department', name: '部门上报' },
    ],
    schemePlans: [] as any[],
    schemeAreas: [] as any[],
    projectCategoryLevel1Options: [] as any[],
    projectCategoryLevel2Options: [] as any[],
    otherInfoLeft: [
      { key: 'apply_special_bond', label: '是否申请特别国债' },
      { key: 'need_land_support', label: '是否需加强用地保障的国家重大项目' },
      { key: 'is_medium_long_term_loan', label: '是否中长期贷款项目' },
      { key: 'is_key_private_invest', label: '是否申列入全国重点民间投资项目' },
      { key: 'apply_major_project', label: '是否申请重大项目' },
      { key: 'apply_14th_102_project', label: '是否申报十四五102项重大工程项目' },
      { key: 'apply_tech_financing', label: '是否申请科技型企业和项目融资' },
      { key: 'has_private_invest', label: '是否有民间投资参与' },
    ],
    otherInfoRight: [
      { key: 'apply_central_budget_fund', label: '是否申请中央预算内资金' },
      { key: 'apply_policy_fin_tool', label: '是否申请政策性开发性金融工具（基金）' },
      { key: 'is_2023_bond_invest', label: '是否2023年增发国债投资项目' },
      { key: 'apply_upgrade_argument', label: '是否申请提级论证项目' },
      { key: 'is_local_special_debt', label: '是否地方政府专项债券项目' },
      { key: 'apply_14th_energy_plan', label: '是否申报十四五能源规划项目' },
      { key: 'is_ultra_long_special_bond', label: '是否超长期特别国债项目' },
    ],
    expand: false,
    page: 1,
    limit: 20,
    total: 0,
    provinces: [],
    citys: [],
    investLevels: [
      { value: '0-5000', name: '5000万以下' },
      { value: '5000-10000', name: '5000万-1亿' },
      { value: '10000-50000', name: '1亿-5亿' },
      { value: '50000+', name: '5亿以上' },
    ],
    projectTypes: [],
    filters: {
      construct_datetime: [],
      province: '',
      city: '',
      project_stage: '',
      invest_level: '',
      project_type: '',
      keyword: '',
    } as any,
    list: [] as any[],
    selectedAllPages: false,
    selectedIds: new Set<string>(),
    deselectedIds: new Set<string>(),
    stats: {
      monthCount: 0,
      totalCount: 0,
      districtStats: [] as any[],
    },
    drawerVisible: false,
    drawerStep: 0,
    draft: {
      project_code: '',
      project_name: '',
      scheme_plan_id: '',
      build_unit: '',
      build_stage: '',
      total_invest: '',
      cumulative_invest_issued: '',
      planned_start_date: '',
      project_stage: '',
      project_type: '',
      build_content: '',
      remark: '',
      unified_project_code: '',
      region_level1: '',
      region_level2: '',
      scheme_area: '',
      supervisor_unit: '',
      project_category_level1: '',
      project_category_level2: '',
      plan_year: '2026',
      plan_year_amount: '',
      cumulative_completed_invest: '',
      expected_finish_date: '',
      project_benefit: '',
      danger_house_renovation: '',
      funds: {
        central_budget: '',
        ultra_long_bond: '',
        special_debt: '',
        fiscal: '',
        other_channel: '',
        credit_financing: '',
        securitization_financing: '',
        enterprise_financing: '',
        resident_contribution: '',
        tbd: '',
      },
      contacts: {
        project_owner: '',
        project_owner_phone: '',
        industry_policy: '',
        target_2030: '',
        project_contact: '',
        major_strategy: '',
        government_invest_direction: '',
      },
      other_info: {
        apply_special_bond: true,
        need_land_support: true,
        is_medium_long_term_loan: true,
        is_key_private_invest: true,
        apply_major_project: true,
        apply_14th_102_project: true,
        apply_tech_financing: true,
        has_private_invest: true,
        apply_central_budget_fund: true,
        apply_policy_fin_tool: true,
        is_2023_bond_invest: true,
        apply_upgrade_argument: true,
        is_local_special_debt: true,
        apply_14th_energy_plan: true,
        is_ultra_long_special_bond: true,
      },
      project_range: '',
      invalid_file: null as any,
      files: {
        update_potential: null as any,
        function_format: null as any,
      },
    } as any,
  })

  onMounted(async () => {
    restoreFromRoute()
    await getInit()
    await init()
    await nextTick()
    renderBar()
  })

  watch(
    () => [state.filters, state.tab, state.page, state.limit],
    () => {
      syncToRoute()
    },
    { deep: true }
  )

  const toggleExpand = () => {
    state.expand = !state.expand
  }

  const restoreFromRoute = () => {
    const q: any = route.query || {}
    state.tab = q.tab ? String(q.tab) : state.tab
    state.page = q.page ? Number(q.page) : state.page
    state.limit = q.limit ? Number(q.limit) : state.limit
    state.filters.province = q.province ? String(q.province) : ''
    state.filters.city = q.city ? String(q.city) : ''
    state.filters.project_stage = q.project_stage ? String(q.project_stage) : ''
    state.filters.invest_level = q.invest_level ? String(q.invest_level) : ''
    state.filters.project_type = q.project_type ? String(q.project_type) : ''
    state.filters.keyword = q.keyword ? String(q.keyword) : ''
    if (q.start && q.end) state.filters.construct_datetime = [String(q.start), String(q.end)]
  }

  const syncToRoute = () => {
    const query: any = {}
    query.tab = state.tab
    query.page = String(state.page)
    query.limit = String(state.limit)
    if (state.filters.province) query.province = state.filters.province
    if (state.filters.city) query.city = state.filters.city
    if (state.filters.project_stage) query.project_stage = state.filters.project_stage
    if (state.filters.invest_level) query.invest_level = state.filters.invest_level
    if (state.filters.project_type) query.project_type = state.filters.project_type
    if (state.filters.keyword) query.keyword = state.filters.keyword
    if (state.filters.construct_datetime && state.filters.construct_datetime.length === 2) {
      query.start = state.filters.construct_datetime[0]
      query.end = state.filters.construct_datetime[1]
    }
    router.replace({ path: route.path, query })
  }

  const getInit = async () => {
    const user = configStore.user
    if (user && user.province && user.province_name) {
      state.provinces = [{ name: user.province_name, value: user.province }]
    }
    if (user && user.parent_id && user.station_num) {
      const q =
        user.parent_id == '0'
          ? { model: 't_station', args: `parent_id='${user.station_num}'` }
          : { model: 't_station', args: `id='${user.station_num}'` }
      const res = await publicStore.http({ Api: q })
      const list = proxy.isNull(res) ? [] : res.sort((a, b) => a.order - b.order)
      state.citys = list.map((v) => ({ name: v.station_name, value: v.city }))
    }
    const res2 = await publicStore.http({ Api: { model: 't_task_type' } })
    state.projectTypes = (proxy.isNull(res2) ? [] : res2)
      .sort((a, b) => (a.orderd ?? 0) - (b.orderd ?? 0))
      .map((v) => ({ name: v.name || v.type || v.id, value: v.id || v.type || v.name }))
    const planRes = await publicStore.http({ Api: { model: 't_scheme_plan', field: 'id,name', args: `release_status='1'` } })
    state.schemePlans = proxy.isNull(planRes) ? [] : planRes
    state.schemeAreas = [{ value: '1', name: '龙城片区' }]
    state.projectCategoryLevel1Options = [
        { name: '市政工程', value: '1' },
        { name: '交通设施', value: '2' },
        { name: '公共服务', value: '3' }
    ]
    state.projectCategoryLevel2Options = [
        { name: '道路更新', value: '1-1' },
        { name: '管网改造', value: '1-2' },
        { name: '绿化提升', value: '1-3' }
    ]
  }

  const buildArgs = () => {
    let args = `1=1`
    if (state.filters.province) args += ` and province='${state.filters.province}'`
    if (state.filters.city) args += ` and city='${state.filters.city}'`
    if (state.filters.construct_datetime && state.filters.construct_datetime.length === 2) {
      const [start, end] = state.filters.construct_datetime
      args += ` and construct_datetime_start>='${start}' and construct_datetime_end<='${end}'`
    }
    if (state.filters.project_stage) args += ` and completion_status='${state.filters.project_stage}'`
    if (state.filters.keyword) args += ` and name LIKE '%${state.filters.keyword}%'`
    if (state.filters.invest_level) {
      const v = String(state.filters.invest_level)
      if (v.endsWith('+')) {
        const min = Number(v.replace('+', ''))
        if (!Number.isNaN(min)) args += ` and construct_price >= ${min}`
      } else if (v.includes('-')) {
        const [a, b] = v.split('-').map((x) => Number(x))
        if (!Number.isNaN(a)) args += ` and construct_price >= ${a}`
        if (!Number.isNaN(b)) args += ` and construct_price < ${b}`
      }
    }
    if (state.filters.project_type) args += ` and task_type='${state.filters.project_type}'`
    return args
  }

  const init = async () => {
    const args = buildArgs()
    const base: any = { model: 't_scheme_project', args, order: `rate_time DESC` }
    const query1 = Object.assign({}, base, { limit: state.limit, page: state.page })
    const query2 = Object.assign({}, base, { field: 'COUNT(*)' })
    const res: any = await publicStore.http({ Api1: query1, Api2: query2 })
    const rows = proxy.isNull(res.Api1) ? [] : res.Api1
    rows.forEach((v) => {
      v.area = (v.province_name || '') + (v.city_name ? `-${v.city_name}` : '') + (v.district_name ? `-${v.district_name}` : '')
      v.__selected = isSelected(v.id)
    })
    state.list = rows
    state.total = proxy.isNull(res.Api2) ? 0 : Number(res.Api2[0]['COUNT(*)'] || 0)
    await refreshStats()
    await nextTick()
    renderBar()
  }

  const refreshStats = async () => {
    state.stats.totalCount = state.total
    const now = new Date()
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const pageMonthCount = state.list.filter((v) => String(parseTime(v.rate_time) || '').startsWith(month)).length
    state.stats.monthCount = pageMonthCount

    const args = buildArgs()
    const q = { model: 't_scheme_project', args, field: 'district_name, COUNT(*) AS cnt', group: 'district_name' }
    const res = await publicStore.http({ Api: q })
    state.stats.districtStats = proxy.isNull(res) ? [] : res
  }

  const isSelected = (id: any) => {
    const key = String(id || '')
    if (!key) return false
    if (state.selectedAllPages) return !state.deselectedIds.has(key)
    return state.selectedIds.has(key)
  }

  const onToggleRow = (row: any) => {
    const id = String(row.id || '')
    if (!id) return
    if (state.selectedAllPages) {
      if (state.deselectedIds.has(id)) state.deselectedIds.delete(id)
      else state.deselectedIds.add(id)
    } else {
      if (state.selectedIds.has(id)) state.selectedIds.delete(id)
      else state.selectedIds.add(id)
    }
    row.__selected = isSelected(id)
  }

  const onSelectAllAcrossPages = () => {
    state.selectedAllPages = !state.selectedAllPages
    state.selectedIds = new Set()
    state.deselectedIds = new Set()
    state.list.forEach((v) => (v.__selected = isSelected(v.id)))
  }

  const onReset = () => {
    state.filters.construct_datetime = []
    state.filters.province = ''
    state.filters.city = ''
    state.filters.project_stage = ''
    state.filters.invest_level = ''
    state.filters.project_type = ''
    state.filters.keyword = ''
    state.page = 1
    onSearch()
  }

  const onSearch = async () => {
    state.page = 1
    await init()
  }

  const onTabChange = async (tab: string) => {
    state.tab = tab
    state.page = 1
    state.selectedAllPages = false
    state.selectedIds = new Set()
    state.deselectedIds = new Set()
    await init()
  }

  const toMoney = (val: any) => {
    const n = Number(val)
    if (Number.isNaN(n)) return val
    return n.toFixed(2)
  }

  const getSelectedCount = () => {
    if (state.selectedAllPages) return state.total - state.deselectedIds.size
    return state.selectedIds.size
  }

  const fetchSelectedRows = async () => {
    if (state.selectedAllPages) {
      return fetchAllRows(10000)
    }
    const ids = Array.from(state.selectedIds)
    if (ids.length === 0) return []
    const chunks: string[][] = []
    for (let i = 0; i < ids.length; i += 300) chunks.push(ids.slice(i, i + 300))
    const out: any[] = []
    for (const c of chunks) {
      const args = `id IN (${c.map((x) => `'${x}'`).join(',')})`
      const res = await publicStore.http({ Api: { model: 't_scheme_project', args } })
      if (!proxy.isNull(res)) out.push(...res)
    }
    return out
  }

  const fetchAllRows = async (max: number) => {
    const total = state.total
    const cap = Math.min(total, max)
    const pageSize = 1000
    const pages = Math.ceil(cap / pageSize)
    const out: any[] = []
    for (let p = 1; p <= pages; p++) {
      const args = buildArgs()
      const q = { model: 't_scheme_project', args, order: `rate_time DESC`, page: p, limit: pageSize }
      const res = await publicStore.http({ Api: q })
      if (proxy.isNull(res)) break
      out.push(...res)
      if (out.length >= cap) break
    }
    return out.slice(0, cap)
  }

  const onExport = async () => {
    const count = getSelectedCount()
    if (count <= 0) return ElNotification({ title: '提示', message: '请先选择至少一条', type: 'error' })
    const list = await fetchSelectedRows()
    const now = parseTime(new Date()).replaceAll(':', '-').replaceAll(' ', '_')
    const fileName = `基础项目总览_${now}`
    const tHeader = ['项目名称', '所属地区', '项目周期', '项目规模', '投资估算(万元)', '项目性质', '更新进度时间']
    const filterVal = ['name', 'area', 'construct_datetime', 'construct_scale', 'construct_price', 'construct_nature', 'rate_time']
    const mapped = list.map((v) => ({
      ...v,
      area: (v.province_name || '') + (v.city_name ? `-${v.city_name}` : '') + (v.district_name ? `-${v.district_name}` : ''),
      construct_datetime: v.construct_datetime_start && v.construct_datetime_end ? `${v.construct_datetime_start}-${v.construct_datetime_end}` : '',
      construct_price: v.construct_price != null && v.construct_price !== '' ? Number(v.construct_price).toFixed(2) : '',
      construct_nature: v.construct_nature ? decrypt(v.construct_nature) : '',
      rate_time: v.rate_time ? parseTime(v.rate_time) : '',
    }))
    await exportExcel({ tHeader, filterVal, fileName }, mapped)
  }

  const onRemind = async () => {
    const count = getSelectedCount()
    if (count <= 0) return ElNotification({ title: '提示', message: '请先选择至少一条', type: 'error' })
    ElMessageBox.confirm('是否确定发送提醒?', '温馨提示', { confirmButtonText: '确定', cancelButtonText: '关闭', type: 'warn' }).then(async () => {
      const list = await fetchSelectedRows()
      ElNotification({ title: '提示', message: `提醒成功：${list.length}，失败：0`, type: 'success' })
    })
  }

  const onStartReserve = (row: any) => {
    ElMessageBox.confirm('是否将该项目开始储备?', '温馨提示', { confirmButtonText: '确定', cancelButtonText: '关闭', type: 'warn' }).then(() => {
      toPath('/actionApply', { id: row.id })
    })
  }

  const onOpenCreate = () => {
    state.drawerVisible = true
    state.drawerStep = 0
    restoreDraft()
  }

  const onOpenProjectLibrary = () => {
    toPath('/actionRelease')
  }

  const onDrawerClose = () => {
    saveDraft()
    state.drawerVisible = false
  }

  const onDrawLand = () => {
    saveDraft()
  }

  const onFinishDraw = () => {
    saveDraft()
  }

  const uploadStatus = (file: any) => {
    if (!file) return '待上传'
    if (file.status === 'success') return '上传成功'
    if (file.status) return '上传失败'
    return '待上传'
  }

  const uploadType = (file: any) => {
    if (!file) return '文本文件'
    return file.type ? String(file.type) : '文本文件'
  }

  const uploadTime = (file: any) => {
    if (!file || !file.time) return '/'
    return parseTime(file.time) || String(file.time)
  }

  const openUpload = (file: any) => {
    if (!file || !file.data) return
    const url = `/api/v1/terminal/download/${encodeURIComponent(String(file.data))}`
    window.open(url, '_self')
  }

  const clearUpload = (key: 'update_potential' | 'function_format') => {
    if (!state.draft.files) state.draft.files = {}
    state.draft.files[key] = null
    saveDraft()
  }

  const draftKey = () => {
    const uid = configStore.user && configStore.user.id ? String(configStore.user.id) : 'anonymous'
    return `basicProjectOverview:draft:${uid}`
  }

  const saveDraft = () => {
    const k = draftKey()
    const v = JSON.stringify(state.draft || {})
    localStorage.setItem(k, v)
  }

  const restoreDraft = () => {
    const k = draftKey()
    const raw = localStorage.getItem(k)
    if (!raw) return
    try {
      const obj = JSON.parse(raw)
      state.draft = Object.assign(state.draft, obj)
    } catch {}
  }

  const validateStep = () => {
    if (state.drawerStep === 0 || state.drawerStep === 1) {
      if (!state.draft.project_code) return '请输入项目编码'
      if (!state.draft.project_name) return '请输入项目名称'
      if (!state.draft.build_unit) return '请输入建设单位'
      if (state.draft.total_invest == null || String(state.draft.total_invest).trim() === '') return '请输入总投资'
      if (!state.draft.build_content) return '请输入建设内容'
      if (!state.draft.supervisor_unit) return '请输入主管单位'
      if (!state.draft.region_level1 || !state.draft.region_level2) return '请选择所属区域'
      if (!state.draft.project_category_level1 || !state.draft.project_category_level2) return '请选择项目类别'
      if (!state.draft.contacts?.project_owner) return '请输入项目责任人'
      if (!state.draft.contacts?.project_owner_phone) return '请输入项目联系方式'
      if (!state.draft.contacts?.project_contact) return '请输入项目联系人'
    }
    return ''
  }

  const onDrawerNext = () => {
    const msg = validateStep()
    if (msg) return ElNotification({ title: '提示', message: msg, type: 'error' })
    saveDraft()
    state.drawerStep = 1
  }

  const onDrawerPrev = () => {
    saveDraft()
    state.drawerStep = 0
  }

  const onDrawerSubmit = async () => {
    const msg = validateStep()
    if (msg) return ElNotification({ title: '提示', message: msg, type: 'error' })
    saveDraft()
    const start = state.draft.planned_start_date || ''
    const end = state.draft.expected_finish_date || ''
    const totalInvest = Number(state.draft.total_invest)
    const form: any = {
      id: '',
      type: 'plan',
      num: state.draft.project_code || '',
      code: state.draft.unified_project_code || '',
      name: state.draft.project_name || '',
      scheme_id: state.draft.scheme_plan_id || '',
      scheme_name: '',
      aera: `${configStore.user?.province_name || ''}${configStore.user?.city_name ? `-${configStore.user?.city_name}` : ''}${configStore.user?.district_name ? `-${configStore.user?.district_name}` : ''}`,
      construct_scale: state.draft.build_stage || '',
      construct_datetime_start: start,
      construct_datetime_end: end,
      construct_datetime: start && end ? `${start}-${end}` : '',
      construct_price: Number.isNaN(totalInvest) ? String(state.draft.total_invest || '') : String(totalInvest),
      completion_status: state.draft.project_stage || '',
      task_type: state.draft.project_type || '',
      apply_status: '0',
      rate: '0',
      apply_time: '',
      apply_respose_time: '',
      completion_time_1: '',
      completion_time_2: '',
      completion_time_3: '',
      user_id: configStore.user?.id || '',
      user_name: configStore.user?.name ? proxy.encrypt(configStore.user.name) : '',
      province: configStore.user?.province || '',
      city: configStore.user?.city || '',
      district: configStore.user?.district || '',
      province_name: configStore.user?.province_name || '',
      city_name: configStore.user?.city_name || '',
      district_name: configStore.user?.district_name || '',
      rate_time: new Date().getTime() + '',
    }
    try {
      const res: any = await api.addApi({ model: 't_scheme_project', list: [form] })
      if (res && (res.code === 200 || res.code === '200')) {
        localStorage.removeItem(draftKey())
        state.drawerVisible = false
        ElNotification({ title: '提示', message: '新建成功', type: 'success' })
        await init()
      } else {
        ElNotification({ title: '提示', message: res?.msg || '新建失败', type: 'error' })
      }
    } catch {
      ElNotification({ title: '提示', message: '新建失败', type: 'error' })
    }
  }

  const renderBar = () => {
    const dom: any = barRef.value
    if (!dom) return
    if (barChart) {
      barChart.dispose()
      barChart = null
    }
    barChart = echarts.init(dom)
    const rows = state.stats.districtStats || []
    const y = rows.map((r) => r.district_name || '未知')
    const x = rows.map((r) => Number(r.cnt || 0))
    const option: any = {
      grid: { left: 60, right: 20, top: 20, bottom: 20, containLabel: true },
      xAxis: { type: 'value' },
      yAxis: { type: 'category', data: y },
      series: [{ type: 'bar', data: x, barWidth: 12, itemStyle: { color: '#266fff' } }],
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    }
    barChart.setOption(option)
  }

  const downloadChartPng = () => {
    if (!barChart) return
    const url = barChart.getDataURL({ type: 'png', pixelRatio: 2, backgroundColor: '#ffffff' })
    const a = document.createElement('a')
    a.href = url
    const now = parseTime(new Date()).replaceAll(':', '-').replaceAll(' ', '_')
    a.download = `项目分布_${now}.png`
    a.click()
  }
</script>

<style scoped lang="scss">
  .project-card {
    line-height: 20px;
    color: rgba(16, 16, 16, 1);
    font-size: 14px;
    font-family: -regular;
  }
  .w360 {
    width: 360px;
  }
  .w110 {
    width: 110px;
  }
  .drawer-content {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }
  .drawer-shell {
    width: 100%;
    min-height: auto;
  }
  :global(.basic-project-overview-dialog.el-dialog) {
    max-width: 1200px;
    width: min(1200px, 92vw) !important;
    margin: 0 auto !important;
    border-radius: 12px;
  }
  :global(.basic-project-overview-dialog .el-dialog__body) {
    padding: 0;
    max-height: calc(90vh - 120px);
    overflow-y: auto;
  }
  .upload-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    padding: 0 12px;
    border-radius: 4px;
    background: #266fff;
    color: #fff;
  }
  .upload-btn :deep(.el-upload) {
    color: #fff;
  }
  .upload-btn :deep(.el-upload:hover) {
    color: #fff;
  }
</style>

