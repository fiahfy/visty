import { RefObject, useCallback, useEffect, useMemo, useState } from 'react'
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

type Action =
  | 'play'
  | 'pause'
  | 'seekBackward'
  | 'seekForward'
  | 'mute'
  | 'unmute'
type ActionCode = `${Action}:${string}`

const generateActionCode = (action: Action): ActionCode =>
  `${action}:${Date.now()}`

const useVideo = (ref: RefObject<HTMLVideoElement>) => {
  const defaultLoop = useAppSelector(selectDefaultLoop)
  const defaultMuted = useAppSelector(selectDefaultMuted)
  const defaultVolume = useAppSelector(selectDefaultVolume)
  const file = useAppSelector(selectFile)
  const dispatch = useAppDispatch()

  const [actionCode, setActionCode] = useState<ActionCode>()
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(100)
  const [loop, setLoop] = useState(false)
  const [loopRange, setLoopRange] = useState<[number, number]>()
  const [muted, setMuted] = useState(false)
  const [paused, setPaused] = useState(true)
  const [pictureInPicture, setPictureInPicture] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [volume, setVolume] = useState(0)
  const [zoom, setZoom] = useState(1)

  const partialLoop = useMemo(() => !!loopRange, [loopRange])
  const loopStartTime = useMemo(
    () => (loopRange ? loopRange[0] : undefined),
    [loopRange],
  )

  const video = ref.current

  useEffect(() => {
    ;(async () => {
      if (!video) {
        return
      }

      setLoopRange(undefined)

      await new Promise<void>((resolve) =>
        video.addEventListener('loadedmetadata', () => resolve()),
      )

      await window.electronAPI.setContentSize({
        width: video.videoWidth,
        height: video.videoHeight,
      })

      video.loop = defaultLoop
      video.volume = defaultMuted ? 0 : defaultVolume
    })()
  }, [defaultLoop, defaultMuted, defaultVolume, file, video])

  useEffect(() => {
    if (!video) {
      return
    }
    const handleEnterPictureInPicture = () => setPictureInPicture(true)
    const handleLeavePictureInPicture = () => setPictureInPicture(false)
    video.addEventListener('enterpictureinpicture', handleEnterPictureInPicture)
    video.addEventListener('leavepictureinpicture', handleLeavePictureInPicture)
    return () => {
      video.removeEventListener(
        'enterpictureinpicture',
        handleEnterPictureInPicture,
      )
      video.removeEventListener(
        'leavepictureinpicture',
        handleLeavePictureInPicture,
      )
    }
  }, [video])

  useEffect(() => {
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
  }, [video])

  useEffect(() => {
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
  }, [loopRange, video])

  useEffect(() => {
    if (!video) {
      return
    }
    if (loopStartTime !== undefined) {
      video.currentTime = loopStartTime
    }
  }, [loopStartTime, video])

  const toggleLoop = useCallback(() => {
    if (!video) {
      return
    }
    const loop = !video.loop
    video.loop = loop
    dispatch(setDefaultLoop(loop))
  }, [dispatch, video])

  const toggleMuted = useCallback(() => {
    if (!video) {
      return
    }
    setMuted((muted) => {
      const newMuted = !muted
      video.volume = newMuted ? 0 : defaultVolume
      dispatch(setDefaultMuted(newMuted))
      const action = newMuted ? 'mute' : 'unmute'
      setActionCode(generateActionCode(action))
      return newMuted
    })
  }, [defaultVolume, dispatch, video])

  const togglePaused = useCallback(() => {
    if (!video) {
      return
    }
    if (video.paused) {
      video.play()
      setActionCode(generateActionCode('play'))
    } else {
      video.pause()
      setActionCode(generateActionCode('pause'))
    }
  }, [video])

  const togglePartialLoop = useCallback(() => {
    if (loopRange) {
      setLoopRange(undefined)
    } else {
      setLoopRange([currentTime, duration])
    }
  }, [currentTime, duration, loopRange])

  const togglePictureInPicture = useCallback(async () => {
    if (!video) {
      return
    }
    if (pictureInPicture) {
      await document.exitPictureInPicture()
    } else {
      await video.requestPictureInPicture()
    }
  }, [pictureInPicture, video])

  const seek = useCallback(
    (value: number) => {
      if (!video) {
        return
      }
      video.currentTime = value
    },
    [video],
  )

  const seekTo = useCallback(
    (direction: 'backward' | 'forward') => {
      if (!video) {
        return
      }
      video.currentTime += direction === 'forward' ? 5 : -5
      const action = direction === 'forward' ? 'seekForward' : 'seekBackward'
      setActionCode(generateActionCode(action))
    },
    [video],
  )

  const changeVolume = useCallback(
    (value: number) => {
      if (!video) {
        return
      }
      const volume = Math.min(Math.max(0, value), 1)
      video.volume = volume
      dispatch(setDefaultVolume(volume))
      dispatch(setDefaultMuted(volume === 0))
    },
    [dispatch, video],
  )

  const changeLoopRange = useCallback(
    (value: [number, number]) => setLoopRange(value),
    [],
  )

  const changePlaybackRate = useCallback(
    (value: number) => {
      if (!video) {
        return
      }
      video.playbackRate = value
    },
    [video],
  )

  const zoomBy = useCallback(
    (value: number) =>
      setZoom((zoom) => Math.min(Math.max(1, zoom * (1 + value)), 10)),
    [],
  )

  const zoomIn = useCallback(() => zoomBy(0.1), [zoomBy])

  const zoomOut = useCallback(() => zoomBy(-0.1), [zoomBy])

  const resetZoom = useCallback(() => setZoom(1), [])

  return {
    actionCode,
    changeLoopRange,
    changePlaybackRate,
    changeVolume,
    currentTime,
    duration,
    file,
    loop,
    loopRange,
    muted,
    partialLoop,
    paused,
    pictureInPicture,
    playbackRate,
    resetZoom,
    seek,
    seekTo,
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
}

export default useVideo
