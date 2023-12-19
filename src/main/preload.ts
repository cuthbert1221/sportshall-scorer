import {contextBridge, ipcRenderer} from 'electron';
import {Athlete, EventInstances, EventDetails, EventSignup} from './interfaces.js';

contextBridge.exposeInMainWorld('electronAPI', {
  sendMessage: (message: string) => ipcRenderer.send('message', message),
  registerAthlete: async (athlete: Athlete) => {
    const result = await ipcRenderer.invoke('create-athlete', athlete);
    return result;
  },
  createEventDetail: async (event: EventDetails) => {
    const result = await ipcRenderer.invoke('create-event-detail', event);
    return result;
  },
  createEventInstance: async (event: EventInstances) => {
    const result = await ipcRenderer.invoke('create-event-instance', event);
    return result;
  },
  createEventSignup: async (event: number, club: number, athlete: number, athlete_type) => {
    const result = await ipcRenderer.invoke('insert-event-signup', event, club, athlete, athlete_type);
    return result;
  },
  createEventSignupAttempt: async (athlete_id, event_id, attemptNumber, score) => {
    const result = await ipcRenderer.invoke('create-event-attempt', athlete_id, event_id, attemptNumber, score);
    return result;
  },
  deleteEventSignupAttempt: async (athlete_id, event_id, attemptNumber) => {
    const result = await ipcRenderer.invoke('delete-event-attempt', athlete_id, event_id, attemptNumber);
    return result;
  },
  deleteEventSignupClub: async (club: number) => {
    const result = await ipcRenderer.invoke('delete-event-signups-club', club);
    return result;
  },
  getEventSignupClub: async (event: number, club: number) => {
    const result = await ipcRenderer.invoke('get-event-signups-club', event, club);
    return result;
  },
  getEventSignup: async (event: number) => {
    const result = await ipcRenderer.invoke('get-event-signups', event);
    return result;
  },
  getEventSignupAttempt: async (athlete_id, event_id) => {
    const result = await ipcRenderer.invoke('get-attempt-result-signup', athlete_id, event_id);
    return result;
  },
  updateMultipleEventsOrder: async (event: EventInstances) => {
    const result = await ipcRenderer.invoke('update-multiple-events-order', event);
    return result;
  },
  rankSignups: async (eventID) => {
    const result = await ipcRenderer.invoke('rankSignups', eventID);
    return result;
  },
  scoreEvent: async (eventID) => {
    const result = await ipcRenderer.invoke('scoreEvent', eventID);
    return result;
  },
  readDataFromDb: (query: string) => ipcRenderer.invoke('read-data', query),
  fetchData: (type) => ipcRenderer.invoke('fetch-data', type)
})
