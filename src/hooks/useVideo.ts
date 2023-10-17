import { RefObject, useCallback, useEffect, useState } from 'react'
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
  const [muted, setMuted] = useState(false)
  const [paused, setPaused] = useState(true)
  const [volume, setVolume] = useState(0)

  const video = ref.current

  useEffect(() => {
    ;(async () => {
      if (!video) {
        return
      }

      await new Promise<void>((resolve) =>
        video.addEventListener('loadedmetadata', () => resolve()),
      )

      await window.electronAPI.changeOriginalSize({
        width: video.videoWidth,
        height: video.videoHeight,
      })

      video.loop = defaultLoop
      video.volume = defaultMuted ? 0 : defaultVolume

      let requestId: number
      const callback = () => {
        if (video.readyState < 1) {
          return
        }
        setPaused(video.paused)
        setCurrentTime(video.currentTime)
        setDuration(video.duration)
        setLoop(video.loop)
        setVolume(video.volume)
        requestId = requestAnimationFrame(callback)
      }
      requestId = requestAnimationFrame(callback)

      return () => cancelAnimationFrame(requestId)
    })()
  }, [defaultLoop, defaultMuted, defaultVolume, file, ref, video])

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
      video.volume = Math.min(Math.max(0, value), 1)
      dispatch(setDefaultVolume(volume))
      dispatch(setDefaultMuted(volume === 0))
    },
    [dispatch, video, volume],
  )

  return {
    actionCode,
    changeVolume,
    currentTime,
    duration,
    file,
    loop,
    muted,
    paused,
    seek,
    seekTo,
    toggleLoop,
    toggleMuted,
    togglePaused,
    volume,
  }
}

export default useVideo
