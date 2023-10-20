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

      const bounds = browserWindow.getBounds()
      const workArea = screen.getDisplayMatching(bounds).workArea

      let contentBounds = { ...browserWindow.getContentBounds(), height, width }

      const titleBarHeight = bounds.height - contentBounds.height
      if (contentBounds.x + contentBounds.width > workArea.x + workArea.width) {
        const newWidth =
          contentBounds.width > workArea.width
            ? workArea.width
            : contentBounds.width
        contentBounds = {
          ...contentBounds,
          x: workArea.x + workArea.width - newWidth,
          width: newWidth,
          height: Math.round((newWidth * height) / width),
        }
      }
      if (
        contentBounds.y + contentBounds.height >
        workArea.y + workArea.height
      ) {
        const newHeight =
          contentBounds.height > workArea.height - titleBarHeight
            ? workArea.height - titleBarHeight
            : contentBounds.height
        contentBounds = {
          ...contentBounds,
          y: workArea.y + workArea.height - newHeight,
          height: newHeight,
          width: Math.round((newHeight * width) / height),
        }
      }
      browserWindow.setContentBounds(contentBounds, true)
      browserWindow.setAspectRatio(width / height)
    },
  )
}

export default registerHandlers
