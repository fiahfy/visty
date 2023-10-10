import { BrowserWindow, IpcMainInvokeEvent, ipcMain } from 'electron'
import { basename } from 'path'
import { pathToFileURL } from 'url'

const registerHandlers = () => {
  ipcMain.handle('node-is-darwin', () => process.platform === 'darwin')
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
}

export default registerHandlers
