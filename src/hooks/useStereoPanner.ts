import { useEffect, useRef } from 'react'

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
  })

  return stereoPannerRef
}

export default useStereoPanner
