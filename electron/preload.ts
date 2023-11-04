import { exposeOperations as exposeContextMenuOperations } from '@fiahfy/electron-context-menu/preload'
import { exposeOperations as exposeTrafficLightOperations } from '@fiahfy/electron-traffic-light/preload'
import { exposeOperations as exposeWindowOperations } from '@fiahfy/electron-window/preload'
import { IpcRendererEvent, contextBridge, ipcRenderer } from 'electron'
import { exposeOperations as exposeFullscreenOperations } from 'electron-fullscreen/preload'
import { ApplicationMenuParams } from './applicationMenu'

contextBridge.exposeInMainWorld('electronAPI', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addMessageListener: (callback: (message: any) => void) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const listener = (_event: IpcRendererEvent, message: any) =>
      callback(message)
    ipcRenderer.on('sendMessage', listener)
    return () => ipcRenderer.removeListener('sendMessage', listener)
  },
  getPlaylistItem: (filePath: string) =>
    ipcRenderer.invoke('getPlaylistItem', filePath),
  openFile: (filePath: string) => ipcRenderer.invoke('openFile', filePath),
  setContentSize: (size: { height: number; width: number }) =>
    ipcRenderer.invoke('setContentSize', size),
  updateApplicationMenu: (params: ApplicationMenuParams) =>
    ipcRenderer.invoke('updateApplicationMenu', params),
  ...exposeContextMenuOperations(),
  ...exposeFullscreenOperations(),
  ...exposeTrafficLightOperations(),
  ...exposeWindowOperations(),
})
