import { IpcRendererEvent, ipcRenderer } from 'electron'

export type Operations = {
  addFullscreenListener: (callback: (fullscreen: boolean) => void) => () => void
  enterFullscreen: () => Promise<void>
  exitFullscreen: () => Promise<void>
  isFullscreen: () => Promise<boolean>
  setFullscreen: (fullscreen: boolean) => Promise<void>
  toggleFullscreen: () => Promise<void>
}

export const exposeOperations = () => {
  return {
    addFullscreenListener: (callback: (fullscreen: boolean) => void) => {
      const listener = (_event: IpcRendererEvent, fullscreen: boolean) =>
        callback(fullscreen)
      ipcRenderer.on('sendFullscreen', listener)
      return () => ipcRenderer.removeListener('sendFullscreen', listener)
    },
    enterFullscreen: () => ipcRenderer.invoke('enterFullscreen'),
    exitFullscreen: () => ipcRenderer.invoke('exitFullscreen'),
    isFullscreen: () => ipcRenderer.invoke('isFullscreen'),
    setFullscreen: (fullscreen: boolean) =>
      ipcRenderer.invoke('setFullscreen', fullscreen),
    toggleFullscreen: () => ipcRenderer.invoke('toggleFullscreen'),
  }
}
