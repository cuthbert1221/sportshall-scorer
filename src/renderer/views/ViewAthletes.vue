<template>
    <div class="card">
      <DataTable v-model:filters="filters" :value="athletes" paginator :rows="10" dataKey="id" filterDisplay="row" :loading="loading" editMode="cell" @cell-edit-complete="onCellEditComplete"
                 :globalFilterFields="['fullname', 'ageGroup', 'gender', 'club']">
        <template #header>
          <div class="flex justify-content-end">
            <span class="p-input-icon-left">
              <i class="pi pi-search" />
              <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
            </span>
          </div>
        </template>
        <template #empty> No athletes found. </template>
        <template #loading> Loading athletes data. Please wait. </template>
        <Column field="id" header="ID" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.id }}
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Search by ID" />
          </template>
        </Column>
        <Column field="fullname" header="Fullname" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.fullname }}
          </template>
          <template #editor="{ data, field }">
            <template v-if="field !== 'price'">
                <InputText v-model="data[field]" autofocus />
            </template>
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Search by fullname" />
          </template>
        </Column>
        <Column field="agegroup" header="Age Group" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.agegroup }}
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <Dropdown id="club" v-model="filterModel.value" :options="ageGroups" :filter="false" placeholder="Select an age group" @change="filterCallback()">
                    <template #option="slotProps">
                        <div class="flex align-items-center">
                            <div>{{slotProps.option}}</div>
                        </div>
                    </template>
                </Dropdown>       
              </template>
        </Column>
        <Column field="gender" header="Gender" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.gender }}
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <Dropdown id="club" v-model="filterModel.value" :options="genders" :filter="false" placeholder="Select a gender" @change="filterCallback()">
                    <template #option="slotProps">
                        <div class="flex align-items-center">
                            <div>{{slotProps.option}}</div>
                        </div>
                    </template>
                </Dropdown>         
               </template>
        </Column>
        <Column field="club_name" header="Club" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.club_name }}
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <Dropdown id="club"  v-model="filterModel.value" :options="clubs" :showClear="true" placeholder="Select a Club" aria-describedby="dd-error" @change="filterCallback()">
                    <template #option="slotProps">
                        <div class="flex align-items-center">
                            <div>{{slotProps.option}}</div>
                        </div>
                    </template>
                </Dropdown>
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
import Dropdown from 'primevue/dropdown';
import { useGenericStore } from '../stores/genericStore';
const genericStore = useGenericStore()

const athletes = ref();
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  fullname: { value: null, matchMode: FilterMatchMode.CONTAINS },
  agegroup: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  id: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  gender: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  club_name: { value: null, matchMode: FilterMatchMode.STARTS_WITH }
});
const loading = ref(true);
const clubs = ref<string[]>([]);
const gendersObjects = genericStore.genders
const genders: string[] = []
for (var gender of gendersObjects) {
  genders.push(gender.name as string);
}
const ageGroupsObjects = genericStore.ageGroups
const ageGroups: string[] = []
for (var ageGroup of ageGroupsObjects) {
  ageGroups.push(ageGroup.name as string);
}


const onCellEditComplete = async (event) => {
  let { data, newValue, field } = event;

  switch (field) {
    case "date":
      console.log(newValue);
      let date = new Date(newValue);
      let formattedDate = date.getFullYear() + '-' + ('0' + (date.getMonth()+1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
      data[field] = formattedDate;
      console.log(formattedDate);
      break;

    default:
      console.log(newValue);
      data[field] = newValue;
      console.log(data);
      break;
  }
  // Update row in database
  const creation = { fullname: data.fullname, club: data.club, agegroup: data.agegroup, gender: data.gender, id: data.id }
  console.log(creation);
  await window.electronAPI.updateAthlete(creation);
};

const loadData = async () => {
  try {
    const result = await window.electronAPI.fetchData('athletes');
    athletes.value = result;
    const club_list = await window.electronAPI.fetchData('clubs');
    for (var club of club_list) {
      clubs.value.push(club.name as string);
    }  
    loading.value = false;
  } catch (error) {
    console.error('Error reading data:', error);
  }
};

onMounted(loadData);
</script>
