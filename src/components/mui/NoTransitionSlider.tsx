import { Slider } from '@mui/material'
import { styled } from '@mui/material/styles'

const NoTransitionSlider = styled(Slider)(({ theme }) =>
  theme.unstable_sx({
    '&': {
      borderRadius: 0,
      '.MuiSlider-thumb': {
        transform: 'translate(-50%, -50%) scale(0)',
        transition: 'transform 0.2s ease-in-out',
        '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
          boxShadow: 'inherit',
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
    },
  }),
)

export default NoTransitionSlider
