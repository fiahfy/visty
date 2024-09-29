// You can include shared interfaces/types in a separate file
// and then use them in any component by importing them. For
// example, to import the interface below do:
//
// import User from 'path/to/interfaces';
import { Operations as ContextMenuOperations } from '@fiahfy/electron-context-menu/preload'
import { Operations as WindowOperations } from '@fiahfy/electron-window/preload'

type File = { name: string; path: string; url: string }

type PlaylistFile = {
  next: File | undefined
  previous: File | undefined
}

export type IElectronAPI = {
  addMessageListener: (callback: (message: any) => void) => () => void
  getPlaylistFile: (filePath: string) => Promise<PlaylistFile>
  openFile: (filePath: string) => Promise<void>
  updateApplicationMenu: (params: ApplicationMenuParams) => Promise<void>
} & ContextMenuOperations &
  WindowOperations<{ file: File }>

export type ApplicationMenuParams = any
