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
    'set-window-size',
    (event: IpcMainInvokeEvent, size: { height: number; width: number }) => {
      try {
        const browserWindow = BrowserWindow.fromWebContents(event.sender)
        if (!browserWindow) {
          return
        }

        const { height, width } = size

        let bounds = browserWindow.getBounds()
        const screenBounds = screen.getDisplayMatching(bounds).bounds

        bounds = { ...bounds, height, width }

        if (bounds.x + bounds.width > screenBounds.width) {
          const newWidth =
            bounds.width > screenBounds.width
              ? screenBounds.width
              : bounds.width
          bounds = {
            ...bounds,
            x: screenBounds.width - newWidth,
            width: newWidth,
            height: (newWidth * height) / width,
          }
        }
        if (bounds.y + bounds.height > screenBounds.height) {
          const newHeight =
            bounds.height > screenBounds.height
              ? screenBounds.height
              : bounds.height
          bounds = {
            ...bounds,
            y: screenBounds.height - newHeight,
            height: newHeight,
            width: (newHeight * width) / height,
          }
        }

        browserWindow.setBounds(bounds, true)
        browserWindow.setAspectRatio(width / height)
      } catch (e) {
        // TODO: fix this
        if (e instanceof Error) {
          event.sender.send('message-send', {
            type: 'log',
            data: {
              code: 'error',
              message: e.message,
              trace: e.stack,
              params: size,
            },
          })
        } else {
          event.sender.send('message-send', {
            type: 'log',
            data: { code: 'unknown', error: e, params: size },
          })
        }
      }
    },
  )
}

export default registerHandlers
