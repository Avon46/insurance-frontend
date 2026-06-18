import { createRouter, createWebHistory } from 'vue-router'
import { useAdminAuthStore } from '@/stores/adminAuth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/premium-calculator',
    },
    {
      path: '/premium-calculator',
      name: 'premium-calculator',
      component: () => import('@/views/PremiumCalculatorView.vue'),
    },
    {
      path: '/recommend',
      name: 'recommend',
      component: () => import('@/views/RecommendView.vue'),
    },

    // ── 管理員專區 ──────────────────────────────────────
    // 以特殊路由進入管理員專用登入畫面（blank 版面，無一般側欄）
    {
      path: '/admin/login',
      name: 'admin-login',
      component: () => import('@/views/AdminLoginView.vue'),
      meta: { layout: 'blank' },
    },
    {
      path: '/admin',
      redirect: '/admin/plans',
    },
    // 模組 1：管理員專用的保單 CRUD（需 Route Guard）
    {
      path: '/admin/plans',
      name: 'admin-plans',
      component: () => import('@/views/PlanAdminView.vue'),
      meta: { area: 'admin', requiresAdmin: true },
    },
    // 模組 2：與一般使用者相同的試算頁面（同樣置於後台導覽中，免登出切換身分）
    {
      path: '/admin/calculator',
      name: 'admin-calculator',
      component: () => import('@/views/PremiumCalculatorView.vue'),
      meta: { area: 'admin', requiresAdmin: true },
    },
  ],
})

// 所有管理員相關操作介面皆需通過 Route Guard
router.beforeEach((to) => {
  const auth = useAdminAuthStore()

  // 未登入卻想進入受保護頁面 → 導向登入頁，並記錄原目的地
  if (to.meta.requiresAdmin && !auth.isAuthenticated) {
    return { name: 'admin-login', query: { redirect: to.fullPath } }
  }

  // 已登入又回到登入頁 → 直接帶往後台首頁
  if (to.name === 'admin-login' && auth.isAuthenticated) {
    return { name: 'admin-plans' }
  }

  return true
})

export default router
