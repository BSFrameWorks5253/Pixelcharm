import { contextBridge, ipcRenderer } from 'electron';

export interface ElectronAPI {
  isElectron: boolean;
  platform: string;
  openNativeFile: () => Promise<{ name: string; buffer: ArrayBuffer; path: string } | null>;
  saveNativeFile: (defaultName: string, buffer: ArrayBuffer, filters: { name: string; extensions: string[] }[]) => Promise<boolean>;
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  onFileOpenedFromExplorer: (callback: (fileData: { name: string; buffer: ArrayBuffer }) => void) => void;
}

const api: ElectronAPI = {
  isElectron: true,
  platform: process.platform,
  openNativeFile: async () => {
    return await ipcRenderer.invoke('dialog:openFile');
  },
  saveNativeFile: async (defaultName, buffer, filters) => {
    return await ipcRenderer.invoke('dialog:saveFile', { defaultName, buffer, filters });
  },
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  maximizeWindow: () => ipcRenderer.send('window:maximize'),
  closeWindow: () => ipcRenderer.send('window:close'),
  onFileOpenedFromExplorer: (callback) => {
    ipcRenderer.on('app:open-file', (_event, data) => callback(data));
  }
};

contextBridge.exposeInMainWorld('electronAPI', api);
