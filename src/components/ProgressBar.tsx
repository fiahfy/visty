import { LinearProgress } from '@mui/material'
import useVideo from '~/hooks/useVideo'
import { useAppSelector } from '~/store'
import { selectAlwaysShowSeekBar } from '~/store/settings'

const ProgressBar = () => {
  const alwaysShowSeekBar = useAppSelector(selectAlwaysShowSeekBar)

  const { currentTime, duration } = useVideo()

  const progress = (currentTime / duration) * 100

  return (
    <>
      {alwaysShowSeekBar && (
        <LinearProgress
          sx={{
            height: '2px',
            inset: 'auto 0 0',
            position: 'absolute',
            '.MuiLinearProgress-bar': { transition: 'none' },
          }}
          value={progress}
          variant="determinate"
        />
      )}
    </>
  )
}

export default ProgressBar
