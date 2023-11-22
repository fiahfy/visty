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

const defaultWindowState: WindowState = {
  file: undefined,
}

const initialState: State = {}

export const windowSlice = createSlice({
  name: 'window',
  initialState,
  reducers: {
    replaceState(_state, action: PayloadAction<State>) {
      return action.payload
    },
    newWindow(
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
          ...defaultWindowState,
          file,
        },
      }
    },
  },
})

export const { replaceState } = windowSlice.actions

export default windowSlice.reducer

export const selectCurrentWindow = (state: AppState) => {
  const windowState = state.window[state.windowIndex]
  return windowState ?? defaultWindowState
}

export const selectFile = createSelector(
  selectCurrentWindow,
  (window) => window.file ?? { name: '', path: '', url: '' },
)

export const newWindow =
  (file: File): AppThunk =>
  async (dispatch, getState) => {
    const { newWindow } = windowSlice.actions
    const index = selectWindowIndex(getState())
    dispatch(
      newWindow({
        index,
        file,
      }),
    )
  }
