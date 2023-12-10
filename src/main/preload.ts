import {contextBridge, ipcRenderer} from 'electron';
import {Athlete, EventInstances, EventDetails} from './interfaces.js';

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
  updateMultipleEventsOrder: async (event: EventInstances) => {
    const result = await ipcRenderer.invoke('update-multiple-events-order', event);
    return result;
  },
  readDataFromDb: (query: string) => ipcRenderer.invoke('read-data', query),
  fetchData: (type) => ipcRenderer.invoke('fetch-data', type)
})
