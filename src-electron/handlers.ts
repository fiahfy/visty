import type { Stats } from 'node:fs'
import { readdir, stat } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { type IpcMainInvokeEvent, ipcMain, screen } from 'electron'

type BaseEntry = {
  name: string
  path: string
  url: string
}
type File = BaseEntry & {
  type: 'file'
}
type Directory = BaseEntry & {
  type: 'directory'
}
type Entry = File | Directory

const getEntryType = (obj: Stats) => {
  if (obj.isFile()) {
    return 'file' as const
  }
  if (obj.isDirectory()) {
    return 'directory' as const
  }
  return 'other' as const
}

const getEntry = async (path: string): Promise<Entry> => {
  const stats = await stat(path)
  const type = getEntryType(stats)
  if (type === 'other') {
    throw new Error('Invalid entry type')
  }
  return {
    name: basename(path).normalize('NFC'),
    path,
    type,
    url: pathToFileURL(path).href,
  }
}

const getEntries = async (directoryPath: string) => {
  const dirents = await readdir(directoryPath, { withFileTypes: true })

  const entries = []
  for (const dirent of dirents) {
    try {
      const path = join(directoryPath, dirent.name)
      const file = await getEntry(path)
      entries.push(file)
    } catch {
      // noop
    }
  }
  return entries
}

const registerHandlers = () => {
  ipcMain.handle('getCursorPosition', (_event: IpcMainInvokeEvent) =>
    screen.getCursorScreenPoint(),
  )
  ipcMain.handle(
    'getEntries',
    (_event: IpcMainInvokeEvent, directoryPath: string) =>
      getEntries(directoryPath),
  )
  ipcMain.handle('getEntry', (_event: IpcMainInvokeEvent, path: string) =>
    getEntry(path),
  )
  ipcMain.handle('getParentEntry', (_event: IpcMainInvokeEvent, path: string) =>
    getEntry(dirname(path)),
  )
}

export default registerHandlers
