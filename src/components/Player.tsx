import {
  Pause as PauseIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material'
import { AppBar, Box, Fade, Toolbar, Typography } from '@mui/material'
import {
  DragEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import ControlBar from '~/components/ControlBar'
import FadeAndScale from '~/components/mui/FadeAndScale'
import useTitle from '~/hooks/useTitle'
import useTrafficLight from '~/hooks/useTrafficLight'
import useVideo from '~/hooks/useVideo'

const Player = () => {
  const [iconVisible, setIconVisible] = useState(false)
  const [toolbarVisible, setToolbarVisible] = useState(false)
  const [hovered, setHovered] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const {
    currentTime,
    duration,
    file,
    muted,
    onChangeCurrentTime,
    onChangeVolume,
    onClickMute,
    onClickPlay,
    paused,
    volume,
  } = useVideo(videoRef)

  const title = useMemo(() => file.name, [file])

  useTitle(title)

  const { visible } = useTrafficLight()

  const timer = useRef<number>()

  const ActionIcon = useMemo(
    () => (paused ? PauseIcon : PlayArrowIcon),
    [paused],
  )

  useEffect(() => {
    window.electronAPI.trafficLight.setVisible(toolbarVisible)
  }, [toolbarVisible])

  useEffect(() => {
    setIconVisible(true)
    const timer = setTimeout(() => setIconVisible(false), 50)
    return () => clearTimeout(timer)
  }, [paused])

  const clearTimer = useCallback(() => window.clearTimeout(timer.current), [])

  const resetTimer = useCallback(
    (hovered: boolean) => {
      setToolbarVisible(true)
      clearTimer()
      if (hovered || paused) {
        return
      }
      timer.current = window.setTimeout(() => setToolbarVisible(false), 2000)
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

  return (
    <Box
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onMouseMove={handleMouseMove}
      sx={{
        cursor: toolbarVisible ? undefined : 'none',
        display: 'flex',
        width: '100%',
      }}
    >
      <video
        onClick={onClickPlay}
        ref={videoRef}
        src={file.url}
        style={{ background: 'black', width: '100%' }}
      />
      {currentTime < duration && (
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
          <FadeAndScale in={iconVisible} timeout={300}>
            <Box
              sx={{
                display: 'inline-block',
                backgroundColor: 'black',
                borderRadius: '50%',
                opacity: 0.7,
                p: 1,
              }}
            >
              <ActionIcon
                sx={(theme) => ({
                  height: theme.spacing(6),
                  verticalAlign: 'bottom',
                  width: theme.spacing(6),
                })}
              />
            </Box>
          </FadeAndScale>
        </Box>
      )}
      <Fade in={visible}>
        <AppBar
          color="default"
          component="div"
          elevation={0}
          enableColorOnDark
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          sx={{ WebkitAppRegion: 'drag' }}
        >
          <Toolbar
            disableGutters
            sx={{
              justifyContent: 'center',
              minHeight: (theme) => `${theme.spacing(3.5)}!important`,
              px: visible ? 8.5 : 1,
            }}
          >
            <Typography mt={0.25} noWrap variant="caption">
              {title}
            </Typography>
          </Toolbar>
        </AppBar>
      </Fade>
      <Fade in={toolbarVisible}>
        <div>
          <ControlBar
            currentTime={currentTime}
            duration={duration}
            muted={muted}
            onChangeCurrentTime={onChangeCurrentTime}
            onChangeVolume={onChangeVolume}
            onClickMute={onClickMute}
            onClickPlay={onClickPlay}
            paused={paused}
            volume={volume}
          />
        </div>
      </Fade>
    </Box>
  )
}

export default Player
