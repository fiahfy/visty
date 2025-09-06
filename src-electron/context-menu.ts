import { type ActionCreators, register } from '@fiahfy/electron-context-menu'
import type { IpcMainInvokeEvent } from 'electron'

// biome-ignore lint/suspicious/noExplicitAny: false positive
const send = (event: IpcMainInvokeEvent, message: any) =>
  event.sender.send('onMessage', message)

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
    closeWindowWithEscapeKey: (event, _params, { checked }) => ({
      label: 'Close Window with Escape Key',
      checked,
      click: () =>
        send(event, { type: 'toggleShouldCloseWindowWithEscapeKey' }),
      type: 'checkbox',
    }),
    defaultViewMode: (event, _params, { defaultViewMode }) => ({
      label: 'Default View Mode',
      submenu: [
        { label: 'Fullscreen', value: 'fullscreen' },
        { label: 'Maximized', value: 'maximized' },
        { label: 'Normal', value: 'normal' },
      ].map(({ label, value }) => ({
        checked: value === defaultViewMode,
        click: () =>
          send(event, {
            type: 'setDefaultViewMode',
            data: { defaultViewMode: value },
          }),
        label,
        type: 'radio',
      })),
    }),
    loop: (event, _params, { checked }) => ({
      accelerator: 'L',
      label: 'Loop',
      checked,
      click: () => send(event, { type: 'toggleLoop' }),
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
        type: 'radio',
      })),
    }),
  }

  register(actionCreators)
}

export default registerContextMenu
