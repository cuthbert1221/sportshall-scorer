<template>
  <div v-if="loading" class="text-center">
    <h1>Overall Results</h1>
    <ProgressSpinner />

    <div>Loading...</div>
  </div>
  <div class="m-3" v-else>
    <div class="text-center"><h1>Overall Results</h1></div>
    <div v-for="(data, key) in clubPointsData" :key="key">
      <h3 v-if="!key.includes('_Mixed')">{{ key.replace('_', ' ') }}'s</h3>
      <h3 v-else-if="key.includes('Mixed_')">Overall</h3>
      <DataTable :value="data" sortMode="multiple" removableSort v-if="!key.includes('_Mixed')|| key.includes('Mixed_')">
        <Column field="club_id" header="Club ID"></Column>
        <Column field="name" header="Club Name"></Column>
        <Column field="TotalDynamicPoints" header="Total Points"></Column>
      </DataTable>
    </div>
  </div>
  
</template>

  
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { useEventsStore } from '../stores/eventsStore';
import ProgressSpinner from 'primevue/progressspinner';

const eventsStore = useEventsStore();

const agegroups = ['U11', 'U13', 'U15', 'Mixed'];
const genders = ['Girl', 'Boy', 'Mixed'];
const clubPointsData = ref({});

const loading = ref(true);

const fetchData = async () => {
  let athlete_id = 1;
  loading.value = true;
  const results = await window.electronAPI.getAthleteScoreVenue(athlete_id, eventsStore.venue_id);
  const clubs_tres = await window.electronAPI.rankClubTotalVenue(eventsStore.venue_id);
  loading.value = false;
  for (const agegroup of agegroups) {
    for (const gender of genders) {
      const key = `${agegroup}_${gender}`;
      clubPointsData.value[key] = await window.electronAPI.getClubPointsOverall(agegroup, gender);
    }
  }
  console.log(clubPointsData.value);
};

onMounted(fetchData);
// Watch for changes in eventsStore.venue_name
watch(() => eventsStore.venue_name, fetchData);
</script>
