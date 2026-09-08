import type { Author, PreviewLocale } from '../../domain/tweet/types'
import { GrokIcon, MoreIcon, RobotIcon, VerifiedBadge } from '../../vendor/x/XIcons'
import styles from './TweetPreview.module.css'

export function AuthorRow({
  author,
  locale,
  timestamp,
  compact,
  automatedBy,
}: {
  author: Author
  locale: PreviewLocale
  timestamp?: string
  compact?: boolean
  automatedBy?: string
}) {
  return (
    <div
      className={`${styles.authorRow} ${compact ? styles.compactAuthor : ''} ${author.verification === 'gold' ? styles.gold : ''}`}
    >
      <img
        className={styles.avatar}
        src={author.avatarUrl}
        alt={`${author.name} 的头像`}
        style={{ objectPosition: `${author.avatarCropX}% ${author.avatarCropY}%` }}
      />
      <div className={styles.authorText}>
        <div className={styles.nameLine}>
          <span className={styles.name}>{author.name}</span>
          {author.verification !== 'none' ? <VerifiedBadge type={author.verification} /> : null}
          {compact ? <span className={styles.handle}>@{author.handle}</span> : null}
          {compact && timestamp ? (
            <>
              <span className={styles.dot}>·</span>
              <span className={styles.handle}>{timestamp}</span>
            </>
          ) : null}
        </div>
        {!compact ? <span className={styles.handle}>@{author.handle}</span> : null}
        {author.parody ? (
          <span className={styles.accountLabel}>
            <img src="/vendor/x/icons/parody-mask.svg" alt="" />
            {locale === 'zh-CN' ? '戏仿账号' : 'Parody account'}
          </span>
        ) : null}
        {automatedBy ? (
          <span className={styles.automatedLabel}>
            <RobotIcon />
            {locale === 'zh-CN' ? '由 ' : 'Automated by '}
            <b>@{automatedBy.replace(/^@/, '')}</b>
            {locale === 'zh-CN' ? ' 自动发推' : ''}
          </span>
        ) : null}
      </div>
      <span className={styles.authorActions}>
        {!compact ? (
          <span className={styles.followButton}>
            {author.following ? (locale === 'zh-CN' ? '订阅' : 'Subscribe') : locale === 'zh-CN' ? '关注' : 'Follow'}
          </span>
        ) : null}
        <span className={styles.authorIcon}>
          <GrokIcon className={styles.grokIcon} />
        </span>
        <span className={styles.authorIcon}>
          <MoreIcon className={styles.moreIcon} />
        </span>
      </span>
    </div>
  )
}
