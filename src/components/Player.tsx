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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import NoTransitionSlider from '~/components/mui/NoTransitionSlider'
import { useAppSelector } from '~/store'
import { selectFileUrl } from '~/store/window'
import { formatDuration } from '~/utils/formatter'

const Player = () => {
  const fileUrl = useAppSelector(selectFileUrl)

  const [toolbarHidden, setToolbarHidden] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [paused, setPaused] = useState(true)
  const [duration, setDuration] = useState(100)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(0)
  const [storedValue, setStoredValue] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const timer = useRef<number>()

  const PlayIcon = useMemo(() => (paused ? PlayArrowIcon : PauseIcon), [paused])

  const VolumeIcon = useMemo(() => {
    if (volume > 0.5) {
      return VolumeUpIcon
    } else if (volume > 0) {
      return VolumeDownIcon
    } else {
      return VolumeOffIcon
    }
  }, [volume])

  const FullscreenIcon = useMemo(
    () => (fullscreen ? FullscreenExitIcon : FullscreenEnterIcon),
    [fullscreen],
  )

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

  const handleClickPlay = () => {
    const video = videoRef.current
    if (!video) {
      return
    }
    video.paused ? video.play() : video.pause()
  }

  const handleChangeCurrentTime = (_e: Event, value: number | number[]) => {
    const video = videoRef.current
    if (!video) {
      return
    }
    console.log('change', value)
    video.currentTime = value as number
  }

  const handleChangeVolume = (_e: Event, value: number | number[]) => {
    const video = videoRef.current
    if (!video) {
      return
    }
    video.volume = value as number
    setStoredValue(value as number)
  }

  const handleClickMute = () => {
    const video = videoRef.current
    if (!video) {
      return
    }
    video.volume = volume > 0 ? 0 : storedValue
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) {
      return
    }

    setVolume(video.volume)

    const handlePause = () => setPaused(true)
    const handlePlay = () => setPaused(false)
    const handleDurationchange = () => setDuration(video.duration)
    const handleTimeupdate = () => setCurrentTime(video.currentTime)
    const handleVolumechange = () => setVolume(video.volume)
    video.addEventListener('pause', handlePause)
    video.addEventListener('play', handlePlay)
    video.addEventListener('durationchange', handleDurationchange)
    video.addEventListener('timeupdate', handleTimeupdate)
    video.addEventListener('volumechange', handleVolumechange)

    return () => {
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('durationchange', handleDurationchange)
      video.removeEventListener('timeupdate', handleTimeupdate)
      video.removeEventListener('volumechange', handleVolumechange)
    }
  }, [])

  return (
    <Box
      onMouseMove={handleMouseMove}
      sx={{
        cursor: toolbarHidden ? 'none' : undefined,
        display: 'flex',
      }}
    >
      <video
        onClick={handleClickPlay}
        ref={videoRef}
        src={fileUrl}
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
              test
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
              title={volume > 0 ? 'Mute' : 'Unmute'}
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
              value={volume}
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
