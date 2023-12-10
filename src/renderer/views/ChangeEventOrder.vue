
<template>
        <OrderList v-model="eventsStore.events" listStyle="height:auto; max-height:50rem" dataKey="id" @reorder="saveChanges">
            <template #header> List of Events </template>
            <template #item="slotProps">
                      <tr>
        <td>ID: {{ slotProps.item.id }}</td>
        <td>{{ slotProps.item.eventDetail_name }}</td>
        <td>{{ slotProps.item.agegroup }}</td>
        <td>{{ slotProps.item.gender }}</td>
        <td>{{ slotProps.item.venue_name }}</td>
      </tr>
            </template>
        </OrderList>
        <Toast />
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import OrderList from "primevue/orderlist";
import { useEventsStore } from '../stores/eventsStore';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

async function saveChanges(event: any) {
    console.log(event.value);
    const json_event = JSON.parse(JSON.stringify(event.value));
    const creation = await window.electronAPI.updateMultipleEventsOrder(json_event);
    if (creation != "success"){
        console.log("Error updating event order");
        toast.add({ severity: 'error', summary: 'Error', detail: 'Error message: ' + creation, life: 3000 });
    }
    console.log(creation);
}
  
const eventsStore = useEventsStore();
  
onMounted(() => {
eventsStore.fetchEvents();
});

</script>
