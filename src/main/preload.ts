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
  createEventSignup: async (event: number, club: number, athlete: number, athlete_type, relay) => {
    const result = await ipcRenderer.invoke('insert-event-signup', event, club, athlete, athlete_type, relay);
    return result;
  },
  createEventSignupAttempt: async (athlete_id, event_id, attemptNumber, score) => {
    const result = await ipcRenderer.invoke('create-event-attempt', athlete_id, event_id, attemptNumber, score);
    return result;
  },
  createEventRelaySignupAttempt: async (club_id, event_id, score) => {
    const result = await ipcRenderer.invoke('create-event-relay-attempt', club_id, event_id, score);
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
  getEvents: async (venue: string) => {
    const result = await ipcRenderer.invoke('get-events', venue);
    return result;
  },
  getEventsDefaultOrder: async (venue: string) => {
    const result = await ipcRenderer.invoke('get-events-default-order', venue);
    return result;
  },
  getEvent: async (event: number) => {
    const result = await ipcRenderer.invoke('get-event', event);
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
  setLanes: async (eventID) => {
    const result = await ipcRenderer.invoke('get-and-update-event-signups', eventID);
    return result;
  },
  createVenue: async (venue) => {
    const result = await ipcRenderer.invoke('create-venue', venue);
    return result;
  },
  updateVenue: async (venue) => {
    const result = await ipcRenderer.invoke('update-venue', venue);
    return result;
  },
  updateAthlete: async (venue) => {
    const result = await ipcRenderer.invoke('update-athlete', venue);
    return result;
  },
  updateEventDetail: async (eventDetail) => {
    const result = await ipcRenderer.invoke('update-eventDetail', eventDetail);
    return result;
  },
  deleteVenue: async (venue) => {
    const result = await ipcRenderer.invoke('delete-venue', venue);
    return result;
  },
  getRelayClubs: async (event) => {
    const result = await ipcRenderer.invoke('get-relay-signup', event);
    return result;
  },
  getAthleteScoreVenue: async (athlete_id, venue) => {
    const result = await ipcRenderer.invoke('get-athlete-total-score-venue', athlete_id, venue);
    return result;
  },
  rankClubTotalVenue: async (venue) => {
    const result = await ipcRenderer.invoke('rankClubTotalVenue', venue);
    return result;
  },
  getClubPointsVenue: async (venue, agegroup, gender) => {
    const result = await ipcRenderer.invoke('getClubPointsVenue', venue, agegroup, gender);
    return result;
  },
  readDataFromDb: (query: string) => ipcRenderer.invoke('read-data', query),
  fetchData: (type) => ipcRenderer.invoke('fetch-data', type)
})
