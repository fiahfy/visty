import { useEffect } from 'react'
import { useAppDispatch } from '~/store'
import { change } from '~/store/window'

const useMessageListener = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const removeListener = window.electronAPI.addMessageListener((message) => {
      const { type, data } = message
      switch (type) {
        case 'changeFile':
          return dispatch(change(data.file))
      }
    })
    return () => removeListener()
  }, [dispatch])
}

export default useMessageListener
