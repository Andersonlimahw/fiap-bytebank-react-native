#!/usr/bin/env node
/*
 * Safe wrapper for `react-native run-ios` that provides a clear error
 * when the native iOS project is missing, instead of crashing inside the CLI.
 */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const iosDir = path.join(root, 'ios');

function hasIOSProject() {
  if (!fs.existsSync(iosDir)) return false;
  const entries = fs.readdirSync(iosDir);
  const hasXcode = entries.some((e) => e.endsWith('.xcodeproj') || e.endsWith('.xcworkspace'));
  const hasPodfile = entries.includes('Podfile');
  return hasXcode || hasPodfile; // either indicates a native iOS project
}

if (!hasIOSProject()) {
  console.error(
    [
      'Unable to run iOS: no native iOS project found.',
      "Create one with 'npx react-native init <AppName>' and copy the ios folder,",
      "or run 'npx react-native@0.74.0 init <AppName>' to match your RN version.",
      'Alternatively, open Xcode and create the iOS target for this app.',
    ].join('\n')
  );
  process.exit(1);
}

const child = spawn('npx', ['react-native', 'run-ios', ...process.argv.slice(2)], {
  stdio: 'inherit',
  cwd: root,
  env: process.env,
});

child.on('exit', (code) => process.exit(code ?? 0));

