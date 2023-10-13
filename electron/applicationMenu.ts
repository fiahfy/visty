import {
  IpcMainInvokeEvent,
  Menu,
  MenuItemConstructorOptions,
  app,
  dialog,
  ipcMain,
  shell,
} from 'electron'

// eslint-disable-next-line @typescript-eslint/ban-types
type State = {}

export type ApplicationMenuParams = Partial<State>

const registerApplicationMenu = (createWindow: (filePath: string) => void) => {
  const isMac = process.platform === 'darwin'

  let state: State = {}

  const update = () => {
    // @see https://www.electronjs.org/docs/latest/api/menu#examples
    const template: MenuItemConstructorOptions[] = [
      // { role: 'appMenu' }
      ...(isMac
        ? [
            {
              label: app.name,
              submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideOthers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' },
              ],
            } as MenuItemConstructorOptions,
          ]
        : []),
      // { role: 'fileMenu' }
      {
        label: 'File',
        submenu: [
          {
            accelerator: 'CmdOrCtrl+O',
            click: async () => {
              const { filePaths } = await dialog.showOpenDialog({
                properties: ['openFile'],
              })
              const filePath = filePaths[0]
              createWindow(filePath)
            },
            label: 'Open File...',
          },
          { type: 'separator' },
          ...[isMac ? { role: 'close' } : { role: 'quit' }],
        ],
      } as MenuItemConstructorOptions,
      // { role: 'editMenu' }
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'selectAll' },
        ],
      } as MenuItemConstructorOptions,
      // { role: 'viewMenu' }
      {
        label: 'View',
        submenu: [
          // TODO: implement
          {
            checked: true,
            click: () => undefined,
            label: 'Actual Size',
            type: 'checkbox',
          },
          { type: 'separator' },
          // TODO: implement
          {
            click: () => undefined,
            label: 'Loop',
          },
          { type: 'separator' },
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'togglefullscreen' },
        ],
      } as MenuItemConstructorOptions,
      // { role: 'windowMenu' }
      {
        label: 'Window',
        submenu: [
          { role: 'minimize' },
          { role: 'zoom' },
          ...(isMac
            ? [
                { type: 'separator' },
                { role: 'front' },
                { type: 'separator' },
                { role: 'window' },
              ]
            : [{ role: 'close' }]),
        ],
      } as MenuItemConstructorOptions,
      {
        role: 'help',
        submenu: [
          {
            label: 'Learn More',
            click: () => shell.openExternal('https://github.com/fiahfy/visty'),
          },
        ],
      },
    ]

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
  }

  update()

  ipcMain.handle(
    'application-menu-update',
    (_event: IpcMainInvokeEvent, params: ApplicationMenuParams) => {
      state = { ...state, ...params }
      update()
    },
  )
}

export default registerApplicationMenu
