import {
  Fullscreen as FullscreenEnterIcon,
  FullscreenExit as FullscreenExitIcon,
  Pause as PauseIcon,
  PlayArrow as PlayArrowIcon,
  VolumeDown as VolumeDownIcon,
  VolumeOff as VolumeOffIcon,
  VolumeUp as VolumeUpIcon,
} from '@mui/icons-material'
import { AppBar, Box, IconButton, Toolbar, Typography } from '@mui/material'
import { useCallback, useMemo, useState } from 'react'
import NoTransitionSlider from '~/components/mui/NoTransitionSlider'
import { formatDuration } from '~/utils/formatter'

type Props = {
  currentTime: number
  duration: number
  muted: boolean
  onChangeCurrentTime: (value: number) => void
  onChangeVolume: (value: number) => void
  onClickMute: () => void
  onClickPlay: () => void
  paused: boolean
  volume: number
}
const ControlBar = (props: Props) => {
  const {
    currentTime,
    duration,
    muted,
    onChangeCurrentTime,
    onChangeVolume,
    onClickMute,
    onClickPlay,
    paused,
    volume,
  } = props

  const [fullscreen, setFullscreen] = useState(false)

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

  const handleChangeCurrentTime = useCallback(
    (_e: Event, value: number | number[]) => {
      onChangeCurrentTime(value as number)
    },
    [onChangeCurrentTime],
  )

  const handleChangeVolume = useCallback(
    (_e: Event, value: number | number[]) => {
      onChangeVolume(value as number)
    },
    [onChangeVolume],
  )

  return (
    <AppBar
      color="transparent"
      component="div"
      elevation={0}
      // onMouseEnter={handleMouseEnter}
      // onMouseLeave={handleMouseLeave}
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
          onClick={onClickPlay}
          size="small"
          title={paused ? 'Play' : 'Pause'}
        >
          <PlayIcon fontSize="small" />
        </IconButton>
        <IconButton
          onClick={onClickMute}
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
  )
}

export default ControlBar