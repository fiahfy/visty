import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit'
import { AppState } from '~/store'

type State = {
  alwaysShowSeekBar: boolean
  defaultAutoplay: boolean
  defaultLoop: boolean
  defaultMuted: boolean
  defaultVolume: number
}

const initialState: State = {
  alwaysShowSeekBar: false,
  defaultAutoplay: false,
  defaultLoop: false,
  defaultMuted: false,
  defaultVolume: 1,
}

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setDefaultAutoplay(state, action: PayloadAction<boolean>) {
      return { ...state, defaultAutoplay: action.payload }
    },
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
  setDefaultAutoplay,
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

export const selectDefaultActualVolume = createSelector(
  selectSettings,
  (settings) => (settings.defaultMuted ? 0 : settings.defaultVolume),
)

export const selectDefaultAutoplay = createSelector(
  selectSettings,
  (settings) => settings.defaultAutoplay,
)

export const selectDefaultLoop = createSelector(
  selectSettings,
  (settings) => settings.defaultLoop,
)
