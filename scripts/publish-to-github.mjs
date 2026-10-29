#!/usr/bin/env node
/**
 * Pixelcharm — Automated GitHub Setup EXE Release Trigger
 * Commits, tags (v<version>), and pushes to GitHub, triggering the GitHub Actions CI/CD pipeline
 * to build and publish Pixelcharm_Setup_<version>.exe directly to GitHub Releases.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const pkgPath = path.join(ROOT_DIR, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

const args = process.argv.slice(2);
let version = pkg.version || '1.0.0';
if (args[0] && !args[0].startsWith('--')) {
  version = args[0].replace(/^v/i, '');
}
const tagName = `v${version}`;

const repoOwner = 'BSFrameworks5253';
const repoName = 'Pixelcharm';
const repoUrl = `https://github.com/${repoOwner}/${repoName}`;

console.log('====================================================');
console.log(` 🚀 Pixelcharm — Triggering Setup EXE Release (${tagName})`);
console.log('====================================================');

const run = (cmd, allowFail = false) => {
  try {
    return execSync(cmd, { cwd: ROOT_DIR, stdio: 'inherit' });
  } catch (err) {
    if (!allowFail) {
      console.error(`Command failed: ${cmd}`);
      process.exit(1);
    }
  }
};

try {
  // 1. Stage all changes
  console.log('[1/4] Staging changes...');
  run('git add -A');

  // 2. Commit if there are changes
  console.log('[2/4] Committing release commit...');
  run(`git commit -m "chore(release): prepare Setup EXE release ${tagName}"`, true);

  // 3. Create or update tag
  console.log(`[3/4] Creating tag ${tagName}...`);
  run(`git tag -f ${tagName}`);

  // 4. Push branch and tag
  console.log('[4/4] Pushing commits & tags to GitHub...');
  run('git push -u origin main', true);
  run(`git push -f origin ${tagName}`);

  console.log('\n====================================================');
  console.log(' 🎉 Success! GitHub Actions CI/CD has been triggered!');
  console.log(` 📦 Repo: ${repoUrl}`);
  console.log(` ⚙️ Actions: ${repoUrl}/actions`);
  console.log(` 📥 Releases: ${repoUrl}/releases`);
  console.log('====================================================');
} catch (e) {
  console.error('[Pixelcharm Release Error]:', e);
  process.exit(1);
}
