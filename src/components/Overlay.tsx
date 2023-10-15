import {
  Pause as PauseIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material'
import { Box } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import FadeAndScale from '~/components/mui/FadeAndScale'

type Props = {
  currentTime: number
  duration: number
  paused: boolean
}

// TODO: for seek backward and forward actions
const Overlay = (props: Props) => {
  const { currentTime, duration, paused } = props

  const [iconVisible, setIconVisible] = useState(false)

  const ActionIcon = useMemo(
    () => (paused ? PauseIcon : PlayArrowIcon),
    [paused],
  )

  useEffect(() => {
    setIconVisible(true)
    const timer = setTimeout(() => setIconVisible(false), 50)
    return () => clearTimeout(timer)
  }, [paused])

  return (
    <>
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
    </>
  )
}

export default Overlay
