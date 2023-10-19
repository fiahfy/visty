import { useEffect } from 'react'
import { useAppDispatch } from '~/store'
import { change } from '~/store/window'

const useMessageListener = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const removeListener = window.electronAPI.message.addListener((message) => {
      const { type, data } = message
      switch (type) {
        case 'changeFile':
          return dispatch(change(data.file))
        case 'log':
          return console.log('logger>>', data)
      }
    })
    return () => removeListener()
  }, [dispatch])
}

export default useMessageListener
