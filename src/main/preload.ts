import {contextBridge, ipcRenderer} from 'electron';
import {Participant, EventInstances, EventDetails} from './interfaces.js';

contextBridge.exposeInMainWorld('electronAPI', {
  sendMessage: (message: string) => ipcRenderer.send('message', message),
  registerParticipant: async (participant: Participant) => {
    const result = await ipcRenderer.invoke('create-participant', participant);
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
  readDataFromDb: (query: string) => ipcRenderer.invoke('read-data', query),
  fetchData: (type) => ipcRenderer.invoke('fetch-data', type)
})
