import {
  ReactNode,
  RefObject,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useAppDispatch, useAppSelector } from '~/store'
import {
  selectDefaultLoop,
  selectDefaultMuted,
  selectDefaultVolume,
  setDefaultLoop,
  setDefaultMuted,
  setDefaultVolume,
} from '~/store/settings'
import { selectFile } from '~/store/window'

type File = { name: string; path: string; url: string }

type PlaylistFile = {
  next: File | undefined
  previous: File | undefined
}

type Action =
  | 'mute'
  | 'nextTrack'
  | 'pause'
  | 'play'
  | 'previousTrack'
  | 'seekBackward'
  | 'seekForward'
  | 'unmute'
type ActionCode = `${Action}:${string}`

export const VideoContext = createContext<
  | {
      actionCode: ActionCode | undefined
      changeLoopRange: (value: [number, number]) => void
      changePlaybackRate: (value: number) => void
      changeVolume: (value: number) => void
      currentTime: number
      duration: number
      file: { name: string; path: string; url: string }
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

type Props = { children: ReactNode }

export const VideoProvider = (props: Props) => {
  const { children } = props

  const defaultLoop = useAppSelector(selectDefaultLoop)
  const defaultMuted = useAppSelector(selectDefaultMuted)
  const defaultVolume = useAppSelector(selectDefaultVolume)
  const file = useAppSelector(selectFile)
  const dispatch = useAppDispatch()

  const [actionCode, setActionCode] = useState<ActionCode>()
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [state, setState] = useState('loading')
  const [loop, setLoop] = useState(false)
  const [loopRange, setLoopRange] = useState<[number, number]>()
  const [muted, setMuted] = useState(false)
  const [paused, setPaused] = useState(true)
  const [pictureInPicture, setPictureInPicture] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [volume, setVolume] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [fullscreen, setFullscreen] = useState(false)

  const [playlistFile, setPlaylistFile] = useState<PlaylistFile>({
    next: undefined,
    previous: undefined,
  })

  const message = useMemo(() => {
    switch (state) {
      case 'loading':
        return 'Loading...'
      case 'error':
        return 'Failed to load.'
      default:
        return undefined
    }
  }, [state])
  const partialLoop = useMemo(() => !!loopRange, [loopRange])
  const loopStartTime = useMemo(
    () => (loopRange ? loopRange[0] : undefined),
    [loopRange],
  )

  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const removeListener =
      window.electronAPI.addFullscreenListener(setFullscreen)
    return () => removeListener()
  }, [])

  useEffect(() => {
    const video = ref.current
    if (!video) {
      return
    }
    const handleLoadStart = () => setState('loading')
    const handleLoadedMetadata = async () => {
      await window.electronAPI.setContentSize({
        width: video.videoWidth,
        height: video.videoHeight,
      })
      video.loop = defaultLoop
      video.volume = defaultMuted ? 0 : defaultVolume
      setState('loaded')
    }
    const handleError = () => setState('error')
    const handleEnterPictureInPicture = () => setPictureInPicture(true)
    const handleLeavePictureInPicture = () => setPictureInPicture(false)
    video.addEventListener('loadedstart', handleLoadStart)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('error', handleError)
    video.addEventListener('enterpictureinpicture', handleEnterPictureInPicture)
    video.addEventListener('leavepictureinpicture', handleLeavePictureInPicture)
    return () => {
      video.removeEventListener('loadedstart', handleLoadStart)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('error', handleError)
      video.removeEventListener(
        'enterpictureinpicture',
        handleEnterPictureInPicture,
      )
      video.removeEventListener(
        'leavepictureinpicture',
        handleLeavePictureInPicture,
      )
    }
  }, [defaultLoop, defaultMuted, defaultVolume])

  useEffect(() => {
    const video = ref.current
    if (!video) {
      return
    }
    let requestId: number
    const callback = () => {
      if (video.readyState >= 1) {
        setCurrentTime(video.currentTime)
        setDuration(video.duration)
        setLoop(video.loop)
        setPaused(video.paused)
        setPlaybackRate(video.playbackRate)
        setVolume(video.volume)
      }
      requestId = requestAnimationFrame(callback)
    }
    requestId = requestAnimationFrame(callback)
    return () => cancelAnimationFrame(requestId)
  }, [])

  useEffect(() => {
    const video = ref.current
    if (!video) {
      return
    }
    let requestId: number
    const callback = () => {
      if (loopRange) {
        const [startTime, endTime] = loopRange
        if (video.currentTime < startTime || video.currentTime > endTime) {
          video.currentTime = startTime
        }
      }
      requestId = requestAnimationFrame(callback)
    }
    requestId = requestAnimationFrame(callback)
    return () => cancelAnimationFrame(requestId)
  }, [loopRange])

  useEffect(() => {
    const video = ref.current
    if (!video) {
      return
    }
    if (loopStartTime !== undefined) {
      video.currentTime = loopStartTime
    }
  }, [loopStartTime])

  useEffect(() => {
    ;(async () => {
      const playlistFile = await window.electronAPI.getPlaylistFile(file.path)
      setPlaylistFile(playlistFile)
    })()
  }, [file.path])

  const triggerAction = useCallback(
    (action: Action) => setActionCode(`${action}:${Date.now()}`),
    [],
  )

  const changeLoopRange = useCallback(
    (value: [number, number]) => setLoopRange(value),
    [],
  )

  const changePlaybackRate = useCallback((value: number) => {
    const video = ref.current
    if (!video) {
      return
    }
    video.playbackRate = value
  }, [])

  const changeVolume = useCallback(
    (value: number) => {
      const video = ref.current
      if (!video) {
        return
      }
      const volume = Math.min(Math.max(0, value), 1)
      video.volume = volume
      dispatch(setDefaultVolume(volume))
      dispatch(setDefaultMuted(volume === 0))
    },
    [dispatch],
  )

  const toggleFullscreen = useCallback(
    async () => window.electronAPI.toggleFullscreen(),
    [],
  )

  const toggleLoop = useCallback(() => {
    const video = ref.current
    if (!video) {
      return
    }
    const newLoop = !loop
    video.loop = newLoop
    dispatch(setDefaultLoop(newLoop))
  }, [dispatch, loop])

  const toggleMuted = useCallback(() => {
    const video = ref.current
    if (!video) {
      return
    }
    const newMuted = !muted
    video.volume = newMuted ? 0 : defaultVolume
    setMuted(newMuted)
    dispatch(setDefaultMuted(newMuted))
    const action = newMuted ? 'mute' : 'unmute'
    triggerAction(action)
  }, [defaultVolume, dispatch, muted, triggerAction])

  const togglePaused = useCallback(() => {
    const video = ref.current
    if (!video) {
      return
    }
    if (paused) {
      video.play()
      triggerAction('play')
    } else {
      video.pause()
      triggerAction('pause')
    }
  }, [paused, triggerAction])

  const togglePartialLoop = useCallback(() => {
    if (loopRange) {
      setLoopRange(undefined)
    } else {
      setLoopRange([currentTime, duration])
    }
  }, [currentTime, duration, loopRange])

  const togglePictureInPicture = useCallback(async () => {
    const video = ref.current
    if (!video) {
      return
    }
    if (pictureInPicture) {
      await document.exitPictureInPicture()
    } else {
      await video.requestPictureInPicture()
    }
  }, [pictureInPicture])

  const seek = useCallback((value: number) => {
    const video = ref.current
    if (!video) {
      return
    }
    video.currentTime = value
  }, [])

  const seekTo = useCallback(
    (direction: 'backward' | 'forward') => {
      const video = ref.current
      if (!video) {
        return
      }
      video.currentTime += direction === 'forward' ? 5 : -5
      const action = direction === 'forward' ? 'seekForward' : 'seekBackward'
      triggerAction(action)
    },
    [triggerAction],
  )

  const zoomBy = useCallback(
    (value: number) =>
      setZoom((zoom) => Math.min(Math.max(1, zoom * (1 + value)), 10)),
    [],
  )

  const zoomIn = useCallback(() => zoomBy(0.1), [zoomBy])

  const zoomOut = useCallback(() => zoomBy(-0.1), [zoomBy])

  const resetZoom = useCallback(() => setZoom(1), [])

  const previousTrack = useCallback(() => {
    const path = playlistFile.previous?.path
    if (path) {
      window.electronAPI.openFile(path)
      triggerAction('previousTrack')
    }
  }, [playlistFile.previous?.path, triggerAction])

  const nextTrack = useCallback(() => {
    const path = playlistFile.next?.path
    if (path) {
      window.electronAPI.openFile(path)
      triggerAction('nextTrack')
    }
  }, [playlistFile.next?.path, triggerAction])

  const value = {
    actionCode,
    changeLoopRange,
    changePlaybackRate,
    changeVolume,
    currentTime,
    duration,
    file,
    fullscreen,
    loop,
    loopRange,
    message,
    muted,
    nextTrack,
    partialLoop,
    paused,
    pictureInPicture,
    playbackRate,
    playlistFile,
    previousTrack,
    ref,
    resetZoom,
    seek,
    seekTo,
    toggleFullscreen,
    toggleLoop,
    toggleMuted,
    togglePartialLoop,
    togglePaused,
    togglePictureInPicture,
    volume,
    zoom,
    zoomBy,
    zoomIn,
    zoomOut,
  }

  return <VideoContext.Provider value={value}>{children}</VideoContext.Provider>
}
