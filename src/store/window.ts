import {
  type PayloadAction,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit'
import type { AppState, AppThunk } from '~/store'
import { selectWindowId } from '~/store/window-id'

type File = { name: string; path: string; url: string }

type WindowState = {
  file?: File
}

type State = {
  [id: number]: WindowState
}

const initialState: State = {}

const defaultWindowState: WindowState = {
  file: undefined,
}

export const windowSlice = createSlice({
  name: 'window',
  initialState,
  reducers: {
    replaceState(_state, action: PayloadAction<{ state: State }>) {
      return action.payload.state
    },
    newWindow(
      state,
      action: PayloadAction<{
        id: number
        file: File
      }>,
    ) {
      const { id, file } = action.payload
      return {
        ...state,
        [id]: {
          ...defaultWindowState,
          file,
        },
      }
    },
  },
})

export const { replaceState } = windowSlice.actions

export default windowSlice.reducer

export const selectWindow = (state: AppState) => state.window

export const selectCurrentWindow = createSelector(
  selectWindow,
  selectWindowId,
  (window, windowId) => window[windowId] ?? defaultWindowState,
)

export const selectFile = createSelector(
  selectCurrentWindow,
  (window) => window.file ?? { name: '', path: '', url: '' },
)

export const newWindow =
  (file: File): AppThunk =>
  async (dispatch, getState) => {
    const { newWindow } = windowSlice.actions
    const id = selectWindowId(getState())
    dispatch(newWindow({ id, file }))
  }
