import {
  Fullscreen as FullscreenEnterIcon,
  FullscreenExit as FullscreenExitIcon,
  Pause as PauseIcon,
  PlayArrow as PlayArrowIcon,
  VolumeDown as VolumeDownIcon,
  VolumeOff as VolumeOffIcon,
  VolumeUp as VolumeUpIcon,
} from '@mui/icons-material'
import {
  AppBar,
  Box,
  Fade,
  IconButton,
  Toolbar,
  Typography,
} from '@mui/material'
import {
  DragEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import NoTransitionSlider from '~/components/mui/NoTransitionSlider'
import useTitle from '~/hooks/useTitle'
import { useAppDispatch, useAppSelector } from '~/store'
import {
  selectDefaultMuted,
  selectDefaultVolume,
  setDefaultMuted,
  setDefaultVolume,
} from '~/store/settings'
import { selectFile } from '~/store/window'
import { formatDuration } from '~/utils/formatter'

const Player = () => {
  const defaultMuted = useAppSelector(selectDefaultMuted)
  const defaultVolume = useAppSelector(selectDefaultVolume)
  const file = useAppSelector(selectFile)
  const dispatch = useAppDispatch()

  const [toolbarHidden, setToolbarHidden] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  const [paused, setPaused] = useState(true)
  const [duration, setDuration] = useState(100)
  const [currentTime, setCurrentTime] = useState(0)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(0)

  const title = useMemo(() => file?.name ?? '', [file])

  useTitle(title)

  const videoRef = useRef<HTMLVideoElement>(null)
  const timer = useRef<number>()

  const volumeValue = useMemo(() => (muted ? 0 : volume), [muted, volume])

  const PlayIcon = useMemo(() => (paused ? PlayArrowIcon : PauseIcon), [paused])

  const VolumeIcon = useMemo(() => {
    if (volumeValue > 0.5) {
      return VolumeUpIcon
    } else if (volumeValue > 0) {
      return VolumeDownIcon
    } else {
      return VolumeOffIcon
    }
  }, [volumeValue])

  const FullscreenIcon = useMemo(
    () => (fullscreen ? FullscreenExitIcon : FullscreenEnterIcon),
    [fullscreen],
  )

  useEffect(() => {
    ;(async () => {
      const video = videoRef.current
      if (!video) {
        return
      }

      await new Promise<void>((resolve) =>
        video.addEventListener('loadedmetadata', () => resolve()),
      )

      await window.electronAPI.changeOriginalSize({
        width: video.videoWidth,
        height: video.videoHeight,
      })

      video.volume = defaultMuted ? 0 : defaultVolume

      let requestId: number
      const callback = () => {
        if (video.readyState < 1) {
          return
        }
        setPaused(video.paused)
        setCurrentTime(video.currentTime)
        setDuration(video.duration)
        setVolume(video.volume)
        requestId = requestAnimationFrame(callback)
      }
      requestId = requestAnimationFrame(callback)

      return () => cancelAnimationFrame(requestId)
    })()
  }, [defaultMuted, defaultVolume, file])

  const clearTimer = useCallback(() => window.clearTimeout(timer.current), [])

  const resetTimer = useCallback(
    (hovered: boolean) => {
      setToolbarHidden(false)
      clearTimer()
      if (hovered || paused) {
        return
      }
      timer.current = window.setTimeout(() => setToolbarHidden(true), 2000)
    },
    [clearTimer, paused],
  )

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

  const handleClickPlay = useCallback(() => {
    const video = videoRef.current
    if (!video) {
      return
    }
    video.paused ? video.play() : video.pause()
  }, [])

  const handleChangeCurrentTime = useCallback(
    (_e: Event, value: number | number[]) => {
      const video = videoRef.current
      if (!video) {
        return
      }
      video.currentTime = value as number
    },
    [],
  )

  const handleChangeVolume = useCallback(
    (_e: Event, value: number | number[]) => {
      const video = videoRef.current
      if (!video) {
        return
      }
      const volume = value as number
      video.volume = volume
      setVolume(volume)
      dispatch(setDefaultVolume(volume))
      dispatch(setDefaultMuted(volume === 0))
    },
    [dispatch],
  )

  const handleClickMute = useCallback(() => {
    const video = videoRef.current
    if (!video) {
      return
    }
    setMuted((muted) => {
      const newMuted = !muted
      dispatch(setDefaultMuted(newMuted))
      return newMuted
    })
  }, [dispatch])

  return (
    <Box
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onMouseMove={handleMouseMove}
      sx={{
        cursor: toolbarHidden ? 'none' : undefined,
        display: 'flex',
        width: '100%',
      }}
    >
      <video
        onClick={handleClickPlay}
        ref={videoRef}
        src={file?.url}
        style={{ background: 'black', width: '100%' }}
      />
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
        <Box
          sx={{
            display: 'inline-block',
            backgroundColor: 'black',
            borderRadius: '50%',
            opacity: 0.7,
            p: 1,
          }}
        >
          <PlayIcon
            sx={(theme) => ({
              height: theme.spacing(6),
              verticalAlign: 'bottom',
              width: theme.spacing(6),
            })}
          />
        </Box>
      </Box>
      <Fade in={!toolbarHidden}>
        <AppBar
          color="transparent"
          component="div"
          elevation={0}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Box
            sx={{
              background:
                'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0))',
              height: (theme) => theme.spacing(25),
              inset: '0 0 auto',
              pointerEvents: 'none',
              position: 'absolute',
            }}
          />
          <Toolbar disableGutters sx={{ px: 1 }} variant="dense">
            <Typography noWrap sx={{ mx: 1 }} variant="body2">
              {title}
            </Typography>
          </Toolbar>
        </AppBar>
      </Fade>
      <Fade in={!toolbarHidden}>
        <AppBar
          color="transparent"
          component="div"
          elevation={0}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          sx={{
            bottom: 0,
            top: 'auto',
          }}
        >
          <Box
            sx={{
              background:
                'linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.7))',
              height: (theme) => theme.spacing(25),
              inset: 'auto 0 0',
              pointerEvents: 'none',
              position: 'absolute',
            }}
          />
          <Toolbar disableGutters sx={{ gap: 0.5, px: 1 }} variant="dense">
            <NoTransitionSlider
              max={duration}
              onChange={handleChangeCurrentTime}
              size="small"
              step={0.01}
              sx={{
                inset: (theme) => `-14px ${theme.spacing(1)} auto`,
                position: 'absolute',
                width: 'auto',
              }}
              value={currentTime}
            />
            <IconButton
              onClick={handleClickPlay}
              size="small"
              title={paused ? 'Play' : 'Pause'}
            >
              <PlayIcon fontSize="small" />
            </IconButton>
            <IconButton
              onClick={handleClickMute}
              size="small"
              title={muted ? 'Unmute' : 'Mute'}
            >
              <VolumeIcon fontSize="small" />
            </IconButton>
            <NoTransitionSlider
              max={1}
              onChange={handleChangeVolume}
              size="small"
              step={0.01}
              sx={{
                color: 'white',
                mx: 1,
                width: (theme) => theme.spacing(10),
              }}
              value={volumeValue}
            />
            <Typography noWrap sx={{ mx: 1 }} variant="body2">
              {formatDuration(currentTime)} / {formatDuration(duration)}
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton
              onClick={() => setFullscreen((fullscreen) => !fullscreen)}
              size="small"
              title={fullscreen ? 'Exit full screen' : 'Full screen'}
            >
              <FullscreenIcon fontSize="small" />
            </IconButton>
          </Toolbar>
        </AppBar>
      </Fade>
    </Box>
  )
}

export default Player
