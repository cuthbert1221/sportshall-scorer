import { defineStore } from 'pinia';

export const useAthletesStore = defineStore('athletesStore', {
  state: () => ({
    athletes: [],
  }),
  actions: {
    async fetchAthletes() {
      try {
        const result = await window.electronAPI.fetchData('athletes');
        this.athletes = result;
      } catch (error) {
        console.error('Error fetching athletes:', error);
        this.athletes = [];
      }
    }
  }
});
