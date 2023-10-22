import { IpcRendererEvent, contextBridge, ipcRenderer } from 'electron'
import { exposeOperations as exposeFullscreenOperations } from 'electron-fullscreen/preload'
import { exposeOperations as exposeTrafficLightOperations } from 'electron-traffic-light/preload'
import { exposeOperations as exposeWindowOperations } from 'electron-window/preload'
import { ApplicationMenuParams } from './applicationMenu'
import { ContextMenuParams } from './contextMenu'

contextBridge.exposeInMainWorld('electronAPI', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addMessageListener: (callback: (message: any) => void) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const listener = (_event: IpcRendererEvent, message: any) =>
      callback(message)
    ipcRenderer.on('sendMessage', listener)
    return () => ipcRenderer.removeListener('sendMessage', listener)
  },
  openFile: (filePath: string) => ipcRenderer.invoke('openFile', filePath),
  setContentSize: (size: { height: number; width: number }) =>
    ipcRenderer.invoke('setContentSize', size),
  showContextMenu: (params: ContextMenuParams) =>
    ipcRenderer.invoke('showContextMenu', params),
  updateApplicationMenu: (params: ApplicationMenuParams) =>
    ipcRenderer.invoke('updateApplicationMenu', params),
  fullscreen: exposeFullscreenOperations(),
  trafficLight: exposeTrafficLightOperations(),
  window: exposeWindowOperations(),
})
