import { Slider } from '@mui/material'
import { styled } from '@mui/material/styles'

const NoTransitionSlider = styled(Slider)(({ theme }) =>
  theme.unstable_sx({
    '.MuiSlider-thumb': {
      transition: 'none',
      '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
        boxShadow: 'inherit',
      },
    },
    '.MuiSlider-rail, .MuiSlider-track': {
      transition: 'none',
    },
  }),
)

export default NoTransitionSlider
