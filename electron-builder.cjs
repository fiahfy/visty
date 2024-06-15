module.exports = (async () => {
  const audioExtensions = (
    await import('audio-extensions', { assert: { type: 'json' } })
  ).default
  const videoExtensions = (await import('video-extensions')).default

  return {
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
})()
