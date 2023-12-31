/**
 * Should match main/preload.ts for typescript support in renderer
 */
import {Athlete, Event, EventDetails, EventInstances} from '../../main/interfaces.js';

export default interface ElectronApi {
  sendMessage: (message: string) => void,
  registerAthlete: (athlete: Athlete) => Promise<any>,
  createEventDetail: (event: EventDetails) => Promise<any>,
  createEventInstance: (event: EventInstances) => Promise<any>,
  readDataFromDb: (query: string) => Promise<any>,
  createEventRelaySignupAttempt: (query: string) => Promise<any>,
  fetchData: (query: string) => Promise<any>,
  getEventSignupClub: (query: string) => Promise<any>,
  getEvents: (query: string) => Promise<any>,
  getEventsDefaultOrder: (query: string) => Promise<any>,
  getClubPointsVenue: (query: string) => Promise<any>,
  getEvent: (query: string) => Promise<any>,
  rankTeamSheet: (query: string) => Promise<any>,
}

declare global {
  interface Window {
    electronAPI: ElectronApi,
  }
}
