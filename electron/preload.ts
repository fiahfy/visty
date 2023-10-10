import { IpcRendererEvent, contextBridge, ipcRenderer } from 'electron'
import { ApplicationMenuParams } from './applicationMenu'
import { ContextMenuParams } from './contextMenu'

contextBridge.exposeInMainWorld('electronAPI', {
  changeOriginalSize: (size: { height: number; width: number }) =>
    ipcRenderer.invoke('change-original-size', size),
  openFile: (filePath: string) => ipcRenderer.invoke('open-file', filePath),
  applicationMenu: {
    update: (params: ApplicationMenuParams) =>
      ipcRenderer.invoke('application-menu-update', params),
  },
  contextMenu: {
    show: (params: ContextMenuParams) =>
      ipcRenderer.invoke('context-menu-show', params),
  },
  fullscreen: {
    addListener: (callback: (fullscreen: boolean) => void) => {
      const listener = (_event: IpcRendererEvent, fullscreen: boolean) =>
        callback(fullscreen)
      ipcRenderer.on('fullscreen-send', listener)
      return () => ipcRenderer.removeListener('fullscreen-send', listener)
    },
    isEntered: () => ipcRenderer.invoke('fullscreen-is-entered'),
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
  node: {
    basename: (path: string) => ipcRenderer.invoke('node-basename', path),
    dirname: (path: string) => ipcRenderer.invoke('node-dirname', path),
    isDarwin: () => ipcRenderer.invoke('node-is-darwin'),
  },
  window: {
    restore: () => ipcRenderer.invoke('window-restore'),
    open: (params: { file: { name: string; path: string; url: string } }) =>
      ipcRenderer.invoke('window-open', params),
  },
})
