<template>
    <div class="card">
      <DataTable v-model:filters="filters" :value="participants" paginator :rows="10" dataKey="id" filterDisplay="row" :loading="loading"
                 :globalFilterFields="['fullname', 'ageGroup', 'gender', 'club']">
        <template #header>
          <div class="flex justify-content-end">
            <span class="p-input-icon-left">
              <i class="pi pi-search" />
              <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
            </span>
          </div>
        </template>
        <template #empty> No participants found. </template>
        <template #loading> Loading participants data. Please wait. </template>
        <Column field="fullname" header="Fullname" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.fullname }}
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Search by fullname" />
          </template>
        </Column>
        <Column field="ageGroup" header="Age Group" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.ageGroup }}
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Search by age group" />
          </template>
        </Column>
        <Column field="gender" header="Gender" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.gender }}
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Search by gender" />
          </template>
        </Column>
        <Column field="club" header="Club" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.club }}
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Search by club" />
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

const participants = ref();
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  fullname: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  ageGroup: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  gender: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  club: { value: null, matchMode: FilterMatchMode.STARTS_WITH }
});
const loading = ref(true);

const loadData = async () => {
  try {
    const query = "SELECT * FROM participants";
    const result = await window.electronAPI.readDataFromDb(query);
    participants.value = result;
    loading.value = false;
  } catch (error) {
    console.error('Error reading data:', error);
  }
};

onMounted(loadData);
</script>
