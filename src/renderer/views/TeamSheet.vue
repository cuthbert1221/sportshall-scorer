<template>
    <div class="p-5">
      <h1>Team Sheet for {{ club }}</h1>
  
      <form @submit.prevent="saveTeamSheet">
        <div v-for="ageGroup in ageGroups" :key="ageGroup">
          <h2>{{ ageGroup }}</h2>
          
          <div v-for="gender in genders" :key="gender">
            <h3>{{ gender }}</h3>
  
            <Panel v-for="event in getEventsFor(ageGroup, gender)" :key="event.id" :header="event.eventDetail_name">
              <div v-for="n in event.clubMaxAthletes" :key="n" class="p-fluid">
                <div class="p-field" v-if="n == 1 || (event.signUps[n - 2] && event.signUps[n - 2].athlete_name) || event.type == 'Relay'">
                  <label for="athlete">Athlete {{ String.fromCharCode(64 + n) }}</label>
                  <Dropdown id="event"  v-model="event.signUps[n - 1]" :options="filterAthletes(teamId, gender, ageGroup, String.fromCharCode(64 + n))" optionLabel="athlete_name" :filter="true" filterBy="athlete_name" :showClear="true" placeholder="Select an Athlete" aria-describedby="dd-error" @update:modelValue="onChange(event, String.fromCharCode(64 + n), $event)">
                    <template #option="slotProps">
                        <div class="flex align-items-center">
                            <div >{{slotProps.option.athlete_name}}</div>
                        </div>
                    </template>
                </Dropdown>
                <div v-if="event.signUps[n - 1] && event.type != 'Relay'"> 
  <div style="color: red;" v-if="event.signUps[n - 1]?.athlete_id && isAthleteSelectedTwice(event.signUps[n - 1]?.athlete_id, event.signUps, n) && n > 1">
    Warning: This athlete has been selected twice for this event.
  </div>
</div>

                            
                </div>
                
              </div>
              <div style="color: red;" v-if="isAthleteListedTwice(event.signUps) && event.type == 'Relay'">
    Warning: Athlete selected mutiple times for relay
  </div>
            </Panel>
          </div>
        </div>
  
        <Button label="Save Team Sheet" @click="saveTeamSheet"/>
        <Toast />
      </form>
    </div>
  </template>
  
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import Panel from 'primevue/panel';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import { useRoute } from 'vue-router';
import {Athlete} from '../../main/interfaces.js';
import Dropdown from 'primevue/dropdown';
import { useToast } from 'primevue/usetoast';
import { useEventsStore } from '../stores/eventsStore';
const eventsStore = useEventsStore();

const toast = useToast();
const route = useRoute();
const teamId = ref(route.params.clubid);
interface SignUp {
  event_id: number;
  athlete_id: number;
  athlete_name: string;
  athlete_type: string;
  // Add other properties here
}
interface Event {
  agegroup: string;
  gender: string;
  id: number;
  eventDetail_name: string;
  signUps: SignUp[];
  clubMaxAthletes: number;
  // Add other properties here
}
const ageGroups = ref(['U11', 'U13', 'U15']); // Example age groups
const genders = ref(['Girl', 'Boy']); // 'G' for Girls, 'B' for Boys
const events = ref<Event[]>([]); // Will hold events data
const athletes = ref<Athlete[]>([]); // Will hold events data

const club = ref(""); // Will hold events data
const test = [ { "fullname": "Test", "id": 1 }, { "id": 2, "fullname": "Testing" } ]
const value = ref({ "fullname": "Test", "id": 1 })

// Fetch events from your database
const fetchEvents = async () => {
  //const result = await eventsStore.events;
  //const result = await window.electronAPI.fetchData('eventInstances');
  const result = await window.electronAPI.getEvents(eventsStore.venue_name)
  var i = 0;
  for (const event of result) {
    const signups = await window.electronAPI.getEventSignupClub( event.id, teamId.value);
    result[i].signUps = signups;
    for (let n = 0; n < maxAthletes; n++){
      if (result[i].signUps[n] == null){
        result[i].signUps[n] = {athlete_id: 0, athlete_name: ""};
      }
    }
    i++;
  }
  events.value = result
  console.log(events.value);
};

