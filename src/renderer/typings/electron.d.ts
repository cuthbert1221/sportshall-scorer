/**
 * Should match main/preload.ts for typescript support in renderer
 */
import {Participant, Event} from '../../main/interfaces.js';

export default interface ElectronApi {
  sendMessage: (message: string) => void,
  registerParticipant: (participant: Participant) => Promise<any>,
  createEvent: (event: Event) => Promise<any>,
  readDataFromDb: (query: string) => Promise<any>,
  fetchData: (query: string) => Promise<any>,
}

declare global {
  interface Window {
    electronAPI: ElectronApi,
  }
}
