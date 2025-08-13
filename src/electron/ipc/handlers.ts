import { ipcMain, BrowserWindow } from 'electron';

export function setupWindowHandlers(getMainWindow: () => BrowserWindow | null) {
  ipcMain.handle('window-minimize', () => {
    const mainWindow = getMainWindow();
    if (mainWindow) {
      mainWindow.minimize();
    }
  });

  ipcMain.handle('window-maximize', () => {
    const mainWindow = getMainWindow();
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  });

  ipcMain.handle('window-close', () => {
    const mainWindow = getMainWindow();
    if (mainWindow) {
      mainWindow.close();
    }
  });
}

export function setupSettingsHandlers() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ipcMain.handle('settings-get', (_event, _key: string) => {
    // TODO: Implementar sistema de configurações
    return null;
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ipcMain.handle('settings-set', (_event, _key: string, _value: unknown) => {
    // TODO: Implementar sistema de configurações
  });
}
