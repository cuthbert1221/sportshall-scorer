<script setup lang="ts">
import InputSwitch from 'primevue/inputswitch';
</script>

<template>
<section class="surface-50 relative flex flex-column overflow-hidden justify-content-center align-items-center gap-6 px-4 py-8 md:px-6 lg:px-8">
    <header class="flex align-items-center justify-content-center flex-column gap-2">
        <h1 class="m-0 font-semibold text-lg line-height-3 text-primary-500">PRICING</h1>
        <h2 class="m-0 font-bold text-4xl line-height-3 text-900">Find your perfect plan</h2>
        <p class="text-xl line-height-3 text-700 mt-0 mb-0">Fringilla ut morbi tincidunt augue interdum velit euismod. Non arcu risus quis varius quam.</p>
    </header>

    <div class="flex flex-column lg:flex-row z-1 justify-content-center gap-5">
        <article class="flex flex-column gap-4 p-4 surface-0 border-round-lg shadow-2">
            <div class="flex justify-content-between align-items-center border-bottom-1 surface-border pb-4 gap-5">
                <div class="flex flex-column gap-2">
                    <h3 class="m-0 font-semibold text-xl text-900">Started Plan</h3>
                    <p class="mt-2 mb-0 text-base text-600">Scelerisque viverra mauris.</p>
                </div>
                <div class="flex align-items-center gap-2"><span class="font-semibold text-4xl text-900">
                    <span class="text-xl">$</span>10</span> <span class="text-base text-600">per month</span>
                </div>
            </div>
            <div class="flex flex-column gap-3 border-bottom-1 surface-border pb-4">
                <h3 class="m-0 mb-2 font-semibold text-base text-900">Started Plan Includes:</h3>
                <div class="flex flex-column sm:flex-row w-full justify-content-between gap-4">
                    <ul class="list-none mt-2 mb-0 p-0">
                        <li>
                            <p class="mb-4 mt-0 text-600 flex align-items-center"><i class="pi pi-check-circle text-green-500 mr-2"></i> Proin fermentum leo</p>
                        </li>
                        <li>
                            <p class="mb-4 mt-0 text-600 flex align-items-center"><i class="pi pi-check-circle text-green-500 mr-2"></i> Ullamcorper morbi tincidunt</p>
                        </li>
                        <li>
                            <p class="mb-4 mt-0 text-600 flex align-items-center"><i class="pi pi-check-circle text-green-500 mr-2"></i> Adipiscing enim eu turpis</p>
                        </li>
                        <li>
                            <p class="mb-0 mt-0 text-600 flex align-items-center"><i class="pi pi-check-circle text-green-500 mr-2"></i> Velit ut tortor pretium</p>
                        </li>
                    </ul>
                    <ul class="list-none mt-0 mb-0 sm:mt-2 p-0">
                        <li>
                            <p class="mb-4 mt-0 text-600 flex align-items-center"><i class="pi pi-check-circle text-green-500 mr-2"></i> Faucibus vitae aliquet nec</p>
                        </li>
                        <li>
                            <p class="mb-4 mt-0 text-600 flex align-items-center"><i class="pi pi-check-circle text-green-500 mr-2"></i> Tristique senectus et netus</p>
                        </li>
                        <li>
                            <p class="mb-4 mt-0 text-600 flex align-items-center"><i class="pi pi-check-circle text-green-500 mr-2"></i> Elit sed vulputate mi sit</p>
                        </li>
                        <li>
                            <p class="mb-0 mt-0 text-600 flex align-items-center"><i class="pi pi-check-circle text-green-500 mr-2"></i> Et netus et malesuada</p>
                        </li>
                    </ul>
                </div>
            </div>
            <div>
                <router-link to="/add-participants">Add user</router-link>
                <router-link to="/list-participants">List Users</router-link>
                <router-link to="/list-events">List Events</router-link>
                <router-link to="/add-event">Add Events</router-link>
            </div>
        </article>
        <article class="flex flex-column gap-4 p-4 surface-0 border-round-lg shadow-2">
            <div class="flex justify-content-between align-items-center border-bottom-1 surface-border pb-4 gap-5">
                <div class="flex flex-column gap-2">
                    <h3 class="m-0 font-semibold text-xl text-900">Professional Plan</h3>
                    <p class="mt-2 mb-0 text-base text-600">Eget mauris pharetra et ultrices.</p>
                </div>
                <div class="flex align-items-center gap-2"><span class="font-semibold text-4xl text-900">
                    <span class="text-xl">$</span>123</span> <span class="text-base text-600">per month</span>
                </div>
            </div>
            <div class="flex flex-column gap-3 border-bottom-1 surface-border pb-4">
                <h3 class="m-0 mb-2 font-semibold text-base text-900">Professional Plan Includes:</h3>
                <div class="flex flex-column sm:flex-row w-full justify-content-between gap-4">
                    <ul class="list-none mt-2 mb-0 p-0">
                        <li>
                            <p class="mb-4 mt-0 text-600 flex align-items-center"><i class="pi pi-check-circle text-green-500 mr-2"></i> Proin fermentum leo</p>
                        </li>
                        <li>
                            <p class="mb-4 mt-0 text-600 flex align-items-center"><i class="pi pi-check-circle text-green-500 mr-2"></i> Ullamcorper morbi tincidunt</p>
                        </li>
                        <li>
                            <p class="mb-4 mt-0 text-600 flex align-items-center"><i class="pi pi-check-circle text-green-500 mr-2"></i> Adipiscing enim eu turpis</p>
                        </li>
                        <li>
                            <p class="mb-0 mt-0 text-600 flex align-items-center"><i class="pi pi-check-circle text-green-500 mr-2"></i> Velit ut tortor pretium</p>
                        </li>
                    </ul>
                    <ul class="list-none mt-0 mb-0 sm:mt-2 p-0">
                        <li>
                            <p class="mb-4 mt-0 text-600 flex align-items-center"><i class="pi pi-check-circle text-green-500 mr-2"></i> Faucibus vitae aliquet nec</p>
                        </li>
                        <li>
                            <p class="mb-4 mt-0 text-600 flex align-items-center"><i class="pi pi-check-circle text-green-500 mr-2"></i> Tristique senectus et netus</p>
                        </li>
                        <li>
                            <p class="mb-4 mt-0 text-600 flex align-items-center"><i class="pi pi-check-circle text-green-500 mr-2"></i> Elit sed vulputate mi sit</p>
                        </li>
                        <li>
                            <p class="mb-0 mt-0 text-600 flex align-items-center"><i class="pi pi-check-circle text-green-500 mr-2"></i> Et netus et malesuada</p>
                        </li>
                    </ul>
                </div>
            </div>
            <div>
                <Button label="Get Started" class="w-full"></Button>
            </div>
        </article>
    </div>
    <div class="absolute top-50 w-screen" style="transform: rotate(-6deg);">
        <div class="h-4rem bg-primary-500"></div>
        <div class="h-4rem bg-primary-300"></div>
        <div class="h-4rem bg-primary-100"></div>
    </div>
</section>
</template>