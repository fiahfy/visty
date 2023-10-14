import { BrowserWindow, IpcMainInvokeEvent, ipcMain } from 'electron'
import { basename } from 'node:path'
import { pathToFileURL } from 'node:url'

const registerHandlers = () => {
  ipcMain.handle(
    'change-original-size',
    (event: IpcMainInvokeEvent, size: { height: number; width: number }) => {
      const browserWindow = BrowserWindow.fromWebContents(event.sender)
      if (!browserWindow) {
        return
      }
      const { height, width } = size
      browserWindow.setContentSize(width, height)
      browserWindow.setAspectRatio(width / height)
    },
  )
  ipcMain.handle('open-file', (event: IpcMainInvokeEvent, filePath: string) => {
    const file = {
      name: basename(filePath),
      path: filePath,
      url: pathToFileURL(filePath).href,
    }
    event.sender.send('message-send', { type: 'changeFile', data: { file } })
  })
  ipcMain.handle(
    'set-traffic-light-hidden',
    (event: IpcMainInvokeEvent, hidden: boolean) => {
      const browserWindow = BrowserWindow.fromWebContents(event.sender)
      if (!browserWindow) {
        return
      }
      browserWindow.setWindowButtonVisibility(!hidden)
    },
  )
}

export default registerHandlers
