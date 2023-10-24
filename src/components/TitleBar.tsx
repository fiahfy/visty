import { AppBar, Toolbar, Typography } from '@mui/material'

type Props = {
  title: string
}

const TitleBar = (props: Props) => {
  const { title } = props

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
          {title}
        </Typography>
      </Toolbar>
    </AppBar>
  )
}

export default TitleBar
