import { ActionCreators, register } from '@fiahfy/electron-context-menu'
import { IpcMainInvokeEvent } from 'electron'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const send = (event: IpcMainInvokeEvent, message: any) =>
  event.sender.send('sendMessage', message)

const registerContextMenu = () => {
  const actionCreators: ActionCreators = {
    changeSpeed: (event, _params, { checked, value }) => ({
      label: value === 1 ? 'Normal' : `${value}`,
      checked,
      click: () => send(event, { type: 'changeSpeed', data: { value } }),
      type: 'checkbox',
    }),
    partialLoop: (event, _params, { checked }) => ({
      label: 'Partial Loop',
      checked,
      click: () => send(event, { type: 'togglePartialLoop' }),
      type: 'checkbox',
    }),
    loop: (event, _params, { checked }) => ({
      label: 'Loop',
      checked,
      click: () => send(event, { type: 'toggleLoop' }),
      type: 'checkbox',
    }),
  }

  register(actionCreators)
}

export default registerContextMenu
