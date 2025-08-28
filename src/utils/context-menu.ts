import {
  buildContextMenuParams,
  type ContextMenuOption,
} from '@fiahfy/electron-context-menu/renderer'
import type { MouseEvent } from 'react'

export const createContextMenuHandler = (options: ContextMenuOption[] = []) => {
  return async (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    await window.contextMenuAPI.showContextMenu(
      buildContextMenuParams(e.nativeEvent, options),
    )
  }
}
