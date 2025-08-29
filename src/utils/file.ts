import mime from 'mime'

export const isMediaFile = (path: string) => {
  const type = mime.getType(path)
  if (!type) {
    return false
  }
  return type.startsWith('audio/') || type.startsWith('video/')
}
