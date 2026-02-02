import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import { constantRoutes, asyncRoutes, adminRoutes } from '../router/routes'

const router = createRouter({
  history: createWebHashHistory(),
  // history: createWebHistory(),
  routes: constantRoutes.concat(asyncRoutes, adminRoutes)
})

export default router
