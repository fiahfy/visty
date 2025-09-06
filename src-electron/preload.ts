import { exposeOperations as exposeContextMenuOperations } from '@fiahfy/electron-context-menu/preload'
import { exposeOperations as exposeWindowOperations } from '@fiahfy/electron-window/preload'
import {
  contextBridge,
  type IpcRendererEvent,
  ipcRenderer,
  webUtils,
} from 'electron'
import type { ApplicationMenuParams } from './application-menu'

const applicationMenuOperations = {
  update: (params: ApplicationMenuParams) => ipcRenderer.send('update', params),
}

const electronOperations = {
  getCursorPosition: () => ipcRenderer.invoke('getCursorPosition'),
  getEntries: (directoryPath: string) =>
    ipcRenderer.invoke('getEntries', directoryPath),
  getEntry: (path: string) => ipcRenderer.invoke('getEntry', path),
  getParentEntry: (filePath: string) =>
    ipcRenderer.invoke('getParentEntry', filePath),
  getPathForFile: (file: File) => webUtils.getPathForFile(file),
  quit: () => ipcRenderer.send('quit'),
}

const messageOperations = {
  // biome-ignore lint/suspicious/noExplicitAny: false positive
  onMessage: (handler: (message: any) => void) => {
    // biome-ignore lint/suspicious/noExplicitAny: false positive
    const listener = (_event: IpcRendererEvent, message: any) =>
      handler(message)
    ipcRenderer.on('onMessage', listener)
    return () => ipcRenderer.off('onMessage', listener)
  },
}

contextBridge.exposeInMainWorld('applicationMenuAPI', applicationMenuOperations)
contextBridge.exposeInMainWorld('contextMenuAPI', exposeContextMenuOperations())
contextBridge.exposeInMainWorld('electronAPI', electronOperations)
contextBridge.exposeInMainWorld('messageAPI', messageOperations)
contextBridge.exposeInMainWorld('windowAPI', exposeWindowOperations())
