import { exposeOperations as exposeContextMenuOperations } from '@fiahfy/electron-context-menu/preload'
import { exposeOperations as exposeWindowOperations } from '@fiahfy/electron-window/preload'
import { type IpcRendererEvent, contextBridge, ipcRenderer } from 'electron'
import type { ApplicationMenuParams } from './applicationMenu'

contextBridge.exposeInMainWorld('electronAPI', {
  addMessageListener: (callback: (message: any) => void) => {
    const listener = (_event: IpcRendererEvent, message: any) =>
      callback(message)
    ipcRenderer.on('sendMessage', listener)
    return () => ipcRenderer.off('sendMessage', listener)
  },
  getPlaylistFile: (filePath: string) =>
    ipcRenderer.invoke('getPlaylistFile', filePath),
  openFile: (filePath: string) => ipcRenderer.invoke('openFile', filePath),
  updateApplicationMenu: (params: ApplicationMenuParams) =>
    ipcRenderer.invoke('updateApplicationMenu', params),
  ...exposeContextMenuOperations(),
  ...exposeWindowOperations(),
})
