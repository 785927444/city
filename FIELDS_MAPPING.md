# 专项规划与新建项目字段映射文档

本文档描述了从“专项规划”（`t_scheme_plan`）选择后，自动填充到“新建项目”（`basicProjectOverview`）表单的字段映射规则。

## 1. 基础信息表单 (Step 1)

| 来源字段 (专项规划 `t_scheme_plan`) | 数据路径/类型 | 目标字段 (新建项目) | 目标路径 | 处理逻辑 |
| :--- | :--- | :--- | :--- | :--- |
| `datetime` | JSON数组 (如 `["2025", "2030"]`) | `planned_start_date` | `state.draft.planned_start_date` | 取开始年份拼接 `-01-01` |
| `datetime` | JSON数组 | `expected_finish_date` | `state.draft.expected_finish_date` | 取结束年份拼接 `-12-31` |
| `datetime` | JSON数组 | `plan_year` | `state.draft.plan_year` | 取开始年份作为计划年度 |
| `attr.规划目标` | 文本 (在 `attr` JSON中) | `target_2030` | `state.draft.contacts.target_2030` | 直接填充到“到2030年的量化目标” |

## 2. 实施方案表单 (Step 2)

| 来源字段 (专项规划 `t_scheme_plan`) | 数据路径/类型 | 目标字段 (新建项目) | 目标路径 | 处理逻辑 |
| :--- | :--- | :--- | :--- | :--- |
| `attr.规划说明` | 文本 | `summary` | `state.draft.step2.summary` | 填充到“方案摘要” |
| `attr.规划文本` | 文件对象 | `fileList` | `state.draft.step2.fileList` | 转换文件对象，添加到“方案文本”列表 |
| `attr.规划图表` | 文件对象 | `chartsList` | `state.draft.step2.chartsList` | 转换文件对象，添加到“重要图表”列表 |
| `attr.支撑材料` | 文件对象 | `materialsList` | `state.draft.step2.materialsList` | 转换文件对象，添加到“支撑材料”列表 |
| `attr.矢量文件` | 文件对象 | `materialsList` | `state.draft.step2.materialsList` | 转换文件对象，类型标记为“矢量文件”，添加到“支撑材料”列表 |

## 3. 文件对象转换规则

专项规划中的文件对象通常包含 `{ data: 'path', name: 'filename', ... }`。
映射到新建项目文件列表时，转换为：
```javascript
{
  id: uuid(),       // 生成新ID或沿用
  name: source.name,// 文件名
  path: source.data,// 文件路径
  type: '自动导入',   // 或保留原类型
  time: new Date(), // 当前时间
  status: 'success',
  statusText: '自动导入'
}
```
