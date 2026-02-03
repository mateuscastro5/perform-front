const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  window: {
    minimize: () => ipcRenderer.invoke('window-minimize'),
    maximize: () => ipcRenderer.invoke('window-maximize'),
    close: () => ipcRenderer.invoke('window-close'),
    
    onMaximized: (callback: () => void) => {
      ipcRenderer.on('window-maximized', callback);
    },
    onUnmaximized: (callback: () => void) => {
      ipcRenderer.on('window-unmaximized', callback);
    },
  },
  
  settings: {
    get: (key: string) => ipcRenderer.invoke('settings-get', key),
    set: (key: string, value: unknown) => ipcRenderer.invoke('settings-set', key, value),
  },
});

declare global {
  interface Window {
    electronAPI: {
      window: {
        minimize: () => Promise<void>;
        maximize: () => Promise<void>;
        close: () => Promise<void>;
        onMaximized: (callback: () => void) => void;
        onUnmaximized: (callback: () => void) => void;
      };
      settings: {
        get: (key: string) => Promise<unknown>;
        set: (key: string, value: unknown) => Promise<void>;
      };
    };
  }
}
