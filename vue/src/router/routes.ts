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
    redirect: '/login',
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
        path: '/analysis',
        name: '数据分析',
        meta: { next: false },
        component: () => import('@/views/async/analysis/index.vue'),
        children: []
      },
      {
        path: '/control',
        name: '设备控制',
        meta: { next: false },
        component: () => import('@/views/async/control/index.vue'),
        children: []
      },
      {
        path: '/detail',
        name: '设备详情',
        meta: { next: false },
        component: () => import('@/views/async/detail/index.vue'),
        children: []
      },
      {
        path: '/alarmlog',
        name: '告警日志',
        meta: { next: false },
        component: () => import('@/views/async/alarmlog/index.vue'),
        children: []
      },
     {
        path: '/controllog',
        name: '控制日志',
        meta: { next: false },
        component: () => import('@/views/async/controllog/index.vue'),
        children: []
      },
      {
        path: '/datalog',
        name: '数据日志',
        meta: { next: false },
        component: () => import('@/views/async/datalog/index.vue'),
        children: []
      },
      {
        path: '/monitor',
        name: '源网荷储',
        meta: { next: false },
        component: () => import('@/views/async/monitor/index.vue'),
        children: []
      }
    ]
  },
  {
    path: '/login',
    name: '登录',
    meta: { next: true },
    component: () => import('@/views/async/login/index.vue')
  },
  {
    path: '/test',
    name: '测试',
    meta: { next: false },
    component: () => import('@/views/async/test/index.vue')
  },
  {
    path: '/three',
    name: 'three',
    meta: { next: false },
    component: () => import('@/views/async/three/index.vue')
  },
  {
    path: '/three2',
    name: 'three2',
    meta: { next: false },
    component: () => import('@/views/async/three/index2.vue')
  },
  {
    path: '/three3',
    name: 'three3',
    meta: { next: false },
    component: () => import('@/views/async/three/index3.vue')
  },
]

// 必需权限
export const adminRoutes: Array<RouteRecordRaw> = [
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
