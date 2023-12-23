<template>
    <div>
      <!-- <DataTable :value="athletesStore.bestAthletesByCategory" sortMode="multiple" removableSort>
        <Column field="category" header="Category"></Column>
        <Column field="club_name" header="Club Name"></Column>
        <Column field="total_points" header="Total Points"></Column>
      </DataTable> -->
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import DataTable from 'primevue/datatable';
  import Column from 'primevue/column';

  const fethData = async () => {
    let athlete_id = 1;
    let venue = 1;
    const results = await window.electronAPI.getAthleteScoreVenue(athlete_id, venue);
    console.log(results);
};
  fethData();
  </script>