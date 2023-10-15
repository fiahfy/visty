const audioExtensions = require('audio-extensions')
const videoExtensions = require('video-extensions')

module.exports = {
  appId: 'net.fiahfy.visty',
  asar: true,
  files: ['dist', 'dist-electron'],
  fileAssociations: [
    {
      ext: audioExtensions,
    },
    {
      ext: videoExtensions,
    },
  ],
}
