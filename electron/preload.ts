import { exposeOperations as exposeContextMenuOperations } from '@fiahfy/electron-context-menu/preload'
import { exposeOperations as exposeWindowOperations } from '@fiahfy/electron-window/preload'
import { IpcRendererEvent, contextBridge, ipcRenderer } from 'electron'
import { ApplicationMenuParams } from './applicationMenu'

contextBridge.exposeInMainWorld('electronAPI', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addMessageListener: (callback: (message: any) => void) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
