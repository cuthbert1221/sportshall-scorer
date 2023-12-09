import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import AddParticipants from '../views/AddParticipants.vue';
import ListParticipants from '../views/ListParticipants.vue';
import ListEvents from '../views/ListEvents.vue';
import AddEvents from '../views/AddEvent.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/add-participants',
    name: 'AddParticipants',
    component: AddParticipants
  },
  {
    path: '/list-participants',
    name: 'ListParticipants',
    component: ListParticipants
  },
  {
    path: '/list-events',
    name: 'ListEvents',
    component: ListEvents
  },
  {
    path: '/add-event',
    name: 'AddEvents',
    component: AddEvents
  },
  // Additional routes for other components
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
