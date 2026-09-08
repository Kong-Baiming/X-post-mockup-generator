import type { TweetContent } from '../../../domain/tweet/types'
import { Field, Section, Toggle } from '../EditorControls'
import styles from '../EditorSidebar.module.css'

export function ContentSection({
  content,
  onChange,
}: {
  content: TweetContent
  onChange: (value: TweetContent, group?: string) => void
}) {
  return (
    <Section value="content" title="正文">
      <label className={styles.stack}>
        <span className={styles.label}>推文正文</span>
        <textarea
          className={styles.textarea}
          value={content.text}
          onChange={(event) => onChange({ ...content, text: event.target.value }, 'content-text')}
        />
      </label>
      <Toggle
        label="显示“显示更多”"
        checked={content.showMore}
        onCheckedChange={(showMore) => onChange({ ...content, showMore })}
      />
      <Field label="回复对象">
        <input
          className={styles.input}
          placeholder="留空则不显示"
          value={content.replyTo}
          onChange={(event) => onChange({ ...content, replyTo: event.target.value }, 'content-reply-to')}
        />
      </Field>
      <Field label="自动发推">
        <input
          className={styles.input}
          placeholder="机器人 @ID，留空关闭"
          value={content.automatedBy}
          onChange={(event) =>
            onChange({ ...content, automatedBy: event.target.value.replace(/^@/, '') }, 'content-automated')
          }
        />
      </Field>
      <Field label="发布时间">
        <input
          className={styles.input}
          type="datetime-local"
          value={content.publishedAt}
          onChange={(event) => onChange({ ...content, publishedAt: event.target.value })}
        />
      </Field>
      <Toggle
        label="显示翻译提示"
        checked={content.translation.enabled}
        onCheckedChange={(enabled) => onChange({ ...content, translation: { ...content.translation, enabled } })}
      />
      {content.translation.enabled ? (
        <Field label="原文语言">
          <input
            className={styles.input}
            value={content.translation.sourceLanguage}
            onChange={(event) =>
              onChange(
                { ...content, translation: { ...content.translation, sourceLanguage: event.target.value } },
                'content-language',
              )
            }
          />
        </Field>
      ) : null}
    </Section>
  )
}
