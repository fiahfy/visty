import { BrowserWindow, app } from 'electron'
import { createManager as createFullscreenManager } from 'electron-fullscreen'
import { createManager as createTrafficLightManager } from 'electron-traffic-light'
import { State, createManager as createWindowManager } from 'electron-window'
import { basename, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import registerApplicationMenu from './applicationMenu'
import registerContextMenu from './contextMenu'
import registerHandlers from './handlers'

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.DIST = join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged
  ? process.env.DIST
  : join(process.env.DIST, '../public')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

app.whenReady().then(async () => {
  const trafficLightManager = createTrafficLightManager()
  const fullscreenManager = createFullscreenManager()

  const baseCreateWindow = (state: State) => {
    const browserWindow = new BrowserWindow({
      ...state,
      minHeight: 350,
      minWidth: 550,
      titleBarStyle: process.platform === 'darwin' ? 'hidden' : 'default',
      webPreferences: {
        preload: join(__dirname, 'preload.js'),
        webSecurity: !VITE_DEV_SERVER_URL,
      },
    })

    if (VITE_DEV_SERVER_URL) {
      browserWindow.loadURL(VITE_DEV_SERVER_URL)
      browserWindow.on('ready-to-show', () => {
        browserWindow.webContents.openDevTools()
      })
    } else {
      browserWindow.loadFile(join(process.env.DIST, 'index.html'))
    }

    trafficLightManager.handle(browserWindow)
    fullscreenManager.handle(browserWindow)

    return browserWindow
  }

  const windowManager = createWindowManager(baseCreateWindow)

  const createWindow = (filePath: string) => {
    const file = {
      name: basename(filePath),
      path: filePath,
      url: pathToFileURL(filePath).href,
    }
    windowManager.create({ file })
  }

  registerApplicationMenu(createWindow)
  registerContextMenu()
  registerHandlers()

  await windowManager.restore()

  const path = process.argv[1]
  if (path && path !== '.') {
    // TODO: check file
    createWindow(path)
  }

  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      // noop
    }
  })

  app.on('before-quit', async () => {
    await windowManager.save()
  })
})
