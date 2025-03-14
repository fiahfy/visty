import { AppBar, Toolbar, Typography } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import useVideo from '~/hooks/useVideo'

type Props = {
  onMouseEnter: () => void
  onMouseLeave: () => void
}

const TitleBar = (props: Props) => {
  const { onMouseEnter, onMouseLeave } = props

  const { file } = useVideo()

  const [hovered, setHovered] = useState(false)

  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (hovered) {
      onMouseEnter()
    } else {
      onMouseLeave()
    }
  }, [hovered, onMouseEnter, onMouseLeave])

  useEffect(() => {
    let id: number

    const callback = async () => {
      const el = ref.current
      if (!el) {
        return
      }

      const rect = el.getBoundingClientRect()
      const { x, y } = await window.electronAPI.getCursorPosition()

      const left = window.screenX + rect.x
      const right = left + rect.width
      const top = window.screenY + rect.y
      const bottom = top + rect.height

      setHovered(left <= x && x <= right && top <= y && y <= bottom)

      id = requestAnimationFrame(callback)
    }

    callback()

    return () => {
      window.cancelAnimationFrame(id)
    }
  }, [])

  return (
    <AppBar
      color="default"
      component="div"
      elevation={0}
      enableColorOnDark
      ref={ref}
      // @see https://github.com/electron/electron/issues/1354
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
