import { AppBar, Toolbar, Typography } from '@mui/material'
import useVideo from '~/hooks/useVideo'

const TitleBar = () => {
  const { file } = useVideo()

  return (
    <AppBar
      color="default"
      component="div"
      elevation={0}
      enableColorOnDark
      sx={{ WebkitAppRegion: 'drag', opacity: 0.95 }}
    >
      <Toolbar
        disableGutters
        sx={{
          justifyContent: 'center',
          minHeight: (theme) => `${theme.spacing(3.5)}!important`,
          px: 8.5,
        }}
      >
        <Typography mt={0.25} noWrap variant="caption">
          {file.name}
        </Typography>
      </Toolbar>
    </AppBar>
  )
}

export default TitleBar
