import { type ReactNode, useEffect, useState } from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { persistor, storageKey, store } from '~/store'
import { replaceState as replaceSettingsState } from '~/store/settings'
import { load, replaceState as replaceWindowState } from '~/store/window'
import { setWindowId } from '~/store/window-id'

type Props = { children: ReactNode }

const StoreProvider = (props: Props) => {
  const { children } = props

  const { dispatch } = store

  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const removeListener = window.storageAPI.onDidChange((newValue) => {
      const value = newValue[storageKey]
      if (typeof value !== 'string') {
        return
      }

      const state = Object.fromEntries(
        Object.entries(JSON.parse(value)).map(([key, value]) => [
          key,
          typeof value === 'string' ? JSON.parse(value) : undefined,
        ]),
      )

      dispatch(replaceSettingsState({ state: state.settings }))
      dispatch(replaceWindowState({ state: state.window }))
    })

    return () => removeListener()
  }, [dispatch])

  useEffect(() => {
    ;(async () => {
      const data = await window.windowAPI.getData()
      if (!data) {
        return
      }
      const { id, params } = data
      dispatch(setWindowId({ windowId: id }))
      const filePath = params?.filePath
      if (filePath) {
        dispatch(load(filePath))
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

export default StoreProvider
