import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../supabaseClient'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard-home',
          component: () => import('@/components/Dashboard.vue')
        },
        {
          path: 'patients',
          name: 'patients',
          component: () => import('@/views/PatientsView.vue')
        },
        {
          path: 'appointments',
          name: 'appointments',
          component: () => import('@/views/AppointmentsView.vue')
        },
        {
          path: 'treatments',
          name: 'treatments',
          component: () => import('@/views/TreatmentsView.vue')
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('../views/ProfileView.vue')
        },
        {
          path: 'medical-history',
          name: 'medical-history',
          component: () => import('../views/MedicalHistoryView.vue')
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      redirect: '/dashboard'
    }
  ]
})

// Comment out or modify the router guard temporarily for testing
router.beforeEach(async (to, from, next) => {
  // Temporarily bypass authentication check
  next()
  
  /* Original authentication logic - uncomment later
  const { data: { session } } = await supabase.auth.getSession()
  
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!session) {
      next('/login')
      return
    }
  }
  
  if (to.path === '/login' && session) {
    next('/dashboard')
    return
  }
  
  next()
  */
})

export default router