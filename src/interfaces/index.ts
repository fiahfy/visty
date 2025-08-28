// You can include shared interfaces/types in a separate file
// and then use them in any component by importing them. For
// example, to import the interface below do:
//
// import User from 'path/to/interfaces';

export type ApplicationMenuOperations = {
  update: (params: ApplicationMenuParams) => void
}

export type ElectronOperations = {
  getCursorPosition: () => Promise<{ x: number; y: number }>
  getEntries: (directoryPath: string) => Promise<Entry[]>
  getEntry: (path: string) => Promise<Entry>
  getParentEntry: (path: string) => Promise<Entry>
  getPathForFile: (file: globalThis.File) => string
}

export type MessageOperations = {
  // biome-ignore lint/suspicious/noExplicitAny: false positive
  onMessage: (handler: (message: any) => void) => () => void
}

type BaseEntry = {
  name: string
  path: string
  url: string
}
type File = BaseEntry & {
  type: 'file'
}
type Directory = BaseEntry & {
  type: 'directory'
}
export type Entry = File | Directory

export type ApplicationMenuParams = Partial<{
  loop: boolean
  partialLoop: boolean
}>
