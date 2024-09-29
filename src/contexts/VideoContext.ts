import { type RefObject, createContext } from 'react'

type File = { name: string; path: string; url: string }

export type PlaylistFile = {
  next: File | undefined
  previous: File | undefined
}

export type Action =
  | 'mute'
  | 'nextTrack'
  | 'pause'
  | 'play'
  | 'previousTrack'
  | 'seekBackward'
  | 'seekForward'
  | 'unmute'

export type ActionCode = `${Action}:${string}`

const VideoContext = createContext<
  | {
      actionCode: ActionCode | undefined
      autoplay: boolean
      changeLoopRange: (value: [number, number]) => void
      changePlaybackRate: (value: number) => void
      changeVolume: (value: number) => void
      currentTime: number
      duration: number
      file: File
      fullscreen: boolean
      loop: boolean
      loopRange: [number, number] | undefined
      message: string | undefined
      muted: boolean
      nextTrack: () => void
      partialLoop: boolean
      paused: boolean
      pictureInPicture: boolean
      playbackRate: number
      playlistFile: PlaylistFile
      previousTrack: () => void
      ref: RefObject<HTMLVideoElement>
      resetZoom: () => void
      seek: (value: number) => void
      seekTo: (direction: 'backward' | 'forward') => void
      size: { height: number; width: number } | undefined
      status: 'loading' | 'loaded' | 'error'
      toggleAutoplay: () => void
      toggleFullscreen: () => void
      toggleLoop: () => void
      toggleMuted: () => void
      togglePartialLoop: () => void
      togglePaused: () => void
      togglePictureInPicture: () => void
      volume: number
      zoom: number
      zoomBy: (value: number) => void
      zoomIn: () => void
      zoomOut: () => void
    }
  | undefined
>(undefined)

export default VideoContext
