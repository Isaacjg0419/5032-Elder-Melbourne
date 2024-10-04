import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import HomeView from '../views/HomeView.vue'
import SupportView from '../views/SupportView.vue'
import AdminDashboardView from '@/views/AdminDashboardView.vue'
import NeighborhoodCentersView from '@/views/NeighborhoodCentersView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView
    },
    {
      path: '/user-home',
      name: 'home',
      component: HomeView
    },
    {
      path: '/support-services',
      name: 'support',
      component: SupportView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView
    },
    {
      path: '/admin-dashboard',
      name: 'AdminDashboard',
      component: AdminDashboardView
    },
    {
      path: '/neighborhood-centers',
      name: 'neighborhood',
      component: NeighborhoodCentersView
    }
  ]
})

export default router
