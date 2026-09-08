import { forwardRef } from 'react'
import type { TweetDocument } from '../../domain/tweet/types'
import { formatMetric, formatTimestamp } from '../../shared/lib/format'
import { AuthorRow } from './AuthorRow'
import { BackIcon, DownIcon, RightIcon } from '../../vendor/x/XIcons'
import { MediaPreview } from './MediaPreview'
import { MetricsBar } from './MetricsBar'
import { QuotePreview } from './QuotePreview'
import { TranslationNotice } from './TranslationNotice'
import { TweetText } from './TweetText'
import styles from './TweetPreview.module.css'

const labels = {
  'zh-CN': {
    post: '帖子',
    replying: '回复',
    replyPlaceholder: '发布你的回复',
    views: '查看',
    quotes: '查看引用',
    related: '相关',
    replies: '回复',
    reposts: '转帖',
    quoteCount: '引用',
    likes: '喜欢',
    bookmarks: '书签',
  },
  'en-US': {
    post: 'Post',
    replying: 'Reply',
    replyPlaceholder: 'Post your reply',
    views: 'Views',
    quotes: 'View quotes',
    related: 'Relevant',
    replies: 'Replies',
    reposts: 'Reposts',
    quoteCount: 'Quotes',
    likes: 'Likes',
    bookmarks: 'Bookmarks',
  },
}

function ExpandedMetrics({ document }: { document: TweetDocument }) {
  if (!document.metrics.visible || !document.metrics.expanded) return null
  const l = labels[document.presentation.locale]
  const rows = [
    [l.replies, document.metrics.replies],
    [l.reposts, document.metrics.reposts],
    [l.quoteCount, document.metrics.quotes],
    [l.likes, document.metrics.likes],
    [l.bookmarks, document.metrics.bookmarks],
  ] as const
  return (
    <div className={styles.expandedMetrics}>
      {rows.map(([label, value]) => (
        <span key={label}>
          <b>{formatMetric(value, document.presentation.locale)}</b> {label}
        </span>
      ))}
    </div>
  )
}

function MainTweetText({ document, detail = false }: { document: TweetDocument; detail?: boolean }) {
  if (detail || !document.content.showMore) return <TweetText text={document.content.text} />
  return (
    <div className={styles.timelineTextBlock}>
      <TweetText text={document.content.text} className={styles.timelineTextCollapsed} />
      <button className={styles.showMore} type="button" tabIndex={-1} data-testid="show-more">
        {document.presentation.locale === 'zh-CN' ? '显示更多' : 'Show more'}
      </button>
    </div>
  )
}

function TimelineTweet({ document }: { document: TweetDocument }) {
  const hasAccountMeta = document.author.parody || Boolean(document.content.automatedBy)
  return (
    <article className={styles.timelineTweet} data-testid="timeline-tweet">
      <AuthorRow
        author={document.author}
        locale={document.presentation.locale}
        automatedBy={document.content.automatedBy}
        compact
        timestamp={formatTimestamp(document.content.publishedAt, document.presentation.locale, false)}
      />
      <div className={`${styles.timelineBody} ${hasAccountMeta ? styles.timelineBodyWithMeta : ''}`}>
        {document.content.replyTo ? (
          <div className={styles.replyingTo}>
            {document.presentation.locale === 'zh-CN' ? '回复' : 'Replying to'}{' '}
            <span>@{document.content.replyTo.replace(/^@/, '')}</span>
          </div>
        ) : null}
        <TranslationNotice
          translation={document.content.translation}
          locale={document.presentation.locale}
          mode="timeline"
        />
        <MainTweetText document={document} />
        <MediaPreview media={document.media} />
        <QuotePreview quote={document.quote} mode="timeline" locale={document.presentation.locale} />
        <ExpandedMetrics document={document} />
        <MetricsBar metrics={document.metrics} locale={document.presentation.locale} detail={false} />
      </div>
    </article>
  )
}

function ReplyTweetPreview({ document }: { document: TweetDocument }) {
  if (!document.reply.enabled) return null
  return (
    <article className={`${styles.timelineTweet} ${styles.detailReply}`} data-testid="detail-reply">
      <AuthorRow
        author={document.reply.author}
        locale={document.presentation.locale}
        compact
        timestamp={document.reply.publishedAtLabel}
      />
      <div className={styles.timelineBody}>
        <TweetText text={document.reply.text} />
        <MetricsBar metrics={document.reply.metrics} locale={document.presentation.locale} detail={false} />
      </div>
    </article>
  )
}

function DetailTweet({ document }: { document: TweetDocument }) {
  const l = labels[document.presentation.locale]
  return (
    <div className={styles.detailPage} data-testid="detail-tweet">
      <header className={styles.detailHeader}>
        <span className={styles.backControl}>
          <BackIcon />
        </span>
        <strong>{l.post}</strong>
      </header>
      <article className={styles.detailTweet}>
        <AuthorRow
          author={document.author}
          locale={document.presentation.locale}
          automatedBy={document.content.automatedBy}
        />
        {document.content.replyTo ? (
          <div className={styles.replyingTo}>
            {document.presentation.locale === 'zh-CN' ? '回复' : 'Replying to'}{' '}
            <span>@{document.content.replyTo.replace(/^@/, '')}</span>
          </div>
        ) : null}
        <TranslationNotice
          translation={document.content.translation}
          locale={document.presentation.locale}
          mode="detail"
        />
        <MainTweetText document={document} detail />
        <MediaPreview media={document.media} />
        <QuotePreview quote={document.quote} mode="detail" locale={document.presentation.locale} />
        <div className={`${styles.detailFooter} ${document.metrics.visible ? styles.detailFooterWithMetrics : ''}`}>
          <div className={styles.timeLine}>
            <span>{formatTimestamp(document.content.publishedAt, document.presentation.locale, true)}</span>
            <span>·</span>
            <b>{formatMetric(document.metrics.views, document.presentation.locale)}</b>
            <span>{l.views}</span>
          </div>
          <ExpandedMetrics document={document} />
          <MetricsBar metrics={document.metrics} locale={document.presentation.locale} detail />
          <div className={styles.quoteLink}>
            <span>
              {l.related}
              <DownIcon />
            </span>
            <span>
              {l.quotes}
              <RightIcon />
            </span>
          </div>
        </div>
      </article>
      <div className={styles.replyComposer}>
        <img
          src={document.reply.author.avatarUrl}
          alt={`${document.reply.author.name} 的回复头像`}
          style={{ objectPosition: `${document.reply.author.avatarCropX}% ${document.reply.author.avatarCropY}%` }}
        />
        <span className={styles.replyPlaceholder}>{l.replyPlaceholder}</span>
        <button type="button" disabled>
          {l.replying}
        </button>
      </div>
      <ReplyTweetPreview document={document} />
    </div>
  )
}

export const TweetPreview = forwardRef<HTMLDivElement, { document: TweetDocument }>(({ document }, ref) => (
  <div
    ref={ref}
    className={`${styles.canvas} ${styles[document.presentation.theme]}`}
    style={{ width: document.presentation.canvasWidth }}
    data-canvas-width={document.presentation.canvasWidth}
    data-testid="export-canvas"
  >
    {document.presentation.mode === 'timeline' ? (
      <TimelineTweet document={document} />
    ) : (
      <DetailTweet document={document} />
    )}
    {document.presentation.showMockup ? <div className={styles.mockupMark}>MOCKUP · NOT AN ACTUAL X POST</div> : null}
  </div>
))
TweetPreview.displayName = 'TweetPreview'
