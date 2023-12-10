<script setup lang="ts">
import InputSwitch from 'primevue/inputswitch';
</script>

<template>

<div class="surface-section px-4 py-8 md:px-6 lg:px-8">
    <div class="text-orange-500 text-center mb-3">VITAE TEMPUS QUAM</div>
    <div class="font-bold text-5xl text-900 text-center mb-6">Take your vision to the next level</div>
    <div class="grid grid-nogutter">
        <div class="col-12 md:col-6 lg:col-3 p-3">
            <div class="bg-blue-50 text-center p-5 border-round flex flex-column">
                <i class="text-blue-500 pi pi-play text-4xl block mb-4"></i>
                <span class="text-900 text-5xl">52000</span>
                <div class="text-blue-700 mt-3 font-medium">Streams</div>
            </div>
        </div>
        <div class="col-12 md:col-6 lg:col-3 p-3">
            <div class="bg-purple-50 text-center p-5 border-round flex flex-column">
                <i class="text-purple-500 pi pi-users text-4xl block mb-4"></i>
                <span class="text-900 text-5xl">21000</span>
                <div class="text-purple-700 mt-3 font-medium">Engagement</div>
            </div>
        </div>
        <div class="col-12 md:col-6 lg:col-3 p-3">
            <div class="bg-teal-50 text-center p-5 border-round flex flex-column">
                <i class="text-teal-500 pi pi-camera text-4xl block mb-4"></i>
                <span class="text-900 text-5xl">71.2h</span>
                <div class="text-teal-700 mt-3 font-medium">Watch Time</div>
            </div>
        </div>
        <div class="col-12 md:col-6 lg:col-3 p-3">
            <div class="bg-indigo-50 text-center p-5 border-round flex flex-column">
                <i class="text-indigo-500 pi pi-thumbs-up text-4xl block mb-4"></i>
                <span class="text-900 text-5xl">4500</span>
                <div class="text-indigo-700 mt-3 font-medium">Likes</div>
            </div>
        </div>
    </div>
</div>
</template>