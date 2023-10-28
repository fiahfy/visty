import { ActionCreators, register } from '@fiahfy/electron-context-menu'
import { IpcMainInvokeEvent } from 'electron'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const send = (event: IpcMainInvokeEvent, message: any) =>
  event.sender.send('sendMessage', message)

const registerContextMenu = () => {
  const actionCreators: ActionCreators = {
    partialLoop: (event, _params, { enabled }) => ({
      label: 'Partial Loop',
      checked: enabled,
      click: () => send(event, { type: 'togglePartialLoop' }),
      type: 'checkbox',
    }),
    loop: (event, _params, { enabled }) => ({
      label: 'Loop',
      checked: enabled,
      click: () => send(event, { type: 'toggleLoop' }),
      type: 'checkbox',
    }),
  }

  register(actionCreators)
}

export default registerContextMenu
