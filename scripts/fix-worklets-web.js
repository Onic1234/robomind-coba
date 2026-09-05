const fs = require('fs');
const path = require('path');

const targetFiles = [
  path.join(__dirname, '../node_modules/react-native-worklets/lib/module/serializableMappingCache.js'),
  path.join(__dirname, '../node_modules/react-native-worklets/src/serializableMappingCache.ts'),
];

const newContentJs = `'use strict';
import { SHOULD_BE_USE_WEB } from "./PlatformChecker/index.js";
export const serializableMappingFlag = Symbol('serializable flag');
const cache = new WeakMap();
export const serializableMappingCache = {
  set(serializable, serializableRef) {
    if (!SHOULD_BE_USE_WEB) {
      cache.set(serializable, serializableRef || serializableMappingFlag);
    }
  },
  get(serializable) {
    if (SHOULD_BE_USE_WEB) return null;
    return cache.get(serializable);
  }
};
`;

const newContentTs = `'use strict';
import { SHOULD_BE_USE_WEB } from './PlatformChecker';
import type { SerializableRef } from './workletTypes';
export const serializableMappingFlag = Symbol('serializable flag');
const cache = new WeakMap<object, SerializableRef | symbol>();
export const serializableMappingCache = {
  set(serializable: object, serializableRef?: SerializableRef): void {
    if (!SHOULD_BE_USE_WEB) {
      cache.set(serializable, serializableRef || serializableMappingFlag);
    }
  },
  get(serializable: object) {
    if (SHOULD_BE_USE_WEB) return null;
    return cache.get(serializable);
  }
};
`;

targetFiles.forEach((filePath) => {
  if (fs.existsSync(filePath)) {
    if (filePath.endsWith('.ts')) {
      fs.writeFileSync(filePath, newContentTs, 'utf-8');
    } else {
      fs.writeFileSync(filePath, newContentJs, 'utf-8');
    }
    console.log('[fix-worklets-web] Successfully patched:', filePath);
  }
});

// Patch Babel get helpers
const babelGetFiles = [
  path.join(__dirname, '../node_modules/@babel/runtime/helpers/get.js'),
  path.join(__dirname, '../node_modules/@babel/runtime/helpers/esm/get.js'),
  path.join(__dirname, '../node_modules/@babel/helpers/lib/helpers/get.js'),
  path.join(__dirname, '../node_modules/@babel/helpers/lib/helpers-generated.js'),
];

babelGetFiles.forEach((filePath) => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    if (content.includes('Reflect.get.bind()')) {
      content = content.replace(/Reflect\.get\.bind\(\)/g, 'Reflect.get.bind(Reflect)');
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log('[fix-worklets-web] Patched Babel get helper:', filePath);
    }
  }
});

// Ensure missing public asset aliases exist
const copyAsset = (src, dest) => {
  if (fs.existsSync(src) && !fs.existsSync(dest)) {
    fs.copyFileSync(src, dest);
    console.log('[fix-worklets-web] Copied asset alias:', dest);
  }
};

copyAsset(
  path.join(__dirname, '../assets/images/modul_robot.png'),
  path.join(__dirname, '../public/modul_robot.png')
);
copyAsset(
  path.join(__dirname, '../public/bule_character.png'),
  path.join(__dirname, '../public/bule_perempuan.png')
);
