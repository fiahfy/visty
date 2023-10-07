import { useEffect } from 'react'
import { useAppDispatch } from '~/store'
import { updateApplicationMenu } from '~/store/window'

const useEventListener = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const handler = () => dispatch(updateApplicationMenu())

    window.addEventListener('focus', handler)

    return () => window.removeEventListener('focus', handler)
  }, [dispatch])
}

export default useEventListener
