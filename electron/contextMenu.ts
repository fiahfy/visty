import { ActionCreators, register } from '@fiahfy/electron-context-menu'
import { IpcMainInvokeEvent } from 'electron'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const send = (event: IpcMainInvokeEvent, message: any) =>
  event.sender.send('sendMessage', message)

const registerContextMenu = () => {
  const actionCreators: ActionCreators = {
    alwaysShowSeekBar: (event, _params, { checked }) => ({
      label: 'Always Show Seek Bar',
      checked,
      click: () => send(event, { type: 'toggleAlwaysShowSeekBar' }),
      type: 'checkbox',
    }),
    autoplay: (event, _params, { checked }) => ({
      label: 'Autoplay',
      checked,
      click: () => send(event, { type: 'toggleAutoplay' }),
      type: 'checkbox',
    }),
    playbackRate: (event, _params, { playbackRate }) => ({
      label: 'Playback Rate',
      submenu: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((value) => ({
        label: value === 1 ? 'Normal' : `${value}`,
        checked: playbackRate === value,
        click: () =>
          send(event, { type: 'changePlaybackRate', data: { value } }),
        type: 'checkbox',
      })),
    }),
    partialLoop: (event, _params, { checked }) => ({
      label: 'Partial Loop',
      checked,
      click: () => send(event, { type: 'togglePartialLoop' }),
      type: 'checkbox',
    }),
    loop: (event, _params, { checked }) => ({
      accelerator: 'L',
      label: 'Loop',
      checked,
      click: () => send(event, { type: 'toggleLoop' }),
      type: 'checkbox',
    }),
  }

  register(actionCreators)
}

export default registerContextMenu
