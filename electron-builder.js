const audioExtensions = require('audio-extensions')
const videoExtensions = require('video-extensions')

module.exports = {
  appId: 'net.fiahfy.visty',
  asar: true,
  directories: {
    output: 'dist-package',
  },
  files: ['dist', 'dist-electron'],
  // @see https://github.com/electron-userland/electron-builder/issues/3204
  fileAssociations: [
    ...audioExtensions.map((ext) => ({
      ext,
    })),
    ...videoExtensions.map((ext) => ({
      ext,
    })),
  ],
}
