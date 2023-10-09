import {
  BrowserWindow,
  IpcMainInvokeEvent,
  Menu,
  MenuItemConstructorOptions,
  ipcMain,
} from 'electron'

export type ContextMenuItemOption = {
  id: string
  data?: any // eslint-disable-line @typescript-eslint/no-explicit-any
}

export type ContextMenuParams = {
  isEditable: boolean
  selectionText: string
  x: number
  y: number
  options: ContextMenuItemOption[]
}

const registerContextMenu = () => {
  ipcMain.handle(
    'context-menu-show',
    (event: IpcMainInvokeEvent, params: ContextMenuParams) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const send = (message: any) => event.sender.send('message-send', message)

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
        [id in string]: (
          data: ContextMenuItemOption['data'],
        ) => MenuItemConstructorOptions
      } = {
        settings: () => ({
          accelerator: 'CmdOrCtrl+,',
          click: () => send({ type: 'goToSettings' }),
          label: 'Settings',
        }),

        separator: () => defaultActions.separator,
      }

      const actions = params.options.flatMap((option) => {
        const creator = actionCreators[option.id]
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
