<template>
  <div class="surface-ground px-4 py-8 md:px-6 lg:px-8">
    <div class="text-900 font-medium text-xl mb-3">Add Event</div>
    <div class="surface-card p-4 shadow-2 border-round">
      <form v-on:submit.prevent="onSubmit" class="flex flex-column gap-2">
        <div class="grid formgrid p-fluid">
          <div class="field mb-4 col-12">
            <label for="name" class="font-medium text-900">Event Name</label>
            <InputText
              id="name"
              type="text"
              v-model="state.name"
              @update:modelValue="v$.name.$touch"
            />
            <small id="event-help">Enter the generic event name. eg. Long Jump</small>
            <div v-for="error of v$.name.$errors" :key="error.$uid">
              <small class="p-error" id="text-error">{{
                error.$message
              }}</small>
            </div>
          </div>
          <div class="field mb-4 col-12">
            <label for="type" class="font-medium text-900">Type</label>
            <Dropdown
              id="type"
              v-model="state.type"
              :options="types"
              optionLabel="name"
              :filter="false"
              placeholder="Select a type"
              @blur="v$.type.$touch"
            />
            <div v-for="error of v$.type.$errors" :key="error.$uid">
              <small class="p-error" id="text-error">{{
                error.$message
              }}</small>
            </div>
          </div>
          <div class="field mb-4 col-12">
            <label for="scoringMethod" class="font-medium text-900"
              >Scoring Method</label
            >
            <Dropdown
              id="scoringMethod"
              v-model="state.scoringMethod"
              :options="scoringMethods"
              optionLabel="name"
              :filter="false"
              placeholder="Select a scoring method"
              @blur="v$.scoringMethod.$touch"
            />
            <div v-for="error of v$.scoringMethod.$errors" :key="error.$uid">
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
  name: "",
  type: "",
  scoringMethod: ""
};

const state = reactive({ ...initialState });

const rules = {
  name: { required }, // Matches state.name
  type: { required }, // Matches state.type
  scoringMethod: { required }, // Matches state.scoringMethod
};

const v$ = useVuelidate(rules, state);

const types = [
  { name: "Track", code: "T" },
  { name: "Field", code: "F" },
  { name: "Relay", code: "R" },
  { name: "Paarluf ", code: "P" },
];

const scoringMethods = [
  { name: "Highest Wins", code: "highest" },
  { name: "Lowest Wins", code: "lowest" },
];

async function onSubmit() {
  const isFormCorrect = await v$.value.$validate();
  if (!isFormCorrect) return;

  const event = JSON.parse(JSON.stringify(state));
  event.type = event.type.name; // Use the type name as a string
  event.scoringMethod = event.scoringMethod.code; 

  const creation = await window.electronAPI.createEventDetail(event);

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
</script>
 