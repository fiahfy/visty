import {
  Fullscreen as FullscreenEnterIcon,
  FullscreenExit as FullscreenExitIcon,
  Hearing as HearingIcon,
  Pause as PauseIcon,
  PictureInPictureAlt as PictureInPictureAltIcon,
  PlayArrow as PlayArrowIcon,
  Settings as SettingsIcon,
  SkipNext as SkipNextIcon,
  SkipPrevious as SkipPreviousIcon,
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
import { useCallback, useMemo } from 'react'
import useVideo from '~/hooks/useVideo'
import { useAppSelector } from '~/store'
import {
  selectShouldAlwaysShowSeekBar,
  selectShouldCloseWindowOnEscapeKey,
  selectViewModeOnOpen,
} from '~/store/settings'
import { createContextMenuHandler } from '~/utils/context-menu'
import { formatDuration } from '~/utils/formatter'

const ControlBar = () => {
  const shouldAlwaysShowSeekBar = useAppSelector(selectShouldAlwaysShowSeekBar)
  const shouldCloseWindowOnEscapeKey = useAppSelector(
    selectShouldCloseWindowOnEscapeKey,
  )
  const viewModeOnOpen = useAppSelector(selectViewModeOnOpen)

  const {
    autoplay,
    changePan,
    changeVolume,
    currentTime,
    duration,
    fullscreen,
    loop,
    nextTrack,
    pan,
    partialLoop,
    paused,
    pictureInPicture,
    playbackRate,
    playlistFile,
    previousTrack,
    toggleFullscreen,
    toggleMuted,
    togglePanLeft,
    togglePanRight,
    togglePaused,
    togglePictureInPicture,
    volume,
  } = useVideo()

  const muted = useMemo(() => volume === 0, [volume])

  const PlayIcon = useMemo(() => (paused ? PlayArrowIcon : PauseIcon), [paused])

  const VolumeIcon = useMemo(() => {
    if (volume > 0.5) {
      return VolumeUpIcon
    }
    if (volume > 0) {
      return VolumeDownIcon
    }
    return VolumeOffIcon
  }, [volume])

  const FullscreenIcon = useMemo(
    () => (fullscreen ? FullscreenExitIcon : FullscreenEnterIcon),
    [fullscreen],
  )

  const handleClickSettings = useMemo(
    () =>
      createContextMenuHandler([
        { type: 'playbackRate', data: { playbackRate } },
        { type: 'separator' },
        { type: 'autoplay', data: { checked: autoplay } },
        { type: 'separator' },
        { type: 'loop', data: { checked: loop } },
        { type: 'partialLoop', data: { checked: partialLoop } },
        { type: 'separator' },
        {
          type: 'alwaysShowSeekBar',
          data: { checked: shouldAlwaysShowSeekBar },
        },
        {
          type: 'closeWindowOnEscapeKey',
          data: { checked: shouldCloseWindowOnEscapeKey },
        },
        {
          type: 'viewModeOnOpen',
          data: { viewModeOnOpen },
        },
      ]),
    [
      autoplay,
      loop,
      partialLoop,
      playbackRate,
      shouldAlwaysShowSeekBar,
      shouldCloseWindowOnEscapeKey,
      viewModeOnOpen,
    ],
  )

  const handleChangeVolume = useCallback(
    (_e: Event, value: number | number[]) => changeVolume(value as number),
    [changeVolume],
  )

  const handleChangePan = useCallback(
    (_e: Event, value: number | number[]) => changePan(value as number),
    [changePan],
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
          value={volume}
        />
        <IconButton
          onClick={togglePanLeft}
          onKeyDown={(e) => e.preventDefault()}
          size="small"
          title="Pan Left"
        >
          <HearingIcon fontSize="small" />
        </IconButton>
        <Slider
          max={1}
          min={-1}
          onChange={handleChangePan}
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
          value={pan}
        />
        <IconButton
          onClick={togglePanRight}
          onKeyDown={(e) => e.preventDefault()}
          size="small"
          sx={{ transform: 'scale(-1, 1)' }}
          title="Pan Right"
        >
          <HearingIcon fontSize="small" />
        </IconButton>
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
          onClick={handleClickSettings}
          onKeyDown={(e) => e.preventDefault()}
          size="small"
          title="Settings"
        >
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
