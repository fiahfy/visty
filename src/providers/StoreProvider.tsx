import { type ReactNode, useEffect, useState } from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { persistor, storageKey, store } from '~/store'
import {
  replaceState as replaceSettingsState,
  selectViewModeOnOpen,
} from '~/store/settings'
import { newWindow, replaceState as replaceWindowState } from '~/store/window'
import { setWindowId } from '~/store/windowId'

type Props = { children: ReactNode }

const StoreProvider = (props: Props) => {
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
      dispatch(replaceSettingsState({ state: JSON.parse(newState.settings) }))
      dispatch(replaceWindowState({ state: JSON.parse(newState.window) }))
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
      const { id, params } = data
      dispatch(setWindowId({ windowId: id }))
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

export default StoreProvider
