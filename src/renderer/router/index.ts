import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import AddAthletes from '../views/AddAthletes.vue';
import ListAthletes from '../views/ListAthletes.vue';
import ListEvents from '../views/ListEvents.vue';
import AddEventDetail from '../views/AddEventDetail.vue';
import AddEventInstance from '../views/AddEventInstance.vue';
import ViewRegistrations from '../views/ViewRegistrations.vue';
import ViewAthletes from '../views/ViewAthletes.vue';
import ChangeEventOrder from '../views/ChangeEventOrder.vue';
import TeamSheet from '../views/TeamSheet.vue';
import EnterResults from '../views/EnterResults.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/add-athletes',
    name: 'AddAthletes',
    component: AddAthletes
  },
  {
    path: '/list-athletes',
    name: 'ListAthletes',
    component: ListAthletes
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
    path: '/view-athletes',
    name: 'ViewAthletes',
    component: ViewAthletes
  },
  {
    path: '/change-event-order',
    name: 'ChangeEventOrder',
    component: ChangeEventOrder
  },
  {
    path: '/teamsheet/:clubid',
    name: 'TeamSheet',
    component: TeamSheet
  },
  {
    path: '/enter-reults/:eventid',
    name: 'EnterResults',
    component: EnterResults
  },
  // Additional routes for other components
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
