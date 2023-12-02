<script setup lang="ts">
import { ref } from 'vue';
import HelloWorld from './components/HelloWorld.vue'

const drawer = ref(true);

window.electronAPI.sendMessage('Hello from App.vue!');

const menuItems = ref([
  { title: 'Home', icon: 'mdi-account', link: '/' },
  { title: 'Manage Users', icon: 'mdi-account', link: '/list-users' },
  // Add other menu items here
]);
</script>

<template>
  <v-app>
    <v-navigation-drawer app permanent>
      <v-list>
        <v-list-item v-for="(item, index) in menuItems" :key="index" :to="item.link" :prependIcon="item.icon">
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app color="indigo" dark>
      <v-toolbar-title>My Vue App</v-toolbar-title>
    </v-app-bar>

    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>
