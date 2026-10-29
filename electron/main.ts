import { app, BrowserWindow, ipcMain, dialog, Menu, nativeTheme } from 'electron';
import path from 'path';
import fs from 'fs';
import { resolveChildAppLoaderConfig, showChildAppSplash, closeChildAppSplash, ChildAppLoaderConfig } from './splash';
import { registerUpdateIpc } from './autoUpdater';

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

function getAppIndexPath(): string {
  const candidates = [
    path.join(__dirname, '../dist/index.html'),
    path.join(app.getAppPath(), 'dist/index.html'),
    path.join(app.getAppPath(), 'index.html'),
    path.join(process.resourcesPath, 'app.asar/dist/index.html')
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return candidates[0];
}

function createWindow(showImmediately = false) {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1024,
    minHeight: 700,
    title: 'Pixelcharm — Creative Canvas & Photo Magic',
    backgroundColor: '#181818',
    darkTheme: true,
    autoHideMenuBar: true,
    show: showImmediately, // Kept hidden until splash completes
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  nativeTheme.themeSource = 'dark';

  // Completely disable native Win32 window menu bar so Photoshop dark menu bar is the sole top bar
  Menu.setApplicationMenu(null);
  mainWindow.setMenuBarVisibility(false);

  // Load appropriate URL
  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (isDev && devServerUrl) {
    console.log('[Pixelcharm] Connecting to development server:', devServerUrl);
    mainWindow.loadURL(devServerUrl).catch((err) => {
      console.warn('[Pixelcharm] Failed to connect to dev server, falling back to dist/index.html:', err);
      const fallback = getAppIndexPath();
      mainWindow?.loadFile(fallback);
    });
  } else {
    const indexPath = getAppIndexPath();
    console.log('[Pixelcharm] Loading bundled application from:', indexPath);
    mainWindow.loadFile(indexPath).catch((err) => {
      console.error('[Pixelcharm] Failed to load index file:', err);
    });
  }

  // Auto-recovery if initial dev server load fails
  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    console.warn('[Pixelcharm] WebContents failed to load:', validatedURL, errorCode, errorDescription);
    const fallback = getAppIndexPath();
    if (fs.existsSync(fallback) && !validatedURL.includes('index.html')) {
      console.log('[Pixelcharm] Recovering by loading bundled index.html:', fallback);
      mainWindow?.loadFile(fallback);
    }
  });

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
  registerUpdateIpc(() => mainWindow);

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
