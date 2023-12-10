import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import AddParticipants from '../views/AddParticipants.vue';
import ListParticipants from '../views/ListParticipants.vue';
import ListEvents from '../views/ListEvents.vue';
import AddEventDetail from '../views/AddEventDetail.vue';
import AddEventInstance from '../views/AddEventInstance.vue';
import ViewRegistrations from '../views/ViewRegistrations.vue';
import ViewParticipants from '../views/ViewParticipants.vue';

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
    path: '/add-event-detail',
    name: 'AddEventDetails',
    component: AddEventDetail
  },
  {
    path: '/add-event-instance',
    name: 'AddEventInstances',
    component: AddEventInstance
  },
  {
    path: '/view-registraions',
    name: 'ViewRegistrations',
    component: ViewRegistrations
  },
  {
    path: '/view-participants',
    name: 'ViewParticipants',
    component: ViewParticipants
  },
  // Additional routes for other components
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
