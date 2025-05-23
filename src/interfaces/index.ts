// You can include shared interfaces/types in a separate file
// and then use them in any component by importing them. For
// example, to import the interface below do:
//
// import User from 'path/to/interfaces';
import type { Operations as ContextMenuOperations } from '@fiahfy/electron-context-menu/preload'
import type { Operations as WindowOperations } from '@fiahfy/electron-window/preload'

type File = { name: string; path: string; url: string }

type PlaylistFile = {
  next: File | undefined
  previous: File | undefined
}

export type IElectronAPI = {
  getCursorPosition: () => Promise<{ x: number; y: number }>
  getPlaylistFile: (filePath: string) => Promise<PlaylistFile>
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  onMessage: (callback: (message: any) => void) => () => void
  openFile: (file: globalThis.File) => Promise<void>
  openFilePath: (filePath: string) => Promise<void>
  updateApplicationMenu: (params: ApplicationMenuParams) => Promise<void>
} & ContextMenuOperations &
  WindowOperations<{ file: File }>

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type ApplicationMenuParams = any
