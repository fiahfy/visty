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
import useStereoPanner from '~/hooks/useStereoPanner'
import { useAppDispatch, useAppSelector } from '~/store'
import {
  saveAutoplay,
  saveCurrentTime,
  saveLoop,
  saveLoopRange,
  savePan,
  savePlaybackRate,
  saveVolume,
  selectAutoplay,
  selectCurrentTime,
  selectFile,
  selectLoop,
  selectLoopRange,
  selectPan,
  selectPlaybackRate,
  selectVolume,
} from '~/store/window'

type Props = { children: ReactNode }

const VideoProvider = (props: Props) => {
  const { children } = props

  const file = useAppSelector(selectFile)
  const loopRange = useAppSelector(selectLoopRange)
  const savedAutoplay = useAppSelector(selectAutoplay)
  const savedCurrentTime = useAppSelector(selectCurrentTime)
  const savedLoop = useAppSelector(selectLoop)
  const savedPan = useAppSelector(selectPan)
  const savedPlaybackRate = useAppSelector(selectPlaybackRate)
  const savedVolume = useAppSelector(selectVolume)
  const dispatch = useAppDispatch()

  const [autoplay, setAutoplay] = useState(false)
  const [actionCode, setActionCode] = useState<ActionCode>()
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [loop, setLoop] = useState(false)
  const [pan, setPan] = useState(0)
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
  const [storedVolume, setStoredVolume] = useState(savedVolume)
  const [volume, setVolume] = useState(0)
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
    if (initialized) {
      return
    }
    setInitialized(true)

    const video = ref.current
    if (!video) {
      return
    }
    const panner = stereoPannerRef.current
    if (!panner) {
      return
    }

    video.autoplay = savedAutoplay
    video.currentTime = savedCurrentTime
    video.loop = savedLoop
    video.playbackRate = savedPlaybackRate
    video.volume = savedVolume
    panner.pan.value = savedPan
  }, [
    initialized,
    savedAutoplay,
    savedCurrentTime,
    savedLoop,
    savedPan,
    savedPlaybackRate,
    savedVolume,
    stereoPannerRef,
  ])

  useEffect(() => {
    const video = ref.current
    if (!video) {
      return
    }
    const panner = stereoPannerRef.current
    if (!panner) {
      return
    }

    const timer = window.setInterval(() => {
      dispatch(saveAutoplay(video.autoplay))
      dispatch(saveCurrentTime(video.currentTime))
      dispatch(saveLoop(video.loop))
      dispatch(savePlaybackRate(video.playbackRate))
      dispatch(saveVolume(video.volume))
      dispatch(savePan(panner.pan.value))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [dispatch, stereoPannerRef])

  useEffect(() => {
    const video = ref.current
    if (!video) {
      return
    }
    const panner = stereoPannerRef.current
    if (!panner) {
      return
    }

    let requestId: number
    const callback = () => {
      if (video.readyState >= 1) {
        setDuration(video.duration)
        setPaused(video.paused)

        setAutoplay(video.autoplay)
        setCurrentTime(video.currentTime)
        setLoop(video.loop)
        setPlaybackRate(video.playbackRate)
        setVolume(video.volume)
        setPan(panner.pan.value)
      }
      requestId = requestAnimationFrame(callback)
    }
    requestId = requestAnimationFrame(callback)

    return () => cancelAnimationFrame(requestId)
  }, [stereoPannerRef.current])

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
    (action: Action, value?: number) =>
      setActionCode(`${action}:${value ?? 0}:${Date.now()}`),
    [],
  )

  const changeLoopRange = useCallback(
    (value: [number, number]) => dispatch(saveLoopRange(value)),
    [dispatch],
  )

  const changePan = useCallback(
    (value: number) => {
      const panner = stereoPannerRef.current
      if (!panner) {
        return
      }
      panner.pan.value = value
    },
    [stereoPannerRef.current],
  )

  const changePlaybackRate = useCallback((value: number) => {
    const video = ref.current
    if (!video) {
      return
    }
    video.playbackRate = value
  }, [])

  const changeVolume = useCallback(
    (value: number, action?: 'volumeDown' | 'volumeUp') => {
      const video = ref.current
      if (!video) {
        return
      }
      const volume = Math.min(Math.max(0, value), 1)
      video.volume = volume
      setStoredVolume(volume)
      if (action) {
        triggerAction(action, volume)
      }
    },
    [triggerAction],
  )

  const volumeUp = useCallback(() => {
    const newVolume = (Math.floor(volume * 10) + 1) / 10
    changeVolume(newVolume, 'volumeUp')
  }, [changeVolume, volume])

  const volumeDown = useCallback(() => {
    const newVolume = (Math.floor(volume * 10) - 1) / 10
    changeVolume(newVolume, 'volumeDown')
  }, [changeVolume, volume])

  const toggleAutoplay = useCallback(() => {
    const video = ref.current
    if (!video) {
      return
    }
    video.autoplay = !autoplay
  }, [autoplay])

  const toggleFullscreen = useCallback(
    () => window.electronAPI.toggleFullscreen(),
    [],
  )

  const toggleLoop = useCallback(() => {
    const video = ref.current
    if (!video) {
      return
    }
    video.loop = !loop
  }, [loop])

  const toggleMuted = useCallback(() => {
    const video = ref.current
    if (!video) {
      return
    }
    const muted = volume !== 0
    const newVolume = muted ? 0 : storedVolume
    const action = muted ? 'mute' : 'unmute'
    video.volume = newVolume
    triggerAction(action)
  }, [storedVolume, triggerAction, volume])

  const togglePanLeft = useCallback(
    () => changePan(pan > 0 ? 0 : pan > -1 ? -1 : 0),
    [changePan, pan],
  )

  const togglePanRight = useCallback(
    () => changePan(pan < 0 ? 0 : pan < 1 ? 1 : 0),
    [changePan, pan],
  )

  const togglePartialLoop = useCallback(() => {
    if (loopRange) {
      dispatch(saveLoopRange(undefined))
    } else {
      dispatch(saveLoopRange([currentTime, duration]))
    }
  }, [currentTime, dispatch, duration, loopRange])

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

  const togglePaused = useCallback(() => {
    const video = ref.current
    if (!video) {
      return
    }
    if (video.paused) {
      video.play()
      triggerAction('play')
    } else {
      video.pause()
      triggerAction('pause')
    }
  }, [triggerAction])

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
    changePan,
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
    pan,
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
    size,
    status,
    toggleAutoplay,
    toggleFullscreen,
    toggleLoop,
    toggleMuted,
    togglePanLeft,
    togglePanRight,
    togglePartialLoop,
    togglePaused,
    togglePictureInPicture,
    volume,
    volumeDown,
    volumeUp,
    zoom,
    zoomBy,
    zoomIn,
    zoomOut,
  }

  return <VideoContext.Provider value={value}>{children}</VideoContext.Provider>
}

export default VideoProvider
