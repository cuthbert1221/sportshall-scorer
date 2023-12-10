
<template>
  <div class="card p-fluid">
    <DataTable
      :value="products"
      editMode="cell"
      showGridlines 
      @cell-edit-complete="onCellEditComplete"
      :pt="{
        table: { style: 'min-width: 50rem' },
        column: {
            bodycell: ({ state }) => ({
                class: { 'pt-0 pb-0': state['d_editing'] },
          }),
        }
      }"
    >
      <Column
        v-for="col of columns"
        :key="col.field"
        :field="col.field"
        :header="col.header"
        style="width: 25%"
      >
        <template #body="{ data, field }">
          {{ field === "price" ? formatCurrency(data[field]) : data[field] }}
        </template>
        <template #editor="{ data, field }">
          <template v-if="field !== 'price'">
            <InputText v-model="data[field]" autofocus />
          </template>
          <template v-else>
            <InputNumber
              v-model="data[field]"
              mode="currency"
              currency="USD"
              locale="en-US"
              autofocus
            />
          </template>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputNumber from "primevue/inputnumber";

const products = ref();
const columns = ref([
  { field: "code", header: "Code" },
  { field: "name", header: "Name" },
  { field: "quantity", header: "Quantity" },
  { field: "price", header: "Price" },
]);

products.value = [
  {
    code: "A123",
    name: "Hard Drive",
    quantity: 1,
    price: 89.99,
  },
  {
    code: "B456",
    name: "Memory",
    quantity: 2,
    price: 49.99,
  },
  {
    code: "C789",
    name: "Video Card",
    quantity: 1,
    price: 139.99,
  },
];
const onCellEditComplete = (event: any) => {
  let { data, newValue, field } = event;

  switch (field) {
    case "quantity":
    case "price":
      if (isPositiveInteger(newValue)) data[field] = newValue;
      else event.preventDefault();
      break;

    default:
      if (newValue.trim().length > 0) data[field] = newValue;
      else event.preventDefault();
      break;
  }
};
const isPositiveInteger = (val: any) => {
  let str = String(val);

  str = str.trim();

  if (!str) {
    return false;
  }

  str = str.replace(/^0+/, "") || "0";
  var n = Math.floor(Number(str));

  return n !== Infinity && String(n) === str && n >= 0;
};
const formatCurrency = (value: any) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};
</script>
