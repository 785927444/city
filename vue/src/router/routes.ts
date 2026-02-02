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
