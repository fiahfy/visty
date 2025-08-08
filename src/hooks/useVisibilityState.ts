import { useCallback, useRef, useState } from 'react'

const useVisibilityState = (timeout: number) => {
  const [visible, setVisible] = useState(false)

  const timer = useRef(0)

  const clearTimer = useCallback(() => window.clearTimeout(timer.current), [])

  const show = useCallback(() => {
    clearTimer()
    setVisible(true)
  }, [clearTimer])

  const hide = useCallback(() => {
    clearTimer()
    setVisible(true)
    timer.current = window.setTimeout(() => setVisible(false), timeout)
  }, [clearTimer, timeout])

  const forceHide = useCallback(() => {
    clearTimer()
    setVisible(false)
  }, [clearTimer])

  return {
    visible,
    show,
    hide,
    forceHide,
  }
}

export default useVisibilityState
