import { ReactNode, useEffect, useState } from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { persistor, storageKey, store } from '~/store'
import { replace as replaceSettings } from '~/store/settings'
import { initialize, replace as replaceWindow } from '~/store/window'
import { set } from '~/store/windowIndex'

type Props = { children: ReactNode }

export const StoreProvider = (props: Props) => {
  const { children } = props

  const { dispatch } = store

  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key !== storageKey) {
        return
      }
      if (!e.newValue) {
        return
      }
      const newState = JSON.parse(e.newValue)
      dispatch(replaceSettings(JSON.parse(newState.settings)))
      dispatch(replaceWindow(JSON.parse(newState.window)))
    }

    window.addEventListener('storage', handler)

    return () => window.removeEventListener('storage', handler)
  }, [dispatch])

  useEffect(() => {
    ;(async () => {
      const data = await window.electronAPI.window.restore()
      if (!data) {
        return
      }
      const {
        index,
        params: { file },
        restored,
      } = data
      dispatch(set(index))
      if (!restored) {
        dispatch(initialize({ index, file }))
      }
      setInitialized(true)
    })()
  }, [dispatch])

  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>{initialized && children}</PersistGate>
    </Provider>
  )
}
