import { BrowserWindow, IpcMainInvokeEvent, ipcMain } from 'electron'

export const createManager = () => {
  ipcMain.handle('isFullscreen', (event: IpcMainInvokeEvent) => {
    const browserWindow = BrowserWindow.fromWebContents(event.sender)
    if (!browserWindow) {
      return false
    }
    return browserWindow.isFullScreen()
  })

  ipcMain.handle(
    'setFullscreen',
    (event: IpcMainInvokeEvent, visible: boolean) => {
      const browserWindow = BrowserWindow.fromWebContents(event.sender)
      if (!browserWindow) {
        return
      }
      browserWindow.setFullScreen(visible)
    },
  )

  ipcMain.handle('enterFullscreen', (event: IpcMainInvokeEvent) => {
    const browserWindow = BrowserWindow.fromWebContents(event.sender)
    if (!browserWindow) {
      return
    }
    browserWindow.setFullScreen(true)
  })

  ipcMain.handle('exitFullscreen', (event: IpcMainInvokeEvent) => {
    const browserWindow = BrowserWindow.fromWebContents(event.sender)
    if (!browserWindow) {
      return
    }
    browserWindow.setFullScreen(false)
  })

  ipcMain.handle('toggleFullscreen', (event: IpcMainInvokeEvent) => {
    const browserWindow = BrowserWindow.fromWebContents(event.sender)
    if (!browserWindow) {
      return
    }
    browserWindow.setFullScreen(!browserWindow.isFullScreen())
  })

  const handle = (browserWindow: BrowserWindow) => {
    browserWindow.on('enter-full-screen', () =>
      browserWindow.webContents.send('sendFullscreen', true),
    )
    browserWindow.on('leave-full-screen', () =>
      browserWindow.webContents.send('sendFullscreen', false),
    )
  }

  return { handle }
}
