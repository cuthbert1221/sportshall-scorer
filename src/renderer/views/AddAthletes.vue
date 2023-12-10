<script setup lang="ts">
import { ref, reactive } from 'vue';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import { useToast } from 'primevue/usetoast';
import { parseQuery } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import { required, email } from '@vuelidate/validators';
import {Athlete} from '../../main/interfaces.js';
import { useGenericStore } from '../stores/genericStore';
const genericStore = useGenericStore()

// Add more fields as needed
const toast = useToast();
declare global {
    interface Window {
        electronAPI: any;
    }
}

const initialState = {
    fullname: '',
    club: '',
    agegroup: '',
    gender: '',
};

const state = reactive({ ...initialState });

const rules = {
    fullname: { required }, // Matches state.firstName
    club: { required }, // Matches state.firstName
    agegroup: { required }, // Matches state.agegroup
    gender: { required }, // Matches state.gender
};



function resetState() {
    Object.assign(state, initialState);
    v$.value.$reset();
}

const v$ = useVuelidate(rules, state)

async function onSubmit(values: any) {
    const isFormCorrect = await v$.value.$validate();
    console.log(isFormCorrect);
    if (!isFormCorrect) return
    
    //Json stringify and parse to remove reactive proxy
    const athlete = JSON.parse(JSON.stringify(state));
    athlete.club = athlete.club.name; // Use the club name as a string
    athlete.agegroup = athlete.agegroup.name; // Use the age name as a string
    athlete.gender = athlete.gender.name; // Use the gender name as a string

    const registration = await window.electronAPI.registerAthlete(athlete);
    
    if (typeof registration === 'number') {
        console.log(registration);
        toast.add({ severity: 'success', summary: 'Success', detail: 'Athlete added, ID: ' + registration, life: 3000 });
        console.log("Athlete added");
        loading.value = true;
        console.log(values);
        resetState();
    } else {
        console.log('Registration returned an error ' + registration);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Error message: ' + registration, life: 3000 });
    }
}

const loading = ref(false);

const addAthlete = () => {
    window.electronAPI.registerAthlete('Hello from 0.vue!');
    console.log('addAthlete');
    loading.value = true;
    toast.add({ severity: 'success', summary: 'Success', detail: 'Athlete added', life: 3000 });
    setTimeout(() => {
        loading.value = false;
    }, 2000);
};

let clubs = ref([]);

const genders = genericStore.genders
const ageGroups = genericStore.ageGroups

async function fetchData() {
    const result = await window.electronAPI.fetchData('clubs');
    clubs.value = result.map((club: any) => ({ name: club.name, id: club.id }));
}

fetchData();
</script>
<template>
    <div class="surface-ground px-4 py-8 md:px-6 lg:px-8">
        <div class="text-900 font-medium text-xl mb-3">Add Athlete</div>
        <p class="m-0 mb-4 p-0 text-600 line-height-3 mr-3">Register a new athlete to get their unique ID, and be able to assign them an event</p>
        <div class="surface-card p-4 shadow-2 border-round">
            <form v-on:submit.prevent="onSubmit" class="flex flex-column gap-2">
            <div class="grid formgrid p-fluid">
                <div class="field mb-4 col-12">
                    <label for="fullname" class="font-medium text-900">Full Name</label>
                    <InputText id="fullname" type="text" v-model="state.fullname" @update:modelValue="v$.fullname.$touch" />
                <div v-for="error of v$.fullname.$errors" :key="error.$uid">
                    <small class="p-error" id="text-error">{{ error.$message }}</small>
                </div>
            </div>
            <div class="surface-border border-top-1 opacity-50 mb-3 col-12"></div>
            <div class="field mb-4 col-12">
                <Dropdown id="club"  v-model="state.club" :options="clubs" optionLabel="name" :filter="true" filterBy="name" :showClear="true" placeholder="Select a Club" aria-describedby="dd-error" @blur="v$.club.$touch">
                    <template #option="slotProps">
                        <div class="flex align-items-center">
                            <div>{{slotProps.option.name}}</div>
                        </div>
                    </template>
                </Dropdown>
                <div v-for="error of v$.club.$errors" :key="error.$uid">
                    <small class="p-error" id="text-error">{{ error.$message }}</small>
                </div>
            </div> 
            <div class="field mb-4 col-12">
                <Dropdown id="club" v-model="state.agegroup" :options="ageGroups" optionLabel="name" :filter="false" placeholder="Select an age group" @blur="v$.agegroup.$touch">
                    <template #option="slotProps">
                        <div class="flex align-items-center">
                            <div>{{slotProps.option.name}}</div>
                        </div>
                    </template>
                </Dropdown>
                <div v-for="error of v$.agegroup.$errors" :key="error.$uid">
                    <small class="p-error" id="text-error">{{ error.$message }}</small>
                </div>
            </div> 
            <div class="field mb-4 col-12">
                <Dropdown id="club" v-model="state.gender" :options="genders" optionLabel="name" :filter="false" placeholder="Select a gender" @blur="v$.gender.$touch">
                    <template #option="slotProps">
                        <div class="flex align-items-center">
                            <div>{{slotProps.option.name}}</div>
                        </div>
                    </template>
                </Dropdown>
                <div v-for="error of v$.gender.$errors" :key="error.$uid">
                    <small class="p-error" id="text-error">{{ error.$message }}</small>
                </div>
            </div> 
            <div class="surface-border border-top-1 opacity-50 mb-3 col-12"></div>
            <div class="field mb-1 col-12" v-if="state.fullname">Athlete: {{state.fullname}}</div>
            <div class="field mb-1 col-12" v-if="state.club">Club: {{state.club.name}}</div>
            <div class="field mb-1 col-12" v-if="state.gender && state.agegroup">Group: {{state.agegroup.name}}{{ state.gender.code }}</div>
        </div>
        <div class="col-12">
            <Button type="submit" label="Add Athlete" class="w-auto mt-3"></Button>
        </div>
        </form>
        <Toast />
    </div>
</div>
</template>