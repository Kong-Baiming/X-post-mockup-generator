import type { QuoteTweet, VerificationType } from '../../../domain/tweet/types'
import { AvatarEditor } from '../AvatarEditor'
import { Field, Section, Toggle } from '../EditorControls'
import { MediaEditor } from '../MediaEditor'
import { PanelSelect } from '../PanelSelect'
import styles from '../EditorSidebar.module.css'

export function QuoteSection({
  quote,
  onChange,
  onError,
}: {
  quote: QuoteTweet
  onChange: (value: QuoteTweet, group?: string) => void
  onError: (message: string) => void
}) {
  return (
    <Section value="quote" title="引用推文">
      <Toggle
        label="显示引用推文"
        checked={quote.enabled}
        onCheckedChange={(enabled) => onChange({ ...quote, enabled })}
      />
      {quote.enabled ? (
        <>
          <AvatarEditor
            author={quote.author}
            label="引用推文头像"
            onChange={(author) => onChange({ ...quote, author }, 'quote-avatar-crop')}
            onError={onError}
          />
          <Field label="昵称">
            <input
              className={styles.input}
              value={quote.author.name}
              onChange={(event) =>
                onChange({ ...quote, author: { ...quote.author, name: event.target.value } }, 'quote-name')
              }
            />
          </Field>
          <Field label="@ID">
            <input
              className={styles.input}
              value={quote.author.handle}
              onChange={(event) =>
                onChange(
                  { ...quote, author: { ...quote.author, handle: event.target.value.replace(/^@/, '') } },
                  'quote-handle',
                )
              }
            />
          </Field>
          <Field label="认证">
            <PanelSelect
              label="引用推文认证"
              value={quote.author.verification}
              onValueChange={(value) =>
                onChange({ ...quote, author: { ...quote.author, verification: value as VerificationType } })
              }
              options={[
                ['none', '未认证'],
                ['blue', '蓝色认证'],
                ['gold', '金色认证'],
                ['gray', '灰色认证'],
              ]}
            />
          </Field>
          <Field label="日期">
            <input
              className={styles.input}
              value={quote.publishedAtLabel}
              onChange={(event) => onChange({ ...quote, publishedAtLabel: event.target.value }, 'quote-date')}
            />
          </Field>
          <Toggle
            label="显示翻译来源"
            checked={quote.translation.enabled}
            onCheckedChange={(enabled) => onChange({ ...quote, translation: { ...quote.translation, enabled } })}
          />
          {quote.translation.enabled ? (
            <Field label="原文语言">
              <input
                className={styles.input}
                value={quote.translation.sourceLanguage}
                onChange={(event) =>
                  onChange(
                    { ...quote, translation: { ...quote.translation, sourceLanguage: event.target.value } },
                    'quote-language',
                  )
                }
              />
            </Field>
          ) : null}
          <label className={styles.stack}>
            <span className={styles.label}>引用正文</span>
            <textarea
              className={styles.textarea}
              value={quote.text}
              onChange={(event) => onChange({ ...quote, text: event.target.value }, 'quote-text')}
            />
          </label>
          <div className={styles.subEditor}>
            <MediaEditor
              media={quote.media}
              onChange={(media, group) => onChange({ ...quote, media }, group ? `quote-${group}` : undefined)}
              onError={onError}
            />
          </div>
        </>
      ) : null}
    </Section>
  )
}
