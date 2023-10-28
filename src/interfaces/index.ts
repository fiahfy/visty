// You can include shared interfaces/types in a separate file
// and then use them in any component by importing them. For
// example, to import the interface below do:
//
// import User from 'path/to/interfaces';
import { Operations as TrafficLightOperations } from '@fiahfy/electron-traffic-light/preload'
import { Operations as WindowOperations } from '@fiahfy/electron-window/preload'
import { Operations as FullscreenOperations } from 'electron-fullscreen/preload'

export type IElectronAPI = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addMessageListener: (callback: (message: any) => void) => () => void
  openFile: (filePath: string) => Promise<void>
  setContentSize: (size: { height: number; width: number }) => Promise<void>
  showContextMenu: (params: ContextMenuParams) => Promise<void>
  updateApplicationMenu: (params: ApplicationMenuParams) => Promise<void>
} & FullscreenOperations &
  TrafficLightOperations &
  WindowOperations<{
    file: { name: string; path: string; url: string }
  }>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ApplicationMenuParams = any

export type ContextMenuOption = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any
  type: string
}
export type ContextMenuParams = {
  isEditable: boolean
  options: ContextMenuOption[]
  selectionText: string
  x: number
  y: number
}

export type Settings = {
  defaultLoop: boolean
  defaultMuted: boolean
  defaultVolume: number
}
