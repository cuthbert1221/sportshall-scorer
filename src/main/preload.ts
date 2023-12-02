import {contextBridge, ipcRenderer} from 'electron';
import {User} from '../interfaces.js';

contextBridge.exposeInMainWorld('electronAPI', {
  sendMessage: (message: string) => ipcRenderer.send('message', message),
  registerUser: (user: User) => ipcRenderer.send('create-user', user)
})
