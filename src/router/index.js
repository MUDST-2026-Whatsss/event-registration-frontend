import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/about', name: 'about', component: AboutView },
    {
      path: '/admin',
      name: 'admin-dashboard',
      component: () => import('../views/admin/admindashboard.vue'),
      meta: { title: 'Admin Dashboard | Eventsss' },
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.afterEach((to) => {
  document.title = to.meta.title ?? 'Eventsss | Event Registration Platform'
})

export default router
