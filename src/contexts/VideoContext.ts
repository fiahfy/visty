import { createContext, type RefObject } from 'react'

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
  | 'volumeDown'
  | 'volumeUp'

export type ActionCode = `${Action}:${string}:${string}`

const VideoContext = createContext<
  | {
      actionCode: ActionCode | undefined
      autoplay: boolean
      changeLoopRange: (value: [number, number]) => void
      changePan: (value: number) => void
      changePlaybackRate: (value: number) => void
      changeVolume: (value: number) => void
      currentTime: number
      duration: number
      file: File
      fullscreen: boolean
      loop: boolean
      loopRange: [number, number] | undefined
      message: string | undefined
      nextTrack: () => void
      pan: number
      partialLoop: boolean
      paused: boolean
      pictureInPicture: boolean
      playbackRate: number
      playlistFile: PlaylistFile
      previousTrack: () => void
      ref: RefObject<HTMLVideoElement | null>
      resetZoom: () => void
      seek: (value: number) => void
      seekTo: (direction: 'backward' | 'forward') => void
      size: { height: number; width: number } | undefined
      status: 'loading' | 'loaded' | 'error'
      toggleAutoplay: () => void
      toggleFullscreen: () => void
      toggleLoop: () => void
      toggleMuted: () => void
      togglePanLeft: () => void
      togglePanRight: () => void
      togglePartialLoop: () => void
      togglePaused: () => void
      togglePictureInPicture: () => void
      volume: number
      volumeDown: () => void
      volumeUp: () => void
      zoom: number
      zoomBy: (value: number) => void
      zoomIn: () => void
      zoomOut: () => void
    }
  | undefined
>(undefined)

export default VideoContext
