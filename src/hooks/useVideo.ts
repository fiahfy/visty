import { useContext } from 'react'
import { VideoContext } from '~/contexts/VideoContext'

const useVideo = () => {
  const context = useContext(VideoContext)
  if (!context) {
    throw new Error('useVideo must be used within a Provider')
  }
  return context
}

export default useVideo
