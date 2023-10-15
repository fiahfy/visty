import { IpcRendererEvent, contextBridge, ipcRenderer } from 'electron'
import { exposeOperations as exposeFullscreenOperations } from 'electron-fullscreen/preload'
import { exposeOperations as exposeTrafficLightOperations } from 'electron-traffic-light/preload'
import { exposeOperations as exposeWindowOperations } from 'electron-window/preload'
import { ApplicationMenuParams } from './applicationMenu'
import { ContextMenuParams } from './contextMenu'

contextBridge.exposeInMainWorld('electronAPI', {
  changeOriginalSize: (size: { height: number; width: number }) =>
    ipcRenderer.invoke('change-original-size', size),
  openFile: (filePath: string) => ipcRenderer.invoke('open-file', filePath),
  setTrafficLightHidden: (hidden: boolean) =>
    ipcRenderer.invoke('set-traffic-light-hidden', hidden),
  applicationMenu: {
    update: (params: ApplicationMenuParams) =>
      ipcRenderer.invoke('application-menu-update', params),
  },
  contextMenu: {
    show: (params: ContextMenuParams) =>
      ipcRenderer.invoke('context-menu-show', params),
  },
  message: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addListener: (callback: (message: any) => void) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const listener = (_event: IpcRendererEvent, message: any) =>
        callback(message)
      ipcRenderer.on('message-send', listener)
      return () => ipcRenderer.removeListener('message-send', listener)
    },
  },
  fullscreen: exposeFullscreenOperations(),
  trafficLight: exposeTrafficLightOperations(),
  window: exposeWindowOperations(),
})
