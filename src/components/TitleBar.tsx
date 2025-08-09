import { AppBar, Toolbar, Typography } from '@mui/material'
import { useEffect, useRef, useState } from 'react'

type Props = {
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  title: string
}

const TitleBar = (props: Props) => {
  const {
    onMouseEnter = () => undefined,
    onMouseLeave = () => undefined,
    title,
  } = props

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

      const hovered = left <= x && x <= right && top <= y && y <= bottom

      setHovered(hovered)

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
          {title}
        </Typography>
      </Toolbar>
    </AppBar>
  )
}

export default TitleBar
