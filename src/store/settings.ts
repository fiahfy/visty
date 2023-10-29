import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit'
import { AppState } from '~/store'

type State = {
  defaultLoop: boolean
  defaultMuted: boolean
  defaultVolume: number
}

const initialState: State = {
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
    replace(_state, action: PayloadAction<State>) {
      return action.payload
    },
  },
})

export const { replace, setDefaultLoop, setDefaultMuted, setDefaultVolume } =
  settingsSlice.actions

export default settingsSlice.reducer

export const selectSettings = (state: AppState) => state.settings

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
