import {
  type ReactNode,
  createContext,
  useCallback,
  useEffect,
  useState,
} from 'react'

export const TrafficLightContext = createContext<
  | {
      setVisible: (visible: boolean) => void
      visible: boolean
    }
  | undefined
>(undefined)

type Props = { children: ReactNode }

export const TrafficLightProvider = (props: Props) => {
  const { children } = props

  const [visibility, setVisibility] = useState(false)

  useEffect(() => {
    const removeListener =
      window.electronAPI.addTrafficLightListener(setVisibility)
    return () => removeListener()
  }, [])

  const setVisible = useCallback((visible: boolean) => {
    window.electronAPI.setTrafficLightVisibility(visible)
  }, [])

  const value = { setVisible, visible: visibility }

  return (
    <TrafficLightContext.Provider value={value}>
      {children}
    </TrafficLightContext.Provider>
  )
}
