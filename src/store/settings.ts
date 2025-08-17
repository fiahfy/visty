import {
  createSelector,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit'
import type { AppState } from '~/store'

type State = {
  defaultAutoplay: boolean
  defaultLoop: boolean
  defaultVolume: number
  shouldAlwaysShowSeekBar: boolean
  shouldCloseWindowOnEscapeKey: boolean
  viewModeOnOpen: 'fullscreen' | 'maximized' | 'default'
}

const initialState: State = {
  defaultAutoplay: false,
  defaultLoop: false,
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
  setDefaultVolume,
  setViewModeOnOpen,
  toggleShouldAlwaysShowSeekBar,
  toggleShouldCloseWindowOnEscapeKey,
} = settingsSlice.actions

export default settingsSlice.reducer

export const selectSettings = (state: AppState) => state.settings

export const selectDefaultAutoplay = createSelector(
  selectSettings,
  (settings) => settings.defaultAutoplay,
)

export const selectDefaultLoop = createSelector(
  selectSettings,
  (settings) => settings.defaultLoop,
)

export const selectDefaultVolume = createSelector(
  selectSettings,
  (settings) => settings.defaultVolume,
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
