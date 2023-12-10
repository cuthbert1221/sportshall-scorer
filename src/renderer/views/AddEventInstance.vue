<template>
  <div class="surface-ground px-4 py-8 md:px-6 lg:px-8">
    <div class="text-900 font-medium text-xl mb-3">Add Event</div>
    <div class="surface-card p-4 shadow-2 border-round">
      <form v-on:submit.prevent="onSubmit" class="flex flex-column gap-2">
        <div class="grid formgrid p-fluid">

          <div class="field mb-4 col-12">
            <label for="event" class="font-medium text-900">Event</label> 
                <Dropdown id="event"  v-model="state.eventDetail_name" :options="eventDetails" optionLabel="name" :filter="true" filterBy="name" :showClear="true" placeholder="Select an Event" aria-describedby="dd-error" @blur="v$.eventDetail_name.$touch">
                    <template #option="slotProps">
                        <div class="flex align-items-center">
                            <div>{{slotProps.option.name}}</div>
                        </div>
                    </template>
                </Dropdown>
                <div v-for="error of v$.eventDetail_name.$errors" :key="error.$uid">
                    <small class="p-error" id="text-error">{{ error.$message }}</small>
                </div>
            </div>
            <div class="field mb-4 col-12">
              <label for="venue" class="font-medium text-900">Venue</label> 
                <Dropdown id="venue"  v-model="state.venue_name" :options="venues" optionLabel="name" :filter="true" filterBy="name" :showClear="true" placeholder="Select a Venue" aria-describedby="dd-error" @blur="v$.venue_name.$touch">
                    <template #option="slotProps">
                        <div class="flex align-items-center">
                            <div>{{slotProps.option.name}}</div>
                        </div>
                    </template>
                </Dropdown>
                <div v-for="error of v$.venue_name.$errors" :key="error.$uid">
                    <small class="p-error" id="text-error">{{ error.$message }}</small>
                </div>
            </div> 
          <div class="field mb-4 col-12">
            <label for="agegroup" class="font-medium text-900">Age Group</label>
            <Dropdown
              id="agegroup"
              v-model="state.agegroup"
              :options="ageGroups"
              optionLabel="name"
              :filter="false"
              placeholder="Select an age group"
              @blur="v$.agegroup.$touch"
            />
            <div v-for="error of v$.agegroup.$errors" :key="error.$uid">
              <small class="p-error" id="text-error">{{
                error.$message
              }}</small>
            </div>
          </div>
          <div class="field mb-4 col-12">
            <label for="gender" class="font-medium text-900">Gender</label>
            <Dropdown
              id="gender"
              v-model="state.gender"
              :options="genders"
              optionLabel="name"
              :filter="false"
              placeholder="Select a gender"
              @blur="v$.gender.$touch"
            />
            <div v-for="error of v$.gender.$errors" :key="error.$uid">
              <small class="p-error" id="text-error">{{
                error.$message
              }}</small>
            </div>
          </div>
        </div>
        <Button type="submit" label="Add Event" class="w-auto mt-3"></Button>
      </form>
      <Toast />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import { useToast } from "primevue/usetoast";
import { useVuelidate } from "@vuelidate/core";
import { required } from "@vuelidate/validators";

const toast = useToast();

const initialState = {
  agegroup: "",
  gender: "",
  eventDetail_name: "",
  venue_name: "",
};

const state = reactive({ ...initialState });

const rules = {
  agegroup: { required }, // Matches state.agegroup
  gender: { required }, // Matches state.scoringMethod
  eventDetail_name: { required }, // Matches state.scoringMethod
  venue_name: { required } // Matches state.scoringMethod
};

const v$ = useVuelidate(rules, state);

const genders = [
    { name: 'Girl', code: 'G' },
    { name: 'Boy', code: 'B' },
]
const ageGroups = [
  { name: "U11", code: "U11" },
  { name: "U13", code: "U13" },
  { name: "U15", code: "U15" },
];

const scoringMethods = [
  { name: "Highest Wins", code: "highest" },
  { name: "Lowest Wins", code: "lowest" },
];

async function onSubmit() {
  const isFormCorrect = await v$.value.$validate();
  if (!isFormCorrect) return;

  const event = JSON.parse(JSON.stringify(state));
  event.agegroup = event.agegroup.name; // Use the age group name as a string
  event.gender = event.gender.name; // Use the gender name as a string

  const creation = await window.electronAPI.createEventInstance(event);

  if (typeof creation === "number") {
    toast.add({
      severity: "success",
      summary: "Success",
      detail: "Event created, ID: " + creation,
      life: 3000,
    });
    resetState();
  } else {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Error message: " + creation,
      life: 3000,
    });
  }
}

function resetState() {
  Object.assign(state, initialState);
  v$.value.$reset();
}

let eventDetails = ref([]);
let venues = ref([]);

async function fetchData() {
    const raw_eventDetails = await window.electronAPI.fetchData('eventDetails');
    eventDetails.value = raw_eventDetails.map((event: any) => ({ name: event.name }));
    const raw_venues = await window.electronAPI.fetchData('venues');
    venues.value = raw_venues.map((venues: any) => ({ name: venues.name }));
}

fetchData();
</script>
 