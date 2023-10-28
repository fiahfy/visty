import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit'
import { AppState, AppThunk } from '~/store'
import { selectWindowIndex } from '~/store/windowIndex'

type File = { name: string; path: string; url: string }

type WindowState = {
  file?: File
}

type State = {
  [index: number]: WindowState
}

const defaultState: WindowState = {
  file: undefined,
}

const initialState: State = {}

export const windowSlice = createSlice({
  name: 'window',
  initialState,
  reducers: {
    initialize(
      state,
      action: PayloadAction<{
        index: number
        file: File
      }>,
    ) {
      const { index, file } = action.payload
      return {
        ...state,
        [index]: {
          ...defaultState,
          file,
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

export const selectFile = createSelector(
  selectWindow,
  (window) => window.file ?? { name: '', path: '', url: '' },
)

export const change =
  (file: File): AppThunk =>
  async (dispatch, getState) => {
    const { initialize } = windowSlice.actions
    const index = selectWindowIndex(getState())
    dispatch(
      initialize({
        index,
        file,
      }),
    )
  }
