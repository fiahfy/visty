import { Box, Fade, Typography } from '@mui/material'
import {
  MouseEvent,
  WheelEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import ControlBar from '~/components/ControlBar'
import DroppableMask from '~/components/DroppableMask'
import FlashIndicator from '~/components/FlashIndicator'
import SeekBar from '~/components/SeekBar'
import TitleBar from '~/components/TitleBar'
import useDrop from '~/hooks/useDrop'
import useTrafficLight from '~/hooks/useTrafficLight'
import useVideo from '~/hooks/useVideo'

const Player = () => {
  const { setVisible, visible } = useTrafficLight()

  const { file, message, ref, togglePaused, zoom, zoomBy } = useVideo()

  const { dropping, onDragEnter, onDragLeave, onDragOver, onDrop } = useDrop()

  const [controlBarVisible, setControlBarVisible] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [dragOffset, setDragOffset] = useState<{
    x: number
    y: number
  }>()

  const wrapperRef = useRef<HTMLDivElement>(null)
  const timer = useRef<number>()

  useEffect(() => {
    setVisible(controlBarVisible)
  }, [controlBarVisible, setVisible])

  const clearTimer = useCallback(() => window.clearTimeout(timer.current), [])

  const resetTimer = useCallback(
    (hovered: boolean) => {
      setControlBarVisible(true)
      clearTimer()
      if (hovered) {
        return
      }
      timer.current = window.setTimeout(() => setControlBarVisible(false), 2000)
    },
    [clearTimer],
  )

  useEffect(() => resetTimer(hovered), [hovered, resetTimer])

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
        ref={ref}
        src={file.url}
        style={{
          background: 'black',
          display: 'block',
          minHeight: '100%',
          width: `${100 * zoom}%`,
        }}
      />
      {message && (
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            inset: 0,
            justifyContent: 'center',
            pointerEvents: 'none',
            position: 'absolute',
          }}
        >
          <Typography variant="caption">{message}</Typography>
        </Box>
      )}
      <FlashIndicator />
      <Fade in={controlBarVisible}>
        <Box onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          <ControlBar />
        </Box>
      </Fade>
      <Box onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <SeekBar controlBarVisible={controlBarVisible} />
      </Box>
      <DroppableMask dropping={dropping} />
      <Fade in={visible}>
        <Box onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          <TitleBar />
        </Box>
      </Fade>
    </Box>
  )
}

export default Player
