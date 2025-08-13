import { contextBridge, ipcRenderer } from 'electron';

// 🔒 EXPOSIÇÃO SEGURA DE APIs PARA O RENDERER
contextBridge.exposeInMainWorld('electronAPI', {
  // 🪟 CONTROLES DA JANELA
  window: {
    minimize: () => ipcRenderer.invoke('window-minimize'),
    maximize: () => ipcRenderer.invoke('window-maximize'),
    close: () => ipcRenderer.invoke('window-close'),
    
    // 📊 EVENTOS DA JANELA
    onMaximized: (callback: () => void) => {
      ipcRenderer.on('window-maximized', callback);
    },
    onUnmaximized: (callback: () => void) => {
      ipcRenderer.on('window-unmaximized', callback);
    },
  },
  
  // 🔧 CONFIGURAÇÕES (para o futuro)
  settings: {
    get: (key: string) => ipcRenderer.invoke('settings-get', key),
    set: (key: string, value: unknown) => ipcRenderer.invoke('settings-set', key, value),
  },
});

// 🎯 TIPOS PARA TYPESCRIPT
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
