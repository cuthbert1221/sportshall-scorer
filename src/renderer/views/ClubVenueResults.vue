<template>
    <div>
      <DataTable :value="clubs_rank" sortMode="multiple" removableSort>
        <Column field="club_id" header="CLub ID"></Column>
        <Column field="name" header="Club Name"></Column>
        <Column field="points" header="Total Points"></Column>
      </DataTable> 
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import DataTable from 'primevue/datatable';
  import Column from 'primevue/column';

  const clubs_rank = ref([]);

  const fethData = async () => {
    let athlete_id = 1;
    let venue = 1;
    const results = await window.electronAPI.getAthleteScoreVenue(athlete_id, venue);
    const clubs_tres = await window.electronAPI.rankClubTotalVenue(venue);
    clubs_rank.value = await window.electronAPI.getClubPointsVenue(venue);
    console.log(clubs_rank.value);
    console.log(results);
};
  fethData();
  </script>