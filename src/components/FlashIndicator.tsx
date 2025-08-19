import {
  Forward5 as Forward5Icon,
  Pause as PauseIcon,
  PlayArrow as PlayArrowIcon,
  Replay5 as Replay5Icon,
  SkipNext as SkipNextIcon,
  SkipPrevious as SkipPreviousIcon,
  VolumeDown as VolumeDownIcon,
  VolumeOff as VolumeOffIcon,
  VolumeUp as VolumeUpIcon,
} from '@mui/icons-material'
import { Box, Stack, Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import FlashIndicatorTransition from '~/components/transitions/FlashIndicatorTransition'
import HideTransition from '~/components/transitions/HideTransition'
import useVideo from '~/hooks/useVideo'

const FlashIndicator = () => {
  const { actionCode } = useVideo()

  const [iconVisible, setIconVisible] = useState(false)

  const [action, value] = useMemo(() => {
    const [action, value] = (actionCode ?? '').split(':')
    return [action, Number(value)]
  }, [actionCode])

  const [ActionIcon, message] = useMemo(() => {
    switch (action) {
      case 'mute':
        return [VolumeOffIcon, `${value * 100}%`]
      case 'nextTrack':
        return [SkipNextIcon, undefined]
      case 'pause':
        return [PauseIcon, undefined]
      case 'play':
        return [PlayArrowIcon, undefined]
      case 'previousTrack':
        return [SkipPreviousIcon, undefined]
      case 'seekBackward':
        return [Replay5Icon, undefined]
      case 'seekForward':
        return [Forward5Icon, undefined]
      case 'unmute':
        return [VolumeUpIcon, `${value * 100}%`]
      case 'volumeDown':
        return [VolumeDownIcon, `${value * 100}%`]
      case 'volumeUp':
        return [VolumeUpIcon, `${value * 100}%`]
      default:
        return [undefined, undefined]
    }
  }, [action, value])

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
        position: 'absolute',
      }}
    >
      <Stack
        alignItems="center"
        direction="column"
        sx={{ position: 'relative' }}
      >
        <FlashIndicatorTransition in={iconVisible}>
          {ActionIcon && (
            <Box
              sx={{
                display: 'inline-block',
                backgroundColor: 'black',
                borderRadius: '50%',
                opacity: 0.5,
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
          )}
        </FlashIndicatorTransition>
        <Box
          sx={{
            bottom: (theme) => `calc(-1 * ${theme.spacing(7.5)})`,
            position: 'absolute',
          }}
        >
          <HideTransition in={iconVisible}>
            {message && (
              <Typography
                variant="body2"
                sx={{
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  borderRadius: (theme) => theme.spacing(0.5),
                  opacity: 0.7,
                  px: 1,
                  py: 0.25,
                }}
              >
                {message}
              </Typography>
            )}
          </HideTransition>
        </Box>
      </Stack>
    </Box>
  )
}

export default FlashIndicator
