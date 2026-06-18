import { createRouter, createWebHistory } from 'vue-router'

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
      path: '/plan-admin',
      name: 'plan-admin',
      component: () => import('@/views/PlanAdminView.vue'),
    },
    {
      path: '/recommend',
      name: 'recommend',
      component: () => import('@/views/RecommendView.vue'),
    },
  ],
})

export default router
