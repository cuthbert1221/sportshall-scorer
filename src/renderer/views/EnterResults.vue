<template>
  <div class="p-2">
    <h1>Enter Results for Event: {{ event.name }}</h1>
    <DataTable v-if="event.type != 'Relay' && event.type != 'Paarluf'" :value="athletes" editMode="cell" @cell-edit-complete="onCellEditComplete" showGridlines >
      <Column field="athlete_name" header="Name"></Column>
      <Column field="club_name" header="Club"></Column>
      <Column field="lane" header="Lane"></Column>
      <Column field="athlete_type" header="Type">
        <template #editor="{ data, field }">
            <InputText v-model="data[field]" />
        </template>
      </Column>
      <Column v-for="n in maxAttempts" :field="'attempts.' + (n-1) + '.result'" :header="header(n)" :key="n">        <template #editor="{ data, field }">
            <InputNumber v-model.number="data.attempts[n-1].result" :maxFractionDigits="event.maxFractionDigits"/>
        </template>
      </Column>
      <Column field="position" header="Position"></Column>
    </DataTable>
    <DataTable v-else :value="clubs" editMode="cell" @cell-edit-complete="onCellEditCompleteRelay" showGridlines >
      <Column field="club_name" header="Name"></Column>
      <Column field="time" header="Time">        <template #editor="{ data, field }">
            <InputNumber v-model.number="data[field]" :maxFractionDigits="event.maxFractionDigits" />
        </template>
      </Column>
    </DataTable>
    <br>
    <!---<Button label="Submit Results" @click="rankTeamSheet" />-->
    <br>
    <br>
    <Button color="red" label="Set Lanes" @click="setLanes" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputNumber from 'primevue/inputnumber';
import { useRoute } from 'vue-router';
import { useEventsStore } from '../stores/eventsStore';
const eventsStore = useEventsStore();

const route = useRoute();

const event = ref({}); // Populate with event data from EventDetails
const athletes = ref([]); // Populate with athlete data from EventSignUps
const clubs = ref([]); // Populate with clubs data from EventSignUps
const maxAttempts = ref(3); // Assuming 3 attempts per athlete
const event_id = ref(route.params.eventid);
const fetchEventDetails = async () => {
  event.value = await window.electronAPI.getEvent(event_id.value);
  maxAttempts.value = event.value.number_attempts;
  if(event.value.type === 'Field' || event.value.type === 'Track') {
  const signups = await window.electronAPI.getEventSignup(event_id.value);
  for (let i = 0; i < signups.length; i++) {
    const signup = signups[i];
    let attempts = await window.electronAPI.getEventSignupAttempt(signup.athlete_id, event_id.value);
    // Create an array of maxAttempts.value length and increment attempt_number by 1 for each element
    let attemptsArray = Array.from({ length: maxAttempts.value }, (_, i) => ({ result: "", attempt_number: i + 1 }));
    if (attempts) {
      console.log('attempts exist');
      // Replace the entries in attemptsArray for which attempts exist
      for (let attempt of attempts) {
        if (!isNaN(attempt.result)) {
          attempt.result = Number(attempt.result);
        }
        attemptsArray[attempt.attempt_number - 1] = attempt;
      }
    }
    signup.attempts = attemptsArray;

    // Set the position of the signup
    signup.position = await window.electronAPI.getSignupPosition(event_id.value, signup.athlete_id)

    signups[i] = signup;
  }
  console.log(signups);
  athletes.value = signups;

} else {
  clubs.value = (await window.electronAPI.getRelayClubs(event_id.value)).map(club => {
    if (!isNaN(club.time)) {
      club.time = Number(club.time);
    }
    return club;
  });
}
};
const header = (n: number) => {
  if (event.value.type === 'Field'){
    return 'Attempt ' + n;
  } else if (event.value.type === 'Track' && n > 1){
    return 'Heat ' + n;
  } else {
    return 'Time';
  }
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
  await window.electronAPI.rankSignups(event_id.value);
  await window.electronAPI.scoreEvent(event_id.value);
  fetchEventDetails();
};

const setLanes = async () => {
  await window.electronAPI.setLanes(event_id.value);
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
        if (!isNaN(data.attempts[attempt_number].result) && data.attempts[attempt_number].result.length != "" && data.attempts[attempt_number].result != null && data.attempts[attempt_number].result != undefined && data.attempts[attempt_number].result != 0) {
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
const onCellEditCompleteRelay = async (event) => {
  let { data, newValue, field } = event;
  switch (field) {
    default:
      if (newValue && newValue > 0) {
        
        console.log(newValue);
        data[field] = newValue;
        let attempts = await window.electronAPI.createEventRelaySignupAttempt(data.club_id, event_id.value, data.time);
      } else {
          console.log('not number');
          // Should delete the attempt...
          let attempts = await window.electronAPI.deleteEventRelaySignupAttempt(data.club_id, event_id.value);
          data[field] = 0;
        } 
      break;
  }

};

</script>