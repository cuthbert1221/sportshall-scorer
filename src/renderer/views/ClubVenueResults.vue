<template>
  <div class="m-3">
    <div v-for="(data, key) in clubPointsData" :key="key">
      <h3 v-if="!key.includes('_Mixed')">{{ key.replace('_', ' ') }}'s</h3>
      <h3 v-else-if="key.includes('Mixed_')">Overall</h3>
      <DataTable :value="data" sortMode="multiple" removableSort v-if="!key.includes('_Mixed')|| key.includes('Mixed_')">
        <Column field="club_id" header="Club ID"></Column>
        <Column field="name" header="Club Name"></Column>
        <Column field="points" header="Total Points"></Column>
      </DataTable>
    </div>
  </div>
</template>

  
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const agegroups = ['U11', 'U13', 'U15', 'Mixed'];
const genders = ['Girl', 'Boy', 'Mixed'];
const venue = 1;
const clubPointsData = ref({});

const fetchData = async () => {
  let athlete_id = 1;
  const results = await window.electronAPI.getAthleteScoreVenue(athlete_id, venue);
  const clubs_tres = await window.electronAPI.rankClubTotalVenue(venue);
  for (const agegroup of agegroups) {
    for (const gender of genders) {
      const key = `${agegroup}_${gender}`;
      clubPointsData.value[key] = await window.electronAPI.getClubPointsVenue(venue, agegroup, gender);
    }
  }
  console.log(clubPointsData.value);
};

onMounted(fetchData);
</script>
