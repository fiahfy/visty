import { ipcMain } from 'electron'

const registerHandlers = () => {
  ipcMain.handle('node-is-darwin', () => process.platform === 'darwin')
}

export default registerHandlers
