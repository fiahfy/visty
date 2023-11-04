import {
  Forward5 as Forward5Icon,
  Pause as PauseIcon,
  PlayArrow as PlayArrowIcon,
  Replay5 as Replay5Icon,
  SkipNext as SkipNextIcon,
  SkipPrevious as SkipPreviousIcon,
  VolumeOff as VolumeOffIcon,
  VolumeUp as VolumeUpIcon,
} from '@mui/icons-material'
import { Box } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import FadeAndScale from '~/components/mui/FadeAndScale'
import useVideo from '~/hooks/useVideo'

const FlashIndicator = () => {
  const { actionCode } = useVideo()

  const [iconVisible, setIconVisible] = useState(false)

  const action = useMemo(() => {
    const [action] = (actionCode ?? '').split(':')
    return action
  }, [actionCode])

  const ActionIcon = useMemo(() => {
    switch (action) {
      case 'mute':
        return VolumeOffIcon
      case 'nextTrack':
        return SkipNextIcon
      case 'pause':
        return PauseIcon
      case 'play':
        return PlayArrowIcon
      case 'previousTrack':
        return SkipPreviousIcon
      case 'seekBackward':
        return Replay5Icon
      case 'seekForward':
        return Forward5Icon
      case 'unmute':
        return VolumeUpIcon
      default:
        return null
    }
  }, [action])

  useEffect(() => {
    if (!actionCode) {
      return
    }
    setIconVisible(true)
    const timer = setTimeout(() => setIconVisible(false), 50)
    return () => clearTimeout(timer)
  }, [actionCode])

  return (
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
          {ActionIcon && (
            <ActionIcon
              sx={(theme) => ({
                height: theme.spacing(6),
                verticalAlign: 'bottom',
                width: theme.spacing(6),
              })}
            />
          )}
        </Box>
      </FadeAndScale>
    </Box>
  )
}

export default FlashIndicator
