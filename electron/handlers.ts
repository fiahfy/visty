import { BrowserWindow, IpcMainInvokeEvent, ipcMain, screen } from 'electron'
import { basename } from 'node:path'
import { pathToFileURL } from 'node:url'

const registerHandlers = () => {
  ipcMain.handle('open-file', (event: IpcMainInvokeEvent, filePath: string) => {
    const file = {
      name: basename(filePath),
      path: filePath,
      url: pathToFileURL(filePath).href,
    }
    event.sender.send('message-send', { type: 'changeFile', data: { file } })
  })
  ipcMain.handle(
    'set-content-size',
    (event: IpcMainInvokeEvent, size: { height: number; width: number }) => {
      const browserWindow = BrowserWindow.fromWebContents(event.sender)
      if (!browserWindow) {
        return
      }

      const { height, width } = size
      browserWindow.setAspectRatio(width / height)
      browserWindow.setContentSize(width, height)

      const windowBounds = browserWindow.getBounds()
      const screenBounds = screen.getDisplayNearestPoint(windowBounds).bounds
      if (windowBounds.x + windowBounds.width > screenBounds.width) {
        const newWidth =
          windowBounds.width > screenBounds.width
            ? screenBounds.width
            : windowBounds.width
        browserWindow.setBounds({
          ...windowBounds,
          x: screenBounds.width - newWidth,
          width: newWidth,
          height: (newWidth * height) / width,
        })
      }
      if (windowBounds.y + windowBounds.height > screenBounds.height) {
        const newHeight =
          windowBounds.height > screenBounds.height
            ? screenBounds.height
            : windowBounds.height
        browserWindow.setBounds({
          ...windowBounds,
          y: screenBounds.height - newHeight,
          height: newHeight,
          width: (newHeight * width) / height,
        })
      }
    },
  )
}

export default registerHandlers
