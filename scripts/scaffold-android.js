#!/usr/bin/env node
/*
 * Scaffolds a native Android folder from the React Native template bundled
 * with the installed version of `react-native` in node_modules.
 *
 * - Copies node_modules/react-native/template/android to ./android
 * - Renames package (com.helloworld -> com.<appName>) and app name
 * - Adjusts Kotlin packages and component name
 */
const fs = require('fs');
const path = require('path');

function log(msg) {
  process.stdout.write(`${msg}\n`);
}

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function replaceInFile(file, replacements) {
  let content = fs.readFileSync(file, 'utf8');
  for (const [from, to] of replacements) {
    content = content.split(from).join(to);
  }
  fs.writeFileSync(file, content);
}

function main() {
  const root = process.cwd();
  const androidDir = path.join(root, 'android');
  if (fs.existsSync(androidDir) && fs.existsSync(path.join(androidDir, 'settings.gradle'))) {
    log('Android project already exists. Skipping scaffold.');
    process.exit(0);
  }

  const appJson = readJSON(path.join(root, 'app.json'));
  const appName = appJson.name || 'app';
  const displayName = appJson.displayName || appName;
  const packageName = `com.${appName.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase()}`;

  const rnTemplateAndroid = path.join(root, 'node_modules', 'react-native', 'template', 'android');
  if (!fs.existsSync(rnTemplateAndroid)) {
    console.error('React Native template android folder not found in node_modules. Is react-native installed?');
    process.exit(1);
  }

  log('Scaffolding Android project from React Native template...');
  copyDir(rnTemplateAndroid, androidDir);

  // Replace project name and package in Gradle files
  const settingsGradle = path.join(androidDir, 'settings.gradle');
  const buildGradleApp = path.join(androidDir, 'app', 'build.gradle');
  const manifest = path.join(androidDir, 'app', 'src', 'main', 'AndroidManifest.xml');
  const stringsXml = path.join(androidDir, 'app', 'src', 'main', 'res', 'values', 'strings.xml');

  if (fs.existsSync(settingsGradle)) {
    replaceInFile(settingsGradle, [
      ["rootProject.name = 'HelloWorld'", `rootProject.name = '${displayName.replace(/'/g, "\\'")}'`],
    ]);
  }

  if (fs.existsSync(buildGradleApp)) {
    replaceInFile(buildGradleApp, [
      ['namespace "com.helloworld"', `namespace "${packageName}"`],
      ['applicationId "com.helloworld"', `applicationId "${packageName}"`],
    ]);
  }

  // Update strings.xml app_name
  if (fs.existsSync(stringsXml)) {
    replaceInFile(stringsXml, [[
      '>HelloWorld<', `>${displayName}<`
    ]]);
  }

  // Move Kotlin sources to match package
  const srcJavaDir = path.join(androidDir, 'app', 'src', 'main', 'java');
  const fromPkgPath = path.join(srcJavaDir, 'com', 'helloworld');
  const toPkgPath = path.join(srcJavaDir, ...packageName.split('.'));
  fs.mkdirSync(path.dirname(toPkgPath), { recursive: true });
  if (fs.existsSync(fromPkgPath)) {
    fs.renameSync(fromPkgPath, toPkgPath);
  }

  // Update package and main component name in Kotlin files
  const mainActivity = path.join(toPkgPath, 'MainActivity.kt');
  const mainApplication = path.join(toPkgPath, 'MainApplication.kt');
  if (fs.existsSync(mainActivity)) {
    replaceInFile(mainActivity, [
      ['package com.helloworld', `package ${packageName}`],
      ['"HelloWorld"', `"${appName}"`],
    ]);
  }
  if (fs.existsSync(mainApplication)) {
    replaceInFile(mainApplication, [
      ['package com.helloworld', `package ${packageName}`],
    ]);
  }

  // Manifest uses relative class names; no change needed, but keep file in place.
  if (fs.existsSync(manifest)) {
    // no-op
  }

  log(`Android project created with package '${packageName}' and name '${displayName}'.`);
  log('Open Android Studio in ./android to sync Gradle and run the app.');
}

try {
  main();
} catch (err) {
  console.error(err?.stack || String(err));
  process.exit(1);
}

