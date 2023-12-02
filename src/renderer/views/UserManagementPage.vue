<template>
    <v-container>
        <v-form @submit.prevent="onSubmit">
            <v-text-field v-model="user.name" label="Name" required></v-text-field>
            <v-text-field v-model="user.ads" label="sdf" required></v-text-field>
            <v-text-field v-model="user.age" label="Age" type="number" required></v-text-field>
            <!-- Additional fields as needed -->
            <v-btn type="submit" color="success">Create User</v-btn>
        </v-form>

        <!-- User list with edit and delete options -->
        <!-- This can be a v-data-table or a custom list -->
    </v-container>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
    setup() {
        const user = ref({ name: '', age: 0 });

        const onSubmit = () => {
            // Handle user creation
            const plainUser = { ...user.value }; // Create a plain object
            window.electronAPI.registerUser(plainUser); // Send data to main process via IPC
        };

        return { user, onSubmit };
    }
});
</script>
  