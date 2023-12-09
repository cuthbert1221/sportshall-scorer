<template>
  <div>
      <h1>Events</h1>
      <ul>
        <li v-for="event in eventsStore.events" :key="event.id">
          {{ event.name }}
        </li>
      </ul>
    </div>
</template>
  
  <script setup lang="ts">
  import { onMounted } from 'vue';
  import { useEventsStore } from '../stores/eventsStore';
  
  const eventsStore = useEventsStore();
  
  onMounted(() => {
    eventsStore.fetchEvents();
  });
  </script>