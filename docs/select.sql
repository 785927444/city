-- 用 规划id 找 规划主信息（plan + design 二选一）
SELECT 
  'plan' AS scheme_type,
  p.*
FROM t_scheme_plan p
WHERE p.id = :schemeId

UNION ALL

SELECT 
  'design' AS scheme_type,
  d.*
FROM t_scheme_design d
WHERE d.id = :schemeId;
-- 用 规划id 找 规划下项目（来自 plan 映射表）
SELECT 
  'plan' AS scheme_type,
  sp.*
FROM t_scheme_plan_project m
JOIN t_scheme_project sp ON sp.id = m.scheme_project_id
WHERE m.scheme_plan_id = :schemeId;

-- 用 规划id 找 规划下项目（来自 design 映射表）
SELECT 
  'design' AS scheme_type,
  sp.*
FROM t_scheme_design_project m
JOIN t_scheme_project sp ON sp.id = m.scheme_project_id
WHERE m.scheme_design_id = :schemeId;
-- 用 规划id 找 规划下任务（plan）
SELECT 
  'plan' AS scheme_type,
  st.*
FROM t_scheme_plan_task m
JOIN t_scheme_task st ON st.id = m.scheme_task_id
WHERE m.scheme_plan_id = :schemeId;

-- 用 规划id 找 规划下任务（design）
SELECT 
  'design' AS scheme_type,
  st.*
FROM t_scheme_design_task m
JOIN t_scheme_task st ON st.id = m.scheme_task_id
WHERE m.scheme_design_id = :schemeId;
-- 用 规划id 找 问题主表
SELECT * FROM t_scheme_problem
WHERE scheme_id = :schemeId;

-- 用 规划id 找 问题项
SELECT * FROM t_scheme_problem_item
WHERE scheme_id = :schemeId;

-- 用 规划id 找 问题日志
SELECT * FROM t_scheme_problem_log
WHERE scheme_id = :schemeId;

-- 用 规划id 找 评价结果/指标结果
SELECT * FROM t_scheme_problem_result
WHERE scheme_id = :schemeId;
-- 用 规划id 找 项目库（含投资年份 estimate_year）
SELECT * FROM t_project_base
WHERE scheme_id = :schemeId;

-- 用 规划id 找 项目上报库（含投资年份 estimate_year）
SELECT * FROM t_project_report
WHERE scheme_id = :schemeId;
-- 用 项目库id 找 年度值
SELECT * FROM t_project_task
WHERE project_id = :projectId;

-- 批量：用多个项目id 找 年度值
SELECT * FROM t_project_task
WHERE project_id IN (:projectIds);
