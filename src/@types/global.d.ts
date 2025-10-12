import type { Operations as ContextMenuOperations } from '@fiahfy/electron-context-menu/preload'
import type { Operations as StorageOperations } from '@fiahfy/electron-storage/preload'
import type { Operations as WindowOperations } from '@fiahfy/electron-window/preload'
import type {
  ApplicationMenuOperations,
  ElectronOperations,
  MessageOperations,
} from '~/interfaces'

declare global {
  interface Window {
    applicationMenuAPI: ApplicationMenuOperations
    contextMenuAPI: ContextMenuOperations
    electronAPI: ElectronOperations
    messageAPI: MessageOperations
    storageAPI: StorageOperations
    windowAPI: WindowOperations<{ filePath: string }>
  }
}
