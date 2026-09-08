import * as Accordion from '@radix-ui/react-accordion'
import { useState, type Dispatch } from 'react'
import type { HistoryAction, TweetAction } from '../../domain/tweet/history'
import type { PreviewMode, ThemeMode, TweetDocument } from '../../domain/tweet/types'
import { DownloadIcon, RedoIcon, ResetIcon, UndoIcon } from './EditorIcons'
import { ContentSection } from './sections/ContentSection'
import { ExportSection } from './sections/ExportSection'
import { IdentitySection } from './sections/IdentitySection'
import { MediaSection } from './sections/MediaSection'
import { MetricsSection } from './sections/MetricsSection'
import { QuoteSection } from './sections/QuoteSection'
import { ReplySection } from './sections/ReplySection'
import styles from './EditorSidebar.module.css'

type Props = {
  tweet: TweetDocument
  dispatch: Dispatch<HistoryAction>
  canUndo: boolean
  canRedo: boolean
  saveStatus: string
  onReset: () => void
  onOpenProject: () => void
  onSaveProject: () => void
  onExport: () => void
  exporting: boolean
  message: string
}

export function EditorSidebar({
  tweet,
  dispatch,
  canUndo,
  canRedo,
  saveStatus,
  onReset,
  onOpenProject,
  onSaveProject,
  onExport,
  exporting,
  message,
}: Props) {
  const [assetError, setAssetError] = useState('')
  const update = (action: TweetAction) => dispatch(action)
  const { author, content, media, quote, reply, metrics, presentation } = tweet

  return (
    <aside className={styles.sidebar} aria-label="推文参数编辑器">
      <div className={styles.top}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>X推文截图生成器</h1>
          <span className={styles.saveStatus} aria-live="polite">
            {saveStatus}
          </span>
        </div>
        <div className={styles.projectBar} aria-label="项目操作">
          <button type="button" onClick={onOpenProject}>
            打开
          </button>
          <button type="button" onClick={onSaveProject}>
            保存项目
          </button>
          <span className={styles.projectDivider} />
          <button type="button" aria-label="撤销" disabled={!canUndo} onClick={() => dispatch({ type: 'undo' })}>
            <UndoIcon />
          </button>
          <button type="button" aria-label="重做" disabled={!canRedo} onClick={() => dispatch({ type: 'redo' })}>
            <RedoIcon />
          </button>
          <button type="button" className={styles.reset} onClick={onReset}>
            <ResetIcon />
            恢复示例
          </button>
        </div>
        <div className={styles.tabs}>
          <div className={styles.tabGroup}>
            <span className={styles.tabCaption}>样式</span>
            <div className={styles.tabList} role="group" aria-label="预览样式">
              <button
                className={styles.tab}
                type="button"
                aria-pressed={presentation.mode === 'timeline'}
                onClick={() =>
                  update({ type: 'update-presentation', value: { ...presentation, mode: 'timeline' as PreviewMode } })
                }
              >
                单条推文
              </button>
              <button
                className={styles.tab}
                type="button"
                aria-pressed={presentation.mode === 'detail'}
                onClick={() =>
                  update({ type: 'update-presentation', value: { ...presentation, mode: 'detail' as PreviewMode } })
                }
              >
                详情页
              </button>
            </div>
          </div>
          <div className={styles.tabGroup}>
            <span className={styles.tabCaption}>主题</span>
            <div className={styles.tabList} role="group" aria-label="预览主题">
              <button
                className={styles.tab}
                type="button"
                aria-pressed={presentation.theme === 'light'}
                onClick={() =>
                  update({ type: 'update-presentation', value: { ...presentation, theme: 'light' as ThemeMode } })
                }
              >
                浅色
              </button>
              <button
                className={styles.tab}
                type="button"
                aria-pressed={presentation.theme === 'dark'}
                onClick={() =>
                  update({ type: 'update-presentation', value: { ...presentation, theme: 'dark' as ThemeMode } })
                }
              >
                深色
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.scroll}>
        <Accordion.Root className={styles.accordion} type="multiple" defaultValue={['identity', 'content', 'media']}>
          <IdentitySection
            author={author}
            onError={setAssetError}
            onChange={(value, historyGroup) => update({ type: 'update-author', value, historyGroup })}
          />
          <ContentSection
            content={content}
            onChange={(value, historyGroup) => update({ type: 'update-content', value, historyGroup })}
          />
          <MediaSection
            media={media}
            onError={setAssetError}
            onChange={(value, historyGroup) => update({ type: 'update-media', value, historyGroup })}
          />
          <QuoteSection
            quote={quote}
            onError={setAssetError}
            onChange={(value, historyGroup) => update({ type: 'update-quote', value, historyGroup })}
          />
          <ReplySection
            reply={reply}
            onError={setAssetError}
            onChange={(value, historyGroup) => update({ type: 'update-reply', value, historyGroup })}
          />
          <MetricsSection metrics={metrics} onChange={(value) => update({ type: 'update-metrics', value })} />
          <ExportSection
            presentation={presentation}
            onChange={(value) => update({ type: 'update-presentation', value })}
          />
        </Accordion.Root>
      </div>
      <div className={styles.footer}>
        {assetError || message ? (
          <p className={styles.error} role="status" aria-live="polite">
            {assetError || message}
          </p>
        ) : null}
        <button className={styles.exportButton} type="button" disabled={exporting} onClick={onExport}>
          <DownloadIcon />
          {exporting ? '正在生成…' : `导出 ${presentation.exportScale}× PNG`}
        </button>
        <p className={styles.disclaimer}>非X官方产品，仅供娱乐使用</p>
      </div>
    </aside>
  )
}
