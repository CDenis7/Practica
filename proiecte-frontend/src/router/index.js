import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import NewProjectView from '../views/NewProjectView.vue';
import EditProjectView from '../views/EditProjectView.vue';
import ProjectDetailView from '../views/ProjectDetailView.vue';
import LoginView from '../views/LoginView.vue';
import { isLoggedIn } from '@/services/authService';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/projects/:id',
      name: 'project-detail',
      component: ProjectDetailView,
      props: true
    },
    {
      path: '/new',
      name: 'new-project',
      component: NewProjectView,
      meta: { requiresAuth: true } 
    },
    {
      path: '/edit/:projectId',
      name: 'edit-project',
      component: EditProjectView,
      props: true,
      meta: { requiresAuth: true } 
    }
  ]
});

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isLoggedIn()) {
    next({ name: 'login' });
  } else {
    next();
  }
});

export default router;