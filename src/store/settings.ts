import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit'
import { AppState } from '~/store'

type State = {
  defaultAutoplay: boolean
  defaultLoop: boolean
  defaultMuted: boolean
  defaultVolume: number
  shouldAlwaysShowSeekBar: boolean
  shouldCloseWindowOnEscapeKey: boolean
  viewModeOnOpen: 'fullscreen' | 'maximized' | 'default'
}

const initialState: State = {
  defaultAutoplay: false,
  defaultLoop: false,
  defaultMuted: false,
  defaultVolume: 1,
  shouldAlwaysShowSeekBar: false,
  shouldCloseWindowOnEscapeKey: false,
  viewModeOnOpen: 'default',
}

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    replaceState(_state, action: PayloadAction<{ state: State }>) {
      return action.payload.state
    },
    setDefaultAutoplay(
      state,
      action: PayloadAction<{ defaultAutoplay: boolean }>,
    ) {
      const { defaultAutoplay } = action.payload
      return { ...state, defaultAutoplay }
    },
    setDefaultLoop(state, action: PayloadAction<{ defaultLoop: boolean }>) {
      const { defaultLoop } = action.payload
      return { ...state, defaultLoop }
    },
    setDefaultMuted(state, action: PayloadAction<{ defaultMuted: boolean }>) {
      const { defaultMuted } = action.payload
      return { ...state, defaultMuted }
    },
    setDefaultVolume(state, action: PayloadAction<{ defaultVolume: number }>) {
      const { defaultVolume } = action.payload
      return { ...state, defaultVolume }
    },
    setViewModeOnOpen(
      state,
      action: PayloadAction<{ viewModeOnOpen: State['viewModeOnOpen'] }>,
    ) {
      const { viewModeOnOpen } = action.payload
      return {
        ...state,
        viewModeOnOpen,
      }
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
  setViewModeOnOpen,
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

export const selectViewModeOnOpen = createSelector(
  selectSettings,
  (settings) => settings.viewModeOnOpen,
)
