import type { TweetMetrics } from '../../../domain/tweet/types'
import { NumberField, Section, Toggle } from '../EditorControls'
import styles from '../EditorSidebar.module.css'

export function MetricsSection({
  metrics,
  onChange,
}: {
  metrics: TweetMetrics
  onChange: (value: TweetMetrics) => void
}) {
  const labels = [
    ['replies', '评论'],
    ['reposts', '转发'],
    ['quotes', '引用'],
    ['likes', '点赞'],
    ['views', '浏览'],
    ['bookmarks', '书签'],
  ] as const
  return (
    <Section value="metrics" title="互动数据">
      <Toggle
        label="显示互动数据"
        checked={metrics.visible}
        onCheckedChange={(visible) => onChange({ ...metrics, visible })}
      />
      <Toggle
        label="展开全部数据"
        checked={metrics.expanded}
        onCheckedChange={(expanded) => onChange({ ...metrics, expanded })}
      />
      <div className={styles.metricsGrid}>
        {labels.map(([key, label]) => (
          <NumberField
            key={key}
            label={label}
            value={metrics[key]}
            onChange={(value) => onChange({ ...metrics, [key]: value })}
          />
        ))}
      </div>
      <Toggle label="已点赞" checked={metrics.liked} onCheckedChange={(liked) => onChange({ ...metrics, liked })} />
      <Toggle
        label="已转发"
        checked={metrics.reposted}
        onCheckedChange={(reposted) => onChange({ ...metrics, reposted })}
      />
      <Toggle
        label="已收藏"
        checked={metrics.bookmarked}
        onCheckedChange={(bookmarked) => onChange({ ...metrics, bookmarked })}
      />
    </Section>
  )
}
