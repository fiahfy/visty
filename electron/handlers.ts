import { BrowserWindow, IpcMainInvokeEvent, ipcMain, screen } from 'electron'
import mime from 'mime'
import { readdir } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'

type File = { name: string; path: string; url: string }

const isMediaFile = (path: string) => {
  const type = mime.getType(path)
  if (!type) {
    return false
  }
  return type.startsWith('audio/') || type.startsWith('video/')
}

const getMediaFiles = async (directoryPath: string) => {
  const dirents = await readdir(directoryPath, { withFileTypes: true })
  return dirents
    .reduce((acc, dirent) => {
      const path = join(directoryPath, dirent.name)
      if (!isMediaFile(path)) {
        return acc
      }
      return [
        ...acc,
        {
          name: dirent.name.normalize('NFC'),
          path,
          url: pathToFileURL(path).href,
        },
      ]
    }, [] as File[])
    .sort((a, b) => a.name.localeCompare(b.name))
}

const registerHandlers = () => {
  ipcMain.handle(
    'getPlaylistFile',
    async (_event: IpcMainInvokeEvent, filePath: string) => {
      const directoryPath = dirname(filePath)
      const files = await getMediaFiles(directoryPath)
      if (files.length <= 1) {
        return {
          next: undefined,
          previous: undefined,
        }
      }

      const index = files.findIndex((file) => file.path === filePath)
      const previousIndex = index === 0 ? files.length - 1 : index - 1
      const previous = files[previousIndex]
      const nextIndex = index === files.length - 1 ? 0 : index + 1
      const next = files[nextIndex]
      return {
        next,
        previous,
      }
    },
  )
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
