import {
  BrowserWindow,
  IpcMainInvokeEvent,
  Menu,
  MenuItemConstructorOptions,
  ipcMain,
} from 'electron'

export type ContextMenuOption = {
  data?: any // eslint-disable-line @typescript-eslint/no-explicit-any
  type: string
}

export type ContextMenuParams = {
  isEditable: boolean
  options: ContextMenuOption[]
  selectionText: string
  x: number
  y: number
}

const registerContextMenu = () => {
  ipcMain.handle(
    'showContextMenu',
    (event: IpcMainInvokeEvent, params: ContextMenuParams) => {
      const defaultActions = {
        separator: { type: 'separator' as const },
        cut: params.isEditable && {
          accelerator: 'CmdOrCtrl+X',
          role: 'cut' as const,
        },
        copy: (params.isEditable || params.selectionText.length > 0) && {
          accelerator: 'CmdOrCtrl+C',
          role: 'copy' as const,
        },
        paste: params.isEditable && {
          accelerator: 'CmdOrCtrl+V',
          role: 'paste' as const,
        },
        inspectElement: {
          label: 'Inspect Element',
          click: () => {
            event.sender.inspectElement(params.x, params.y)
            if (event.sender.isDevToolsOpened()) {
              event.sender.devToolsWebContents?.focus()
            }
          },
        },
      }

      const actionCreators: {
        [type in string]: (
          data: ContextMenuOption['data'],
        ) => MenuItemConstructorOptions
      } = {
        separator: () => defaultActions.separator,
      }

      const actions = params.options.flatMap((option) => {
        const creator = actionCreators[option.type]
        return creator ? creator(option.data) : []
      })

      const template = [
        ...actions,
        defaultActions.separator,
        defaultActions.cut,
        defaultActions.copy,
        defaultActions.paste,
        defaultActions.separator,
        defaultActions.inspectElement,
      ].filter((a) => a) as MenuItemConstructorOptions[]

      const menu = Menu.buildFromTemplate(template)
      const window = BrowserWindow.fromWebContents(event.sender)
      window && menu.popup({ window, x: params.x, y: params.y })
    },
  )
}

export default registerContextMenu
