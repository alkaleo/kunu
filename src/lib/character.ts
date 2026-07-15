export const APPROVED_CHARACTER_IMAGE_ID = 'approved-kunu-character-v1'

export interface PreparedReference {
  data: string
  mimeType: 'image/jpeg'
  view: 'front' | 'three-quarter' | 'full-body'
}

export async function prepareReferencePhoto(file: File, view: PreparedReference['view']): Promise<PreparedReference> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Choose a JPEG, PNG, or WebP photo.')
  if (file.size > 15_000_000) throw new Error('Each reference photo must be smaller than 15 MB.')
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))
  const context = canvas.getContext('2d', { alpha: false })
  if (!context) throw new Error('This browser could not prepare the photo.')
  context.fillStyle = '#fff'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return { data: canvas.toDataURL('image/jpeg', .82), mimeType: 'image/jpeg', view }
}

export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl)
  return response.blob()
}

/** Extracts the isolated first full-body panel in memory; no derivative is persisted. */
export async function isolateFullBody(sheet: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(sheet)
  const cropWidth = Math.max(1, Math.round(bitmap.width * .31))
  const canvas = document.createElement('canvas')
  canvas.width = cropWidth
  canvas.height = bitmap.height
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('Character isolation is unavailable.')
  context.drawImage(bitmap, 0, 0, cropWidth, bitmap.height, 0, 0, cropWidth, bitmap.height)
  bitmap.close()
  const image = context.getImageData(0, 0, canvas.width, canvas.height)
  const corner = (x: number, y: number) => {
    const index = (y * canvas.width + x) * 4
    return [image.data[index], image.data[index + 1], image.data[index + 2]]
  }
  const samples = [corner(2, 2), corner(canvas.width - 3, 2), corner(2, canvas.height - 3), corner(canvas.width - 3, canvas.height - 3)]
  const background = [0, 1, 2].map((channel) => samples.reduce((sum, sample) => sum + sample[channel], 0) / samples.length)
  for (let index = 0; index < image.data.length; index += 4) {
    const distance = Math.hypot(image.data[index] - background[0], image.data[index + 1] - background[1], image.data[index + 2] - background[2])
    image.data[index + 3] = distance < 32 ? 0 : distance < 82 ? Math.round((distance - 32) / 50 * 255) : 255
  }
  context.putImageData(image, 0, 0)
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Character isolation failed.')), 'image/png'))
}
