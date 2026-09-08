export type VerificationType = 'none' | 'blue' | 'gold' | 'gray'
export type PreviewMode = 'timeline' | 'detail'
export type ThemeMode = 'light' | 'dark'
export type PreviewLocale = 'zh-CN' | 'en-US'
export type MediaLayout = 'grid' | 'carousel'

export interface Author {
  name: string
  handle: string
  avatarUrl: string
  avatarCropX: number
  avatarCropY: number
  verification: VerificationType
  following: boolean
  parody: boolean
}

export interface TranslationSettings {
  enabled: boolean
  sourceLanguage: string
}

export interface TweetContent {
  text: string
  showMore: boolean
  replyTo: string
  publishedAt: string
  automatedBy: string
  translation: TranslationSettings
}

export interface ImageMediaItem {
  id: string
  src: string
  alt: string
  width: number
  height: number
  cropX: number
  cropY: number
}

export type TweetMedia =
  | {
      kind: 'images'
      layout: MediaLayout
      activeIndex: number
      items: ImageMediaItem[]
    }
  | {
      kind: 'video'
      coverUrl: string
      durationSeconds: number
      currentTimeSeconds: number
      width: number
      height: number
    }

export interface QuoteTweet {
  enabled: boolean
  author: Author
  text: string
  publishedAtLabel: string
  translation: TranslationSettings
  media: TweetMedia
}

export interface TweetMetrics {
  replies: number
  reposts: number
  quotes: number
  likes: number
  views: number
  bookmarks: number
  visible: boolean
  expanded: boolean
  liked: boolean
  reposted: boolean
  bookmarked: boolean
}

export interface ReplyTweet {
  enabled: boolean
  author: Author
  text: string
  publishedAtLabel: string
  metrics: TweetMetrics
}

export interface PresentationSettings {
  mode: PreviewMode
  theme: ThemeMode
  locale: PreviewLocale
  exportScale: 1 | 2 | 3 | 4
  showMockup: boolean
  canvasWidth: 600
  zoom: number
}

export type TweetExtension =
  | { type: 'poll'; payload: unknown }
  | { type: 'community-note'; payload: unknown }
  | { type: 'ad'; payload: unknown }
  | { type: 'article'; payload: unknown }
  | { type: 'location'; payload: unknown }
  | { type: 'translation'; payload: unknown }

export interface TweetDocument {
  version: 2
  author: Author
  content: TweetContent
  media: TweetMedia
  quote: QuoteTweet
  reply: ReplyTweet
  metrics: TweetMetrics
  presentation: PresentationSettings
  extensions: TweetExtension[]
}

export const TWEET_DOCUMENT_VERSION = 2 as const
export const PROJECT_FILE_FORMAT = 'x-post-mockup' as const
export const PROJECT_FILE_VERSION = 1 as const

export interface TweetProjectFile {
  format: typeof PROJECT_FILE_FORMAT
  schemaVersion: typeof PROJECT_FILE_VERSION
  savedAt: string
  document: TweetDocument
}
