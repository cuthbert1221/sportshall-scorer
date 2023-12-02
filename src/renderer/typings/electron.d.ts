/**
 * Should match main/preload.ts for typescript support in renderer
 */
import {User} from '../../interfaces.js';

export default interface ElectronApi {
  sendMessage: (message: string) => void,
  registerUser: (user: User) => void
}

declare global {
  interface Window {
    electronAPI: ElectronApi,
  }
}
