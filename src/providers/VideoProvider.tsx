import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import VideoContext, {
  type Action,
  type ActionCode,
  type PlaylistFile,
} from '~/contexts/VideoContext'
import { useAppDispatch, useAppSelector } from '~/store'
import {
  selectDefaultActualVolume,
  selectDefaultAutoplay,
  selectDefaultLoop,
  setDefaultAutoplay,
  setDefaultLoop,
  setDefaultMuted,
  setDefaultVolume,
} from '~/store/settings'
import { selectFile } from '~/store/window'

const useStereoPanner = (
  videoRef: React.RefObject<HTMLVideoElement | null>,
) => {
  const audioContextRef = useRef<AudioContext>(null)
  const stereoPannerRef = useRef<StereoPannerNode>(null)

  useEffect(() => {
    if (!videoRef.current || audioContextRef.current) {
      return
    }

    const audioContext = new AudioContext()
    const source = audioContext.createMediaElementSource(videoRef.current)
    const stereoPanner = audioContext.createStereoPanner()

    source.connect(stereoPanner)
    stereoPanner.connect(audioContext.destination)

    audioContextRef.current = audioContext
    stereoPannerRef.current = stereoPanner

    return () => {
      audioContextRef.current?.close()
    }
  })

  return stereoPannerRef
}

type Props = { children: ReactNode }

const VideoProvider = (props: Props) => {
  const { children } = props

  const defaultAutoplay = useAppSelector(selectDefaultAutoplay)
  const defaultLoop = useAppSelector(selectDefaultLoop)
  const defaultVolume = useAppSelector(selectDefaultActualVolume)
  const file = useAppSelector(selectFile)
  const dispatch = useAppDispatch()

  const [actionCode, setActionCode] = useState<ActionCode>()
  const [autoplay, setAutoplay] = useState(defaultAutoplay)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const [loop, setLoop] = useState(defaultLoop)
  const [loopRange, setLoopRange] = useState<[number, number]>()
  const [panVolume, setPanVolume] = useState(0)
  const [paused, setPaused] = useState(true)
  const [pictureInPicture, setPictureInPicture] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [playlistFile, setPlaylistFile] = useState<PlaylistFile>({
    next: undefined,
    previous: undefined,
  })
  const [size, setSize] = useState<{ height: number; width: number }>()
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(
    'loading',
  )
  const [storedVolume, setStoredVolume] = useState(defaultVolume)
  const [volume, setVolume] = useState(defaultVolume)
  const [zoom, setZoom] = useState(1)

  const partialLoop = useMemo(() => !!loopRange, [loopRange])
  const loopStartTime = useMemo(
    () => (loopRange ? loopRange[0] : undefined),
    [loopRange],
  )

  const message = useMemo(() => {
    switch (status) {
      case 'loading':
        return 'Loading...'
      case 'error':
        return 'Failed to load.'
      default:
        return undefined
    }
  }, [status])

  const ref = useRef<HTMLVideoElement>(null)
  const stereoPannerRef = useStereoPanner(ref)

  useEffect(() => {
    const removeListener = window.electronAPI.onFullscreenChange(setFullscreen)
    return () => removeListener()
  }, [])

  useEffect(() => {
    const video = ref.current
    if (!video) {
      return
    }

    const handleLoadStart = () => setStatus('loading')
    const handleLoadedMetadata = async () => {
      setSize({
        height: video.videoHeight,
        width: video.videoWidth,
      })
      setStatus('loaded')
    }
    const handleError = () => setStatus('error')
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
  }, [])

  useEffect(() => {
    const video = ref.current
    if (!video) {
      return
    }

    video.loop = loop
    video.volume = volume
    video.autoplay = autoplay
  }, [autoplay, loop, volume])

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
        setAutoplay(video.autoplay)
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
      setStoredVolume(volume)
      dispatch(setDefaultVolume({ defaultVolume: volume }))
      dispatch(setDefaultMuted({ defaultMuted: volume === 0 }))
    },
    [dispatch],
  )

  const changePanVolume = useCallback(
    (value: number) => {
      const panner = stereoPannerRef.current
      if (!panner) {
        return
      }
      panner.pan.value = value
      setPanVolume(value)
    },
    [stereoPannerRef.current],
  )

  const resetPanVolume = useCallback(
    () => changePanVolume(0),
    [changePanVolume],
  )

  const toggleAutoplay = useCallback(() => {
    const video = ref.current
    if (!video) {
      return
    }
    const newAutoplay = !autoplay
    video.autoplay = newAutoplay
    dispatch(setDefaultAutoplay({ defaultAutoplay: newAutoplay }))
  }, [autoplay, dispatch])

  const toggleFullscreen = useCallback(
    () => window.electronAPI.toggleFullscreen(),
    [],
  )

  const toggleLoop = useCallback(() => {
    const video = ref.current
    if (!video) {
      return
    }
    const newLoop = !loop
    video.loop = newLoop
    dispatch(setDefaultLoop({ defaultLoop: newLoop }))
  }, [dispatch, loop])

  const toggleMuted = useCallback(() => {
    const video = ref.current
    if (!video) {
      return
    }
    const muted = volume !== 0
    video.volume = muted ? 0 : storedVolume
    dispatch(setDefaultMuted({ defaultMuted: muted }))
    const action = muted ? 'mute' : 'unmute'
    triggerAction(action)
  }, [dispatch, storedVolume, triggerAction, volume])

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
      window.electronAPI.openFilePath(path)
      triggerAction('previousTrack')
    }
  }, [playlistFile.previous?.path, triggerAction])

  const nextTrack = useCallback(() => {
    const path = playlistFile.next?.path
    if (path) {
      window.electronAPI.openFilePath(path)
      triggerAction('nextTrack')
    }
  }, [playlistFile.next?.path, triggerAction])

  const value = {
    actionCode,
    autoplay,
    changeLoopRange,
    changePanVolume,
    changePlaybackRate,
    changeVolume,
    currentTime,
    duration,
    file,
    fullscreen,
    loop,
    loopRange,
    message,
    nextTrack,
    panVolume,
    partialLoop,
    paused,
    pictureInPicture,
    playbackRate,
    playlistFile,
    previousTrack,
    ref,
    resetPanVolume,
    resetZoom,
    seek,
    seekTo,
    size,
    status,
    toggleAutoplay,
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

export default VideoProvider
