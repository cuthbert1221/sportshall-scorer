import {contextBridge, ipcRenderer} from 'electron';
import {Participant, Event} from './interfaces.js';

contextBridge.exposeInMainWorld('electronAPI', {
  sendMessage: (message: string) => ipcRenderer.send('message', message),
  registerParticipant: async (participant: Participant) => {
    const result = await ipcRenderer.invoke('create-participant', participant);
    return result;
  },
  createEvent: async (event: Event) => {
    const result = await ipcRenderer.invoke('create-event', event);
    return result;
  },
  readDataFromDb: (query: string) => ipcRenderer.invoke('read-data', query),
  fetchData: (type) => ipcRenderer.invoke('fetch-data', type)
})
