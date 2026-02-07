# actionApply 项目导入功能说明

## 入口位置
- 页面：actionApply 第一步基础数据
- 触发按钮：项目信息区域的“专项与片区项目库”
- 实现位置：[step1.vue](file:///e:/Order/city/vue/src/views/async/actionApply/step1.vue#L6-L9)

## 交互流程
1. 点击“专项与片区项目库”按钮
2. 打开项目库弹窗并拉取可导入的项目列表
3. 在列表中点击“导入”
4. 将所选项目的字段合并到当前 publicStore.form
5. 弹出“导入成功”提示并关闭弹窗

## 弹窗与列表查询
- 弹窗组件：projects
- 打开弹窗：`projectRef.onVisable(publicStore.form)`
- 实现位置：[step1.vue](file:///e:/Order/city/vue/src/views/async/actionApply/step1.vue#L6-L9) 与 [projects.vue](file:///e:/Order/city/vue/src/views/async/actionApply/projects.vue#L96-L101)

### 查询模型
在 `projects.vue` 中，列表通过 `publicStore.http` 查询：
- 主表：`t_scheme_project`（别名 p）
- 关联表：`t_scheme_plan`（别名 sp）
- 关联条件：`p.scheme_id = sp.id`
- 过滤条件：`sp.release_status = '1'`
- 实现位置：[projects.vue](file:///e:/Order/city/vue/src/views/async/actionApply/projects.vue#L103-L125)

### 可用筛选项
筛选条件来自弹窗头部的输入：
- 项目周期：`construct_datetime_start` ~ `construct_datetime_end`
- 实施状态：`completion_status`
- 项目名称：`name LIKE '%关键字%'`
- 省/市（依赖 state.province/state.city）
- 实现位置：[projects.vue](file:///e:/Order/city/vue/src/views/async/actionApply/projects.vue#L10-L29) 与 [projects.vue](file:///e:/Order/city/vue/src/views/async/actionApply/projects.vue#L109-L118)

## 导入逻辑
导入按钮位于列表“操作”列：
- 触发方法：`handleClick('exportdata', scope.row)`
- 实现位置：[projects.vue](file:///e:/Order/city/vue/src/views/async/actionApply/projects.vue#L61-L65)

### 合并字段
导入时会将选中行的字段合并进当前表单：
- `num`
- `name`
- `task_type`
- `construct_scale`
- `construct_nature`
- `construct_price`
- `construct_datetime_start`
- `construct_datetime_end`

实现位置：[projects.vue](file:///e:/Order/city/vue/src/views/async/actionApply/projects.vue#L134-L148)

### 提示与关闭
- 提示：`ElNotification({ message: '导入成功' })`
- 关闭：调用 `onVisable()` 切换弹窗状态
- 实现位置：[projects.vue](file:///e:/Order/city/vue/src/views/async/actionApply/projects.vue#L147-L149)

## 数据落点
导入数据写入 `publicStore.form`，因此会自动回填 step1 中绑定的表单项（如项目名称、任务类型、建设规模、建设性质、投资预估等）。
- 表单绑定示例：[step1.vue](file:///e:/Order/city/vue/src/views/async/actionApply/step1.vue#L13-L18) 和 [step1.vue](file:///e:/Order/city/vue/src/views/async/actionApply/step1.vue#L95-L108)

## 关键文件
- [step1.vue](file:///e:/Order/city/vue/src/views/async/actionApply/step1.vue)
- [projects.vue](file:///e:/Order/city/vue/src/views/async/actionApply/projects.vue)
