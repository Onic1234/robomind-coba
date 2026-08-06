const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Packages whose ESM build uses `import.meta`, which Metro serves as a
// classic <script> (not a module) and the browser rejects with
// "Cannot use 'import.meta' outside a module". Force the CommonJS build.
const commonJsOnly = {
  'zustand': 'zustand/index.js',
  'zustand/vanilla': 'zustand/vanilla.js',
  'zustand/middleware': 'zustand/middleware.js',
  'zustand/shallow': 'zustand/shallow.js',
  'zustand/traditional': 'zustand/traditional.js',
  'zustand/context': 'zustand/context.js',
  'zustand/react': 'zustand/react.js',
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (commonJsOnly[moduleName]) {
    return context.resolveRequest(context, commonJsOnly[moduleName], platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
