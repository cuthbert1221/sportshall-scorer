<template>
  <div class="p-2">
    <h1>Enter Results for Event: {{ event.name }}</h1>
    <DataTable :value="athletes" editMode="cell" @cell-edit-complete="onCellEditComplete" showGridlines >
      <Column field="athlete_name" header="Name"></Column>
      <Column field="athlete_type" header="Type">
        <template #editor="{ data, field }">
            <InputText v-model="data[field]" />
        </template>
      </Column>
      <Column v-for="n in maxAttempts" :field="'attempts.' + (n-1) + '.result'" :header="'Attempt ' + n" :key="n">        <template #editor="{ data, field }">
            <InputText v-model="data.attempts[n-1].result" />
        </template>
      </Column>
    </DataTable>

    <Button label="Submit Results" @click="rankTeamSheet" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import { useRoute } from 'vue-router';
import { useEventsStore } from '../stores/eventsStore';
const eventsStore = useEventsStore();

const route = useRoute();

const event = ref({name: 'Event 1'}); // Populate with event data from EventDetails
const athletes = ref([]); // Populate with athlete data from EventSignUps
const maxAttempts = ref(3); // Assuming 3 attempts per athlete
const event_id = ref(route.params.eventid);
const fetchEventDetails = async () => {
  const signups = await window.electronAPI.getEventSignup(event_id.value);
  for (let i = 0; i < signups.length; i++) {
    const signup = signups[i];
    let attempts = await window.electronAPI.getEventSignupAttempt(signup.athlete_id, event_id.value);
    // Create an array of maxAttempts.value length and increment attempt_number by 1 for each element
    let attemptsArray = Array.from({ length: maxAttempts.value }, (_, i) => ({ result: '', attempt_number: i + 1 }));
    if (attempts) {
      console.log('attempts exist');
      // Replace the entries in attemptsArray for which attempts exist
      for (let attempt of attempts) {
        attemptsArray[attempt.attempt_number - 1] = attempt;
      }
    }
    signup.attempts = attemptsArray;
    signups[i] = signup;
  }
  console.log(signups);
  athletes.value = signups;
};

fetchEventDetails();

const typeAAthletes = () => {
  return athletes.value.filter(athlete => athlete.athlete_type === 'A');
}
const typeBAthletes = () => {
  return athletes.value.filter(athlete => athlete.athlete_type === 'B');
}

const submitResults = () => {
  // Submit logic goes here
  // Loop through athletes and their attempts to calculate the best result
  // and submit them to the backend or local database
};
const rankTeamSheet = async () => {
  await window.electronAPI.rankSignups(1);
  await window.electronAPI.scoreEvent(1);
};

const onCellEditComplete = async (event) => {
  let { data, newValue, field } = event;
  console.log(data);
  switch (field) {
    case 'type':
      console.log(newValue);
      if (newValue === 'A' || newValue === 'B') data[field] = newValue;
      break;
    default:
      if (field.startsWith('attempts')) {
        console.log(data.id, field.split('.')[1], newValue);
        let attempt_number = field.split('.')[1];
        if (!isNaN(data.attempts[attempt_number].result) && data.attempts[attempt_number].result.length != "" && data.attempts[attempt_number].result != null) {
          console.log('is number');
          let attempts = await window.electronAPI.createEventSignupAttempt(data.athlete_id, event_id.value, parseInt(attempt_number) + 1, data.attempts[attempt_number].result);
        } else {
          console.log('not number');
          // Should delete the attempt...
          let attempts = await window.electronAPI.deleteEventSignupAttempt(data.athlete_id, event_id.value, parseInt(attempt_number) + 1);
          data.attempts[attempt_number].result = "";
        } 
      } else {
        if (newValue && newValue.length > 0) data[field] = newValue;
      }
      break;
  }

};

</script>