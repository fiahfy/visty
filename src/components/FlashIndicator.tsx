import {
  Forward5 as Forward5Icon,
  Pause as PauseIcon,
  PlayArrow as PlayArrowIcon,
  Replay5 as Replay5Icon,
  VolumeOff as VolumeOffIcon,
  VolumeUp as VolumeUpIcon,
} from '@mui/icons-material'
import { Box } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import FadeAndScale from '~/components/mui/FadeAndScale'

type Action =
  | 'play'
  | 'pause'
  | 'seekBackward'
  | 'seekForward'
  | 'mute'
  | 'unmute'
type ActionCode = `${Action}:${string}`

type Props = {
  actionCode: ActionCode | undefined
}

const FlashIndicator = (props: Props) => {
  const { actionCode } = props

  const [iconVisible, setIconVisible] = useState(false)

  const action = useMemo(() => {
    const [action] = (actionCode ?? '').split(':')
    return action
  }, [actionCode])

  const ActionIcon = useMemo(() => {
    switch (action) {
      case 'play':
        return PlayArrowIcon
      case 'pause':
        return PauseIcon
      case 'seekBackward':
        return Replay5Icon
      case 'seekForward':
        return Forward5Icon
      case 'mute':
        return VolumeOffIcon
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
