/*
 Navicat Premium Data Transfer
 Source Server         : 182.40.104.234
 Source Server Type    : MySQL
 Source Server Version : 80044
 Source Host           : 182.40.104.234:33306
 Source Schema         : om
 Target Server Type    : MySQL
 Target Server Version : 80044
 File Encoding         : 65001
 Date: 05/02/2026 09:14:19
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Drop temporary table created by mistake
-- ----------------------------
DROP TABLE IF EXISTS `t_implementation_plan_files`;

-- ----------------------------
-- Table structure for t_file
-- ----------------------------
DROP TABLE IF EXISTS `t_file`;
CREATE TABLE `t_file`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '主键',
  `user_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '用户id',
  `type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '类型',
  `path` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '路径',
  `status` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '状态',
  `time` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '时间',
  `class` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '分类',
  `order` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '预留',
  PRIMARY KEY (`id`, `user_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of t_file
-- ----------------------------
-- 1. 方案文本 (plan_text)
INSERT INTO `t_file` VALUES ('1', 'admin', '文本文件', '/static/uploads/33fa95f0152e4543912b88c636b26f9f.pdf', 'success', '2025-12-15 12:00', 'plan_text', '基础条件.pdf');
INSERT INTO `t_file` VALUES ('2', 'admin', '文本文件', '/static/uploads/4eaa30b8a7ab40a798cf5b98924fde30.pdf', 'fail', '2025-12-15 12:05', 'plan_text', '更新方式.pdf');

-- 2. 重要图表 (charts)
INSERT INTO `t_file` VALUES ('3', 'admin', '图表文件', '/static/uploads/53fc120ecca44c12bce7ee9dc45ce35f.png', 'success', '2025-12-16 09:30', 'charts', '现状分析图.png');
INSERT INTO `t_file` VALUES ('4', 'admin', '图表文件', '/static/uploads/879d409c37f94ed8bf5ad09fcb0240b7.png', 'success', '2025-12-16 10:15', 'charts', '规划结构图.png');

-- 3. 支撑材料 (materials)
INSERT INTO `t_file` VALUES ('5', 'admin', '文档文件', '/static/uploads/3fe8234a9a194f0c9da7f477accfe2ec.docx', 'success', '2025-12-17 14:20', 'materials', '会议纪要.docx');
INSERT INTO `t_file` VALUES ('6', 'admin', '文档文件', '/static/uploads/4f2d187ff80441d991ae60570d19cabb.docx', 'fail', '2025-12-17 16:45', 'materials', '专家意见.docx');

SET FOREIGN_KEY_CHECKS = 1;
