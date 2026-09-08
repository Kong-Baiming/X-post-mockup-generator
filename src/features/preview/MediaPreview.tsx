import type { ImageMediaItem, TweetMedia } from '../../domain/tweet/types'
import { formatVideoRemaining } from '../../shared/lib/format'
import styles from './TweetPreview.module.css'

function MediaImage({ item }: { item: ImageMediaItem }) {
  return (
    <img src={item.src} alt={item.alt} draggable={false} style={{ objectPosition: `${item.cropX}% ${item.cropY}%` }} />
  )
}

export function MediaPreview({ media, compact = false }: { media: TweetMedia; compact?: boolean }) {
  if (media.kind === 'video') {
    if (!media.coverUrl) return null
    const videoRatio = media.width > 0 && media.height > 0 ? media.width / media.height : 16 / 9
    const displayRatio = Math.min(1.91, Math.max(0.05, videoRatio))
    const heightCap = compact ? 357 : 510
    return (
      <div
        className={`${styles.mediaFrame} ${styles.videoFrame}`}
        style={{ width: `${heightCap * displayRatio}px`, maxWidth: '100%', aspectRatio: String(displayRatio) }}
      >
        <img src={media.coverUrl} alt="视频封面" draggable={false} />
        <span className={styles.duration}>{formatVideoRemaining(media.durationSeconds, media.currentTimeSeconds)}</span>
      </div>
    )
  }
  const items = media.items.slice(0, 4)
  if (items.length === 0) return null
  if (media.layout === 'carousel' && items.length > 1) {
    const currentIndex = Math.min(Math.max(0, media.activeIndex), items.length - 1)
    const activeItem = items[currentIndex] ?? items[0]
    const activeRatio = activeItem.width > 0 && activeItem.height > 0 ? activeItem.width / activeItem.height : 16 / 9
    const carouselRatio = Math.min(2.95, Math.max(1.45, activeRatio / 0.8))
    const transform =
      currentIndex === items.length - 1
        ? `translateX(calc(-${items.length * 80 - 100}% - ${(items.length - 1) * 4}px))`
        : `translateX(calc(${-currentIndex} * (80% + 4px)))`
    return (
      <div className={`${styles.mediaFrame} ${styles.carousel}`} style={{ aspectRatio: String(carouselRatio) }}>
        <div className={styles.carouselTrack} style={{ transform }}>
          {items.map((item) => (
            <div className={styles.carouselItem} key={item.id}>
              <MediaImage item={item} />
            </div>
          ))}
        </div>
      </div>
    )
  }
  const naturalRatio = items[0].width > 0 && items[0].height > 0 ? items[0].width / items[0].height : 16 / 9
  if (items.length === 1) {
    const displayRatio = Math.min(1.91, Math.max(0.05, naturalRatio))
    const heightCap = compact ? 240 : 510
    return (
      <div
        className={`${styles.mediaFrame} ${styles.mediaSingle}`}
        style={{ width: `${heightCap * displayRatio}px`, maxWidth: '100%', aspectRatio: String(displayRatio) }}
      >
        <MediaImage item={items[0]} />
      </div>
    )
  }
  return (
    <div
      className={`${styles.mediaFrame} ${styles.mediaGrid} ${styles.mediaGridMultiple} ${styles[`mediaCount${items.length}`]}`}
    >
      {items.map((item) => (
        <div className={styles.mediaCell} key={item.id}>
          <MediaImage item={item} />
        </div>
      ))}
    </div>
  )
}
