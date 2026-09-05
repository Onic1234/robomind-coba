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

// Patch merge-options to support ES module interop safely
const mergeOptionsPath = path.join(__dirname, '../node_modules/merge-options/index.js');
if (fs.existsSync(mergeOptionsPath)) {
  const cleanContent = `'use strict';
const isOptionObject = require('is-plain-obj');

const {hasOwnProperty} = Object.prototype;
const {propertyIsEnumerable} = Object;
const defineProperty = (object, name, value) => Object.defineProperty(object, name, {
	value,
	writable: true,
	enumerable: true,
	configurable: true
});

const globalThis = this;
const defaultMergeOptions = {
	concatArrays: false,
	ignoreUndefined: false
};

const getEnumerableOwnPropertyKeys = value => {
	const keys = [];

	for (const key in value) {
		if (hasOwnProperty.call(value, key)) {
			keys.push(key);
		}
	}

	if (Object.getOwnPropertySymbols) {
		const symbols = Object.getOwnPropertySymbols(value);

		for (const symbol of symbols) {
			if (propertyIsEnumerable.call(value, symbol)) {
				keys.push(symbol);
			}
		}
	}

	return keys;
};

function clone(value) {
	if (Array.isArray(value)) {
		return cloneArray(value);
	}

	if (isOptionObject(value)) {
		return cloneOptionObject(value);
	}

	return value;
}

function cloneArray(array) {
	const result = array.slice(0, 0);

	getEnumerableOwnPropertyKeys(array).forEach(key => {
		defineProperty(result, key, clone(array[key]));
	});

	return result;
}

function cloneOptionObject(object) {
	const result = Object.getPrototypeOf(object) === null ? Object.create(null) : {};

	getEnumerableOwnPropertyKeys(object).forEach(key => {
		defineProperty(result, key, clone(object[key]));
	});

	return result;
}

const mergeKeys = (merged, source, keys, config) => {
	keys.forEach(key => {
		if (typeof source[key] === 'undefined' && config.ignoreUndefined) {
			return;
		}

		if (key in merged && merged[key] !== Object.getPrototypeOf(merged)) {
			defineProperty(merged, key, merge(merged[key], source[key], config));
		} else {
			defineProperty(merged, key, clone(source[key]));
		}
	});

	return merged;
};

const concatArrays = (merged, source, config) => {
	let result = merged.slice(0, 0);
	let resultIndex = 0;

	[merged, source].forEach(array => {
		const indices = [];

		for (let k = 0; k < array.length; k++) {
			if (!hasOwnProperty.call(array, k)) {
				continue;
			}

			indices.push(String(k));

			if (array === merged) {
				defineProperty(result, resultIndex++, array[k]);
			} else {
				defineProperty(result, resultIndex++, clone(array[k]));
			}
		}

		result = mergeKeys(result, array, getEnumerableOwnPropertyKeys(array).filter(key => !indices.includes(key)), config);
	});

	return result;
};

function merge(merged, source, config) {
	if (config.concatArrays && Array.isArray(merged) && Array.isArray(source)) {
		return concatArrays(merged, source, config);
	}

	if (!isOptionObject(source) || !isOptionObject(merged)) {
		return clone(source);
	}

	return mergeKeys(merged, source, getEnumerableOwnPropertyKeys(source), config);
}

const fn = function (...options) {
	const config = merge(clone(defaultMergeOptions), (this !== globalThis && this) || {}, defaultMergeOptions);
	let merged = {_: {}};

	for (const option of options) {
		if (option === undefined) {
			continue;
		}

		if (!isOptionObject(option)) {
			throw new TypeError(option + " is not an Option Object");
		}

		merged = merge(merged, {_: option}, config);
	}

	return merged._;
};
fn.default = fn;
fn.__esModule = true;
module.exports = fn;
`;
  fs.writeFileSync(mergeOptionsPath, cleanContent, 'utf-8');
  console.log('[fix-worklets-web] Patched merge-options ES interop:', mergeOptionsPath);
}

// Patch AsyncStorage.js merge-options import
const asyncStoragePaths = [
  path.join(__dirname, '../node_modules/@react-native-async-storage/async-storage/lib/module/AsyncStorage.js'),
  path.join(__dirname, '../node_modules/@react-native-async-storage/async-storage/lib/commonjs/AsyncStorage.js'),
];
asyncStoragePaths.forEach((filePath) => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    if (content.includes('mergeOptions.bind(')) {
      content = content.replace(
        /const merge = mergeOptions\.bind\(\{/g,
        'const _getFn = (m) => (typeof m === "function" ? m : (m && typeof m.default === "function" ? m.default : (m && m.default && typeof m.default.default === "function" ? m.default.default : () => ({}))));\nconst merge = _getFn(mergeOptions).bind({'
      );
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log('[fix-worklets-web] Patched AsyncStorage mergeOptions:', filePath);
    }
  }
});
// Ensure web-games static directory exists and is synced
const webGamesDir = path.join(__dirname, '../public/web-games');
if (!fs.existsSync(webGamesDir)) {
  fs.mkdirSync(webGamesDir, { recursive: true });
}

const gameFolders = ['robo-pose', 'robo-jek', 'robo-delivery', 'robo-maze', 'robo-bros'];
const copyFolderRecursiveSync = (src, dest) => {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyFolderRecursiveSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
};

gameFolders.forEach((folder) => {
  const src = path.join(__dirname, '../public', folder);
  const dest = path.join(__dirname, '../public/web-games', folder);
  if (fs.existsSync(src)) {
    copyFolderRecursiveSync(src, dest);
    console.log('[fix-worklets-web] Synced web-games folder:', dest);
  }
});