fetchEvents();
// Watch for changes in eventsStore.venue_name
watch(() => eventsStore.venue_name, fetchEvents);

const fetchAthletes = async () => {
  const result = await window.electronAPI.fetchData('athletes');
  athletes.value = result;
  console.log(athletes.value);
};

fetchAthletes();
fetchEvents();

const filterAthletes = (clubId: number, gender: string, ageGroup: string, athlete_type_letter: string) => {
  return athletes.value
    .filter(athlete => athlete.club == clubId && athlete.gender === gender && athlete.agegroup === ageGroup)
    .map(({ id, fullname, athlete_type }) => ({ athlete_id: id, athlete_name: fullname, athlete_type: athlete_type_letter}));
};

const getEventsFor = (ageGroup: any, gender: any) => {
    return events.value.filter(event => 
    event.agegroup === ageGroup && event.gender === gender
    );
};
const isAthleteSelectedTwice = (athleteId: number, signUps: SignUp[], n) => {
  if (!athleteId) return false;
  if(!signUps[1] || !signUps[1].athlete_id) {
    return false;
  }
  return signUps.filter(signUp => signUp.athlete_id === athleteId).length >= 2;
};

function isAthleteListedTwice(athletes: (Athlete | null)[]): boolean {
    const seenAthleteIds = new Set<number>();

    for (const athlete of athletes) {
        if (athlete && athlete.athlete_id) {
            if (seenAthleteIds.has(athlete.athlete_id)) {
                return true; // Duplicate found
            }
            seenAthleteIds.add(athlete.athlete_id);
        }
    }

    return false; // No duplicates
}


const maxAthletes = 2; // Maximum number of athletes per event per club

const onChange = async(eventIndex: any, type: any, athlete: any) => {
    console.log('Event index:', eventIndex);
    console.log('New value:', athlete); 
    var save_error = false;
    try {
      const deleted = await window.electronAPI.deleteEventSignupIndividual(eventIndex.id, teamId.value, type);
      console.log('Result:', deleted);
    }
    catch (error) {
      console.error('Error deleting data:', error);
    }
    if(athlete){
    try {
          
          const insert = await window.electronAPI.createEventSignup(eventIndex.id, teamId.value, athlete.athlete_id, athlete.athlete_type, eventIndex.type == 'Relay');
          console.log('Result:', insert);
        }
        catch (error) {
          save_error = true;
          console.error('Error inserting data:', error);
          toast.add({ severity: 'error', summary: 'Error', detail: 'Error message: ' + error, life: 9000 });
        }
        if (!save_error){
    toast.add({ severity: 'success', summary: 'Success', detail: 'Team Sheet saved"', life: 3000 });
  }
  else {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fully save, see above messages', life: 3000 });
  }
}
eventsStore.fetchEvents();
};

const saveTeamSheet = async () => {
  console.log(events.value);
  const resultDelete = await window.electronAPI.deleteEventSignupClub(teamId.value);
  var save_error = false;
  for (const event of events.value) {
    for (const athleteId of event.signUps) {
      console.log('Athlete ID:', athleteId);
      if (athleteId && athleteId.athlete_id != 0){
        try {

          const insert = await window.electronAPI.createEventSignup(event.id, teamId.value, athleteId.athlete_id, athleteId.athlete_type, event.type == 'Relay');
          console.log('Result:', insert);
        }
        catch (error) {
          save_error = true;
          console.error('Error inserting data:', error);
          toast.add({ severity: 'error', summary: 'Error', detail: 'Error message: ' + error, life: 9000 });
        }
       
      }
    }
  }
  if (!save_error){
    toast.add({ severity: 'success', summary: 'Success', detail: 'Team Sheet saved"', life: 3000 });
  }
  else {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fully save, see above messages', life: 3000 });
  }
};

const setClub = async () => {
  const result = await window.electronAPI.fetchData('clubs');
  for (const club_data of result) {
    if (club_data.id == teamId.value){
      console.log(club_data.name);
      club.value = club_data.name;
      }
  }
}
onMounted(() => {
  setClub();
  eventsStore.fetchEvents();
});
</script>
