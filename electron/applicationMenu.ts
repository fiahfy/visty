import audioExtensions from 'audio-extensions'
import {
  BrowserWindow,
  type IpcMainInvokeEvent,
  Menu,
  type MenuItemConstructorOptions,
  app,
  dialog,
  ipcMain,
  shell,
} from 'electron'
import videoExtensions from 'video-extensions'

type State = {
  loop: boolean
  partialLoop: boolean
}

export type ApplicationMenuParams = Partial<State>

const send = (message: any) => {
  const activeWindow = BrowserWindow.getFocusedWindow()
  activeWindow?.webContents.send('sendMessage', message)
}

const registerApplicationMenu = (createWindow: (filePath: string) => void) => {
  const isMac = process.platform === 'darwin'

  let state: State = {
    loop: false,
    partialLoop: false,
  }

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
                filters: [
                  { extensions: [...audioExtensions], name: 'Audios' },
                  { extensions: [...videoExtensions], name: 'Videos' },
                ],
                properties: ['openFile'],
              })
              const filePath = filePaths[0]
              if (filePath) {
                await createWindow(filePath)
              }
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
          {
            click: () => send({ type: 'toggleFullscreen' }),
            label: 'Full Screen',
          },
          { type: 'separator' },
          {
            accelerator: 'CmdOrCtrl+Plus',
            click: () => send({ type: 'zoomIn' }),
            label: 'Zoom In',
          },
          {
            accelerator: 'CmdOrCtrl+-',
            click: () => send({ type: 'zoomOut' }),
            label: 'Zoom Out',
          },
          {
            accelerator: 'CmdOrCtrl+0',
            click: () => send({ type: 'resetZoom' }),
            label: 'Reset Zoom',
          },
          { type: 'separator' },
          {
            checked: state.partialLoop,
            click: () => send({ type: 'togglePartialLoop' }),
            label: 'Partial Loop',
            type: 'checkbox',
          },
          {
            checked: state.loop,
            click: () => send({ type: 'toggleLoop' }),
            label: 'Loop',
            type: 'checkbox',
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
    'updateApplicationMenu',
    (_event: IpcMainInvokeEvent, params: ApplicationMenuParams) => {
      state = { ...state, ...params }
      update()
    },
  )
}

export default registerApplicationMenu
