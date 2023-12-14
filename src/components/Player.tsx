import { Box, Fade, Typography } from '@mui/material'
import { MouseEvent, useCallback, useEffect, useRef, useState } from 'react'
import ControlBar from '~/components/ControlBar'
import DroppableMask from '~/components/DroppableMask'
import FlashIndicator from '~/components/FlashIndicator'
import SeekBar from '~/components/SeekBar'
import TitleBar from '~/components/TitleBar'
import useDrop from '~/hooks/useDrop'
import usePrevious from '~/hooks/usePrevious'
import useTrafficLight from '~/hooks/useTrafficLight'
import useVideo from '~/hooks/useVideo'

const Player = () => {
  const { setVisible, visible } = useTrafficLight()

  const { file, message, ref, togglePaused, zoom, zoomBy } = useVideo()

  const { dropping, ...dropHandlers } = useDrop()

  const [controlBarVisible, setControlBarVisible] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [dragOffset, setDragOffset] = useState<{
    x: number
    y: number
  }>()
  const [position, setPosition] = useState<{ x: number; y: number }>()

  const wrapperRef = useRef<HTMLDivElement>(null)
  const timer = useRef<number>()

  const previousZoom = usePrevious(zoom)

  useEffect(
    () => setVisible(controlBarVisible),
    [controlBarVisible, setVisible],
  )

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) {
      return
    }
    const handleWheel = (e: WheelEvent) => {
      if ((e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey)) {
        e.preventDefault()
        zoomBy(e.deltaY * 0.01)
      }
    }
    wrapper.addEventListener('wheel', handleWheel, { passive: false })
    return () => wrapper.removeEventListener('wheel', handleWheel)
  }, [zoomBy])

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) {
      return
    }
    if (!position || !previousZoom || !zoom) {
      return
    }
    const left =
      ((wrapper.scrollLeft + position.x) /
        (previousZoom * wrapper.offsetWidth)) *
        (zoom * wrapper.offsetWidth) -
      position.x
    const top =
      ((wrapper.scrollTop + position.y) /
        (previousZoom * wrapper.offsetHeight)) *
        (zoom * wrapper.offsetHeight) -
      position.y
    wrapper.scrollTo({ left, top })
  }, [position, previousZoom, zoom])

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

  useEffect(() => {
    if (hovered) {
      resetTimer(hovered)
    }
  }, [hovered, resetTimer])

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
      setPosition({ x: e.clientX, y: e.clientY })
      resetTimer(hovered)
      const wrapper = wrapperRef.current
      if (wrapper && dragOffset) {
        wrapper.scrollLeft = dragOffset.x - e.clientX
        wrapper.scrollTop = dragOffset.y - e.clientY
      }
    },
    [dragOffset, hovered, resetTimer],
  )

  const handleMouseUp = useCallback(() => setDragOffset(undefined), [])

  const handleMouseEnter = useCallback(
    () => resetTimer(hovered),
    [hovered, resetTimer],
  )

  const handleMouseLeave = useCallback((e: MouseEvent) => {
    if (
      e.clientX < 0 ||
      e.clientX > window.innerWidth ||
      e.clientY < 0 ||
      e.clientY > window.innerHeight
    ) {
      setDragOffset(undefined)
      setControlBarVisible(false)
    }
  }, [])

  const handleMouseEnterBar = useCallback(() => {
    setHovered(true)
    resetTimer(true)
  }, [resetTimer])

  const handleMouseLeaveBar = useCallback(() => {
    setHovered(false)
    resetTimer(false)
  }, [resetTimer])

  return (
    <Box
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{ height: '100%', width: '100%' }}
    >
      <Box
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
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
        {...dropHandlers}
      >
        <video
          ref={ref}
          src={file.url}
          style={{
            background: 'black',
            display: 'block',
            minHeight: '100%',
            width: `${100 * zoom}%`,
          }}
        />
      </Box>
      <Box
        sx={{
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          position: 'absolute',
        }}
      >
        {message && (
          <Box
            sx={{
              alignItems: 'center',
              display: 'flex',
              inset: 0,
              justifyContent: 'center',
              position: 'absolute',
            }}
          >
            <Typography variant="caption">{message}</Typography>
          </Box>
        )}
        <FlashIndicator />
        <DroppableMask dropping={dropping} />
        <Fade in={controlBarVisible}>
          <Box
            onMouseEnter={handleMouseEnterBar}
            onMouseLeave={handleMouseLeaveBar}
            sx={{ pointerEvents: 'auto' }}
          >
            <ControlBar />
          </Box>
        </Fade>
        <Box
          onMouseEnter={handleMouseEnterBar}
          onMouseLeave={handleMouseLeaveBar}
          sx={{ pointerEvents: 'auto' }}
        >
          <SeekBar controlBarVisible={controlBarVisible} />
        </Box>
        <Fade in={visible}>
          <Box sx={{ pointerEvents: 'auto' }}>
            <TitleBar />
          </Box>
        </Fade>
      </Box>
    </Box>
  )
}

export default Player
