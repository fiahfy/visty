import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  createStore,
  register as registerStorage,
} from '@fiahfy/electron-storage'
import {
  createManager as createWindowManager,
  type WindowCreator,
} from '@fiahfy/electron-window'
import { app, BrowserWindow, screen } from 'electron'
import started from 'electron-squirrel-startup'
import registerApplicationMenu from './application-menu'
import registerContextMenu from './context-menu'
import registerHandlers from './handlers'

const store = createStore()

const dirPath = dirname(fileURLToPath(import.meta.url))

const windowCreator: WindowCreator = (optionsResolver) => {
  const browserWindow = new BrowserWindow({
    ...optionsResolver({
      height: 768,
      width: 1024 + (MAIN_WINDOW_VITE_DEV_SERVER_URL ? 512 : 0),
    }),
    minHeight: 270,
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

const windowManager = createWindowManager(windowCreator)

const getOptions = () => {
  try {
    const value = store.get('persist:root')
    if (typeof value !== 'string') {
      return undefined
    }
    const state = JSON.parse(value)
    const settings = JSON.parse(state.settings)
    const defaultViewMode = settings.defaultViewMode
    switch (defaultViewMode) {
      case 'fullscreen':
        return { fullscreen: true }
      case 'maximized': {
        const cursor = screen.getCursorScreenPoint()
        const display = screen.getDisplayNearestPoint(cursor)
        const bounds = display.bounds
        return { height: bounds.height, width: bounds.width }
      }
    }
    return undefined
  } catch {
    return undefined
  }
}

const createWindow = (filePath: string) => {
  const options = getOptions()
  windowManager.create({ filePath }, options)
}

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
  registerStorage(store)

  windowManager.restore()
})
