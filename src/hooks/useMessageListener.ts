import { useEffect } from 'react'
import { useAppDispatch } from '~/store'

const useMessageListener = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    // const removeListener = window.electronAPI.message.addListener((message) => {
    //   const { type, data } = message
    //   switch (type) {
    //     case 'open':
    //       return dispatch(open(data.path))
    //   }
    // })
    // return () => removeListener()
  }, [dispatch])
}

export default useMessageListener
