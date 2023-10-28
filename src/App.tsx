import { Box, GlobalStyles } from '@mui/material'
import { useMemo } from 'react'
import Player from '~/components/Player'
import { createContextMenuHandler } from '~/utils/contextMenu'

const App = () => {
  const handleContextMenu = useMemo(() => createContextMenuHandler(), [])

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
