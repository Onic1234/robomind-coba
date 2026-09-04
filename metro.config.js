const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Enable sourceExts and assetExts for Three.js / GLTF 3D models
config.resolver.sourceExts = ['js', 'jsx', 'json', 'ts', 'tsx', 'cjs', 'mjs'];
config.resolver.assetExts = [...config.resolver.assetExts, 'glb', 'gltf'];

// Custom resolver returning direct file paths for packages that trigger Metro resolution bugs
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Handle maath
  if (moduleName === 'maath') {
    return {
      filePath: require.resolve('maath/dist/maath.cjs.dev.js'),
      type: 'sourceFile',
    };
  }
  if (moduleName === 'maath/easing') {
    return {
      filePath: require.resolve('maath/easing/dist/maath-easing.cjs.dev.js'),
      type: 'sourceFile',
    };
  }

  // Handle @react-three/drei
  if (moduleName === '@react-three/drei') {
    return {
      filePath: require.resolve('@react-three/drei/index.cjs.js'),
      type: 'sourceFile',
    };
  }

  // Handle @react-three/fiber
  if (moduleName === '@react-three/fiber') {
    return {
      filePath: require.resolve('@react-three/fiber/dist/react-three-fiber.cjs.js'),
      type: 'sourceFile',
    };
  }

  // Handle zustand subpaths
  if (moduleName.startsWith('zustand')) {
    try {
      return {
        filePath: require.resolve(moduleName),
        type: 'sourceFile',
      };
    } catch (e) {}
  }

  // Handle relative ESM imports inside node_modules that end with .js (e.g. ./core/Billboard.js)
  if ((moduleName.startsWith('./') || moduleName.startsWith('../')) && moduleName.endsWith('.js') && context.originModulePath.includes('node_modules')) {
    const cleanName = moduleName.slice(0, -3);
    try {
      return context.resolveRequest(context, cleanName, platform);
    } catch (e) {}
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
