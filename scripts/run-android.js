#!/usr/bin/env node
/*
 * Safe wrapper for `react-native run-android` that:
 * - Creates a native Android project from the local RN template if missing
 * - Then runs the Android app
 */
const { spawnSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const androidDir = path.join(root, 'android');

function hasAndroidProject() {
  return fs.existsSync(path.join(androidDir, 'settings.gradle')) && fs.existsSync(path.join(androidDir, 'app'));
}

function scaffoldIfMissing() {
  if (hasAndroidProject()) return;
  console.log('No Android project found. Creating one from the local React Native template...');
  const res = spawnSync('node', ['scripts/scaffold-android.js'], { stdio: 'inherit' });
  if (res.status !== 0) {
    console.error('Failed to scaffold Android project. Aborting.');
    process.exit(res.status || 1);
  }
}

function runAndroid() {
  const args = ['react-native', 'run-android', ...process.argv.slice(2)];
  // Avoid launching a separate Terminal for the packager in CI/non-interactive envs
  if (process.env.CI || process.env.CODESPACES || process.env.TERM_PROGRAM === 'vscode') {
    if (!args.includes('--no-packager')) args.push('--no-packager');
    console.log('Tip: start Metro separately with `npm start`');
  }
  const child = spawn('npx', args, { stdio: 'inherit', cwd: root, env: process.env });
  child.on('exit', (code) => process.exit(code ?? 0));
}

scaffoldIfMissing();
runAndroid();

