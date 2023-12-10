import { defineStore } from 'pinia';

export const useEventsStore = defineStore('eventsStore', {
  state: () => ({
    events: [] as EventSource[],
  }),
  actions: {
    async fetchEvents() {
      try {
        const result = await window.electronAPI.fetchData('eventInstances');
        this.events = result;
      } catch (error) {
        console.error('Error fetching events:', error);
        this.events = [];
      }
    }
  }
});

interface EventSource {
    name: string
    age: number
  }
