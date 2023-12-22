<template>
  <div>
    <Button
      label="Add Venue"
      icon="pi pi-plus"
      class="p-button-success m-3"
      @click="displayAddVenueDialog = true"
    ></Button>
    <DataTable
      :value="venues"
      editMode="cell"
      @cell-edit-complete="onCellEditComplete"
    >
      <Column field="id" header="ID"></Column>
      <Column field="name" header="Venue Name"
        ><template #editor="{ data, field }"
          ><InputText v-model="data[field]" autofocus /></template
      ></Column>
      <Column field="date" header="Date"><template #editor="{ data, field }"
          >
          <Calendar v-model="data[field]" showIcon iconDisplay="input"  dateFormat="yy-mm-dd" :minDate="minDate">
</Calendar>
        </template>
        </Column>
      <Column>
        <template #body="slotProps">
          <Button
            icon="pi pi-trash"
            class="p-button-danger"
            @click="confirmDelete(slotProps.data)"
          ></Button>
        </template>
      </Column>
    </DataTable>

<Dialog
    v-model:visible="displayAddVenueDialog"
    modal
    header="Add Venue"
    position="top"
    :pt="{
        mask: {
            style: 'backdrop-filter: blur(2px)'
        }
    }"
>
    <template #container="{ closeCallback }">
        <div class="flex flex-column px-8 py-5 gap-4" style="border-radius: 12px; background-image: radial-gradient(circle at left top, var(--primary-400), var(--primary-700))">
            <div class="inline-flex flex-column gap-2">
              <InputText v-model="newVenue.name" placeholder="Venue Name"></InputText>
            </div>
            <div class="inline-flex flex-column gap-2">
              <Calendar v-model="newVenue.date" showIcon iconDisplay="input"  dateFormat="yy-mm-dd" :minDate="minDate" />
            </div>
            <div class="flex align-items-center gap-2">
                <Button label="Add" @click="addVenue" text class="p-3 w-full text-primary-50 border-1 border-white-alpha-30 hover:bg-white-alpha-10"></Button>
                <Button label="Cancel" @click="closeCallback" text class="p-3 w-full text-primary-50 border-1 border-white-alpha-30 hover:bg-white-alpha-10"></Button>
            </div>
        </div>
    </template>
</Dialog>


    <ConfirmDialog></ConfirmDialog>
    <Toast />
  </div>
</template>
  
  <script setup lang="ts">
import { ref } from "vue";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Dialog from "primevue/dialog";
import ConfirmDialog from "primevue/confirmdialog";
import InputText from "primevue/inputtext";
import Calendar from "primevue/calendar";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";

const confirm = useConfirm();
const toast = useToast();
const venues = ref([]);
const newVenue = ref({ name: "", date: "" });
const displayAddVenueDialog = ref(false);
const displayDeleteVenueDialog = ref(false);
let venueToDelete = ref(null);

const date = ref();
const minDate = ref(new Date());
let today = new Date();
let month = today.getMonth();
let year = today.getFullYear();
let prevMonth = (month === 0) ? 11 : month -1;
let prevYear = (prevMonth === 11) ? year - 1 : year;
minDate.value.setMonth(prevMonth);
minDate.value.setFullYear(prevYear);
minDate.value = today;

const fetchVenues = async () => {
  console;
  venues.value = await window.electronAPI.fetchData("venues");
};

const confirmDelete = (venue: object) => {
  confirm.require({
    message: "Are you sure you want to delete?",
    header: "Confirmation",
    icon: "pi pi-exclamation-triangle",
    accept: () => {
      deleteVenue(venue.id);
      toast.add({
        severity: "info",
        summary: "Confirmed",
        detail: "Venue deleted",
        life: 3000,
      });
    },
    reject: () => {
      toast.add({
        severity: "error",
        summary: "Rejected",
        detail: "Venue not deleted",
        life: 3000,
      });
    },
  });
};
const addVenue = async () => {
  // Replace this with your actual function to add a venue
  //await addVenueToDatabase(newVenue.value);
  if(newVenue.value.name == ""){
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Venue name cannot be empty",
      life: 3000,
    });
    return;
  }
  if(newVenue.value.Date == ""){
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Venue date cannot be empty",
      life: 3000,
    });
    return;
  }
  let date = new Date(newVenue.value.date);
  let formattedDate = date.getFullYear() + '-' + ('0' + (date.getMonth()+1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
  newVenue.value.date = formattedDate;
  const creation = { name: newVenue.value.name, date: newVenue.value.date}
  await window.electronAPI.createVenue(creation);

  console.log(newVenue.value);
  newVenue.value = { name: "", date: "" };
  displayAddVenueDialog.value = false;
  await fetchVenues();
};

const deleteVenue = async (id: number) => {
  console.log("id: " + id);
  await window.electronAPI.deleteVenue(id);
  await fetchVenues();
};

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
  const creation = { name: data.name, date: data.date, id: data.id }
  console.log(creation);
  await window.electronAPI.updateVenue(creation);
};

fetchVenues();
</script>