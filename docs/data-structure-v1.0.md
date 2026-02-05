# 数据结构说明（v1.0）

本文件用于统一记录“城市体检评估管理信息平台”当前仓库可追溯到的数据结构（实体、字段、关联、枚举、约束、业务规则）。

重要说明：

1. 本仓库内 **未包含** `t_scheme_* / t_task_* / t_file_* / t_problem_* / t_user / t_station` 等业务库表的建表 DDL / 迁移脚本；这些表只在前端以“中台 query 参数（拼 SQL）”的方式被引用（见 [ai.txt](file:///c:/Users/Pro13/Desktop/%E5%8D%95%E5%AD%90/%E7%9F%A5%E8%AF%86%E5%BA%93/doc/%E5%9F%8E%E5%B8%82%E4%BD%93%E6%A3%80%E5%B9%B3%E5%8F%B0%E5%BC%80%E5%8F%91/%E5%9F%8E%E5%B8%82%E4%BD%93%E6%A3%80%E5%B9%B3%E5%8F%B0%E5%BC%80%E5%8F%91/om/om/coworker/city/ai.txt) 与各页面）。
2. 因此，对这些 `t_*` 实体：本文档的“字段类型/长度/索引/外键约束”以 **前端可见字段与业务推断** 为主，DB 侧信息标记为“待确认（需从数据库/后端 DDL 获取）”，避免杜撰。
3. 对于“知识库（kb_backend）”模块：仓库内存在明确的 MySQL DDL（见 [kb_backend/app.py](file:///c:/Users/Pro13/Desktop/%E5%8D%95%E5%AD%90/%E7%9F%A5%E8%AF%86%E5%BA%93/doc/%E5%9F%8E%E5%B8%82%E4%BD%93%E6%A3%80%E5%B9%B3%E5%8F%B0%E5%BC%80%E5%8F%91/%E5%9F%8E%E5%B8%82%E4%BD%93%E6%A3%80%E5%B9%B3%E5%8F%B0%E5%BC%80%E5%8F%91/om/om/coworker/city/kb_backend/app.py#L239-L355)），可给出精确字段、索引与外键。

## 1. 全局枚举与字典

来自前端字典仓库：[dictStore.ts](file:///c:/Users/Pro13/Desktop/%E5%8D%95%E5%AD%90/%E7%9F%A5%E8%AF%86%E5%BA%93/doc/%E5%9F%8E%E5%B8%82%E4%BD%93%E6%A3%80%E5%B9%B3%E5%8F%B0%E5%BC%80%E5%8F%91/%E5%9F%8E%E5%B8%82%E4%BD%93%E6%A3%80%E5%B9%B3%E5%8F%B0%E5%BC%80%E5%8F%91/om/om/coworker/city/vue/src/stores/dictStore.ts#L41-L65)

### 1.1 上报状态（release_status）

| 值 | 文案 |
|---|---|
| 0 | 待上报 |
| 1 | 已上报 |

### 1.2 完成状态（completion_status）

| 值 | 文案 |
|---|---|
| 0 | 未开始 |
| 1 | 进行中 |
| 2 | 已完成 |

### 1.3 审核状态（examine_status）

| 值 | 文案 |
|---|---|
| 0 | 待审核 |
| 1 | 审核中 |
| 2 | 已通过 |
| 3 | 不通过 |

### 1.4 项目实施状态（project_completion_status / 页面筛选用）

| 值 | 文案 |
|---|---|
| 1 | 谋划中 |
| 2 | 实施中 |
| 3 | 已竣工 |

### 1.5 申请储备状态（apply_status / 仅在页面逻辑中出现）

来源：[actionRelease/index.vue](file:///c:/Users/Pro13/Desktop/%E5%8D%95%E5%AD%90/%E7%9F%A5%E8%AF%86%E5%BA%93/doc/%E5%9F%8E%E5%B8%82%E4%BD%93%E6%A3%80%E5%B9%B3%E5%8F%B0%E5%BC%80%E5%8F%91/%E5%9F%8E%E5%B8%82%E4%BD%93%E6%A3%80%E5%B9%B3%E5%8F%B0%E5%BC%80%E5%8F%91/om/om/coworker/city/vue/src/views/async/actionRelease/index.vue#L180-L183)

| 值 | 推断含义 |
|---|---|
| 0 | 未申请（页面默认列表筛选） |
| 1 | 已申请（“已申请”统计） |
| 3 | 已退回（“已退回”统计） |

## 2. 业务库实体（中台 t_* 表，DDL 待补齐）

### 2.1 实体：专项规划/片区方案（t_scheme_plan）

- 中文名：专项规划/片区方案
- 英文名：t_scheme_plan
- 主键：`id`（UUID 字符串，推断）

**字段列表（已在前端代码引用/推断）**

| 字段 | 逻辑类型 | 长度 | 必填 | 默认值 | 注释/用途 | 来源 |
|---|---|---|---|---|---|---|
| id | string | 待确认 | 是 | - | 主键 | 多处：`args: id='...'` |
| name | string | 待确认 | 是 | - | 名称 | `publicStore.form.name` |
| type | string | 待确认 | 是 | - | plan/design 区分 | StepFoot 保存写入 |
| release_status | string | 待确认 | 是 | 0/1 | 上报状态 | 业务字典 |
| examine_status | string | 待确认 | 是 | 0 | 审核状态 | StepFoot 保存写入 |
| datetime | string/json | 待确认 | 否 | '' | 周期（JSON 序列化） | StepFoot 保存写入 |
| attr | string/json | 待确认 | 否 | '' | 附件/扩展字段（JSON） | StepFoot 保存写入 |
| project_num | number | 待确认 | 否 | 0 | 关联项目数量 | StepFoot 保存写入 |
| task_num | number | 待确认 | 否 | 0 | 关联任务数量 | StepFoot 保存写入 |
| user_id | string | 待确认 | 是 | - | 上报人/单位用户 | StepFoot 保存写入 |
| user_name | string | 待确认 | 是 | - | 上报人/单位名称 | StepFoot 保存写入 |
| province | string | 待确认 | 否 | '' | 省编码 | StepFoot 保存写入 |
| city | string | 待确认 | 否 | '' | 市编码 | StepFoot 保存写入 |
| district | string | 待确认 | 否 | '' | 区县编码 | StepFoot 保存写入 |
| province_name | string | 待确认 | 否 | '' | 省名称 | StepFoot 保存写入 |
| city_name | string | 待确认 | 否 | '' | 市名称 | StepFoot 保存写入 |
| district_name | string | 待确认 | 否 | '' | 区县名称 | StepFoot 保存写入 |
| parent_area | string | 待确认 | 否 | - | 片区（页面展示/筛选） | actionRelease join select |

**索引（待确认）**

- 建议：`(user_id, type, release_status)`、`(province, city, district)`、`(created_at)`（需从 DB/DDL 验证）

**外键关联（概念关系，待 DB 校验）**

- t_scheme_plan.user_id → t_user.id（推断）

**业务规则（前端侧）**

- type=plan：基础信息下一步前必须填写 `name` 与 `datetime`（见 [StepFoot.vue](file:///c:/Users/Pro13/Desktop/%E5%8D%95%E5%AD%90/%E7%9F%A5%E8%AF%86%E5%BA%93/doc/%E5%9F%8E%E5%B8%82%E4%BD%93%E6%A3%80%E5%B9%B3%E5%8F%B0%E5%BC%80%E5%8F%91/%E5%9F%8E%E5%B8%82%E4%BD%93%E6%A3%80%E5%B9%B3%E5%8F%B0%E5%BC%80%E5%8F%91/om/om/coworker/city/vue/src/components/StepFoot.vue#L37-L50)）
- 保存时：attr 会被 JSON 序列化，且可能触发文件转移（见同文件 onSave）

### 2.2 实体：项目（t_scheme_project）

- 中文名：项目（基础项目/储备项目/上报项目）
- 英文名：t_scheme_project
- 主键：`id`（UUID 字符串，推断）

**字段列表（已在前端代码引用/推断）**

| 字段 | 逻辑类型 | 长度 | 必填 | 默认值 | 注释/用途 | 来源 |
|---|---|---|---|---|---|---|
| id | string | 待确认 | 是 | - | 主键 | `/actionApply` 回填 |
| scheme_id | string | 待确认 | 是 | - | 关联方案/规划 | actionRelease join 条件 |
| name | string | 待确认 | 是 | - | 项目名称 | 列表卡片标题 |
| parent_area | string | 待确认 | 否 | - | 所属片区 | 列表卡片展示 |
| province | string | 待确认 | 否 | - | 省编码 | 列表筛选 join 表也有 |
| city | string | 待确认 | 否 | - | 市编码 | 列表筛选 |
| district | string | 待确认 | 否 | - | 区县编码 | 列表展示 |
| province_name | string | 待确认 | 否 | - | 省名称 | 列表展示 |
| city_name | string | 待确认 | 否 | - | 市名称 | 列表展示 |
| district_name | string | 待确认 | 否 | - | 区县名称 | 列表展示 |
| construct_datetime_start | string | 待确认 | 否 | - | 项目周期开始年 | 列表筛选/展示 |
| construct_datetime_end | string | 待确认 | 否 | - | 项目周期结束年 | 列表筛选/展示 |
| construct_scale | number/string | 待确认 | 否 | - | 项目规模 | 列表展示 |
| construct_price | number | 待确认 | 否 | - | 预估投入（万元） | 列表展示 |
| construct_nature | string | 待确认 | 否 | - | 项目性质（加密存储可能） | 列表展示 `decrypt()` |
| rate_time | string/number | 待确认 | 否 | - | 最近更新进度时间 | 列表展示 |
| completion_status | string | 待确认 | 否 | - | 实施状态（筛选） | 列表筛选 |
| apply_status | string | 待确认 | 否 | 0 | 储备申请状态 | 列表/统计 |
| user_id | string | 待确认 | 否 | - | 上报人/单位 | 其他页面引用 |
| user_name | string | 待确认 | 否 | - | 上报人/单位名称 | 其他页面引用 |

**索引（待确认）**

- 建议：`(scheme_id)`、`(apply_status)`、`(completion_status)`、`(province, city, district)`、`(construct_datetime_start, construct_datetime_end)`（需从 DB/DDL 验证）

**外键关联（概念关系，待 DB 校验）**

- t_scheme_project.scheme_id → t_scheme_plan.id（前端 join 明确使用）

**业务规则（前端侧）**

- 列表（实施与调度管理）默认筛选 `sp.release_status='1'` 且按 `apply_status` 分流（见 [actionRelease/index.vue](file:///c:/Users/Pro13/Desktop/%E5%8D%95%E5%AD%90/%E7%9F%A5%E8%AF%86%E5%BA%93/doc/%E5%9F%8E%E5%B8%82%E4%BD%93%E6%A3%80%E5%B9%B3%E5%8F%B0%E5%BC%80%E5%8F%91/%E5%9F%8E%E5%B8%82%E4%BD%93%E6%A3%80%E5%B9%B3%E5%8F%B0%E5%BC%80%E5%8F%91/om/om/coworker/city/vue/src/views/async/actionRelease/index.vue#L176-L207)）

### 2.3 实体：任务（t_scheme_task）

- 中文名：任务
- 英文名：t_scheme_task
- 主键：`id`（UUID 字符串，推断）

**字段列表（待补齐）**

| 字段 | 逻辑类型 | 长度 | 必填 | 默认值 | 注释/用途 | 来源 |
|---|---|---|---|---|---|---|
| id | string | 待确认 | 是 | - | 主键 | StepFoot 批量新增/删除 |
| scheme_id | string | 待确认 | 是 | - | 关联方案 | StepFoot setAdd |
| scheme_name | string | 待确认 | 否 | - | 方案名称冗余 | StepFoot setAdd |

**外键关联（概念关系，待 DB 校验）**

- t_scheme_task.scheme_id → t_scheme_plan.id

### 2.4 实体：问题（t_scheme_problem）

- 中文名：问题
- 英文名：t_scheme_problem
- 主键：待确认

字段/约束待补齐（仓库内仅见表名清单）。

### 2.5 实体：任务类型（t_task_type）

- 中文名：任务类型
- 英文名：t_task_type
- 主键：待确认

字段/约束待补齐（仓库内仅见读取此表用于字典初始化）。

### 2.6 实体：任务内容（t_task_content）

- 中文名：任务内容
- 英文名：t_task_content
- 主键：待确认

字段/约束待补齐。

### 2.7 实体：文件类型（t_file_type）

- 中文名：文件类型
- 英文名：t_file_type
- 主键：待确认

字段/约束待补齐。

### 2.8 实体：文件内容（t_file_content）

- 中文名：文件内容
- 英文名：t_file_content
- 主键：待确认

字段/约束待补齐。

### 2.9 实体：问题类型（t_problem_type）

- 中文名：问题类型
- 英文名：t_problem_type
- 主键：待确认

字段/约束待补齐。

### 2.10 实体：问题内容（t_task_problem）

- 中文名：问题内容
- 英文名：t_task_problem
- 主键：待确认

字段/约束待补齐。

### 2.11 实体：用户（t_user）

- 中文名：用户
- 英文名：t_user
- 主键：`id`（推断）

**字段列表（已在前端代码引用/推断）**

| 字段 | 逻辑类型 | 长度 | 必填 | 默认值 | 注释/用途 | 来源 |
|---|---|---|---|---|---|---|
| id | string | 待确认 | 是 | - | 用户 ID | 登录返回 user.id |
| username | string | 待确认 | 是 | - | 登录账号（可能加密存储） | 登录 where username=... |
| password | string | 待确认 | 是 | - | 登录密码（前端 MD5 + 随机前后缀） | 登录 where password=... |
| name | string | 待确认 | 否 | - | 姓名/单位名（可能加密） | 顶部展示/解密 |
| phone | string | 待确认 | 否 | - | 手机号（可能加密） | 顶部展示/解密 |
| role_id | string | 待确认 | 否 | - | 角色 | 动态路由权限 |
| province | string | 待确认 | 否 | - | 省编码 | 多页面筛选 |
| city | string | 待确认 | 否 | - | 市编码 | 多页面筛选 |
| district | string | 待确认 | 否 | - | 区县编码 | 多页面筛选 |
| province_name | string | 待确认 | 否 | - | 省名 | 多页面展示 |
| city_name | string | 待确认 | 否 | - | 市名 | 多页面展示 |
| district_name | string | 待确认 | 否 | - | 区县名 | 多页面展示 |
| station_num | string | 待确认 | 否 | - | 单位编号/站点编号 | actionRelease 初始化 |
| parent_id | string | 待确认 | 否 | - | 上级单位/父级标记 | actionRelease 初始化 |

**业务规则（前端侧）**

- 账密登录：username 会被加密后参与 where 拼接；password 为 `随机前缀 + MD5(明文) + 随机后缀`（见 [login/index.vue](file:///c:/Users/Pro13/Desktop/%E5%8D%95%E5%AD%90/%E7%9F%A5%E8%AF%86%E5%BA%93/doc/%E5%9F%8E%E5%B8%82%E4%BD%93%E6%A3%80%E5%B9%B3%E5%8F%B0%E5%BC%80%E5%8F%91/%E5%9F%8E%E5%B8%82%E4%BD%93%E6%A3%80%E5%B9%B3%E5%8F%B0%E5%BC%80%E5%8F%91/om/om/coworker/city/vue/src/views/async/login/index.vue#L181-L201)）

### 2.12 实体：单位/站点（t_station）

- 中文名：单位/站点
- 英文名：t_station
- 主键：待确认

**字段列表（已在前端代码引用/推断）**

| 字段 | 逻辑类型 | 长度 | 必填 | 默认值 | 注释/用途 | 来源 |
|---|---|---|---|---|---|---|
| id | string | 待确认 | 是 | - | 主键 | 查询条件使用 |
| parent_id | string | 待确认 | 否 | - | 父级关系 | 查询条件使用 |
| station_name | string | 待确认 | 否 | - | 单位名称 | actionRelease 初始化 |
| city | string | 待确认 | 否 | - | 地市编码 | actionRelease 初始化 |
| order | number | 待确认 | 否 | - | 排序 | actionRelease 初始化排序 |

## 3. 知识库实体（kb_backend，DDL 可追溯）

来源：[kb_backend/app.py](file:///c:/Users/Pro13/Desktop/%E5%8D%95%E5%AD%90/%E7%9F%A5%E8%AF%86%E5%BA%93/doc/%E5%9F%8E%E5%B8%82%E4%BD%93%E6%A3%80%E5%B9%B3%E5%8F%B0%E5%BC%80%E5%8F%91/%E5%9F%8E%E5%B8%82%E4%BD%93%E6%A3%80%E5%B9%B3%E5%8F%B0%E5%BC%80%E5%8F%91/om/om/coworker/city/kb_backend/app.py#L239-L355)

### 3.1 实体：知识库专栏（kb_column）

- 中文名：知识库专栏
- 英文名：kb_column
- 主键：`code`

| 字段 | 类型/长度 | 必填 | 默认值 | 注释 |
|---|---|---|---|---|
| code | VARCHAR(32) | 是 | - | 专栏编码 |
| name | VARCHAR(64) | 是 | - | 专栏名称 |
| description | VARCHAR(255) | 否 | NULL | 描述 |
| sort_no | INT | 是 | 0 | 排序 |
| created_at | TIMESTAMP | 是 | CURRENT_TIMESTAMP | 创建时间 |

索引：无额外索引（主键为 code）

外键：无

业务规则：

- code 由系统预置（policy/standard/mechanism/expert/case/course）

### 3.2 实体：知识库分类（kb_category）

- 中文名：知识库分类
- 英文名：kb_category
- 主键：`id`（自增）

| 字段 | 类型/长度 | 必填 | 默认值 | 注释 |
|---|---|---|---|---|
| id | BIGINT | 是 | AUTO_INCREMENT | 主键 |
| column_code | VARCHAR(32) | 是 | - | 所属专栏 |
| name | VARCHAR(64) | 是 | - | 分类名 |
| sort_no | INT | 是 | 0 | 排序 |
| created_at | TIMESTAMP | 是 | CURRENT_TIMESTAMP | 创建时间 |

索引：

- UNIQUE KEY `uk_kb_category_col_name` (column_code, name)
- KEY `idx_kb_category_col` (column_code)
- KEY `idx_kb_category_sort` (sort_no)

外键：DDL 未声明外键（column_code 与 kb_column.code 的关系在业务层维持）

业务规则：

- 同一专栏下分类名唯一

### 3.3 实体：知识库条目（kb_item）

- 中文名：知识库条目
- 英文名：kb_item
- 主键：`id`（自增）

| 字段 | 类型/长度 | 必填 | 默认值 | 注释 |
|---|---|---|---|---|
| id | BIGINT | 是 | AUTO_INCREMENT | 主键 |
| column_code | VARCHAR(32) | 是 | - | 所属专栏 |
| title | VARCHAR(255) | 是 | - | 标题 |
| author | VARCHAR(64) | 否 | NULL | 作者 |
| summary | TEXT | 否 | NULL | 摘要 |
| content | LONGTEXT | 否 | NULL | 正文 |
| publish_org | VARCHAR(255) | 否 | NULL | 发布单位 |
| doc_no | VARCHAR(255) | 否 | NULL | 文号 |
| publish_time | DATE | 否 | NULL | 发布时间 |
| image_urls | JSON | 否 | NULL | 图片 URL 列表 |
| views | INT | 是 | 0 | 浏览量 |
| download_count | INT | 是 | 0 | 下载数 |
| favorite_count | INT | 是 | 0 | 收藏数 |
| created_at | TIMESTAMP | 是 | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 是 | CURRENT_TIMESTAMP | 更新时间（ON UPDATE） |
| user_id | VARCHAR(64) | 否 | NULL | 创建者用户 ID |
| view_count | INT | 是 | 0 | 兼容字段：浏览数 |
| collect_count | INT | 是 | 0 | 兼容字段：收藏数 |
| subtitle | VARCHAR(255) | 否 | NULL | 副标题 |
| tags | VARCHAR(255) | 否 | NULL | 标签（逗号分隔） |
| is_top | TINYINT(1) | 是 | 0 | 是否置顶 |
| seo_keywords | VARCHAR(255) | 否 | NULL | SEO 关键词 |

索引：

- KEY `idx_kb_item_column` (column_code)
- KEY `idx_kb_item_created` (created_at)
- KEY `idx_kb_item_user` (user_id)

外键：DDL 未声明 column_code 外键（与 kb_column.code 的关系在业务层维持）

业务规则：

- 条目可关联多个分类（见 kb_item_category）

### 3.4 实体：知识库附件（kb_attachment）

- 中文名：知识库附件
- 英文名：kb_attachment
- 主键：`id`（自增）

| 字段 | 类型/长度 | 必填 | 默认值 | 注释 |
|---|---|---|---|---|
| id | BIGINT | 是 | AUTO_INCREMENT | 主键 |
| item_id | BIGINT | 是 | - | 所属条目 |
| file_name | VARCHAR(255) | 是 | - | 文件名 |
| file_type | VARCHAR(32) | 否 | NULL | 文件类型 |
| file_size | BIGINT | 是 | 0 | 文件大小 |
| file_url | VARCHAR(512) | 否 | NULL | 文件 URL |
| created_at | TIMESTAMP | 是 | CURRENT_TIMESTAMP | 创建时间 |

索引：

- KEY `idx_kb_attachment_item` (item_id)

外键：

- fk_kb_attachment_item：kb_attachment.item_id → kb_item.id（ON DELETE CASCADE）

### 3.5 实体：条目-分类关联（kb_item_category）

- 中文名：条目分类关联
- 英文名：kb_item_category
- 主键：(item_id, category_id)

| 字段 | 类型/长度 | 必填 | 默认值 | 注释 |
|---|---|---|---|---|
| item_id | BIGINT | 是 | - | 条目 ID |
| category_id | BIGINT | 是 | - | 分类 ID |
| created_at | TIMESTAMP | 是 | CURRENT_TIMESTAMP | 创建时间 |

索引：

- PRIMARY KEY (item_id, category_id)
- KEY `idx_kb_item_category_cat` (category_id)

外键：

- fk_kb_item_category_item：item_id → kb_item.id（ON DELETE CASCADE）
- fk_kb_item_category_category：category_id → kb_category.id（ON DELETE CASCADE）

### 3.6 实体：用户收藏（kb_favorite）

- 中文名：用户收藏
- 英文名：kb_favorite
- 主键：(user_id, item_id)

| 字段 | 类型/长度 | 必填 | 默认值 | 注释 |
|---|---|---|---|---|
| user_id | VARCHAR(64) | 是 | - | 用户 ID |
| item_id | BIGINT | 是 | - | 条目 ID |
| created_at | TIMESTAMP | 是 | CURRENT_TIMESTAMP | 创建时间 |

索引：

- PRIMARY KEY (user_id, item_id)
- KEY `idx_kb_favorite_item` (item_id)

外键：

- fk_kb_favorite_item：item_id → kb_item.id（ON DELETE CASCADE）

### 3.7 实体：下载记录（kb_download_log）

- 中文名：下载记录
- 英文名：kb_download_log
- 主键：`id`（自增）

| 字段 | 类型/长度 | 必填 | 默认值 | 注释 |
|---|---|---|---|---|
| id | BIGINT | 是 | AUTO_INCREMENT | 主键 |
| user_id | VARCHAR(64) | 是 | - | 用户 ID |
| item_id | BIGINT | 是 | - | 条目 ID |
| created_at | TIMESTAMP | 是 | CURRENT_TIMESTAMP | 创建时间 |

索引：

- KEY `idx_kb_download_item` (item_id)
- KEY `idx_kb_download_user` (user_id)

外键：

- fk_kb_download_item：item_id → kb_item.id（ON DELETE CASCADE）

## 4. 待补齐清单（获取方式建议）

为满足“字段类型/长度/索引/外键/约束”完整要求，建议从以下任一来源补齐 `t_*` 表 schema：

- 业务后端仓库的迁移/DDL（Flyway/Liquibase/GORM migrations 等）
- 交付给中台/数据库的建库脚本（.sql）
- 直接从数据库导出（MySQL：`SHOW CREATE TABLE` / `information_schema`；PostgreSQL：`\d+`）

