import { FileOpen as FileOpenIcon } from '@mui/icons-material'
import { Box, Fade } from '@mui/material'
import useTheme from '~/hooks/useTheme'

type Props = {
  dropping: boolean
}

const DroppableMask = (props: Props) => {
  const { dropping } = props

  const { theme } = useTheme()

  return (
    <Fade in={dropping}>
      <Box
        sx={{
          inset: 0,
          zIndex: theme.zIndex.appBar,
          pointerEvents: 'none',
          position: 'absolute',
        }}
      >
        <Box
          sx={{
            alignItems: 'center',
            backgroundColor: 'white',
            color: 'black',
            display: 'flex',
            height: '100%',
            justifyContent: 'center',
            opacity: 0.3,
            width: '100%',
          }}
        >
          <FileOpenIcon
            sx={(theme) => ({
              height: theme.spacing(10),
              verticalAlign: 'bottom',
              width: theme.spacing(10),
            })}
          />
        </Box>
      </Box>
    </Fade>
  )
}

export default DroppableMask
