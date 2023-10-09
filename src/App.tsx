import { Box, GlobalStyles } from '@mui/material'
import { useMemo } from 'react'
import Player from '~/components/Player'
import useEventListener from '~/hooks/useEventListener'
import useMessageListener from '~/hooks/useMessageListener'
import { createMenuHandler } from '~/utils/contextMenu'

const App = () => {
  useEventListener()
  useMessageListener()

  const handleContextMenu = useMemo(() => createMenuHandler(), [])

  return (
    <Box
      component="main"
      onContextMenu={handleContextMenu}
      sx={{
        display: 'flex',
        height: '100%',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      <GlobalStyles styles={{ 'html, body, #root': { height: '100%' } }} />
      <Player />
    </Box>
  )
}

export default App
