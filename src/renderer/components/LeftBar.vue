<template>
  <div
    id="app-sidebar-2"
    class="bg-bluegray-800 h-screen hidden lg:block flex-shrink-0 absolute lg:static left-0 top-0 z-1 select-none"
    style="width: 280px"
  >
    <div class="flex flex-column h-full">
      <div
        class="flex align-items-center px-5 bg-bluegray-900 flex-shrink-0"
        style="height: 60px"
      >
        <img src="/images/blocks/logos/hyper-300.svg" alt="Image" height="30" />
      </div>
      <div class="overflow-y-auto mt-3">
        <ul class="list-none p-3 m-0">
          <li class="p-2">
            <Dropdown v-model="selectedVenue" :options="venues" optionLabel="name" placeholder="Select a Venue" class="w-full md:w-14rem" @update:modelValue="setVenue" />
          </li>
          <li>
            <router-link
              :to="{ name: 'Home' }"
              v-ripple
              class="flex align-items-center cursor-pointer p-3 hover:bg-bluegray-900 border-round text-bluegray-100 hover:text-bluegray-50 transition-duration-150 transition-colors p-ripple"
            >
              <i class="pi pi-home mr-2"></i>
              <span class="font-medium">Dashboard</span>
            </router-link>
          </li>
          <li>
            <div
              v-ripple
              class="flex align-items-center cursor-pointer p-3 hover:bg-bluegray-900 border-round text-bluegray-100 hover:text-bluegray-50 transition-duration-150 transition-colors p-ripple justify-content-between"
              v-styleclass="{
                selector: '@next',
                enterClass: 'hidden',
                enterActiveClass: 'slidedown',
                leaveToClass: 'hidden',
                leaveActiveClass: 'slideup',
              }"
            >
              <span class="font-medium">Events</span>
              <i class="pi pi-chevron-down"></i>
            </div>
            <ul class="list-none p-0 m-0 overflow-hidden">
              <li>
                <router-link
                  :to="{ name: 'AddEventDetails' }"
                  v-ripple
                  class="flex align-items-center cursor-pointer p-3 hover:bg-bluegray-900 border-round text-bluegray-100 hover:text-bluegray-50 transition-duration-150 transition-colors p-ripple"
                >
                  <i class="pi pi-plus mr-2"></i>
                  <span class="font-medium">Add Event Type</span>
                </router-link>
              </li>
              <li>
                <router-link
                  :to="{ name: 'ViewEventTypes' }"
                  v-ripple
                  class="flex align-items-center cursor-pointer p-3 hover:bg-bluegray-900 border-round text-bluegray-100 hover:text-bluegray-50 transition-duration-150 transition-colors p-ripple"
                >
                  <i class="pi pi-plus mr-2"></i>
                  <span class="font-medium">View Event Type</span>
                </router-link>
              </li>
              <li>
                <router-link
                  :to="{ name: 'AddEventInstances' }"
                  v-ripple
                  class="flex align-items-center cursor-pointer p-3 hover:bg-bluegray-900 border-round text-bluegray-100 hover:text-bluegray-50 transition-duration-150 transition-colors p-ripple"
                >
                  <i class="pi pi-plus mr-2"></i>
                  <span class="font-medium">Register Event</span>
                </router-link>
              </li>
              <li>
                <router-link
                  :to="{ name: 'ChangeEventOrder' }"
                  v-ripple
                  class="flex align-items-center cursor-pointer p-3 hover:bg-bluegray-900 border-round text-bluegray-100 hover:text-bluegray-50 transition-duration-150 transition-colors p-ripple"
                >
                  <i class="pi pi-plus mr-2"></i>
                  <span class="font-medium">Event Order</span>
                </router-link>
              </li>
              <li>
                <router-link
                  :to="{ name: 'PickTeamSheet' }"
                  v-ripple
                  class="flex align-items-center cursor-pointer p-3 hover:bg-bluegray-900 border-round text-bluegray-100 hover:text-bluegray-50 transition-duration-150 transition-colors p-ripple"
                >
                  <i class="pi pi-plus mr-2"></i>
                  <span class="font-medium">Team Sheets</span>
                </router-link>
              </li>
              <li>
                <router-link
                  :to="{ name: 'PickEnterResults' }"
                  v-ripple
                  class="flex align-items-center cursor-pointer p-3 hover:bg-bluegray-900 border-round text-bluegray-100 hover:text-bluegray-50 transition-duration-150 transition-colors p-ripple"
                >
                  <i class="pi pi-plus mr-2"></i>
                  <span class="font-medium">Event List</span>
                </router-link>
              </li>
              <li>
                <router-link
                  :to="{ name: 'Venues' }"
                  v-ripple
                  class="flex align-items-center cursor-pointer p-3 hover:bg-bluegray-900 border-round text-bluegray-100 hover:text-bluegray-50 transition-duration-150 transition-colors p-ripple"
                >
                  <i class="pi pi-plus mr-2"></i>
                  <span class="font-medium">Venues</span>
                </router-link>
              </li>
              <li>
                <router-link
                  :to="{ name: 'ClubVenueResults' }"
                  v-ripple
                  class="flex align-items-center cursor-pointer p-3 hover:bg-bluegray-900 border-round text-bluegray-100 hover:text-bluegray-50 transition-duration-150 transition-colors p-ripple"
                >
                  <i class="pi pi-plus mr-2"></i>
                  <span class="font-medium">Club Results Venue</span>
                </router-link>
              </li>
              <li>
                <router-link
                  :to="{ name: 'ClubOverallResults' }"
                  v-ripple
                  class="flex align-items-center cursor-pointer p-3 hover:bg-bluegray-900 border-round text-bluegray-100 hover:text-bluegray-50 transition-duration-150 transition-colors p-ripple"
                >
                  <i class="pi pi-plus mr-2"></i>
                  <span class="font-medium">Club Results Overall</span>
                </router-link>
              </li>
            </ul>
          </li>
        </ul>
        <ul class="list-none p-3 m-0">
          <li>
            <div
              v-ripple
              class="flex align-items-center cursor-pointer p-3 hover:bg-bluegray-900 border-round text-bluegray-100 hover:text-bluegray-50 transition-duration-150 transition-colors p-ripple justify-content-between"
              v-styleclass="{
                selector: '@next',
                enterClass: 'hidden',
                enterActiveClass: 'slidedown',
                leaveToClass: 'hidden',
                leaveActiveClass: 'slideup',
              }"
            >
              <span class="font-medium">Athletes</span>
              <i class="pi pi-chevron-down"></i>
            </div>
            <ul class="list-none p-0 m-0 overflow-hidden">
              <li>
                <router-link
                  :to="{ name: 'AddAthletes' }"
                  v-ripple
                  class="flex align-items-center cursor-pointer p-3 hover:bg-bluegray-900 border-round text-bluegray-100 hover:text-bluegray-50 transition-duration-150 transition-colors p-ripple"
                >
                  <i class="pi pi-plus mr-2"></i>
                  <span class="font-medium">Add Athlete</span>
                </router-link>
              </li>
              <li>
                <router-link
                  :to="{ name: 'ViewAthletes' }"
                  v-ripple
                  class="flex align-items-center cursor-pointer p-3 hover:bg-bluegray-900 border-round text-bluegray-100 hover:text-bluegray-50 transition-duration-150 transition-colors p-ripple"
                >
                  <i class="pi pi-plus mr-2"></i>
                  <span class="font-medium">View Athletes</span>
                </router-link>
              </li>
              <li>
                <router-link
                  :to="{ name: 'AthleteVenueResults' }"
                  v-ripple
                  class="flex align-items-center cursor-pointer p-3 hover:bg-bluegray-900 border-round text-bluegray-100 hover:text-bluegray-50 transition-duration-150 transition-colors p-ripple"
                >
                  <i class="pi pi-plus mr-2"></i>
                  <span class="font-medium">Athlete Results</span>
                </router-link>
              </li>
            </ul>
          </li>
        </ul>
      </div>
      <div class="mt-auto">
        <hr class="mb-3 mx-3 border-top-1 border-none border-bluegray-600" />
        <ul
          class="list-none p-2 m-0 hidden origin-bottom animation-duration-150 overflow-hidden animation-ease-in-out"
        >
          <li>
            <a
              v-ripple
              class="flex align-items-center cursor-pointer p-3 hover:bg-bluegray-900 border-round text-bluegray-100 hover:text-bluegray-50 transition-duration-150 transition-colors p-ripple"
            >
              <i class="pi pi-cog mr-2"></i>
              <span class="font-medium">Settings</span>
            </a>
          </li>
          <li>
            <a
              v-ripple
              class="flex align-items-center cursor-pointer p-3 hover:bg-bluegray-900 border-round text-bluegray-100 hover:text-bluegray-50 transition-duration-150 transition-colors p-ripple"
            >
              <i class="pi pi-sign-out mr-2"></i>
              <span class="font-medium">Exit</span>
            </a>
          </li>
        </ul>
        <a
          v-ripple
          class="m-3 px-3 py-2 flex align-items-center hover:bg-bluegray-900 border-round cursor-pointer text-bluegray-100 hover:text-bluegray-50 transition-duration-150 transition-colors p-ripple"
          v-styleclass="{
            selector: '@prev',
            enterClass: 'hidden',
            enterActiveClass: 'slidedown',
            leaveToClass: 'hidden',
            leaveActiveClass: 'slideup',
          }"
        >
          <span class="font-medium">Menu</span>
          <i class="pi pi-chevron-up ml-auto"></i>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Dropdown from "primevue/dropdown";
import { useEventsStore } from '../stores/eventsStore';

const eventsStore = useEventsStore();
const venues = ref([]);
const selectedVenue = ref([]);

async function setVenue(venue_name: string) {
  console.log(venue_name.name);
  console.log(venue_name.id);
  eventsStore.setVenueName(venue_name.name)
  eventsStore.setVenueId(venue_name.id)
}
onMounted(async () => {
  const result = await window.electronAPI.fetchData('venues');
  venues.value = result.map((venue: any) => ({ name: venue.name, id: venue.id}));
});
</script>
<style>
li a {
  text-decoration: none;
}
</style>