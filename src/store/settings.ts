import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit'
import { AppState } from '~/store'

type State = {
  defaultAutoplay: boolean
  defaultLoop: boolean
  defaultMuted: boolean
  defaultVolume: number
  shouldAlwaysShowSeekBar: boolean
  shouldCloseWindowOnEscapeKey: boolean
}

const initialState: State = {
  defaultAutoplay: false,
  defaultLoop: false,
  defaultMuted: false,
  defaultVolume: 1,
  shouldAlwaysShowSeekBar: false,
  shouldCloseWindowOnEscapeKey: false,
}

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    replaceState(_state, action: PayloadAction<State>) {
      return action.payload
    },
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
    toggleShouldAlwaysShowSeekBar(state) {
      return {
        ...state,
        shouldAlwaysShowSeekBar: !state.shouldAlwaysShowSeekBar,
      }
    },
    toggleShouldCloseWindowOnEscapeKey(state) {
      return {
        ...state,
        shouldCloseWindowOnEscapeKey: !state.shouldCloseWindowOnEscapeKey,
      }
    },
  },
})

export const {
  replaceState,
  setDefaultAutoplay,
  setDefaultLoop,
  setDefaultMuted,
  setDefaultVolume,
  toggleShouldAlwaysShowSeekBar,
  toggleShouldCloseWindowOnEscapeKey,
} = settingsSlice.actions

export default settingsSlice.reducer

export const selectSettings = (state: AppState) => state.settings

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

export const selectShouldAlwaysShowSeekBar = createSelector(
  selectSettings,
  (settings) => settings.shouldAlwaysShowSeekBar,
)

export const selectShouldCloseWindowOnEscapeKey = createSelector(
  selectSettings,
  (settings) => settings.shouldCloseWindowOnEscapeKey,
)
