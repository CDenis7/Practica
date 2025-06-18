import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import NewProjectView from '../views/NewProjectView.vue';
import EditProjectView from '../views/EditProjectView.vue';
import ProjectDetailView from '../views/ProjectDetailView.vue';
import LoginView from '../views/LoginView.vue'; // <-- Import LoginView
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
      path: '/login', // <-- Add Login Route
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
      meta: { requiresAuth: true } // Mark this route as requiring authentication
    },
    {
      path: '/edit/:projectId',
      name: 'edit-project',
      component: EditProjectView,
      props: true,
      meta: { requiresAuth: true } // Mark this route as requiring authentication
    }
  ]
});

// Navigation Guard: Protects routes that require authentication
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isLoggedIn()) {
    // If route requires auth and user is not logged in, redirect to login
    next({ name: 'login' });
  } else {
    // Otherwise, proceed
    next();
  }
});

export default router;