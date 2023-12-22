<template>
    <div class="surface-section px-4 py-8 md:px-6 lg:px-8">
        <div class="text-orange-500 text-center mb-3">Sportshall Scorer</div>
        <div class="font-bold text-5xl text-900 text-center mb-6">Manage Sportshall Events Efficiently</div>
        <div class="grid grid-nogutter">
            <!-- Manage Athletes -->
            <div class="col-12 md:col-6 lg:col-3 p-3">
                <div class="bg-blue-50 text-center p-5 border-round flex flex-column">
                    <i class="text-blue-500 pi pi-user text-4xl block mb-4"></i>
                    <span class="text-900 text-xl mb-3">Manage Athletes</span>
                    <div class="text-blue-700 mt-3 font-medium">
                        Add and manage athlete details, track their categories and clubs.
                    </div>
                    <Button label="Athletes" class="p-button-outlined mt-3" @click="goTo('/view-athletes')" />
                </div>
            </div>
            <!-- Manage Events -->
            <div class="col-12 md:col-6 lg:col-3 p-3">
                <div class="bg-purple-50 text-center p-5 border-round flex flex-column">
                    <i class="text-purple-500 pi pi-calendar text-4xl block mb-4"></i>
                    <span class="text-900 text-xl mb-3">Create Events</span>
                    <div class="text-purple-700 mt-3 font-medium">
                        Schedule events, define event types, and set dates.
                    </div>
                    <Button label="Events" class="p-button-outlined mt-3" @click="goTo('/add-event-instance')" />
                </div>
            </div>
            <!-- Manage Venues -->
            <div class="col-12 md:col-6 lg:col-3 p-3">
                <div class="bg-teal-50 text-center p-5 border-round flex flex-column">
                    <i class="text-teal-500 pi pi-map-marker text-4xl block mb-4"></i>
                    <span class="text-900 text-xl mb-3">Venue Management</span>
                    <div class="text-teal-700 mt-3 font-medium">
                        Add and manage venues for your sportshall events.
                    </div>
                    <Button label="Venues" class="p-button-outlined mt-3" @click="goTo('/venues')" />
                </div>
            </div>
            <!-- View Results -->
            <div class="col-12 md:col-6 lg:col-3 p-3">
                <div class="bg-indigo-50 text-center p-5 border-round flex flex-column">
                    <i class="text-indigo-500 pi pi-chart-line text-4xl block mb-4"></i>
                    <span class="text-900 text-xl mb-3">View Results</span>
                    <div class="text-indigo-700 mt-3 font-medium">
                        Access detailed results and rankings for each event.
                    </div>
                    <Button label="Results" class="p-button-outlined mt-3" @click="goTo('/view-results')" />
                </div>
            </div>
        </div>
    </div>
</template>
    
    <script setup lang="ts">
    import { useRouter } from 'vue-router';
    
    const router = useRouter();
    const goTo = path => router.push(path);
    </script>
    
    <style scoped>
    .surface-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    
    .text-center {
      text-align: center;
    }
    
    .grid {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
    }
    
    .col {
      flex: 1 1 200px; /* Flex grow, flex shrink, flex basis */
      margin: 0.5rem;
      display: flex; /* To apply flex to inner content */
    }
    
    .border-round {
      border-radius: 10px;
    }
    
    .flex-column {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100%; /* To make all boxes same height */
    }
    
    .p-3 {
      padding: 1rem;
    }
    
    .block {
      margin-bottom: 0.5rem;
    }
    
    .link {
      margin: 10px;
      padding: 10px 20px;
      border-radius: 5px;
      text-decoration: none;
      color: #fff;
    }
    
    .link:hover {
      background-color: #0056b3;
    }
    
    @media (max-width: 768px) {
      .col {
        flex-basis: 100%; /* Full width on smaller screens */
      }
    }

    .flex-column {
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* Adjusted for spacing */
  align-items: center;
  height: 100%; /* To make all boxes same height */
}

.card-content {
  flex-grow: 1; /* Allows this element to grow and push the button down */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.card-footer {
  width: 100%;
  display: flex;
  justify-content: center;
  padding-bottom: 1rem; /* Padding at the bottom */
}

@media (max-width: 768px) {
  .col {
    flex-basis: 100%; /* Full width on smaller screens */
  }
}
    </style>
    