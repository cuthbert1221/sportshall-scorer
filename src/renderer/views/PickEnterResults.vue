<template>
  <div>
    <DataTable :value="eventsStore.events" sortMode="multiple" removableSort >
      <Column field="id" header="ID"></Column>
      <Column header="Full Name">
          <template #body="slotProps">
            {{ slotProps.data.eventDetail_name }} {{ slotProps.data.agegroup }}{{ slotProps.data.gender[0] }}
          </template>
      </Column>
      <Column field="eventDetail_name" header="Event" sortable ></Column>
      <Column field="gender" header="Gender" sortable ></Column>
      <Column field="agegroup" header="Age Group" sortable ></Column>
      <Column field="type" header="Type" sortable ></Column>
      <Column field="display_order" header="Scheudle #"></Column>
      <Column>
        <template #body="slotProps">
          <router-link :to="{ name: 'EnterResults', params: { eventid: slotProps.data.id } }">
            <Button label="Enter Results"></Button>
          </router-link>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import { useRoute, useRouter } from 'vue-router';
import { useEventsStore } from '../stores/eventsStore';
const eventsStore = useEventsStore();
const fetchEvents = async () => {
    eventsStore.fetchEvents();
}

watch(() => eventsStore.venue_name, fetchEvents);
onMounted(() => {
  eventsStore.fetchEvents();
});
</script>