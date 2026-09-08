import type { ReplyTweet, VerificationType } from '../../../domain/tweet/types'
import { AvatarEditor } from '../AvatarEditor'
import { Field, NumberField, Section, Toggle } from '../EditorControls'
import { PanelSelect } from '../PanelSelect'
import styles from '../EditorSidebar.module.css'

export function ReplySection({
  reply,
  onChange,
  onError,
}: {
  reply: ReplyTweet
  onChange: (value: ReplyTweet, group?: string) => void
  onError: (message: string) => void
}) {
  const metricLabels = [
    ['replies', '评论'],
    ['reposts', '转发'],
    ['likes', '点赞'],
    ['views', '浏览'],
  ] as const
  return (
    <Section value="reply" title="详情页回复">
      <Toggle
        label="显示一条回复"
        checked={reply.enabled}
        onCheckedChange={(enabled) => onChange({ ...reply, enabled })}
      />
      {reply.enabled ? (
        <>
          <AvatarEditor
            author={reply.author}
            label="回复账号头像"
            onChange={(author) => onChange({ ...reply, author }, 'reply-avatar-crop')}
            onError={onError}
          />
          <Field label="昵称">
            <input
              className={styles.input}
              value={reply.author.name}
              onChange={(event) =>
                onChange({ ...reply, author: { ...reply.author, name: event.target.value } }, 'reply-name')
              }
            />
          </Field>
          <Field label="@ID">
            <input
              className={styles.input}
              value={reply.author.handle}
              onChange={(event) =>
                onChange(
                  { ...reply, author: { ...reply.author, handle: event.target.value.replace(/^@/, '') } },
                  'reply-handle',
                )
              }
            />
          </Field>
          <Field label="认证">
            <PanelSelect
              label="回复账号认证"
              value={reply.author.verification}
              onValueChange={(value) =>
                onChange({ ...reply, author: { ...reply.author, verification: value as VerificationType } })
              }
              options={[
                ['none', '未认证'],
                ['blue', '蓝色认证'],
                ['gold', '金色认证'],
                ['gray', '灰色认证'],
              ]}
            />
          </Field>
          <Field label="发布时间">
            <input
              className={styles.input}
              value={reply.publishedAtLabel}
              onChange={(event) => onChange({ ...reply, publishedAtLabel: event.target.value }, 'reply-date')}
            />
          </Field>
          <label className={styles.stack}>
            <span className={styles.label}>回复正文</span>
            <textarea
              className={styles.textarea}
              value={reply.text}
              onChange={(event) => onChange({ ...reply, text: event.target.value }, 'reply-text')}
            />
          </label>
          <div className={styles.metricsGrid}>
            {metricLabels.map(([key, label]) => (
              <NumberField
                key={key}
                label={label}
                value={reply.metrics[key]}
                onChange={(value) => onChange({ ...reply, metrics: { ...reply.metrics, [key]: value } })}
              />
            ))}
          </div>
        </>
      ) : null}
    </Section>
  )
}
