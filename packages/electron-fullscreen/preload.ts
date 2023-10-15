import { IpcRendererEvent, ipcRenderer } from 'electron'

export type Operations = {
  addListener: (callback: (fullscreen: boolean) => void) => () => void
  enterFullscreen: () => Promise<void>
  exitFullscreen: () => Promise<void>
  isFullscreen: () => Promise<boolean>
  setFullscreen: (fullscreen: boolean) => Promise<void>
  toggleFullscreen: () => Promise<void>
}

export const exposeOperations = () => {
  const channelPrefix = 'electron-fullscreen'
  return {
    addListener: (callback: (fullscreen: boolean) => void) => {
      const listener = (_event: IpcRendererEvent, fullscreen: boolean) =>
        callback(fullscreen)
      ipcRenderer.on(`${channelPrefix}-send`, listener)
      return () => ipcRenderer.removeListener(`${channelPrefix}-send`, listener)
    },
    enterFullscreen: () =>
      ipcRenderer.invoke(`${channelPrefix}-enter-fullscreen`),
    exitFullscreen: () =>
      ipcRenderer.invoke(`${channelPrefix}-exit-fullscreen`),
    isFullscreen: () => ipcRenderer.invoke(`${channelPrefix}-is-fullscreen`),
    setFullscreen: (fullscreen: boolean) =>
      ipcRenderer.invoke(`${channelPrefix}-set-fullscreen`, fullscreen),
    toggleFullscreen: () =>
      ipcRenderer.invoke(`${channelPrefix}-toggle-fullscreen`),
  }
}
