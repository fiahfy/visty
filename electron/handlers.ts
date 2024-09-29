import { type IpcMainInvokeEvent, ipcMain } from 'electron'
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
      if (isMediaFile(path)) {
        acc.push({
          name: dirent.name.normalize('NFC'),
          path,
          url: pathToFileURL(path).href,
        })
      }
      return acc
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
}

export default registerHandlers
