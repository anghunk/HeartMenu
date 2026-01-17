import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  // 根路径重定向到点餐端
  {
    path: '/',
    redirect: '/app',
  },
  // ==================== 点餐端路由 ====================
  {
    path: '/app/login',
    name: 'AppLogin',
    component: () => import('../views/app/Login.vue'),
  },
  {
    path: '/app',
    component: () => import('../layout/AppLayout.vue'),
    meta: { requiresAuth: true, role: 'user' },
    children: [
      {
        path: '',
        name: 'AppIndex',
        component: () => import('../views/app/Index.vue'),
      },
      {
        path: 'order',
        name: 'AppOrder',
        component: () => import('../views/app/Order.vue'),
      },
      {
        path: 'detail/:id',
        name: 'AppDetail',
        component: () => import('../views/app/Detail.vue'),
        meta: { hideHeader: true, hideFooter: true },
      },
    ],
  },
  // ==================== 管理端路由 ====================
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('../views/admin/Login.vue'),
  },
  {
    path: '/admin',
    component: () => import('../layout/AdminLayout.vue'),
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      {
        path: '',
        redirect: '/admin/menu',
      },
      {
        path: 'menu',
        name: 'AdminMenu',
        component: () => import('../views/admin/Menu.vue'),
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('../views/admin/Users.vue'),
      },
      {
        path: 'orders',
        name: 'AdminOrders',
        component: () => import('../views/admin/Orders.vue'),
      },
      {
        path: 'settings',
        name: 'AdminSettings',
        component: () => import('../views/admin/Settings.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const isAppRoute = to.path.startsWith('/app')
  const isAdminRoute = to.path.startsWith('/admin')

  // 根据路由类型获取对应的 token
  const tokenKey = isAdminRoute ? 'admin_token' : 'app_token'
  const token = localStorage.getItem(tokenKey)

  // 设置页面标题
  if (isAppRoute) {
    document.title = '情侣点餐'
  } else if (isAdminRoute) {
    document.title = '情侣点餐 - 管理后台'
  }

  if (to.meta.requiresAuth && !token) {
    // 根据路由类型重定向到对应的登录页
    if (isAppRoute) {
      next('/app/login')
    } else if (isAdminRoute) {
      next('/admin/login')
    } else {
      next('/app/login')
    }
  } else {
    next()
  }
})

export default router
