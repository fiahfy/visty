import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createManager as createWindowManager } from '@fiahfy/electron-window'
import {
  app,
  BrowserWindow,
  type BrowserWindowConstructorOptions,
} from 'electron'
import started from 'electron-squirrel-startup'
import registerApplicationMenu from './application-menu'
import registerContextMenu from './context-menu'
import registerHandlers from './handlers'

const dirPath = dirname(fileURLToPath(import.meta.url))

const baseCreateWindow = (options: BrowserWindowConstructorOptions) => {
  const browserWindow = new BrowserWindow({
    ...options,
    minHeight: 300,
    minWidth: 400,
    titleBarStyle: process.platform === 'darwin' ? 'hidden' : 'default',
    webPreferences: {
      preload: join(dirPath, 'preload.js'),
      webSecurity: !MAIN_WINDOW_VITE_DEV_SERVER_URL,
    },
  })

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    browserWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
    browserWindow.on('ready-to-show', () => {
      browserWindow.webContents.openDevTools()
    })
  } else {
    browserWindow.loadFile(
      join(dirPath, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    )
  }

  return browserWindow
}

const windowManager = createWindowManager(baseCreateWindow)

const createWindow = (filePath: string) => windowManager.create({ filePath })

app.setAsDefaultProtocolClient('visty')

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit()
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
