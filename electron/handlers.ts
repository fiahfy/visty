import { BrowserWindow, IpcMainInvokeEvent, ipcMain, screen } from 'electron'
import { basename } from 'node:path'
import { pathToFileURL } from 'node:url'

const registerHandlers = () => {
  ipcMain.handle('openFile', (event: IpcMainInvokeEvent, filePath: string) => {
    const file = {
      name: basename(filePath),
      path: filePath,
      url: pathToFileURL(filePath).href,
    }
    event.sender.send('sendMessage', { type: 'changeFile', data: { file } })
  })
  ipcMain.handle(
    'setContentSize',
    (event: IpcMainInvokeEvent, size: { height: number; width: number }) => {
      const browserWindow = BrowserWindow.fromWebContents(event.sender)
      if (!browserWindow) {
        return
      }

      const { height, width } = size

      const workArea = screen.getDisplayMatching(
        browserWindow.getBounds(),
      ).workArea

      let bounds = { ...browserWindow.getContentBounds(), height, width }
      if (bounds.x + bounds.width > workArea.x + workArea.width) {
        const newWidth =
          bounds.width > workArea.width ? workArea.width : bounds.width
        bounds = {
          ...bounds,
          x: workArea.x + workArea.width - newWidth,
          width: newWidth,
          height: Math.round((newWidth * height) / width),
        }
      }
      if (bounds.y + bounds.height > workArea.y + workArea.height) {
        const newHeight =
          bounds.height > workArea.height ? workArea.height : bounds.height
        bounds = {
          ...bounds,
          y: workArea.y + workArea.height - newHeight,
          height: newHeight,
          width: Math.round((newHeight * width) / height),
        }
      }
      browserWindow.setContentBounds(bounds, true)
      browserWindow.setAspectRatio(width / height)
    },
  )
}

export default registerHandlers
