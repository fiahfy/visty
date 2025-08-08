import { exposeOperations as exposeContextMenuOperations } from '@fiahfy/electron-context-menu/preload'
import { exposeOperations as exposeWindowOperations } from '@fiahfy/electron-window/preload'
import {
  contextBridge,
  type IpcRendererEvent,
  ipcRenderer,
  webUtils,
} from 'electron'
import type { ApplicationMenuParams } from './application-menu'

contextBridge.exposeInMainWorld('electronAPI', {
  getCursorPosition: () => ipcRenderer.invoke('getCursorPosition'),
  getPlaylistFile: (filePath: string) =>
    ipcRenderer.invoke('getPlaylistFile', filePath),
  // biome-ignore lint/suspicious/noExplicitAny: false positive
  onMessage: (callback: (message: any) => void) => {
    // biome-ignore lint/suspicious/noExplicitAny: false positive
    const listener = (_event: IpcRendererEvent, message: any) =>
      callback(message)
    ipcRenderer.on('onMessage', listener)
    return () => ipcRenderer.off('onMessage', listener)
  },
  openFile: (file: File) =>
    ipcRenderer.invoke('openFile', webUtils.getPathForFile(file)),
  openFilePath: (filePath: string) => ipcRenderer.invoke('openFile', filePath),
  updateApplicationMenu: (params: ApplicationMenuParams) =>
    ipcRenderer.invoke('updateApplicationMenu', params),
  ...exposeContextMenuOperations(),
  ...exposeWindowOperations(),
})
