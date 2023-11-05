import { FileOpen as FileOpenIcon } from '@mui/icons-material'
import { Box, Fade } from '@mui/material'

type Props = {
  dropping: boolean
}

const DroppableMask = (props: Props) => {
  const { dropping } = props

  return (
    <Fade in={dropping}>
      <Box
        sx={{
          inset: 0,
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
