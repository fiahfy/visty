import { Box, Slider } from '@mui/material'
import {
  type MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Transition } from 'react-transition-group'
import useTheme from '~/hooks/useTheme'
import useVideo from '~/hooks/useVideo'
import { useAppSelector } from '~/store'
import { selectShouldAlwaysShowSeekBar } from '~/store/settings'
import { formatDuration } from '~/utils/formatter'

type Props = {
  controlBarVisible: boolean
}

const SeekBar = (props: Props) => {
  const { controlBarVisible } = props

  const shouldAlwaysShowSeekBar = useAppSelector(selectShouldAlwaysShowSeekBar)

  const { changeLoopRange, currentTime, duration, loopRange, seek } = useVideo()
  const { theme } = useTheme()

  const [partialLoopEnabled, setPartialLoopEnabled] = useState(false)

  const nodeRef = useRef(null)

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

  const handleClickCurrentTime = useCallback(
    (e: MouseEvent) => {
      if ((e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey)) {
        changeLoopRange([currentTime, duration])
      }
    },
    [changeLoopRange, currentTime, duration],
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

  const timeout = theme.transitions.duration.shortest

  const styles = useMemo(() => {
    const styles = {
      inset: `auto ${theme.spacing(1)} 1px`,
      opacity: 1,
      transform: 'translateY(-61px)',
    }
    return {
      appear: styles,
      disappear: {
        inset: shouldAlwaysShowSeekBar ? 'auto 0 1px' : styles.inset,
        opacity: shouldAlwaysShowSeekBar ? styles.opacity : 0,
        transform: shouldAlwaysShowSeekBar
          ? 'translateY(-14px)'
          : styles.transform,
      },
    }
  }, [shouldAlwaysShowSeekBar, theme])

  const transitionStyles = {
    entering: styles.appear,
    entered: styles.appear,
    exiting: styles.disappear,
    exited: styles.disappear,
    unmounted: styles.disappear,
  }

  return (
    <Transition in={controlBarVisible} nodeRef={nodeRef} timeout={timeout}>
      {(state) => (
        <Box
          ref={nodeRef}
          sx={{
            position: 'absolute',
            transition: `opacity ${timeout}ms ease-in-out, transform ${timeout}ms ease-in-out, inset ${timeout}ms ease-in-out`,
            zIndex: (theme) => theme.zIndex.appBar,
            ...transitionStyles[state],
          }}
        >
          <Slider
            max={duration}
            onChange={handleChangeCurrentTime}
            onClick={handleClickCurrentTime}
            size="small"
            // Emulating Keyboard Event Prevention
            step={0.1 ** 10}
            sx={{
              borderRadius: 0,
              inset: 0,
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
              size="small"
              step={0.01}
              sx={{
                borderRadius: 0,
                inset: 0,
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
              valueLabelDisplay={
                !controlBarVisible && shouldAlwaysShowSeekBar ? 'off' : 'on'
              }
              valueLabelFormat={formatDuration}
            />
          )}
        </Box>
      )}
    </Transition>
  )
}

export default SeekBar
