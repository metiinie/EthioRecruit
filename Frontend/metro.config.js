const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Restrict Metro watcher to the Frontend project root only, preventing ENOENT on parent directory
config.projectRoot = __dirname;
config.watchFolders = [__dirname];

module.exports = config;
