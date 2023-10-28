import { Box, Fade } from '@mui/material'
import {
  MouseEvent,
  WheelEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import ControlBar from '~/components/ControlBar'
import FlashIndicator from '~/components/FlashIndicator'
import TitleBar from '~/components/TitleBar'
import useDrop from '~/hooks/useDrop'
import useTitle from '~/hooks/useTitle'
import useTrafficLight from '~/hooks/useTrafficLight'
import useVideo from '~/hooks/useVideo'
import { useAppDispatch } from '~/store'
import { change } from '~/store/window'
import { createMenuHandler } from '~/utils/contextMenu'
import DroppableMask from './DroppableMask'

const Player = () => {
  const dispatch = useAppDispatch()

  const { setVisible, visible } = useTrafficLight()

  const wrapperRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const timer = useRef<number>()

  const {
    actionCode,
    changeTimeRange,
    changeVolume,
    currentTime,
    duration,
    file,
    loop,
    muted,
    partialLoop,
    paused,
    resetZoom,
    seek,
    seekTo,
    timeRange,
    toggleLoop,
    toggleMuted,
    togglePartialLoop,
    togglePaused,
    volume,
    zoom,
    zoomBy,
    zoomIn,
    zoomOut,
  } = useVideo(videoRef)
  const { dropping, onDragEnter, onDragLeave, onDragOver, onDrop } = useDrop()

  const title = useMemo(() => file.name, [file])

  useTitle(title)

  const [controlBarVisible, setControlBarVisible] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [dragOffset, setDragOffset] = useState<{
    x: number
    y: number
  }>()

  useEffect(() => {
    const removeListener = window.electronAPI.addMessageListener((message) => {
      const { type, data } = message
      switch (type) {
        case 'changeFile':
          return dispatch(change(data.file))
        case 'zoomIn':
          return zoomIn()
        case 'zoomOut':
          return zoomOut()
        case 'resetZoom':
          return resetZoom()
        case 'toggleLoop':
          return toggleLoop()
        case 'togglePartialLoop':
          return togglePartialLoop()
        case 'toggleFullscreen':
          return window.electronAPI.toggleFullscreen()
      }
    })
    return () => removeListener()
  }, [dispatch, resetZoom, toggleLoop, togglePartialLoop, zoomIn, zoomOut])

  useEffect(() => {
    const handler = async (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          return seekTo('backward')
        case 'ArrowRight':
          return seekTo('forward')
        case 'ArrowUp':
          return changeVolume(volume + 0.1)
        case 'ArrowDown':
          return changeVolume(volume - 0.1)
        case 'Escape':
          return await window.electronAPI.exitFullscreen()
        case 'f':
          return await window.electronAPI.toggleFullscreen()
        case 'l':
          return toggleLoop()
        case 'm':
          return toggleMuted()
        case 'k':
        case ' ':
          return togglePaused()
      }
    }
    document.body.addEventListener('keydown', handler)
    return () => document.body.removeEventListener('keydown', handler)
  }, [
    changeVolume,
    currentTime,
    resetZoom,
    seekTo,
    toggleLoop,
    toggleMuted,
    togglePaused,
    volume,
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
    setVisible(controlBarVisible)
  }, [controlBarVisible, setVisible])

  const clearTimer = useCallback(() => window.clearTimeout(timer.current), [])

  const resetTimer = useCallback(
    (hovered: boolean) => {
      setControlBarVisible(true)
      clearTimer()
      if (hovered || paused) {
        return
      }
      timer.current = window.setTimeout(() => setControlBarVisible(false), 2000)
    },
    [clearTimer, paused],
  )

  useEffect(() => resetTimer(hovered), [hovered, paused, resetTimer])

  const handleContextMenu = useMemo(
    () =>
      createMenuHandler([
        { type: 'partialLoop', data: { enabled: partialLoop } },
        { type: 'loop', data: { enabled: !!loop } },
      ]),
    [loop, partialLoop],
  )

  const handleClick = useCallback(
    (e: MouseEvent) => {
      if ((e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey)) {
        return
      }
      togglePaused()
    },
    [togglePaused],
  )

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if ((e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey)) {
      const wrapper = wrapperRef.current
      if (wrapper) {
        setDragOffset({
          x: wrapper.scrollLeft + e.clientX,
          y: wrapper.scrollTop + e.clientY,
        })
      }
    }
  }, [])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      resetTimer(hovered)
      const wrapper = wrapperRef.current
      if (wrapper && dragOffset) {
        wrapper.scrollLeft = dragOffset.x - e.clientX
        wrapper.scrollTop = dragOffset.y - e.clientY
      }
    },
    [dragOffset, hovered, resetTimer],
  )

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if ((e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey)) {
        zoomBy(e.deltaY * 0.01)
      }
    },
    [zoomBy],
  )

  const handleMouseEnter = useCallback(() => {
    setHovered(true)
    resetTimer(true)
  }, [resetTimer])

  const handleMouseLeave = useCallback(() => {
    setHovered(false)
    resetTimer(false)
  }, [resetTimer])

  return (
    <Box
      onContextMenu={handleContextMenu}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      ref={wrapperRef}
      sx={{
        cursor: dragOffset
          ? 'grabbing'
          : controlBarVisible
          ? undefined
          : 'none',
        height: '100%',
        overflow: 'auto',
        width: '100%',
        '::-webkit-scrollbar': {
          display: 'none',
        },
      }}
    >
      <video
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseLeave={() => setDragOffset(undefined)}
        onMouseMove={handleMouseMove}
        onMouseUp={() => setDragOffset(undefined)}
        onWheel={handleWheel}
        ref={videoRef}
        src={file.url}
        style={{
          background: 'black',
          display: 'block',
          minHeight: '100%',
          width: `${100 * zoom}%`,
        }}
      />
      <FlashIndicator actionCode={actionCode} />
      <Fade in={controlBarVisible}>
        <Box onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          <ControlBar
            currentTime={currentTime}
            duration={duration}
            loop={loop}
            muted={muted}
            onChangeCurrentTime={seek}
            onChangeTimeRange={changeTimeRange}
            onChangeVolume={changeVolume}
            onClickLoop={toggleLoop}
            onClickMute={toggleMuted}
            onClickPlay={togglePaused}
            paused={paused}
            timeRange={timeRange}
            volume={volume}
          />
        </Box>
      </Fade>
      <DroppableMask dropping={dropping} />
      <Fade in={visible}>
        <Box onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          <TitleBar title={title} />
        </Box>
      </Fade>
    </Box>
  )
}

export default Player
