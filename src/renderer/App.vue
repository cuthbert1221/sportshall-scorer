<script setup lang="ts">
import { ref } from 'vue';
import Menu from 'primevue/menu';
import LeftBar from './components/LeftBar.vue';
import TopBar from './components/TopBar.vue';

window.electronAPI.sendMessage('Hello from App.vue!');

</script>
<template>
  

  <div class="min-h-screen flex relative lg:static surface-ground ">
    <LeftBar />
    <div class="min-h-screen flex flex-column relative flex-auto">
        <TopBar />
        <div class="p-5 flex flex-column flex-auto">
            <div class="border-2 border-dashed surface-border border-round surface-section flex-auto">
              <router-view />
            </div>
        </div>
    </div>
</div>
</template>
