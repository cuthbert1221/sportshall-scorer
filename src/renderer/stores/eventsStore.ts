import { defineStore } from 'pinia';

export const useEventsStore = defineStore('eventsStore', {
  state: () => ({
    events: [] as EventSource[],
    venue_name: 'Venue 2' as string,
    venue_id: 2 as number
  }),
  actions: {
    async fetchEvents() {
      try {
        //const result = await window.electronAPI.fetchData('eventInstances');
        const result = await window.electronAPI.getEvents(this.venue_name);
        this.events = result;
      } catch (error) {
        console.error('Error fetching events:', error);
        this.events = [];
      }
    }, 
    async resetOrder() {
      try {
        //const result = await window.electronAPI.fetchData('eventInstances');
        const result = await window.electronAPI.getEventsDefaultOrder(this.venue_name);
        this.events = result;
      } catch (error) {
        console.error('Error fetching events:', error);
        this.events = [];
      }
    }, 
    setVenueName(venue_name: string) {
      this.venue_name = venue_name;
    },
    setVenueId(venue_id: number) {
      this.venue_id = venue_id;
    }
  }
});

interface EventSource {
    name: string
    age: number
  }
