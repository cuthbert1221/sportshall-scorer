import { defineStore } from 'pinia';

export const useGenericStore = defineStore('generic', {
    state: () => {
      return {
        genders: [
            { name: 'Girl', code: 'G' },
            { name: 'Boy', code: 'B' },
        ],
        ageGroups: [
            { name: 'U11', code: 'U11' },
            { name: 'U13', code: 'U13' },
            { name: 'U15', code: 'U15' }
        ],
      }
    },
  })