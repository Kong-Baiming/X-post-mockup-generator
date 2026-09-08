import { z } from 'zod'
import { sampleTweet } from './sample'
import { PROJECT_FILE_FORMAT, PROJECT_FILE_VERSION, type TweetDocument, type TweetProjectFile } from './types'

const trustedAsset = /^\/assets\/[a-z0-9._/-]+$/i
const trustedVendor = /^\/vendor\/x\/[a-z0-9._/-]+$/i
const embeddedImage = /^data:image\/(?:png|jpeg|webp|avif);base64,/i
const imageSource = z
  .string()
  .max(40_000_000)
  .refine(
    (value) => trustedAsset.test(value) || trustedVendor.test(value) || embeddedImage.test(value),
    '图片必须是项目内资源或本地嵌入的 PNG、JPEG、WebP、AVIF。',
  )
const percent = z.number().finite().min(0).max(100)
const count = z.number().finite().int().min(0).max(Number.MAX_SAFE_INTEGER)
const dimension = z.number().finite().int().positive().max(100_000)
const author = z.object({
  name: z.string().max(100),
  handle: z.string().max(50),
  avatarUrl: imageSource,
  avatarCropX: percent,
  avatarCropY: percent,
  verification: z.enum(['none', 'blue', 'gold', 'gray']),
  following: z.boolean(),
  parody: z.boolean(),
})
const translation = z.object({ enabled: z.boolean(), sourceLanguage: z.string().max(80) })
const imageItem = z.object({
  id: z.string().min(1).max(200),
  src: imageSource,
  alt: z.string().max(500),
  width: dimension,
  height: dimension,
  cropX: percent,
  cropY: percent,
})
const media = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('images'),
    layout: z.enum(['grid', 'carousel']),
    activeIndex: z.number().int().min(0).max(3),
    items: z.array(imageItem).max(4),
  }),
  z.object({
    kind: z.literal('video'),
    coverUrl: imageSource.or(z.literal('')),
    durationSeconds: count.max(86_400),
    currentTimeSeconds: count.max(86_400),
    width: dimension,
    height: dimension,
  }),
])
const metrics = z.object({
  replies: count,
  reposts: count,
  quotes: count,
  likes: count,
  views: count,
  bookmarks: count,
  visible: z.boolean(),
  expanded: z.boolean(),
  liked: z.boolean(),
  reposted: z.boolean(),
  bookmarked: z.boolean(),
})

export const tweetDocumentSchema = z.object({
  version: z.literal(2),
  author,
  content: z.object({
    text: z.string().max(100_000),
    showMore: z.boolean(),
    replyTo: z.string().max(100),
    publishedAt: z.string().max(100),
    automatedBy: z.string().max(100),
    translation,
  }),
  media,
  quote: z.object({
    enabled: z.boolean(),
    author,
    text: z.string().max(100_000),
    publishedAtLabel: z.string().max(100),
    translation,
    media,
  }),
  reply: z.object({
    enabled: z.boolean(),
    author,
    text: z.string().max(100_000),
    publishedAtLabel: z.string().max(100),
    metrics,
  }),
  metrics,
  presentation: z.object({
    mode: z.enum(['timeline', 'detail']),
    theme: z.enum(['light', 'dark']),
    locale: z.enum(['zh-CN', 'en-US']),
    exportScale: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
    showMockup: z.boolean(),
    canvasWidth: z.literal(600),
    zoom: z.number().finite().min(0.45).max(1.25),
  }),
  extensions: z
    .array(
      z.object({
        type: z.enum(['poll', 'community-note', 'ad', 'article', 'location', 'translation']),
        payload: z.unknown(),
      }),
    )
    .max(100),
})

const projectFileSchema = z.object({
  format: z.literal(PROJECT_FILE_FORMAT),
  schemaVersion: z.literal(PROJECT_FILE_VERSION),
  savedAt: z.iso.datetime(),
  document: z.unknown(),
})

function mergeWithDefaults(value: unknown): unknown {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return value
  const merge = (base: unknown, next: unknown): unknown => {
    if (
      !base ||
      typeof base !== 'object' ||
      Array.isArray(base) ||
      !next ||
      typeof next !== 'object' ||
      Array.isArray(next)
    )
      return next ?? base
    const result = { ...(base as Record<string, unknown>) }
    for (const [key, item] of Object.entries(next as Record<string, unknown>)) result[key] = merge(result[key], item)
    return result
  }
  return merge(sampleTweet, value)
}

export function parseTweetDocument(value: unknown): TweetDocument {
  const parsed = tweetDocumentSchema.safeParse(mergeWithDefaults(value))
  if (!parsed.success) throw new Error(`无法打开项目：${parsed.error.issues[0]?.message ?? '项目数据不合法。'}`)
  for (const target of [parsed.data.media, parsed.data.quote.media])
    if (target.kind === 'video') target.currentTimeSeconds = Math.min(target.currentTimeSeconds, target.durationSeconds)
  return parsed.data
}

export function parseProjectFile(value: unknown): TweetDocument {
  if (value && typeof value === 'object' && 'format' in value) {
    const wrapped = projectFileSchema.safeParse(value)
    if (!wrapped.success) throw new Error('无法打开项目：文件格式或版本不受支持。')
    return parseTweetDocument(wrapped.data.document)
  }
  return parseTweetDocument(value)
}

export function createProjectFile(document: TweetDocument, now = new Date()): TweetProjectFile {
  return {
    format: PROJECT_FILE_FORMAT,
    schemaVersion: PROJECT_FILE_VERSION,
    savedAt: now.toISOString(),
    document: structuredClone(document),
  }
}
