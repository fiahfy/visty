import {
  createSelector,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit'
import type { Entry } from '~/interfaces'
import type { AppState, AppThunk } from '~/store'
import {
  selectDefaultAutoplay,
  selectDefaultLoop,
  selectDefaultVolume,
  setDefaultAutoplay,
  setDefaultLoop,
  setDefaultVolume,
} from '~/store/settings'
import { selectWindowId } from '~/store/window-id'

type WindowState = {
  autoplay?: boolean
  currentTime: number
  error: boolean
  file?: Entry
  loading: boolean
  loop?: boolean
  loopRange?: [number, number]
  pan: number
  playbackRate: number
  volume?: number
}

type State = {
  [id: number]: WindowState
}

const initialState: State = {}

const defaultWindowState: WindowState = {
  autoplay: undefined,
  currentTime: 0,
  error: false,
  file: undefined,
  loading: false,
  loop: undefined,
  loopRange: undefined,
  pan: 0,
  playbackRate: 1,
  volume: undefined,
}

export const windowSlice = createSlice({
  name: 'window',
  initialState,
  reducers: {
    replaceState(_state, action: PayloadAction<{ state: State }>) {
      return action.payload.state
    },
    load(state, action: PayloadAction<{ id: number }>) {
      const { id } = action.payload
      return {
        ...state,
        [id]: {
          ...defaultWindowState,
          loading: true,
        },
      }
    },
    loaded(
      state,
      action: PayloadAction<{
        id: number
        file: Entry
      }>,
    ) {
      const { id, file } = action.payload
      const window = state[id]
      if (!window) {
        return state
      }
      return {
        ...state,
        [id]: {
          ...window,
          file,
          loading: false,
        },
      }
    },
    loadFailed(state, action: PayloadAction<{ id: number }>) {
      const { id } = action.payload
      const window = state[id]
      if (!window) {
        return state
      }
      return {
        ...state,
        [id]: {
          ...window,
          error: true,
          loading: false,
        },
      }
    },
    setAutoplay(
      state,
      action: PayloadAction<{
        id: number
        autoplay: boolean
      }>,
    ) {
      const { id, autoplay } = action.payload
      const window = state[id]
      if (!window) {
        return state
      }
      return {
        ...state,
        [id]: {
          ...window,
          autoplay,
        },
      }
    },
    setCurrentTime(
      state,
      action: PayloadAction<{
        id: number
        currentTime: number
      }>,
    ) {
      const { id, currentTime } = action.payload
      const window = state[id]
      if (!window) {
        return state
      }
      return {
        ...state,
        [id]: {
          ...window,
          currentTime,
        },
      }
    },
    setLoop(
      state,
      action: PayloadAction<{
        id: number
        loop: boolean
      }>,
    ) {
      const { id, loop } = action.payload
      const window = state[id]
      if (!window) {
        return state
      }
      return {
        ...state,
        [id]: {
          ...window,
          loop,
        },
      }
    },
    setLoopRange(
      state,
      action: PayloadAction<{
        id: number
        loopRange: [number, number] | undefined
      }>,
    ) {
      const { id, loopRange } = action.payload
      const window = state[id]
      if (!window) {
        return state
      }
      return {
        ...state,
        [id]: {
          ...window,
          loopRange,
        },
      }
    },
    setPan(
      state,
      action: PayloadAction<{
        id: number
        pan: number
      }>,
    ) {
      const { id, pan } = action.payload
      const window = state[id]
      if (!window) {
        return state
      }
      return {
        ...state,
        [id]: {
          ...window,
          pan,
        },
      }
    },
    setPlaybackRate(
      state,
      action: PayloadAction<{
        id: number
        playbackRate: number
      }>,
    ) {
      const { id, playbackRate } = action.payload
      const window = state[id]
      if (!window) {
        return state
      }
      return {
        ...state,
        [id]: {
          ...window,
          playbackRate,
        },
      }
    },
    setVolume(
      state,
      action: PayloadAction<{
        id: number
        volume: number
      }>,
    ) {
      const { id, volume } = action.payload
      const window = state[id]
      if (!window) {
        return state
      }
      return {
        ...state,
        [id]: {
          ...window,
          volume,
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

export const selectAutoplay = createSelector(
  selectCurrentWindow,
  selectDefaultAutoplay,
  (window, defaultAutoplay) => window.autoplay ?? defaultAutoplay,
)

export const selectCurrentTime = createSelector(
  selectCurrentWindow,
  (window) => window.currentTime,
)

export const selectError = createSelector(
  selectCurrentWindow,
  (window) => window.error,
)

export const selectFile = createSelector(
  selectCurrentWindow,
  (window) => window.file,
)

export const selectLoading = createSelector(
  selectCurrentWindow,
  (window) => window.loading,
)

export const selectLoop = createSelector(
  selectCurrentWindow,
  selectDefaultLoop,
  (window, defaultLoop) => window.loop ?? defaultLoop,
)

export const selectLoopRange = createSelector(
  selectCurrentWindow,
  (window) => window.loopRange,
)

export const selectPan = createSelector(
  selectCurrentWindow,
  (window) => window.pan,
)

export const selectPlaybackRate = createSelector(
  selectCurrentWindow,
  (window) => window.playbackRate,
)

export const selectVolume = createSelector(
  selectCurrentWindow,
  selectDefaultVolume,
  (window, defaultVolume) => window.volume ?? defaultVolume,
)

export const load =
  (filePath: string): AppThunk =>
  async (dispatch, getState) => {
    const { load, loaded, loadFailed } = windowSlice.actions

    const loading = selectLoading(getState())
    if (loading) {
      return
    }

    const id = selectWindowId(getState())

    dispatch(load({ id }))
    try {
      const entry = await window.electronAPI.getEntry(filePath)
      dispatch(loaded({ id, file: entry }))
    } catch {
      dispatch(loadFailed({ id }))
    }
  }

export const saveAutoplay =
  (autoplay: boolean): AppThunk =>
  async (dispatch, getState) => {
    const { setAutoplay } = windowSlice.actions

    const id = selectWindowId(getState())
    const savedAutoplay = selectAutoplay(getState())

    dispatch(setAutoplay({ id, autoplay }))
    if (autoplay !== savedAutoplay) {
      dispatch(setDefaultAutoplay({ defaultAutoplay: autoplay }))
    }
  }

export const saveCurrentTime =
  (currentTime: number): AppThunk =>
  async (dispatch, getState) => {
    const { setCurrentTime } = windowSlice.actions

    const id = selectWindowId(getState())

    dispatch(setCurrentTime({ id, currentTime }))
  }

export const saveLoop =
  (loop: boolean): AppThunk =>
  async (dispatch, getState) => {
    const { setLoop } = windowSlice.actions

    const id = selectWindowId(getState())
    const savedLoop = selectLoop(getState())

    dispatch(setLoop({ id, loop }))
    if (loop !== savedLoop) {
      dispatch(setDefaultLoop({ defaultLoop: loop }))
    }
  }

export const saveLoopRange =
  (loopRange: [number, number] | undefined): AppThunk =>
  async (dispatch, getState) => {
    const { setLoopRange } = windowSlice.actions

    const id = selectWindowId(getState())

    dispatch(setLoopRange({ id, loopRange }))
  }

export const savePlaybackRate =
  (playbackRate: number): AppThunk =>
  async (dispatch, getState) => {
    const { setPlaybackRate } = windowSlice.actions

    const id = selectWindowId(getState())

    dispatch(setPlaybackRate({ id, playbackRate }))
  }

export const savePan =
  (pan: number): AppThunk =>
  async (dispatch, getState) => {
    const { setPan } = windowSlice.actions

    const id = selectWindowId(getState())

    dispatch(setPan({ id, pan }))
  }

export const saveVolume =
  (volume: number): AppThunk =>
  async (dispatch, getState) => {
    const { setVolume } = windowSlice.actions

    const id = selectWindowId(getState())
    const savedVolume = selectVolume(getState())

    dispatch(setVolume({ id, volume }))
    if (volume !== savedVolume) {
      dispatch(setDefaultVolume({ defaultVolume: volume }))
    }
  }
