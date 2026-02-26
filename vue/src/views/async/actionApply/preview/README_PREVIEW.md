# 项目预览页面接入文档

本项目预览页面位于 `src/views/async/actionApply/preview/`，用于以只读方式展示项目申请表单的详细信息。

## 页面路径
`src/views/async/actionApply/preview/previewIndex.vue`

## 接入参数 (Query Parameters)

进入预览页面时，需要通过 URL 查询参数（Query）传递以下字段：

| 参数名 | 类型 | 是否必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `id` | `string` | **是** | 项目报告 ID (`t_project_report` 表的主键)。用于从后端获取项目详细数据。 |
| `key` | `string` | 否 | 业务场景标识。可选值：`enterprise` (企业), `department` (部门)。用于逻辑判断。 |
| `action` | `string` | 否 | 流程节点 ID。配合 `key='enterprise'` 使用，用于特定流程状态下的步骤判定。 |

## 业务逻辑说明

预览页面会自动根据项目状态和传入参数调整展示步数：

1.  **两步模式 (2 Steps)**：
    *   **触发条件**：
        *   **无项目 ID**：对应原表单“仅保存”逻辑 (`step2.vue` L196)。
        *   **企业申请储备场景**：(`step2.vue` L198-199)。
            *   场景 A: `key === 'enterprise'` 且 项目 `apply_status === '0'` 且 `reserve_status === '0'`
            *   场景 B: `key === 'enterprise'` 且 项目 `apply_status === '1'` 且 `reserve_status === '0'` 且 `action === '1f10502a-e388-6850-8aa3-265c92863865'`
    *   **表现**：顶部进度条显示 2 步，Step 2 底部显示“上一步”和“关闭”按钮。

2.  **三步模式 (3 Steps)**：
    *   **触发条件**：
        *   **部门申请场景**：`key === 'department'` 且 `apply_status >= '0'` (同步自 `step2.vue` L204)。
        *   **企业普通申请**：`key === 'enterprise'` 且 `apply_status >= '1'` 且 `action` 不是特定 ID (同步自 `step2.vue` L202)。
        *   其他不满足两步模式的场景。
    *   **表现**：顶部进度条显示 3 步，Step 2 底部显示“下一步”，Step 3 底部仅显示“关闭”按钮。

## 代码调用示例

```typescript
import { useRouter } from 'vue-router'

const router = useRouter()

// 示例 1：常规项目预览
router.push({
  path: '/async/actionApply/preview/previewIndex',
  query: { 
    id: '项目ID_123' 
  }
})

// 示例 2：企业申请储备项目预览（两步流）
router.push({
  path: '/async/actionApply/preview/previewIndex',
  query: { 
    id: '项目ID_456',
    key: 'enterprise',
    action: '1f10502a-e388-6850-8aa3-265c92863865' // 特定节点ID
  }
})
```

## 注意事项
*   预览页面所有字段均为**不可编辑**状态。
*   页面已移除“保存”、“通过”、“驳回”等涉及数据变更的操作。
*   数据填充逻辑已同步 `actionApply/index.vue` 的 JSON 解析逻辑，确保展示一致性。
