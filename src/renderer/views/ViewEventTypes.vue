<template>
    <div class="card">
      <DataTable v-model:filters="filters" :value="EventDetails" paginator :rows="10" dataKey="id" filterDisplay="row" :loading="loading" editMode="cell" @cell-edit-complete="onCellEditComplete"
                 :globalFilterFields="['name', 'type', 'scoringMethod', 'number_attempts', 'maxFractionDigits']">
        <template #header>
          <div class="flex justify-content-end">
            <span class="p-input-icon-left">
              <i class="pi pi-search" />
              <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
            </span>
          </div>
        </template>
        <template #empty> No Event Details found. </template>
        <template #loading> Loading event data. Please wait. </template>
        <Column field="name" header="Name" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.name }}
          </template>
          <!--
          <template #editor="{ data, field }">
                <InputText v-model="data[field]" autofocus />
          </template>
        -->
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Search by Name" />
          </template>
        </Column>
        <Column field="type" header="Type" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.type }}
          </template>
          <template #editor="{ data, field }">
            <Dropdown
              id="type"
              v-model="data.type"
              :options="types"
              optionLabel="name"
              :filter="false"
              placeholder="Select a type"
            />
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Search by Type" />
          </template>
        </Column>
        <Column field="scoringMethod" header="Scoring Method" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.scoringMethod }}
          </template>
          <template #editor="{ data, field }">
            <Dropdown
              id="scoringMethod"
              v-model="data.scoringMethod"
              :options="scoringMethods"
              optionLabel="name"
              :filter="false"
              placeholder="Select a scoring method"
            />
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Search by Method" />
          </template>
        </Column>
        <Column field="number_attempts" header="Number Attempts" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.number_attempts }}
          </template>
          <template #editor="{ data, field }">
            <InputNumber v-model="data.number_attempts" inputId="integeronly" showButtons :min="1" :max="10"/>
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Search by Number" />
          </template>
        </Column>
        <Column field="maxFractionDigits" header="maxFractionDigits" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.maxFractionDigits }}
          </template>
          <template #editor="{ data, field }">
            <InputNumber v-model="data.maxFractionDigits" inputId="integeronly" showButtons :min="0" :max="10"/>
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Search by Number" />
          </template>
        </Column>

      </DataTable>
    </div>
  </template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { FilterMatchMode } from 'primevue/api';
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Dropdown from 'primevue/dropdown';
import { useGenericStore } from '../stores/genericStore';
const genericStore = useGenericStore()

const EventDetails = ref();
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  name: { value: null, matchMode: FilterMatchMode.CONTAINS },
  type: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  scoringMethod: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  number_attempts: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  maxFractionDigits: { value: null, matchMode: FilterMatchMode.STARTS_WITH }
});
const loading = ref(true);

const types = [
  { name: "Track", code: "T" },
  { name: "Field", code: "F" },
  { name: "Relay", code: "R" },
  { name: "Paarluf ", code: "P" },
];

const scoringMethods = [
  { name: "Highest Wins", code: "Highest" },
  { name: "Lowest Wins", code: "Lowest" },
];

const onCellEditComplete = async (event) => {
  let { data, newValue, field } = event;

  switch (field) {
    case "type":
      if (newValue.name){
        data["type"] = newValue.name;
      }
      break;
    case "scoringMethod":
      if (newValue.name){
        data["scoringMethod"] = newValue.code;
      }
      break;

    default:
      console.log(newValue);
      data[field] = newValue;
      console.log(data);
      break;
  }
  // Update row in database
  const creation = { name: data.name, type: data.type, scoringMethod: data.scoringMethod, number_attempts: data.number_attempts, maxFractionDigits: data.maxFractionDigits }
  console.log(creation);
  await window.electronAPI.updateEventDetail(creation);
};

const loadData = async () => {
  try {
    const result = await window.electronAPI.fetchData('eventDetails');
    EventDetails.value = result;
    loading.value = false;
  } catch (error) {
    console.error('Error reading data:', error);
  }
};

onMounted(loadData);
</script>
