const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

function copyDirRecursiveSync(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursiveSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

module.exports = function withAndroidPublicAssets(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const publicDir = path.join(projectRoot, 'public');
      const androidAssetsDir = path.join(
        projectRoot,
        'android',
        'app',
        'src',
        'main',
        'assets'
      );

      console.log(`Copying public assets from ${publicDir} to ${androidAssetsDir}...`);
      copyDirRecursiveSync(publicDir, androidAssetsDir);

      return config;
    },
  ]);
};
