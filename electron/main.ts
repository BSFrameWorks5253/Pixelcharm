import { app, BrowserWindow, ipcMain, dialog, Menu, nativeTheme } from 'electron';
import path from 'path';
import fs from 'fs';
import { resolveChildAppLoaderConfig, showChildAppSplash, closeChildAppSplash, ChildAppLoaderConfig } from './splash';

// Windows Taskbar & Action Center Model ID for dedicated window grouping
if (process.platform === 'win32') {
  app.setAppUserModelId('com.anything.pixelcharm');
}

// Windows High-DPI Support for crisp text rendering
app.commandLine.appendSwitch('high-dpi-support', '1');

let mainWindow: BrowserWindow | null = null;
let splashCompleted = false;

// Only use dev server when explicitly running in live development mode with dedicated port
const isDev = process.env.NODE_ENV === 'development' && !!process.env.VITE_DEV_SERVER_URL;

function createWindow(showImmediately = false) {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1024,
    minHeight: 700,
    title: 'Pixelcharm — Creative Canvas & Photo Magic',
    backgroundColor: '#0a0a0c',
    darkTheme: true,
    show: showImmediately, // Kept hidden until splash completes
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  nativeTheme.themeSource = 'dark';

  // Construct Custom Native Menu
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open Photoshop (.psd, .psb) or Project...',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            if (!mainWindow) return;
            const res = await handleFileOpen();
            if (res) {
              mainWindow.webContents.send('app:open-file', res);
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Save Project',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow?.webContents.send('menu:save-project');
          }
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About Pixelcharm',
          click: () => {
            dialog.showMessageBox(mainWindow!, {
              type: 'info',
              title: 'About Pixelcharm',
              message: 'Pixelcharm Studio v1.0.0',
              detail: 'Creative Canvas & Photo Magic for the Anything Apps Ecosystem.\nFusing Canva fluid vector layout with Adobe Photoshop raster layer fidelity.'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // Load appropriate URL
  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (isDev && devServerUrl) {
    console.log('[Pixycharm] Connecting to development server:', devServerUrl);
    mainWindow.loadURL(devServerUrl).catch((err) => {
      console.warn('[Pixycharm] Failed to connect to dev server, falling back to dist/index.html:', err);
      mainWindow?.loadFile(path.join(__dirname, '../dist/index.html'));
    });
  } else {
    const indexPath = path.join(__dirname, '../dist/index.html');
    console.log('[Pixycharm] Loading bundled application from:', indexPath);
    mainWindow.loadFile(indexPath);
  }

  // Handle files passed via Windows CLI / File association (e.g. double clicking a .psd)
  mainWindow.webContents.on('did-finish-load', () => {
    const fileArg = process.argv.find((arg) =>
      /\.(psd|psb|psdt|pixelcharm|pixycharm|anything-project|png|jpg|jpeg|webp)$/i.test(arg)
    );
    if (fileArg && fs.existsSync(fileArg)) {
      try {
        const buffer = fs.readFileSync(fileArg);
        const name = path.basename(fileArg);
        mainWindow?.webContents.send('app:open-file', {
          name,
          buffer: buffer.buffer
        });
      } catch (err) {
        console.error('Failed to open file from args:', err);
      }
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Native Dialog Open Handler
async function handleFileOpen() {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Open Photoshop or Pixelcharm Project',
    properties: ['openFile'],
    filters: [
      {
        name: 'All Supported Formats',
        extensions: ['psd', 'psb', 'psdt', 'pixelcharm', 'pixycharm', 'anything-project', 'png', 'jpg', 'jpeg', 'webp']
      },
      { name: 'Photoshop Documents', extensions: ['psd', 'psb', 'psdt'] },
      { name: 'Pixelcharm Projects', extensions: ['pixelcharm', 'pixycharm', 'anything-project'] },
      { name: 'Raster Images', extensions: ['png', 'jpg', 'jpeg', 'webp'] }
    ]
  });

  if (result.canceled || result.filePaths.length === 0) return null;

  const filePath = result.filePaths[0];
  const buffer = fs.readFileSync(filePath);
  const name = path.basename(filePath);

  return {
    name,
    buffer: buffer.buffer,
    path: filePath
  };
}

// Native Dialog Save Handler
async function handleFileSave(
  defaultName: string,
  buffer: ArrayBuffer,
  filters: { name: string; extensions: string[] }[]
) {
  if (!mainWindow) return false;
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Save File',
    defaultPath: defaultName,
    filters
  });

  if (result.canceled || !result.filePath) return false;

  fs.writeFileSync(result.filePath, Buffer.from(buffer));
  return true;
}

// IPC Registration & Application Lifecycle
app.whenReady().then(() => {
  ipcMain.handle('dialog:openFile', handleFileOpen);
  ipcMain.handle('dialog:saveFile', async (_event, { defaultName, buffer, filters }) => {
    return await handleFileSave(defaultName, buffer, filters);
  });

  ipcMain.on('window:minimize', () => mainWindow?.minimize());
  ipcMain.on('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });
  ipcMain.on('window:close', () => mainWindow?.close());

  // 1. Resolve dynamic Anything Loader configuration for Pixelcharm
  const APP_ID = 'pixelcharm';
  const APP_NAME = 'Pixelcharm';
  const loaderConfig = resolveChildAppLoaderConfig(APP_ID, APP_NAME);

  const revealMainWindow = () => {
    if (splashCompleted) return;
    splashCompleted = true;
    closeChildAppSplash();
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show();
      mainWindow.focus();
    }
  };

  // 2. Launch Splash Screen
  showChildAppSplash(loaderConfig, revealMainWindow);

  // 3. Create Main Window in background (show: false prevents white flashing)
  createWindow(false);

  // 4. Safety watchdog: Ensure window reveals if splash stalls for any unexpected reason
  const maxWait = (loaderConfig.durationMs || 2600) + 3000;
  setTimeout(() => {
    if (!splashCompleted) {
      console.warn('[UniversalLoader] Safety watchdog triggered, revealing main window.');
      revealMainWindow();
    }
  }, maxWait);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(true);
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
