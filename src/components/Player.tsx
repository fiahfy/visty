import { Box, Fade } from '@mui/material'
import {
  DragEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import ControlBar from '~/components/ControlBar'
import Overlay from '~/components/Overlay'
import TitleBar from '~/components/TitleBar'
import useTitle from '~/hooks/useTitle'
import useTrafficLight from '~/hooks/useTrafficLight'
import useVideo from '~/hooks/useVideo'
import { createMenuHandler } from '~/utils/contextMenu'

const Player = () => {
  const [controlBarVisible, setControlBarVisible] = useState(false)
  const [hovered, setHovered] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const {
    actionCode,
    changeTimeRange,
    changeVolume,
    currentTime,
    duration,
    file,
    loop,
    muted,
    paused,
    seek,
    seekTo,
    timeRange,
    toggleLoop,
    toggleMuted,
    togglePartialLoop,
    togglePaused,
    volume,
    // zoom,
    zoomIn,
    zoomOut,
  } = useVideo(videoRef)

  const title = useMemo(() => file.name, [file])

  useTitle(title)

  const { setVisible, visible } = useTrafficLight()

  const timer = useRef<number>()

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
          return await window.electronAPI.fullscreen.exitFullscreen()
        case 'f':
          return await window.electronAPI.fullscreen.toggleFullscreen()
        case 'l':
          return toggleLoop()
        case 'm':
          return toggleMuted()
        case ' ':
          return togglePaused()
        case ';':
          if ((e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey)) {
            return zoomIn()
          }
          return
        case '-':
          if ((e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey)) {
            return zoomOut()
          }
          return
      }
    }
    document.body.addEventListener('keydown', handler)
    return () => document.body.removeEventListener('keydown', handler)
  }, [
    changeVolume,
    currentTime,
    seekTo,
    toggleLoop,
    toggleMuted,
    togglePaused,
    volume,
    zoomIn,
    zoomOut,
  ])

  useEffect(() => {
    const removeListener = window.electronAPI.addMessageListener((message) => {
      const { type } = message
      switch (type) {
        case 'togglePartialLoop':
          return togglePartialLoop()
      }
    })
    return () => removeListener()
  }, [togglePartialLoop])

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

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const paths = Array.from(e.dataTransfer.files).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (file) => (file as any).path,
    ) as string[]
    const path = paths[0]
    if (!path) {
      return
    }
    window.electronAPI.openFile(path)
  }, [])

  const handleMouseMove = useCallback(
    () => resetTimer(hovered),
    [hovered, resetTimer],
  )

  const handleMouseEnter = useCallback(() => {
    setHovered(true)
    resetTimer(true)
  }, [resetTimer])

  const handleMouseLeave = useCallback(() => {
    setHovered(false)
    resetTimer(false)
  }, [resetTimer])

  const handleContextMenu = useMemo(
    () =>
      createMenuHandler([
        { type: 'partialLoop', data: { enabled: !!timeRange } },
      ]),
    [timeRange],
  )

  return (
    <Box
      onContextMenu={handleContextMenu}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onMouseMove={handleMouseMove}
      sx={{
        cursor: controlBarVisible ? undefined : 'none',
        display: 'flex',
        overflow: 'auto',
        width: '100%',
      }}
    >
      <video
        onClick={togglePaused}
        ref={videoRef}
        src={file.url}
        style={{ background: 'black', width: '100%' }}
      />
      <Overlay actionCode={actionCode} />
      <Fade in={visible}>
        <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          <TitleBar title={title} />
        </div>
      </Fade>
      <Fade in={controlBarVisible}>
        <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
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
        </div>
      </Fade>
    </Box>
  )
}

export default Player
