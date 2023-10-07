import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { AppState, AppThunk } from '~/store'

// eslint-disable-next-line @typescript-eslint/ban-types
type WindowState = {}

type State = {
  [index: number]: WindowState
}

const defaultState: WindowState = {}

const initialState: State = {}

export const windowSlice = createSlice({
  name: 'window',
  initialState,
  reducers: {
    initialize(state, action: PayloadAction<{ index: number }>) {
      const { index } = action.payload
      return {
        ...state,
        [index]: {
          ...defaultState,
        },
      }
    },
    replace(_state, action: PayloadAction<State>) {
      return action.payload
    },
  },
})

export const { initialize, replace } = windowSlice.actions

export default windowSlice.reducer

export const selectWindow = (state: AppState) => {
  const windowState = state.window[state.windowIndex]
  return windowState ?? defaultState
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const updateApplicationMenu = (): AppThunk => async (_, _getState) => {}
