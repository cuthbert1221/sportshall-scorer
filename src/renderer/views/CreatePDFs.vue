<template>
  <div>
      <h1>PDFs</h1>
      <p>Writen PDFs, I hope....</p>
    </div>
</template>
  
  <script setup lang="ts">
  import { onMounted } from 'vue';
  import { useEventsStore } from '../stores/eventsStore';
  
  const eventsStore = useEventsStore();
  
  onMounted(() => {
    eventsStore.fetchEvents();
    fethData();
  });

  const fethData = async () => {
    await window.electronAPI.setPDFs(eventsStore.venue_id);
  }
  </script>