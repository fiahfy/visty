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
import { selectDefaultAutoplay, setDefaultAutoplay } from '~/store/settings'
import {
  selectCurrentTime,
  selectFile,
  selectLoop,
  selectLoopRange,
  selectPan,
  selectPlaybackRate,
  selectVolume,
  setCurrentTime,
  setLoop,
  setLoopRange,
  setPan,
  setPlaybackRate,
  setVolume,
} from '~/store/window'

type Props = { children: ReactNode }

const VideoProvider = (props: Props) => {
  const { children } = props

  const currentTime = useAppSelector(selectCurrentTime)
  const defaultAutoplay = useAppSelector(selectDefaultAutoplay)
  const file = useAppSelector(selectFile)
  const loop = useAppSelector(selectLoop)
  const loopRange = useAppSelector(selectLoopRange)
  const pan = useAppSelector(selectPan)
  const playbackRate = useAppSelector(selectPlaybackRate)
  const volume = useAppSelector(selectVolume)
  const dispatch = useAppDispatch()

  const [initialized, setInitialized] = useState(false)

  const [actionCode, setActionCode] = useState<ActionCode>()
  const [autoplay, setAutoplay] = useState(defaultAutoplay)
  const [duration, setDuration] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const [paused, setPaused] = useState(true)
  const [pictureInPicture, setPictureInPicture] = useState(false)
  const [playlistFile, setPlaylistFile] = useState<PlaylistFile>({
    next: undefined,
    previous: undefined,
  })
  const [size, setSize] = useState<{ height: number; width: number }>()
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(
    'loading',
  )
  const [storedVolume, setStoredVolume] = useState(volume)
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

    video.autoplay = autoplay
    video.currentTime = currentTime
    video.loop = loop
    video.volume = volume

    const panner = stereoPannerRef.current
    if (!panner) {
      return
    }
    panner.pan.value = pan
  }, [autoplay, currentTime, initialized, loop, pan, stereoPannerRef, volume])

  useEffect(() => {
    const video = ref.current
    if (!video) {
      return
    }
    let requestId: number
    const callback = () => {
      if (video.readyState >= 1) {
        dispatch(setCurrentTime(video.currentTime))
        dispatch(setLoop(video.loop))
        dispatch(setPlaybackRate(video.playbackRate))
        dispatch(setVolume(video.volume))
        setDuration(video.duration)
        setPaused(video.paused)
        setAutoplay(video.autoplay)
      }
      requestId = requestAnimationFrame(callback)
    }
    requestId = requestAnimationFrame(callback)
    return () => cancelAnimationFrame(requestId)
  }, [dispatch])

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
    const panner = stereoPannerRef.current
    if (!panner) {
      return
    }
    let requestId: number
    const callback = () => {
      dispatch(setPan(panner.pan.value))
      requestId = requestAnimationFrame(callback)
    }
    requestId = requestAnimationFrame(callback)
    return () => cancelAnimationFrame(requestId)
  }, [dispatch, stereoPannerRef.current])

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
    (value: [number, number]) => dispatch(setLoopRange(value)),
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
      dispatch(setLoopRange(undefined))
    } else {
      dispatch(setLoopRange([currentTime, duration]))
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
    if (paused) {
      video.play()
      triggerAction('play')
    } else {
      video.pause()
      triggerAction('pause')
    }
  }, [paused, triggerAction])

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
      // TODO: not working sometimes
      window.electronAPI.openFilePath(path)
      triggerAction('previousTrack')
    }
  }, [playlistFile.previous?.path, triggerAction])

  const nextTrack = useCallback(() => {
    const path = playlistFile.next?.path
    if (path) {
      // TODO: not working sometimes
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
