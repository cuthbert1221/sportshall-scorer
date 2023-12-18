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

const event = ref({name: 'Event 1'}); // Populate with event data from EventDetails
const athletes = ref([]); // Populate with athlete data from EventSignUps
const maxAttempts = ref(3); // Assuming 3 attempts per athlete

const fetchEvents = async () => {
  const signups = await window.electronAPI.getEventSignup(1);
  for (let i = 0; i < signups.length; i++) {
    const signup = signups[i];
    let attempts = await window.electronAPI.getEventSignupAttempt(signup.id);
    if (!attempts) {
      attempts = [];
    }
    while (attempts.length < maxAttempts.value) {
      attempts.push({ result: '' });
    }
    signup.attempts = attempts;
    signups[i] = signup;
  }
  console.log(signups);
  athletes.value = signups;
};

fetchEvents();

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
        let attempts = await window.electronAPI.createEventSignupAttempt(data.id, attempt_number+1, data.attempts[attempt_number].result);
      } else {
        if (newValue && newValue.length > 0) data[field] = newValue;
      }
      break;
  }
};

</script>