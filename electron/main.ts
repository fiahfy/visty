import { createManager as createWindowManager } from '@fiahfy/electron-window'
import { BrowserWindow, BrowserWindowConstructorOptions, app } from 'electron'
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

const baseCreateWindow = (options: BrowserWindowConstructorOptions) => {
  const browserWindow = new BrowserWindow({
    ...options,
    minHeight: 300,
    minWidth: 400,
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

app.setAsDefaultProtocolClient('visty')

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

app.on('before-quit', () => {
  windowManager.save()
})

app.on('open-file', async (_event, path) => {
  await app.whenReady()
  createWindow(path)
})

app.on('open-url', async (_event, url) => {
  await app.whenReady()
  const u = new URL(url)
  if (u.hostname === 'open') {
    const path = u.searchParams.get('path') ?? ''
    createWindow(path)
  }
})

app.whenReady().then(() => {
  registerApplicationMenu(createWindow)
  registerContextMenu()
  registerHandlers()

  windowManager.restore()
})
