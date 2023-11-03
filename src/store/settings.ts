import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit'
import { AppState } from '~/store'

type State = {
  alwaysShowSeekBar: boolean
  defaultLoop: boolean
  defaultMuted: boolean
  defaultVolume: number
}

const initialState: State = {
  alwaysShowSeekBar: false,
  defaultLoop: false,
  defaultMuted: false,
  defaultVolume: 1,
}

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setDefaultLoop(state, action: PayloadAction<boolean>) {
      return { ...state, defaultLoop: action.payload }
    },
    setDefaultMuted(state, action: PayloadAction<boolean>) {
      return { ...state, defaultMuted: action.payload }
    },
    setDefaultVolume(state, action: PayloadAction<number>) {
      return { ...state, defaultVolume: action.payload }
    },
    toggleAlwaysShowSeekBar(state) {
      return { ...state, alwaysShowSeekBar: !state.alwaysShowSeekBar }
    },
    replace(_state, action: PayloadAction<State>) {
      return action.payload
    },
  },
})

export const {
  replace,
  setDefaultLoop,
  setDefaultMuted,
  setDefaultVolume,
  toggleAlwaysShowSeekBar,
} = settingsSlice.actions

export default settingsSlice.reducer

export const selectSettings = (state: AppState) => state.settings

export const selectAlwaysShowSeekBar = createSelector(
  selectSettings,
  (settings) => settings.alwaysShowSeekBar,
)

export const selectDefaultLoop = createSelector(
  selectSettings,
  (settings) => settings.defaultLoop,
)

export const selectDefaultMuted = createSelector(
  selectSettings,
  (settings) => settings.defaultMuted,
)

export const selectDefaultVolume = createSelector(
  selectSettings,
  (settings) => settings.defaultVolume,
)
