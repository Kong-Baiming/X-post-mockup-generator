import type { PreviewLocale, TweetMetrics } from '../../domain/tweet/types'
import { BookmarkIcon, LikeIcon, ReplyIcon, RepostIcon, ShareIcon, ViewIcon } from '../../vendor/x/XIcons'
import { formatMetric } from '../../shared/lib/format'
import styles from './TweetPreview.module.css'

export function MetricsBar({
  metrics,
  locale,
  detail,
}: {
  metrics: TweetMetrics
  locale: PreviewLocale
  detail: boolean
}) {
  if (!metrics.visible) return null
  const primaryItems = [
    { key: 'replies', value: metrics.replies, icon: <ReplyIcon />, active: false },
    { key: 'reposts', value: metrics.reposts, icon: <RepostIcon />, active: metrics.reposted },
    { key: 'likes', value: metrics.likes, icon: <LikeIcon active={metrics.liked} />, active: metrics.liked },
    ...(detail ? [] : [{ key: 'views', value: metrics.views, icon: <ViewIcon />, active: false }]),
  ]
  const bookmark = {
    key: 'bookmarks',
    value: detail ? metrics.bookmarks : 0,
    icon: <BookmarkIcon active={metrics.bookmarked} />,
    active: metrics.bookmarked,
  }
  const renderMetric = (item: (typeof primaryItems)[number]) => (
    <span
      className={`${styles.metric} ${item.active ? styles.metricActive : ''}`}
      data-metric={item.key}
      key={item.key}
    >
      {item.icon}
      {item.value > 0 ? <span>{formatMetric(item.value, locale)}</span> : null}
    </span>
  )
  return (
    <div className={`${styles.metricsBar} ${detail ? styles.detailMetrics : ''}`} aria-label="互动数据">
      <span className={styles.primaryMetrics}>{primaryItems.map(renderMetric)}</span>
      <span className={styles.trailingMetrics}>
        {renderMetric(bookmark)}
        <span className={styles.shareMetric}>
          <ShareIcon />
        </span>
      </span>
    </div>
  )
}
