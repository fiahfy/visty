import { type DragEvent, useCallback, useMemo, useState } from 'react'

const useDrop = () => {
  const [enterCount, setEnterCount] = useState(0)

  const dropping = useMemo(() => enterCount > 0, [enterCount])

  const onDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setEnterCount((count) => count + 1)
  }, [])

  const onDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setEnterCount((count) => count - 1)
  }, [])

  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setEnterCount(0)
    const file = e.dataTransfer.files.item(0)
    if (!file) {
      return
    }
    window.electronAPI.openFile(file)
  }, [])

  return {
    dropping,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop,
  }
}

export default useDrop
