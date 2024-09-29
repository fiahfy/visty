import { ActionCreators, register } from '@fiahfy/electron-context-menu'
import { IpcMainInvokeEvent } from 'electron'

const send = (event: IpcMainInvokeEvent, message: any) =>
  event.sender.send('sendMessage', message)

const registerContextMenu = () => {
  const actionCreators: ActionCreators = {
    alwaysShowSeekBar: (event, _params, { checked }) => ({
      label: 'Always Show Seek Bar',
      checked,
      click: () => send(event, { type: 'toggleShouldAlwaysShowSeekBar' }),
      type: 'checkbox',
    }),
    autoplay: (event, _params, { checked }) => ({
      label: 'Autoplay',
      checked,
      click: () => send(event, { type: 'toggleAutoplay' }),
      type: 'checkbox',
    }),
    closeWindowOnEscapeKey: (event, _params, { checked }) => ({
      label: 'Close Window on Escape Key',
      checked,
      click: () => send(event, { type: 'toggleShouldCloseWindowOnEscapeKey' }),
      type: 'checkbox',
    }),
    partialLoop: (event, _params, { checked }) => ({
      label: 'Partial Loop',
      checked,
      click: () => send(event, { type: 'togglePartialLoop' }),
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
    loop: (event, _params, { checked }) => ({
      accelerator: 'L',
      label: 'Loop',
      checked,
      click: () => send(event, { type: 'toggleLoop' }),
      type: 'checkbox',
    }),
    viewModeOnOpen: (event, _params, { viewModeOnOpen }) => ({
      label: 'View Mode on Open',
      submenu: [
        { label: 'Fullscreen', value: 'fullscreen' },
        { label: 'Maximized', value: 'maximized' },
        { label: 'Default', value: 'default' },
      ].map(({ label, value }) => ({
        checked: value === viewModeOnOpen,
        click: () =>
          send(event, {
            type: 'setViewModeOnOpen',
            data: { viewModeOnOpen: value },
          }),
        label,
        type: 'radio',
      })),
    }),
  }

  register(actionCreators)
}

export default registerContextMenu
