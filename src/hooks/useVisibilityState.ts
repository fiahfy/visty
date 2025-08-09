import { useCallback, useRef, useState } from 'react'

const useVisibilityState = () => {
  const [visible, setVisible] = useState(false)

  const timer = useRef(0)

  const clearTimer = useCallback(() => window.clearTimeout(timer.current), [])

  const show = useCallback(() => {
    clearTimer()
    setVisible(true)
  }, [clearTimer])

  const hide = useCallback(() => {
    clearTimer()
    setVisible(false)
  }, [clearTimer])

  const hideAfter = useCallback(
    (timeout: number) => {
      clearTimer()
      timer.current = window.setTimeout(() => setVisible(false), timeout)
    },
    [clearTimer],
  )

  return {
    visible,
    show,
    hide,
    hideAfter,
  }
}

export default useVisibilityState
