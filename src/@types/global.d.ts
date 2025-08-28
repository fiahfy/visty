import type { Operations as ContextMenuOperations } from '@fiahfy/electron-context-menu/preload'
import type { Operations as WindowOperations } from '@fiahfy/electron-window/preload'
import type {
  ApplicationMenuOperations,
  ElectronOperations,
  MessageOperations,
} from '~/interfaces'

declare global {
  interface Window {
    applicationMenuAPI: ApplicationMenuOperations
    electronAPI: ElectronOperations
    contextMenuAPI: ContextMenuOperations
    messageAPI: MessageOperations
    windowAPI: WindowOperations<{ filePath: string }>
  }
}
