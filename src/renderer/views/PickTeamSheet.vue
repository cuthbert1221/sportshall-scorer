<template>
    <div class="p-d-flex p-jc-center p-ai-center p-mt-6">
      <Card class="p-col-8">
        <template #title> Clubs </template>
        <template #content>
        <DataTable :value="clubs">
          <Column field="name" header="Club Name"></Column>
          <Column>
            <template #body="slotProps">
              <router-link :to="{ name: 'TeamSheet', params: { clubid: slotProps.data.id } }">
                <Button :label="'View '+ slotProps.data.name +' Team Sheet'" icon="pi pi-eye" class="p-button-success"></Button>
              </router-link>
            </template>
          </Column>
        </DataTable>
        </template>
      </Card>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import Card from 'primevue/card';
  import DataTable from 'primevue/datatable';
  import Column from 'primevue/column';
  import Button from 'primevue/button';
  import { useRoute, useRouter } from 'vue-router';
  
  const clubs = ref([]);
  
  async function fetchData() {

}
  onMounted(async () => {
    const result = await window.electronAPI.fetchData('clubs');
    console.log(result);
    clubs.value = result.map((club: any) => ({ name: club.name, id: club.id }));
  });
  </script>
  
  <style scoped>
  .p-d-flex {
    display: flex;
  }
  .p-jc-center {
    justify-content: center;
  }
  .p-ai-center {
    align-items: center;
  }
  .p-mt-6 {
    margin-top: 2rem;
  }
  </style>