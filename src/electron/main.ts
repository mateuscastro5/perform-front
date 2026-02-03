import { app, BrowserWindow } from "electron";
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { isDev } from "./utils/dev.js";
import { setupWindowHandlers, setupSettingsHandlers } from "./ipc/handlers.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let mainWindow: BrowserWindow;

app.on("ready", () => {
    const iconPath = path.join(process.cwd(), 'src/ui/assets/AlphaLogo.png');
    
    mainWindow = new BrowserWindow({
        width: 1368,
        height: 800,
        frame: false,
        title: 'alphaSights Insights',
        icon: iconPath,
        titleBarStyle: 'hidden',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'ipc/preload.js'),
            webSecurity: true,
            allowRunningInsecureContent: false,
            experimentalFeatures: true,
            enableBlinkFeatures: 'CSSPseudoElementsInWebComponents',
        },
        show: false,
        minWidth: 800,
        minHeight: 600,
    });

    setupWindowHandlers(() => mainWindow);
    setupSettingsHandlers();

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.on('maximize', () => {
        mainWindow.webContents.send('window-maximized');
    });

    mainWindow.on('unmaximize', () => {
        mainWindow.webContents.send('window-unmaximized');
    });

    if (isDev()) {
        mainWindow.loadURL('http://localhost:5123');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist-react/index.html'));
    }
});
