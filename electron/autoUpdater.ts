import { app, ipcMain, BrowserWindow } from 'electron';
import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const APP_ID = 'pixelcharm';
const GITHUB_REPO = 'BSFrameworks5253/Pixelcharm';

let downloadedInstallerPath: string | null = null;
let isDownloading = false;

function fetchJson(url: string): Promise<any> {
  return new Promise((resolve) => {
    const client = url.startsWith('http://') ? http : https;
    const req = client.get(
      url,
      {
        headers: {
          'User-Agent': 'Pixelcharm-AutoUpdater',
          Accept: 'application/vnd.github.v3+json, application/json',
        },
        timeout: 4000,
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch {
            resolve(null);
          }
        });
      }
    );
    req.on('error', () => resolve(null));
    req.on('timeout', () => {
      req.destroy();
      resolve(null);
    });
  });
}

function compareVersions(v1: string, v2: string): number {
  const p1 = String(v1).replace(/^[vV]/, '').split(/[-_]/)[0].split('.').map(Number);
  const p2 = String(v2).replace(/^[vV]/, '').split(/[-_]/)[0].split('.').map(Number);
  const len = Math.max(p1.length, p2.length);
  for (let i = 0; i < len; i++) {
    const n1 = p1[i] || 0;
    const n2 = p2[i] || 0;
    if (n1 > n2) return 1;
    if (n1 < n2) return -1;
  }
  return 0;
}

export async function checkForUpdates(mainWindow?: BrowserWindow | null): Promise<any> {
  const currentVer = (app.getVersion() || '1.0.0').replace(/^[vV]/, '').trim();

  // 1. Probe Anything Local Hub Server on port 49153
  try {
    const hubData = await fetchJson('http://127.0.0.1:49153/api/catalog');
    if (hubData && Array.isArray(hubData.apps)) {
      const item = hubData.apps.find((a: any) =>
        a.id === APP_ID || (typeof a.name === 'string' && a.name.toLowerCase().includes('pixelcharm'))
      );
      if (item && item.version) {
        const remoteVer = String(item.version).replace(/^[vV]/, '').trim();
        const newer = compareVersions(remoteVer, currentVer) > 0;
        const setupName = item.setupExecutableName || `Pixelcharm_Setup_${remoteVer}.exe`;
        const downloadUrl = `http://127.0.0.1:49153/api/download-package/${APP_ID}`;
        const updateInfo = {
          version: remoteVer,
          latestVersion: remoteVer,
          currentVersion: currentVer,
          hasUpdate: newer,
          downloadUrl: item.downloadUrl || downloadUrl,
          setupName,
          source: 'anything-hub',
          releaseNotes: item.changelog || ['Fast Local LAN Update via Anything Hub Server'],
          sizeFormatted: item.packageSize || '124.5 MB',
        };
        if (newer && mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('update:available', updateInfo);
        }
        if (newer) return updateInfo;
      }
    }
  } catch (err) {
    console.log('[Pixelcharm] Local Hub 49153 probe non-fatal warning:', err);
  }

  // 2. Fallback to GitHub Releases API
  try {
    const data = await fetchJson(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`);
    if (data && (data.tag_name || data.name)) {
      const remoteVer = String(data.tag_name || data.name).replace(/^[vV]/, '').trim();
      const newer = compareVersions(remoteVer, currentVer) > 0;
      const assets = data.assets || [];
      const setupAsset =
        assets.find((a: any) => a.name.toLowerCase().includes('setup') && a.name.endsWith('.exe')) ||
        assets.find((a: any) => a.name.endsWith('.exe')) ||
        assets[0];

      const updateInfo = {
        version: remoteVer,
        latestVersion: remoteVer,
        currentVersion: currentVer,
        hasUpdate: newer,
        downloadUrl: setupAsset ? setupAsset.browser_download_url : data.html_url,
        setupName: setupAsset ? setupAsset.name : `Pixelcharm_Setup_${remoteVer}.exe`,
        sizeFormatted: setupAsset && setupAsset.size ? `${(setupAsset.size / (1024 * 1024)).toFixed(1)} MB` : '124.5 MB',
        source: 'github-api',
        releaseNotes: data.body ? data.body.split('\n').filter(Boolean) : ['Official Release from GitHub'],
      };

      if (newer && mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('update:available', updateInfo);
      }
      return updateInfo;
    }
  } catch (err) {
    console.warn('[Pixelcharm] GitHub Releases check warning:', err);
  }

  return {
    version: currentVer,
    latestVersion: currentVer,
    currentVersion: currentVer,
    hasUpdate: false,
    downloadUrl: '',
    setupName: '',
    source: 'local',
    releaseNotes: ['You are running the latest verified release.'],
  };
}

export function registerUpdateIpc(mainWindowGetter: () => BrowserWindow | null): void {
  ipcMain.handle('update:check', async () => {
    return checkForUpdates(mainWindowGetter());
  });

  ipcMain.handle('update:install', async () => {
    if (!downloadedInstallerPath || !fs.existsSync(downloadedInstallerPath)) {
      throw new Error('No downloaded installer found to execute');
    }

    const installArgs = process.platform === 'win32' ? ['/S'] : [];
    const child = spawn(downloadedInstallerPath, installArgs, {
      detached: true,
      stdio: 'ignore',
    });
    child.unref();
    setTimeout(() => {
      app.quit();
    }, 400);
    return { success: true };
  });
}
