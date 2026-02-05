# 字段映射文档 (Fields Mapping Documentation)

此文档记录了从“专项规划” (`t_scheme_plan`) 和 “规划项目” (`t_scheme_project`) 到“新建项目”表单 (`state.draft`) 的自动填充映射规则。

## 1. 来源：专项规划 (`t_scheme_plan`)

**触发条件：** 选择“所属专项规划” (`scheme_plan_id`)

| 来源字段 (t_scheme_plan) | 来源格式 | 目标字段 (state.draft) | 说明 |
| :--- | :--- | :--- | :--- |
| `name` | String | `step2.plan_name` | 方案名称 |
| `datetime` | JSON Array `["2026", "2030"]` | `planned_start_date` | 取第一个年份，拼成 `YYYY-01-01` (若项目未覆盖) |
| `datetime` | JSON Array | `expected_finish_date` | 取第二个年份，拼成 `YYYY-12-31` (若项目未覆盖) |
| `datetime` | JSON Array | `plan_year` | 取第一个年份 |
| `attr['规划说明']` | String | `step2.summary` | 方案摘要 |
| `attr['规划目标']` | String | `contacts.target_2030` | 到2030年的量化目标 |
| `attr['规划文本']` | File Object | `step2.fileList` | 追加到“方案文本”列表 |
| `attr['规划图表']` | File Object | `step2.chartsList` | 追加到“重要图表”列表 |
| `attr['支撑材料']` | File Object | `step2.materialsList` | 追加到“支撑材料”列表 |
| `attr['矢量文件']` | File Object | `step2.materialsList` | 追加到“支撑材料”列表（作为矢量文件） |
| `attr['编制单位']` | String | `step2.compilation_unit` | 方案编制单位 |
| `attr['批复时间']` | String | `step2.approval_time` | 批复时间 |
| `attr['基础建设条件']` | String | `step2.conditions` | 项目基础建设条件 |

## 2. 来源：规划项目 (`t_scheme_project`)

**触发条件：** 同时选择“所属专项规划” (`scheme_plan_id`) + “所属规划片区” (`scheme_area`) + “项目类型” (`project_type`)
**查询逻辑：** `SELECT * FROM t_scheme_project WHERE scheme_id = ? AND aera = ? AND task_type = ?`

| 来源字段 (t_scheme_project) | 说明 | 目标字段 (state.draft) | 备注 |
| :--- | :--- | :--- | :--- |
| `name` | 项目名称 | `project_name` | |
| `num` | 项目编号 | `project_code` | |
| `code` | 统一项目代码 | `unified_project_code` | |
| `construct_unit` | 建设单位 | `build_unit` | |
| `construct_main` | 主管单位 | `supervisor_unit` | |
| `class` | 项目类别 | `project_category_level1` | 需确保值匹配 |
| `construct_scale` | 建设规模 | `build_stage` | 映射到“建设阶段/规模” |
| `construct_price` | 投资预估 | `total_invest` | |
| `total_put_price` | 累计下达投资 | `cumulative_invest_issued` | |
| `total_completion_price` | 累计完成投资 | `cumulative_completed_invest` | |
| `total_income_price` | 项目收益 | `project_benefit` | |
| `construct_datetime_start` | 建设开始 | `planned_start_date` | 覆盖原值 |
| `construct_datetime_end` | 建设结束 | `expected_finish_date` | 覆盖原值 |
| `completion_status` | 实施状态 | `project_stage` | |
| `task_type` | 任务类型 | `project_type` | |
| `estimate_year` | 预估投入年份 | `plan_year` | |
| `estimate_price` | 预估投入金额 | `plan_year_amount` | |
| `construct_content` | 建设内容 | `build_content` | |
| `construct_note` | 备注 | `remark` | |
| `mapdata` | 地图数据 | `project_range` | |
| `response_person` | 项目责任人 | `contacts.project_owner` | |
| `contact_phone` | 联系方式 | `contacts.project_owner_phone` | |
| `contact_person` | 项目联系人 | `contacts.project_contact` | |
| `vast_scheme` | 符合最大战略 | `contacts.major_strategy` | |
| `industrial_policy` | 符合产业政策 | `contacts.industry_policy` | |
| `gc_investmentd_irection` | 政府投资方向 | `contacts.government_invest_direction` | |
| `qu_stage_objective` | 阶段量化目标 | `contacts.target_2030` | |

### 资金来源映射 (`fund_source` -> `funds`)

| 来源 Key | 说明 | 目标字段 (funds) |
| :--- | :--- | :--- |
| `value1` | 中央预算内投资 | `central_budget` |
| `value2` | 信贷融资 | `credit_financing` |
| `value3` | 超长期国债 | `ultra_long_bond` |
| `value4` | 证券化融资 | `securitization_financing` |
| `value5` | 专项债 | `special_debt` |
| `value6` | 企业融资 | `enterprise_financing` |
| `value7` | 财政 | `fiscal` |
| `value8` | 居民出资 | `resident_contribution` |
| `value9` | 其他渠道 | `other_channel` |
| `value10` | 待定 | `tbd` |

### 其他信息映射 (`orther_text` -> `other_info`)

| 来源 Key | 说明 | 目标字段 (other_info) |
| :--- | :--- | :--- |
| `value1` | 是否申请特别国债 | `apply_special_bond` |
| `value2` | 是否申请中央预算内资金 | `apply_central_budget_fund` |
| `value3` | 是否需加强用地保障 | `need_land_support` |
| `value4` | 是否申请政策性开发性金融工具 | `apply_policy_fin_tool` |
| `value5` | 是否中长期贷款项目 | `is_medium_long_term_loan` |
| `value6` | 是否2023年增发国债 | `is_2023_bond_invest` |
| `value7` | 是否申请列入全国重点民间投资 | `is_key_private_invest` |
| `value8` | 是否申请提级论证项目 | `apply_upgrade_argument` |
| `value9` | 是否申请重大项目 | `apply_major_project` |
| `value10` | 是否地方政府专项债券项目 | `is_local_special_debt` |
| `value11` | 是否申报十四五102项 | `apply_14th_102_project` |
| `value12` | 是否申报十四五能源规划 | `apply_14th_energy_plan` |
| `value13` | 是否申请科技型企业融资 | `apply_tech_financing` |
| `value14` | 是否超长期特别国债项目 | `is_ultra_long_special_bond` |
| `value15` | 是否有民间投资参与 | `has_private_invest` |
