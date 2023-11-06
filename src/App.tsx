import { Box, GlobalStyles } from '@mui/material'
import { useEffect, useMemo } from 'react'
import Player from '~/components/Player'
import useTitle from '~/hooks/useTitle'
import useVideo from '~/hooks/useVideo'
import { useAppDispatch, useAppSelector } from '~/store'
import {
  selectShouldCloseWindowOnEscapeKey,
  toggleShouldAlwaysShowSeekBar,
  toggleShouldCloseWindowOnEscapeKey,
} from '~/store/settings'
import { change } from '~/store/window'
import { createContextMenuHandler } from '~/utils/contextMenu'

const App = () => {
  const shouldCloseWindowOnEscapeKey = useAppSelector(
    selectShouldCloseWindowOnEscapeKey,
  )
  const dispatch = useAppDispatch()

  const {
    changePlaybackRate,
    changeVolume,
    currentTime,
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
    volume,
    zoomIn,
    zoomOut,
  } = useVideo()

  useTitle(file.name)

  useEffect(() => {
    const removeListener = window.electronAPI.addMessageListener((message) => {
      const { type, data } = message
      switch (type) {
        case 'changeFile':
          return dispatch(change(data.file))
        case 'changePlaybackRate':
          return changePlaybackRate(data.value)
        case 'resetZoom':
          return resetZoom()
        case 'toggleAutoplay':
          return toggleAutoplay()
        case 'toggleShouldAlwaysShowSeekBar':
          return dispatch(toggleShouldAlwaysShowSeekBar())
        case 'toggleFullscreen':
          return window.electronAPI.toggleFullscreen()
        case 'toggleLoop':
          return toggleLoop()
        case 'togglePartialLoop':
          return togglePartialLoop()
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
    const handler = () =>
      window.electronAPI.updateApplicationMenu({ loop, partialLoop })
    handler()
    window.addEventListener('focus', handler)
    return () => window.removeEventListener('focus', handler)
  }, [loop, partialLoop])

  useEffect(() => {
    const handler = async (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          return seekTo('backward')
        case 'ArrowRight':
          e.preventDefault()
          return seekTo('forward')
        case 'ArrowUp':
          e.preventDefault()
          return changeVolume(volume + 0.1)
        case 'ArrowDown':
          e.preventDefault()
          return changeVolume(volume - 0.1)
        case 'Escape':
          e.preventDefault()
          if (shouldCloseWindowOnEscapeKey) {
            return await window.electronAPI.closeWindow()
          } else {
            return await window.electronAPI.exitFullscreen()
          }
        case 'f':
          e.preventDefault()
          return await window.electronAPI.toggleFullscreen()
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
    changeVolume,
    currentTime,
    nextTrack,
    previousTrack,
    resetZoom,
    seekTo,
    shouldCloseWindowOnEscapeKey,
    toggleLoop,
    toggleMuted,
    togglePaused,
    volume,
    zoomIn,
    zoomOut,
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
