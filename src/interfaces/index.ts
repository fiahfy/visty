// You can include shared interfaces/types in a separate file
// and then use them in any component by importing them. For
// example, to import the interface below do:
//
// import User from 'path/to/interfaces';

export interface IElectronAPI {
  changeOriginalSize: (size: { height: number; width: number }) => Promise<void>
  openFile: (filePath: string) => Promise<void>
  applicationMenu: {
    update: (params: ApplicationMenuParams) => Promise<void>
  }
  contextMenu: {
    show: (params: ContextMenuParams) => Promise<void>
  }
  fullscreen: {
    addListener: (callback: (fullscreen: boolean) => void) => () => void
    isEntered: () => Promise<boolean>
  }
  message: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addListener: (callback: (message: any) => void) => () => void
  }
  node: {
    basename: (path: string) => Promise<string>
    dirname: (path: string) => Promise<string>
    isDarwin: () => Promise<boolean>
  }
  window: {
    restore: () => Promise<
      | {
          index: number
          params: { file: { name: string; path: string; url: string } }
          restored: boolean
        }
      | undefined
    >
    open: (params: { directory: string }) => Promise<void>
  }
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
