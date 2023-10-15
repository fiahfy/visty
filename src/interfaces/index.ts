// You can include shared interfaces/types in a separate file
// and then use them in any component by importing them. For
// example, to import the interface below do:
//
// import User from 'path/to/interfaces';
import { Operations as FullscreenOperations } from 'electron-fullscreen/preload'
import { Operations as TrafficLightOperations } from 'electron-traffic-light/preload'
import { Operations as WindowOperations } from 'electron-window/preload'

export interface IElectronAPI {
  changeOriginalSize: (size: { height: number; width: number }) => Promise<void>
  openFile: (filePath: string) => Promise<void>
  setTrafficLightHidden: (hidden: boolean) => Promise<void>
  applicationMenu: {
    update: (params: ApplicationMenuParams) => Promise<void>
  }
  contextMenu: {
    show: (params: ContextMenuParams) => Promise<void>
  }
  message: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addListener: (callback: (message: any) => void) => () => void
  }
  fullscreen: FullscreenOperations
  trafficLight: TrafficLightOperations
  window: WindowOperations<{
    file: { name: string; path: string; url: string }
  }>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ApplicationMenuParams = any

export type ContextMenuOption = {
  id: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any
}
export type ContextMenuParams = {
  isEditable: boolean
  selectionText: string
  x: number
  y: number
  options: ContextMenuOption[]
}

export type Settings = {
  defaultLoop: boolean
  defaultMuted: boolean
  defaultVolume: number
}
