import { exposeOperations as exposeContextMenuOperations } from '@fiahfy/electron-context-menu/preload'
import { exposeOperations as exposeWindowOperations } from '@fiahfy/electron-window/preload'
import {
  type IpcRendererEvent,
  contextBridge,
  ipcRenderer,
  webUtils,
} from 'electron'
import type { ApplicationMenuParams } from './applicationMenu'

contextBridge.exposeInMainWorld('electronAPI', {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  addMessageListener: (callback: (message: any) => void) => {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const listener = (_event: IpcRendererEvent, message: any) =>
      callback(message)
    ipcRenderer.on('sendMessage', listener)
    return () => ipcRenderer.off('sendMessage', listener)
  },
  getPlaylistFile: (filePath: string) =>
    ipcRenderer.invoke('getPlaylistFile', filePath),
  openFile: (file: File) =>
    ipcRenderer.invoke('openFile', webUtils.getPathForFile(file)),
  openFilePath: (filePath: string) => ipcRenderer.invoke('openFile', filePath),
  updateApplicationMenu: (params: ApplicationMenuParams) =>
    ipcRenderer.invoke('updateApplicationMenu', params),
  ...exposeContextMenuOperations(),
  ...exposeWindowOperations(),
})
