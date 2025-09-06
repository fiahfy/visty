import {
  createSelector,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit'
import type { AppState } from '~/store'

type State = {
  defaultAutoplay: boolean
  defaultLoop: boolean
  defaultViewMode: 'fullscreen' | 'maximized' | 'normal'
  defaultVolume: number
  shouldAlwaysShowSeekBar: boolean
  shouldCloseWindowWithEscapeKey: boolean
}

const initialState: State = {
  defaultAutoplay: false,
  defaultLoop: false,
  defaultViewMode: 'normal',
  defaultVolume: 1,
  shouldAlwaysShowSeekBar: false,
  shouldCloseWindowWithEscapeKey: false,
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
    setDefaultViewMode(
      state,
      action: PayloadAction<{ defaultViewMode: State['defaultViewMode'] }>,
    ) {
      const { defaultViewMode } = action.payload
      return {
        ...state,
        defaultViewMode,
      }
    },
    setDefaultVolume(state, action: PayloadAction<{ defaultVolume: number }>) {
      const { defaultVolume } = action.payload
      return { ...state, defaultVolume }
    },
    toggleShouldAlwaysShowSeekBar(state) {
      return {
        ...state,
        shouldAlwaysShowSeekBar: !state.shouldAlwaysShowSeekBar,
      }
    },
    toggleShouldCloseWindowWithEscapeKey(state) {
      return {
        ...state,
        shouldCloseWindowWithEscapeKey: !state.shouldCloseWindowWithEscapeKey,
      }
    },
  },
})

export const {
  replaceState,
  setDefaultAutoplay,
  setDefaultLoop,
  setDefaultViewMode,
  setDefaultVolume,
  toggleShouldAlwaysShowSeekBar,
  toggleShouldCloseWindowWithEscapeKey,
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

export const selectDefaultViewMode = createSelector(
  selectSettings,
  (settings) => settings.defaultViewMode,
)

export const selectDefaultVolume = createSelector(
  selectSettings,
  (settings) => settings.defaultVolume,
)

export const selectShouldAlwaysShowSeekBar = createSelector(
  selectSettings,
  (settings) => settings.shouldAlwaysShowSeekBar,
)

export const selectShouldCloseWindowWithEscapeKey = createSelector(
  selectSettings,
  (settings) => settings.shouldCloseWindowWithEscapeKey,
)
