import { RefObject, useCallback, useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '~/store'
import {
  selectDefaultMuted,
  selectDefaultVolume,
  setDefaultMuted,
  setDefaultVolume,
} from '~/store/settings'
import { selectFile } from '~/store/window'

const useVideo = (ref: RefObject<HTMLVideoElement>) => {
  const defaultMuted = useAppSelector(selectDefaultMuted)
  const defaultVolume = useAppSelector(selectDefaultVolume)
  const file = useAppSelector(selectFile)
  const dispatch = useAppDispatch()

  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(100)
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

      video.volume = defaultMuted ? 0 : defaultVolume

      let requestId: number
      const callback = () => {
        if (video.readyState < 1) {
          return
        }
        setPaused(video.paused)
        setCurrentTime(video.currentTime)
        setDuration(video.duration)
        setVolume(video.volume)
        requestId = requestAnimationFrame(callback)
      }
      requestId = requestAnimationFrame(callback)

      return () => cancelAnimationFrame(requestId)
    })()
  }, [defaultMuted, defaultVolume, file, ref, video])

  const onChangeCurrentTime = useCallback(
    (value: number) => {
      if (!video) {
        return
      }
      video.currentTime = value
    },
    [video],
  )

  const onClickPlay = useCallback(() => {
    if (!video) {
      return
    }
    if (video.paused) {
      video.play()
    } else {
      video.pause()
    }
  }, [video])

  const onClickMute = useCallback(() => {
    if (!video) {
      return
    }
    setMuted((muted) => {
      const newMuted = !muted
      video.volume = newMuted ? 0 : defaultVolume
      dispatch(setDefaultMuted(newMuted))
      return newMuted
    })
  }, [defaultVolume, dispatch, video])

  const onChangeVolume = useCallback(
    (value: number) => {
      if (!video) {
        return
      }
      video.volume = value
      dispatch(setDefaultVolume(volume))
      dispatch(setDefaultMuted(volume === 0))
    },
    [dispatch, video, volume],
  )

  return {
    currentTime,
    duration,
    file,
    muted,
    onChangeCurrentTime,
    onChangeVolume,
    onClickMute,
    onClickPlay,
    paused,
    volume,
  }
}

export default useVideo
