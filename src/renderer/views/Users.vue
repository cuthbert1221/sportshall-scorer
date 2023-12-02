<template>
    <v-container>
      <v-row justify="center">
        <v-col cols="12" md="10">
          <v-card>
            <v-card-title>
              User Management
            </v-card-title>
            <v-card-text>
              <v-data-table
                :headers="headers"
                :items="users"
                class="elevation-1"
              >
                <template v-slot:item.action="{ item }">
                  <v-icon small class="mr-2" @click="editUser(item)">
                    mdi-pencil
                  </v-icon>
                  <v-icon small @click="deleteUser(item)">
                    mdi-delete
                  </v-icon>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script>
  export default {
    data() {
      return {
        headers: [
          { text: 'Name', value: 'name' },
          { text: 'Age', value: 'age' },
          { text: 'Club', value: 'club' },
          { text: 'Actions', value: 'action', sortable: false },
        ],
        users: [
          // Your user data here
        ],
      };
    },
    methods: {
      editUser(user) {
        // Logic to edit user
      },
      deleteUser(user) {
        // Logic to delete user
      },
    },
  };
  </script>
  