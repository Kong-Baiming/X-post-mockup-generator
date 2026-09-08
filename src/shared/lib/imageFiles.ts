import type { ImageMediaItem } from '../../domain/tweet/types'

export const MAX_IMAGE_BYTES = 25 * 1024 * 1024
export const MAX_IMAGE_PIXELS = 80_000_000
export const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/avif'] as const

export type ReadImageResult = Omit<ImageMediaItem, 'id' | 'alt' | 'cropX' | 'cropY'>

export async function readImage(file: File): Promise<ReadImageResult> {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number]))
    throw new Error('仅支持 PNG、JPEG、WebP 和 AVIF 图片。')
  if (file.size <= 0) throw new Error('图片文件为空。')
  if (file.size > MAX_IMAGE_BYTES) throw new Error('单张图片不能超过 25 MB。')
  const src = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('无法读取图片。'))
    reader.readAsDataURL(file)
  })
  const image = new Image()
  image.src = src
  try {
    await image.decode()
  } catch {
    throw new Error('图片已损坏或浏览器无法解码。')
  }
  const width = image.naturalWidth
  const height = image.naturalHeight
  if (!width || !height) throw new Error('图片尺寸无效。')
  if (width * height > MAX_IMAGE_PIXELS) throw new Error('图片像素超过 8000 万，请先缩小图片。')
  return { src, width, height }
}

export function createMediaId(): string {
  return crypto.randomUUID()
}
