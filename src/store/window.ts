import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit'
import { AppState, AppThunk } from '~/store'

// eslint-disable-next-line @typescript-eslint/ban-types
type WindowState = {
  filePath: string
  fileUrl: string
}

type State = {
  [index: number]: WindowState
}

const defaultState: WindowState = {
  filePath: '',
  fileUrl: '',
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
        filePath: string
        fileUrl: string
      }>,
    ) {
      const { index, filePath, fileUrl } = action.payload
      return {
        ...state,
        [index]: {
          ...defaultState,
          filePath,
          fileUrl,
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

export const selectFilePath = createSelector(
  selectWindow,
  (window) => window.filePath,
)

export const selectFileUrl = createSelector(
  selectWindow,
  (window) => window.fileUrl,
)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const updateApplicationMenu = (): AppThunk => async (_, _getState) => {}
