import { Box, GlobalStyles } from '@mui/material'
import { useEffect, useMemo } from 'react'
import Player from '~/components/Player'
import useTitle from '~/hooks/useTitle'
import useVideo from '~/hooks/useVideo'
import { useAppDispatch, useAppSelector } from '~/store'
import {
  selectShouldCloseWindowOnEscapeKey,
  setViewModeOnOpen,
  toggleShouldAlwaysShowSeekBar,
  toggleShouldCloseWindowOnEscapeKey,
} from '~/store/settings'
import { createContextMenuHandler } from '~/utils/context-menu'

const App = () => {
  const shouldCloseWindowOnEscapeKey = useAppSelector(
    selectShouldCloseWindowOnEscapeKey,
  )
  const dispatch = useAppDispatch()

  const {
    changePlaybackRate,
    file,
    loop,
    nextTrack,
    partialLoop,
    previousTrack,
    resetZoom,
    seekTo,
    toggleAutoplay,
    toggleLoop,
    toggleMuted,
    togglePartialLoop,
    togglePaused,
    volumeDown,
    volumeUp,
    zoomIn,
    zoomOut,
  } = useVideo()

  useTitle(file.name)

  useEffect(() => {
    const removeListener = window.messageAPI.onMessage((message) => {
      const { type, data } = message
      switch (type) {
        case 'changePlaybackRate':
          return changePlaybackRate(data.value)
        case 'resetZoom':
          return resetZoom()
        case 'setViewModeOnOpen':
          return dispatch(
            setViewModeOnOpen({ viewModeOnOpen: data.viewModeOnOpen }),
          )
        case 'toggleAutoplay':
          return toggleAutoplay()
        case 'toggleFullscreen':
          return window.windowAPI.toggleFullscreen()
        case 'toggleLoop':
          return toggleLoop()
        case 'togglePartialLoop':
          return togglePartialLoop()
        case 'toggleShouldAlwaysShowSeekBar':
          return dispatch(toggleShouldAlwaysShowSeekBar())
        case 'toggleShouldCloseWindowOnEscapeKey':
          return dispatch(toggleShouldCloseWindowOnEscapeKey())
        case 'zoomIn':
          return zoomIn()
        case 'zoomOut':
          return zoomOut()
      }
    })
    return () => removeListener()
  }, [
    changePlaybackRate,
    dispatch,
    resetZoom,
    toggleAutoplay,
    toggleLoop,
    togglePartialLoop,
    zoomIn,
    zoomOut,
  ])

  useEffect(() => {
    const removeListener = window.windowAPI.onFocusChange((focused) => {
      if (focused) {
        window.applicationMenuAPI.update({ loop, partialLoop })
      }
    })
    return () => removeListener()
  }, [loop, partialLoop])

  useEffect(() => {
    ;(async () => {
      const focused = await window.windowAPI.isFocused()
      if (focused) {
        window.applicationMenuAPI.update({ loop, partialLoop })
      }
    })()
  }, [loop, partialLoop])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          return volumeDown()
        case 'ArrowLeft':
          e.preventDefault()
          return seekTo('backward')
        case 'ArrowRight':
          e.preventDefault()
          return seekTo('forward')
        case 'ArrowUp':
          e.preventDefault()
          return volumeUp()
        case 'Escape':
          e.preventDefault()
          if (shouldCloseWindowOnEscapeKey) {
            return window.windowAPI.close()
          }
          return window.windowAPI.exitFullscreen()
        case 'f':
          e.preventDefault()
          return window.windowAPI.toggleFullscreen()
        case 'l':
          e.preventDefault()
          return toggleLoop()
        case 'm':
          e.preventDefault()
          return toggleMuted()
        case 'k':
        case ' ':
          e.preventDefault()
          return togglePaused()
        case 'N':
          e.preventDefault()
          return nextTrack()
        case 'P':
          e.preventDefault()
          return previousTrack()
      }
    }
    document.body.addEventListener('keydown', handler)
    return () => document.body.removeEventListener('keydown', handler)
  }, [
    nextTrack,
    previousTrack,
    seekTo,
    shouldCloseWindowOnEscapeKey,
    toggleLoop,
    toggleMuted,
    togglePaused,
    volumeDown,
    volumeUp,
  ])

  const handleContextMenu = useMemo(() => createContextMenuHandler(), [])

  return (
    <Box
      component="main"
      onContextMenu={handleContextMenu}
      sx={{
        display: 'flex',
        height: '100%',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      <GlobalStyles styles={{ 'html, body, #root': { height: '100%' } }} />
      <Player />
    </Box>
  )
}

export default App
