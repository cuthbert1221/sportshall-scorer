import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import AddAthletes from '../views/AddAthletes.vue';
import ListAthletes from '../views/ListAthletes.vue';
import ListEvents from '../views/ListEvents.vue';
import AddEventDetail from '../views/AddEventDetail.vue';
import AddEventInstance from '../views/AddEventInstance.vue';
import ViewAthletes from '../views/ViewAthletes.vue';
import ChangeEventOrder from '../views/ChangeEventOrder.vue';
import TeamSheet from '../views/TeamSheet.vue';
import EnterResults from '../views/EnterResults.vue';
import PickEnterResults from '../views/PickEnterResults.vue';
import PickTeamSheet from '../views/PickTeamSheet.vue';
import Venues from '../views/Venues.vue';
import ViewResults from '../views/ViewResults.vue';
import AthleteVenueResults from '../views/AthleteVenueResults.vue';
import ClubVenueResults from '../views/ClubVenueResults.vue';
import ViewEventTypes from '../views/ViewEventTypes.vue';

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
  {
    path: '/event-list',
    name: 'PickEnterResults',
    component: PickEnterResults
  },
  {
    path: '/club-list',
    name: 'PickTeamSheet',
    component: PickTeamSheet
  },
  {
    path: '/venues',
    name: 'Venues',
    component: Venues
  },
  {
    path: '/view-results',
    name: 'ViewResults',
    component: ViewResults
  },
  {
    path: '/athlte-venue-results',
    name: 'AthleteVenueResults',
    component: AthleteVenueResults
  },
  {
    path: '/club-venue-results',
    name: 'ClubVenueResults',
    component: ClubVenueResults
  },
  {
    path: '/view-event-types',
    name: 'ViewEventTypes',
    component: ViewEventTypes
  },
  // Additional routes for other components
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
