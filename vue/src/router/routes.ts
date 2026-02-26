import { RouteRecordRaw } from 'vue-router'
import asyncLayout from "@/views/layout/asyncDefault.vue"
import adminLayout from "@/views/layout/adminDefault.vue"

// 公共路由
export const constantRoutes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/async'
  },
  {
    path: '/noPermission',
    name: '无权限',
    meta: { next: false },
    component: () => import('@/views/error/noPermission.vue')
  },
  {
    path: '/404',
    name: '404',
    meta: { next: false },
    component: () => import('@/views/error/notFound.vue')
  },
  {
    path: '/405',
    name: '405',
    meta: { next: true },
    component: () => import('@/views/error/notErrlog.vue')
  },
  // {
  //   path: '/:pathMatch(.*)',
  //   name: '404',
  //   meta: { next: false },
  //   component: () => import('@/views/error/notFound.vue')
  // },
]

// 无需权限
export const asyncRoutes: Array<RouteRecordRaw> = [
  {
    path: '/async',
    redirect: '/scheme',
    component: asyncLayout,
    children: [
      {
        path: '/home',
        name: '主页',
        meta: { next: false },
        component: () => import('@/views/async/home/index.vue'),
        children: []
      },
      {
        path: '/knowledge',
        name: '知识库',
        meta: { next: false },
        component: () => import('@/views/async/knowledge/index.vue'),
        children: []
      },
      {
        path: '/knowledge/column/:code',
        name: '知识库专栏',
        meta: { next: false },
        component: () => import('@/views/async/knowledge/column.vue'),
        children: []
      },
      {
        path: '/knowledge/user-articles',
        name: '我的文章',
        meta: { next: false },
        component: () => import('@/views/async/knowledge/UserArticles.vue'),
        children: []
      },
      {
        path: '/knowledge/category-management',
        name: '分类管理',
        meta: { next: false },
        component: () => import('@/views/async/knowledge/CategoryManagement.vue'),
        children: []
      },
      {
        path: '/knowledge/manage',
        name: '知识库管理后台',
        meta: { next: false },
        component: () => import('@/views/async/knowledge/Manage.vue'),
        children: []
      },
      {
        path: '/knowledge/item/:id',
        name: '专栏详情',
        meta: { next: false },
        component: () => import('@/views/async/knowledge/detail.vue'),
        children: []
      },
      {
        path: '/action-home',
        name: '实施与调度管理',
        meta: { next: false },
        component: () => import('@/views/async/actionHome/index.vue'),
        children: []
      },
      {
        path: '/basicProjectOverview',
        name: '项目基础库',
        meta: { next: false },
        component: () => import('@/views/async/basicProjectOverview/index.vue'),
        children: []
      },
      {
        path: '/project-push',
        name: '项目推送库',
        meta: { next: false },
        component: () => import('../views/async/actionHome/projectPush.vue'),
        children: []
      },
      {
        path: '/project-push/ledger',
        name: '项目台账',
        meta: { next: false },
        component: () => import('@/views/async/actionHome/projectPushLedger/index.vue'),
        children: []
      },
      {
        path: '/project-push/tracking',
        name: '项目实施跟踪',
        meta: { next: false },
        component: () => import('@/views/async/actionHome/projectPushTracking/index.vue'),
        children: []
      },
      {
        path: '/annual-plan',
        name: '年度计划',
        meta: { next: false },
        component: () => import('@/views/async/annualPlan/index.vue'),
        children: []
      },
      {
        path: '/annual-plan/report',
        name: '年度计划上报',
        meta: { next: false },
        component: () => import('@/views/async/annualPlan/report.vue'),
        children: []
      },
      {
        path: '/actionApply',
        name: '项目储备申请',
        meta: { next: false },
        component: () => import('@/views/async/actionApply/index.vue'),
        children: []
      },
      {
        path: '/actionApply/preview/previewIndex',
        name: '项目储备预览',
        meta: { next: false },
        component: () => import('@/views/async/actionApply/preview/previewIndex.vue'),
        children: []
      },
      {
        path: '/annual-plan/track',
        name: '年度计划跟踪',
        meta: { next: false },
        component: () => import('@/views/async/annualPlan/track.vue'),
        children: []
      },
      {
        path: '/annual-plan/:id',
        name: '年度计划详情',
        meta: { next: false },
        component: () => import('@/views/async/annualPlan/detail.vue'),
        children: []
      },
      {
        path: '/annual-plan/:id/projects',
        name: '计划项目库',
        meta: { next: false },
        component: () => import('@/views/async/annualPlan/projectList.vue'),
        children: []
      },
      {
        path: '/annual-plan/:id/attachments',
        name: '计划附件',
        meta: { next: false },
        component: () => import('@/views/async/annualPlan/attachments.vue'),
        children: []
      },
      {
        path: '/annual-plan/:id/goals',
        name: '年度目标任务',
        meta: { next: false },
        component: () => import('@/views/async/annualPlan/goalTasks.vue'),
        children: []
      }
    ]
  },
  {
    path: '/login',
    name: '登录',
    meta: { next: true },
    component: () => import('@/views/async/login/index.vue')
  }
]

// 必需权限
export const adminRoutes: Array<RouteRecordRaw> = [
  {
    path: '/kb-management',
    name: '知识库管理',
    meta: { isroute: 1, icon: '' },
    component: adminLayout,
    redirect: '/kb-management/user-articles',
    children: [
      {
        path: '/kb-management/user-articles',
        name: '知识库内容管理',
        meta: { isroute: 1, icon: '' },
        component: () => import('@/views/async/knowledge/UserArticles.vue'),
        children: []
      },
      {
        path: '/kb-management/category-management',
        name: '分类管理',
        meta: { isroute: 1, icon: '' },
        component: () => import('@/views/async/knowledge/CategoryManagement.vue'),
        children: []
      }
    ]
  },
  // {
  //   path: '/admin',
  //   name: '系统管理',
  //   meta: { isroute: true, icon: 'i-ep-menu' },
  //   component: adminLayout,
  //   redirect: '/user',
  //   children: [
  //     {
  //       path: '/user',
  //       name: '用户列表',
  //       meta: { isroute: true, icon: 'r1' },
  //       component: () => import('@/views/admin/user/index.vue'),
  //       children: []
  //     }
  //   ]}
  ]
