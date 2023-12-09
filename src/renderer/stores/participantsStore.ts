import { defineStore } from 'pinia';

export const useParticipantsStore = defineStore('participantsStore', {
  state: () => ({
    participants: [],
  }),
  actions: {
    async fetchParticipants() {
      try {
        const result = await window.electronAPI.fetchData('participants');
        this.participants = result;
      } catch (error) {
        console.error('Error fetching participants:', error);
        this.participants = [];
      }
    }
  }
});
