import {
  Fullscreen as FullscreenEnterIcon,
  FullscreenExit as FullscreenExitIcon,
  Pause as PauseIcon,
  PictureInPictureAlt as PictureInPictureAltIcon,
  PlayArrow as PlayArrowIcon,
  Repeat as RepeatIcon,
  RepeatOn as RepeatOnIcon,
  Settings as SettingsIcon,
  SkipNext as SkipNextIcon,
  SkipPrevious as SkipPreviousIcon,
  Speed as SpeedIcon,
  VolumeDown as VolumeDownIcon,
  VolumeOff as VolumeOffIcon,
  VolumeUp as VolumeUpIcon,
} from '@mui/icons-material'
import {
  AppBar,
  Box,
  IconButton,
  Slider,
  Toolbar,
  Typography,
} from '@mui/material'
import { MouseEvent, useCallback, useEffect, useMemo, useState } from 'react'
import useVideo from '~/hooks/useVideo'
import { useAppSelector } from '~/store'
import { selectAlwaysShowSeekBar } from '~/store/settings'
import { createContextMenuHandler } from '~/utils/contextMenu'
import { formatDuration } from '~/utils/formatter'

const ControlBar = () => {
  const alwaysShowSeekBar = useAppSelector(selectAlwaysShowSeekBar)

  const {
    changeLoopRange,
    changeVolume,
    currentTime,
    duration,
    fullscreen,
    loop,
    loopRange,
    muted,
    nextTrack,
    paused,
    pictureInPicture,
    playbackRate,
    playlistFile,
    previousTrack,
    seek,
    toggleFullscreen,
    toggleLoop,
    toggleMuted,
    togglePaused,
    togglePictureInPicture,
    volume,
  } = useVideo()

  const [partialLoopEnabled, setPartialLoopEnabled] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) =>
      setPartialLoopEnabled(
        (e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey),
      )
    const handleKeyUp = () => setPartialLoopEnabled(false)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

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

  const LoopIcon = useMemo(() => (loop ? RepeatOnIcon : RepeatIcon), [loop])

  const FullscreenIcon = useMemo(
    () => (fullscreen ? FullscreenExitIcon : FullscreenEnterIcon),
    [fullscreen],
  )

  const handleClickCurrentTime = useCallback(
    (e: MouseEvent) => {
      if ((e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey)) {
        changeLoopRange([currentTime, duration])
      }
    },
    [changeLoopRange, currentTime, duration],
  )

  const handleClickPlaybackSpeed = useMemo(
    () =>
      createContextMenuHandler(
        [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((value) => ({
          type: 'playbackRate',
          data: { checked: value === playbackRate, value },
        })),
      ),
    [playbackRate],
  )

  const handleClickSettings = useMemo(
    () =>
      createContextMenuHandler([
        {
          type: 'alwaysShowSeekBar',
          data: { checked: alwaysShowSeekBar },
        },
      ]),
    [alwaysShowSeekBar],
  )

  const handleChangeCurrentTime = useCallback(
    (_e: Event, value: number | number[]) => seek(value as number),
    [seek],
  )

  const handleChangeLoopRange = useCallback(
    (_e: Event, value: number | number[]) =>
      changeLoopRange(value as [number, number]),
    [changeLoopRange],
  )

  const handleChangeVolume = useCallback(
    (_e: Event, value: number | number[]) => changeVolume(value as number),
    [changeVolume],
  )

  return (
    <AppBar
      color="transparent"
      component="div"
      elevation={0}
      sx={{
        bottom: 0,
        top: 'auto',
      }}
    >
      <Box
        sx={{
          background: 'linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.7))',
          height: (theme) => theme.spacing(25),
          inset: 'auto 0 0',
          pointerEvents: 'none',
          position: 'absolute',
        }}
      />
      <Toolbar disableGutters sx={{ gap: 0.5, px: 1 }} variant="dense">
        <Slider
          max={duration}
          onChange={handleChangeCurrentTime}
          onClick={handleClickCurrentTime}
          onKeyDown={(e) => e.preventDefault()}
          size="small"
          step={0.01}
          sx={{
            borderRadius: 0,
            inset: (theme) => `-14px ${theme.spacing(1)} auto`,
            position: 'absolute',
            width: 'auto',
            '.MuiSlider-thumb': {
              transform: 'translate(-50%, -50%) scale(0)',
              transition: 'none',
              '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
                boxShadow: 'inherit',
              },
              '.MuiSlider-valueLabel': {
                backgroundColor: 'transparent',
                opacity: 0,
                transition: 'opacity 0.2s ease-in-out',
                '::before': {
                  display: 'none',
                },
              },
              '.MuiSlider-valueLabelOpen': {
                opacity: 1,
              },
            },
            '.MuiSlider-rail, .MuiSlider-track': {
              transition: 'transform 0.2s ease-in-out',
            },
            '&:hover': {
              '.MuiSlider-thumb': {
                transform: 'translate(-50%, -50%) scale(1)',
              },
              '.MuiSlider-rail, .MuiSlider-track': {
                transform: 'translate(0, -50%) scale(1, 1.5)',
              },
            },
          }}
          value={currentTime}
          valueLabelDisplay="auto"
          valueLabelFormat={formatDuration}
        />
        {loopRange && (
          <Slider
            color="secondary"
            max={duration}
            onChange={handleChangeLoopRange}
            onKeyDown={(e) => e.preventDefault()}
            size="small"
            step={0.01}
            sx={{
              borderRadius: 0,
              inset: (theme) => `-14px ${theme.spacing(1)} auto`,
              pointerEvents: partialLoopEnabled ? 'auto' : 'none',
              position: 'absolute',
              width: 'auto',
              '.MuiSlider-thumb': {
                transition: 'none',
                '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
                  boxShadow: 'inherit',
                },
                '.MuiSlider-valueLabel': {
                  backgroundColor: 'transparent',
                  opacity: 0,
                  transition: 'opacity 0.2s ease-in-out',
                  '::before': {
                    display: 'none',
                  },
                },
                '.MuiSlider-valueLabelOpen': {
                  opacity: 1,
                },
              },
              '.MuiSlider-rail, .MuiSlider-track': {
                opacity: 0.5,
                transition: 'transform 0.2s ease-in-out',
              },
              '.MuiSlider-rail': {
                display: 'none',
              },
              '&:hover': {
                '.MuiSlider-rail, .MuiSlider-track': {
                  transform: 'translate(0, -50%) scale(1, 1.5)',
                },
              },
            }}
            value={loopRange}
            valueLabelDisplay="on"
            valueLabelFormat={formatDuration}
          />
        )}
        <IconButton
          disabled={!playlistFile.previous}
          onClick={previousTrack}
          onKeyDown={(e) => e.preventDefault()}
          size="small"
          title={playlistFile.previous?.name}
        >
          <SkipPreviousIcon fontSize="small" />
        </IconButton>
        <IconButton
          onClick={togglePaused}
          onKeyDown={(e) => e.preventDefault()}
          size="small"
          title={`${paused ? 'Play' : 'Pause'} (k)`}
        >
          <PlayIcon fontSize="small" />
        </IconButton>
        <IconButton
          disabled={!playlistFile.next}
          onClick={nextTrack}
          onKeyDown={(e) => e.preventDefault()}
          size="small"
          title={playlistFile.next?.name}
        >
          <SkipNextIcon fontSize="small" />
        </IconButton>
        <IconButton
          onClick={toggleMuted}
          onKeyDown={(e) => e.preventDefault()}
          size="small"
          title={`${muted ? 'Unmute' : 'Mute'} (m)`}
        >
          <VolumeIcon fontSize="small" />
        </IconButton>
        <Slider
          max={1}
          onChange={handleChangeVolume}
          onKeyDown={(e) => e.preventDefault()}
          size="small"
          step={0.01}
          sx={{
            borderRadius: 0,
            color: 'white',
            mx: 1,
            width: (theme) => theme.spacing(10),
            '.MuiSlider-thumb': {
              '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
                boxShadow: 'inherit',
              },
            },
          }}
          value={volumeValue}
        />
        <Typography
          noWrap
          sx={{
            flexShrink: 0,
            mx: 1,
          }}
          variant="body2"
        >
          {formatDuration(currentTime)} / {formatDuration(duration)}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton
          onClick={toggleLoop}
          onKeyDown={(e) => e.preventDefault()}
          size="small"
          title="Loop (l)"
        >
          <LoopIcon fontSize="small" />
        </IconButton>
        <IconButton
          onClick={handleClickPlaybackSpeed}
          size="small"
          title="Playback speed"
        >
          <SpeedIcon fontSize="small" />
        </IconButton>
        <IconButton onClick={handleClickSettings} size="small" title="Settings">
          <SettingsIcon fontSize="small" />
        </IconButton>
        <IconButton
          onClick={togglePictureInPicture}
          onKeyDown={(e) => e.preventDefault()}
          size="small"
          title={
            pictureInPicture ? 'Exit picture in picture' : 'Picture in picture'
          }
        >
          <PictureInPictureAltIcon fontSize="small" />
        </IconButton>
        <IconButton
          onClick={toggleFullscreen}
          onKeyDown={(e) => e.preventDefault()}
          size="small"
          title={`${fullscreen ? 'Exit full screen' : 'Full screen'} (f)`}
        >
          <FullscreenIcon fontSize="small" />
        </IconButton>
      </Toolbar>
    </AppBar>
  )
}

export default ControlBar
