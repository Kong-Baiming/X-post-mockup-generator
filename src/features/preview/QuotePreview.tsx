import type { CSSProperties } from 'react'
import type { ImageMediaItem, PreviewLocale, PreviewMode, QuoteTweet, TweetMedia } from '../../domain/tweet/types'
import { formatVideoRemaining } from '../../shared/lib/format'
import { MediaPreview } from './MediaPreview'
import { TranslationNotice } from './TranslationNotice'
import { VerifiedBadge } from '../../vendor/x/XIcons'
import { TweetText } from './TweetText'
import styles from './TweetPreview.module.css'

function QuoteImage({ item }: { item: ImageMediaItem }) {
  return (
    <img src={item.src} alt={item.alt} draggable={false} style={{ objectPosition: `${item.cropX}% ${item.cropY}%` }} />
  )
}

function CompactQuoteMedia({ media }: { media: TweetMedia }) {
  if (media.kind === 'video') {
    if (!media.coverUrl) return null
    return (
      <div className={`${styles.quoteCompactMediaFrame} ${styles.quoteCompactVideo}`} data-testid="quote-compact-media">
        <img src={media.coverUrl} alt="引用推文视频封面" draggable={false} />
        <span className={styles.quoteCompactDuration}>
          {formatVideoRemaining(media.durationSeconds, media.currentTimeSeconds)}
        </span>
      </div>
    )
  }
  const items = media.items.slice(0, 4)
  if (!items.length) return null
  return (
    <div className={styles.quoteCompactMediaFrame} data-testid="quote-compact-media">
      <div className={`${styles.quoteCompactGrid} ${styles[`quoteCompactCount${items.length}`]}`}>
        {items.map((item) => (
          <div className={styles.quoteCompactCell} key={item.id}>
            <QuoteImage item={item} />
          </div>
        ))}
      </div>
    </div>
  )
}

function DetailQuoteCarousel({ media }: { media: Extract<TweetMedia, { kind: 'images' }> }) {
  const items = media.items.slice(0, 4)
  if (!items.length) return null
  const frameRatio = 1.52
  const widths = items.map((item) => {
    const ratio = item.width > 0 && item.height > 0 ? item.width / item.height : 1
    return Math.min(100, Math.max(18, (ratio / frameRatio) * 100))
  })
  const currentIndex = Math.min(Math.max(0, media.activeIndex), items.length - 1)
  const totalWidth = widths.reduce((total, width) => total + width, 0)
  const precedingWidth = widths.slice(0, currentIndex).reduce((total, width) => total + width, 0)
  const maxOffset = Math.max(0, totalWidth - 100)
  const offset = currentIndex === items.length - 1 ? maxOffset : Math.min(precedingWidth, maxOffset)
  const gapOffset = currentIndex === items.length - 1 ? Math.max(0, items.length - 1) * 4 : currentIndex * 4
  const transform = `translateX(calc(-${offset}% - ${maxOffset > 0 ? gapOffset : 0}px))`
  return (
    <div
      className={styles.quoteDetailCarousel}
      style={{ aspectRatio: String(frameRatio) }}
      data-testid="quote-detail-carousel"
    >
      <div className={styles.quoteDetailCarouselTrack} style={{ transform }}>
        {items.map((item, index) => (
          <div
            className={styles.quoteDetailCarouselItem}
            style={{ '--quote-item-width': `${widths[index]}%` } as CSSProperties}
            key={item.id}
          >
            <QuoteImage item={item} />
          </div>
        ))}
      </div>
    </div>
  )
}

function DetailQuoteMedia({ media }: { media: TweetMedia }) {
  if (media.kind === 'images' && media.layout === 'carousel' && media.items.length > 1)
    return <DetailQuoteCarousel media={media} />
  return (
    <div className={styles.quoteDetailMediaInset} data-testid="quote-detail-media">
      <MediaPreview media={media} compact />
    </div>
  )
}

function QuoteAuthor({ quote }: { quote: QuoteTweet }) {
  return (
    <div className={`${styles.quoteAuthor} ${quote.author.verification === 'gold' ? styles.quoteAuthorGold : ''}`}>
      <img
        src={quote.author.avatarUrl}
        alt="引用推文头像"
        style={{ objectPosition: `${quote.author.avatarCropX}% ${quote.author.avatarCropY}%` }}
      />
      <strong>{quote.author.name}</strong>
      {quote.author.verification !== 'none' ? <VerifiedBadge type={quote.author.verification} /> : null}
      <span>@{quote.author.handle}</span>
      <span>·</span>
      <span>{quote.publishedAtLabel}</span>
    </div>
  )
}

function QuoteTextContent({
  quote,
  mode,
  locale,
  compact = false,
}: {
  quote: QuoteTweet
  mode: PreviewMode
  locale: PreviewLocale
  compact?: boolean
}) {
  return (
    <div className={compact ? styles.quoteCompactTextWrap : styles.quoteTextWrap}>
      <TranslationNotice translation={quote.translation} locale={locale} mode={mode} quote />
      <TweetText text={quote.text} className={compact ? styles.quoteCompactText : styles.quoteText} />
    </div>
  )
}

export function QuotePreview({ quote, mode, locale }: { quote: QuoteTweet; mode: PreviewMode; locale: PreviewLocale }) {
  if (!quote.enabled) return null
  const hasMedia = quote.media.kind === 'video' ? Boolean(quote.media.coverUrl) : quote.media.items.length > 0
  return (
    <div className={styles.quoteCard} data-testid="quote-card">
      <QuoteAuthor quote={quote} />
      {mode === 'timeline' && hasMedia ? (
        <div
          className={`${styles.quoteCompactBody} ${quote.translation.enabled ? styles.quoteCompactBodyTranslated : ''}`}
        >
          <CompactQuoteMedia media={quote.media} />
          <QuoteTextContent quote={quote} mode={mode} locale={locale} compact />
        </div>
      ) : (
        <>
          <QuoteTextContent quote={quote} mode={mode} locale={locale} />
          {mode === 'detail' && hasMedia ? <DetailQuoteMedia media={quote.media} /> : null}
        </>
      )}
    </div>
  )
}
