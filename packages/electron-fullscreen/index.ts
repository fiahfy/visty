import { BrowserWindow, IpcMainInvokeEvent, ipcMain } from 'electron'

export const createManager = () => {
  const channelPrefix = 'electron-fullscreen'

  ipcMain.handle(
    `${channelPrefix}-is-fullscreen`,
    (event: IpcMainInvokeEvent) => {
      const browserWindow = BrowserWindow.fromWebContents(event.sender)
      if (!browserWindow) {
        return false
      }
      return browserWindow.isFullScreen()
    },
  )

  ipcMain.handle(
    `${channelPrefix}-set-fullscreen`,
    (event: IpcMainInvokeEvent, visible: boolean) => {
      const browserWindow = BrowserWindow.fromWebContents(event.sender)
      if (!browserWindow) {
        return
      }
      browserWindow.setFullScreen(visible)
    },
  )

  ipcMain.handle(
    `${channelPrefix}-enter-fullscreen`,
    (event: IpcMainInvokeEvent) => {
      const browserWindow = BrowserWindow.fromWebContents(event.sender)
      if (!browserWindow) {
        return
      }
      browserWindow.setFullScreen(true)
    },
  )

  ipcMain.handle(
    `${channelPrefix}-exit-fullscreen`,
    (event: IpcMainInvokeEvent) => {
      const browserWindow = BrowserWindow.fromWebContents(event.sender)
      if (!browserWindow) {
        return
      }
      browserWindow.setFullScreen(false)
    },
  )

  ipcMain.handle(
    `${channelPrefix}-toggle-fullscreen`,
    (event: IpcMainInvokeEvent) => {
      const browserWindow = BrowserWindow.fromWebContents(event.sender)
      if (!browserWindow) {
        return
      }
      browserWindow.setFullScreen(!browserWindow.isFullScreen())
    },
  )

  const handle = (browserWindow: BrowserWindow) => {
    browserWindow.on('enter-full-screen', () =>
      browserWindow.webContents.send(`${channelPrefix}-send`, true),
    )
    browserWindow.on('leave-full-screen', () =>
      browserWindow.webContents.send(`${channelPrefix}-send`, false),
    )
  }

  return { handle }
}
