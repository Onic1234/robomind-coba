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
