import { ReactNode, useEffect, useState } from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { persistor, storageKey, store } from '~/store'
import {
  replaceState as replaceSettingsState,
  selectViewModeOnOpen,
} from '~/store/settings'
import { newWindow, replaceState as replaceWindowState } from '~/store/window'
import { set } from '~/store/windowIndex'

type Props = { children: ReactNode }

export const StoreProvider = (props: Props) => {
  const { children } = props

  const { dispatch, getState } = store

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
      dispatch(replaceSettingsState(JSON.parse(newState.settings)))
      dispatch(replaceWindowState(JSON.parse(newState.window)))
    }

    window.addEventListener('storage', handler)

    return () => window.removeEventListener('storage', handler)
  }, [dispatch])

  useEffect(() => {
    ;(async () => {
      const data = await window.electronAPI.restoreWindow()
      if (!data) {
        return
      }
      const { index, params } = data
      dispatch(set(index))
      const file = params?.file
      if (file) {
        dispatch(newWindow(file))
        const viewModeOnOpen = selectViewModeOnOpen(getState())
        switch (viewModeOnOpen) {
          case 'fullscreen':
            window.electronAPI.enterFullscreen()
            break
          case 'maximized':
            window.electronAPI.maximize()
            break
        }
      }
      setInitialized(true)
    })()
  }, [dispatch, getState])

  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>{initialized && children}</PersistGate>
    </Provider>
  )
}
