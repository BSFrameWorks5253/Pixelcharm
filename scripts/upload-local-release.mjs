#!/usr/bin/env node
/**
 * Direct Upload Script for Pixelcharm Setup EXE Release
 * Uploads local release/Pixelcharm_Setup_<version>.exe directly to GitHub Releases.
 */

import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Load environment token
let token = process.env.GITHUB_TOKEN;
const envPath = path.join(ROOT_DIR, '.env');
if (!token && fs.existsSync(envPath)) {
  const match = fs.readFileSync(envPath, 'utf8').match(/GITHUB_TOKEN=(.*)/);
  if (match) token = match[1].trim();
}

if (!token) {
  console.error('Error: GITHUB_TOKEN not found in environment or .env');
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf8'));
const version = pkg.version || '1.0.0';
const tagName = `v${version}`;
const releaseName = `Pixelcharm Setup ${tagName}`;
const owner = 'BSFrameworks5253';
const repo = 'Pixelcharm';

const exeName = `Pixelcharm_Setup_${version}.exe`;
const exePath = path.join(ROOT_DIR, 'release', exeName);

if (!fs.existsSync(exePath)) {
  console.error(`Error: Setup EXE not found at: ${exePath}`);
  console.error('Run "npm run build:win" first to build the installer.');
  process.exit(1);
}

const fileSize = fs.statSync(exePath).size;
console.log(`📦 Found Setup EXE: ${exeName} (${(fileSize / (1024 * 1024)).toFixed(2)} MB)`);

function ghRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function main() {
  console.log(`🔍 Checking release for tag ${tagName}...`);

  // 1. Get or create release
  let res = await ghRequest({
    hostname: 'api.github.com',
    path: `/repos/${owner}/${repo}/releases/tags/${tagName}`,
    headers: {
      'User-Agent': 'Pixelcharm-Uploader',
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });

  let release = res.data;
  if (res.status === 404) {
    console.log(`Creating release for ${tagName}...`);
    const createRes = await ghRequest({
      hostname: 'api.github.com',
      path: `/repos/${owner}/${repo}/releases`,
      method: 'POST',
      headers: {
        'User-Agent': 'Pixelcharm-Uploader',
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      }
    }, JSON.stringify({
      tag_name: tagName,
      target_commitish: 'main',
      name: releaseName,
      body: `### Pixelcharm — Professional Creative Image Suite\n\n- **Installer:** Setup EXE (NSIS)\n- **Platform:** Windows x64\n- **Version:** \`${tagName}\`\n\nDownload \`${exeName}\` below to install Pixelcharm on Windows.`,
      draft: false,
      prerelease: false
    }));
    release = createRes.data;
    console.log(`Release created: ${release.html_url}`);
  } else {
    console.log(`Existing release found: ${release.html_url}`);
  }

  if (!release.id || !release.upload_url) {
    console.error('Failed to get valid release:', release);
    process.exit(1);
  }

  // Check if asset already exists
  const existingAsset = (release.assets || []).find(a => a.name === exeName);
  if (existingAsset) {
    console.log(`Asset ${exeName} already uploaded: ${existingAsset.browser_download_url}`);
    return;
  }

  // Upload asset
  const uploadUrl = new URL(release.upload_url.replace(/\{.*\}/, ''));
  uploadUrl.searchParams.set('name', exeName);

  console.log(`🚀 Uploading ${exeName} to GitHub Releases...`);

  const fileStream = fs.createReadStream(exePath);
  const uploadReq = https.request({
    hostname: uploadUrl.hostname,
    path: `${uploadUrl.pathname}${uploadUrl.search}`,
    method: 'POST',
    headers: {
      'User-Agent': 'Pixelcharm-Uploader',
      'Authorization': `token ${token}`,
      'Content-Type': 'application/octet-stream',
      'Content-Length': fileSize
    }
  }, (uploadRes) => {
    let respBody = '';
    uploadRes.on('data', chunk => respBody += chunk);
    uploadRes.on('end', () => {
      console.log(`Upload finished with status code: ${uploadRes.statusCode}`);
      try {
        const asset = JSON.parse(respBody);
        console.log(`🎉 Download URL: ${asset.browser_download_url}`);
      } catch {
        console.log(respBody);
      }
    });
  });

  uploadReq.on('error', (err) => {
    console.error('Upload failed:', err);
  });

  let uploadedBytes = 0;
  fileStream.on('data', (chunk) => {
    uploadedBytes += chunk.length;
    const pct = ((uploadedBytes / fileSize) * 100).toFixed(1);
    process.stdout.write(`\rUploading... ${pct}% (${(uploadedBytes / 1048576).toFixed(1)} / ${(fileSize / 1048576).toFixed(1)} MB)`);
  });

  fileStream.pipe(uploadReq);
}

main().catch(console.error);
