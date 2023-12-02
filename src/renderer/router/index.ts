import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import UserManagementPage from '../views/UserManagementPage.vue';
import Users from '../views/Users.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/create-user',
    name: 'CreateUser',
    component: UserManagementPage
  },
  {
    path: '/list-users',
    name: 'Users',
    component: Users
  },
  // Additional routes for other components
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
