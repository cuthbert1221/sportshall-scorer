
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
        <br />
        <Button class="ml-7" label="Reset to Default" @click="resetToDefault" />
        <Toast />
</template>
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
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

// Watch for changes in eventsStore.venue_name

const eventsStore = useEventsStore();

const fetchEvents = async () => {
    eventsStore.fetchEvents();
}

const resetToDefault = async () => {
    eventsStore.resetOrder();
    let event_tmp = {};
    event_tmp.value = eventsStore.events
    console.log(event_tmp);
    saveChanges(event_tmp);
}

watch(() => eventsStore.venue_name, fetchEvents);

onMounted(() => {
eventsStore.fetchEvents();
});

</script>
