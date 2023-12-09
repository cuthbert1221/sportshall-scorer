<script setup lang="ts">
import { ref, onMounted } from 'vue';

const data = ref(null);

const loadData = async () => {
  try {
    const query = "SELECT * FROM participants";
    const result = await window.electronAPI.readDataFromDb(query);
    data.value = result;
    console.log(data.value);
  } catch (error) {
    console.error('Error reading data:', error);
  }
};

onMounted(loadData);
</script>

<template>
  <div>
    <!-- Render your data here -->
  </div>
</template>