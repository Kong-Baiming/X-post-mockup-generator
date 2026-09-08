import type { Author, VerificationType } from '../../../domain/tweet/types'
import { AvatarEditor } from '../AvatarEditor'
import { Field, Section, Toggle } from '../EditorControls'
import { PanelSelect } from '../PanelSelect'
import styles from '../EditorSidebar.module.css'

export function IdentitySection({
  author,
  onChange,
  onError,
}: {
  author: Author
  onChange: (value: Author, group?: string) => void
  onError: (message: string) => void
}) {
  return (
    <Section value="identity" title="身份">
      <AvatarEditor
        author={author}
        label="当前头像"
        onChange={(value) => onChange(value, 'author-avatar-crop')}
        onError={onError}
      />
      <Field label="昵称">
        <input
          className={styles.input}
          value={author.name}
          onChange={(event) => onChange({ ...author, name: event.target.value }, 'author-name')}
        />
      </Field>
      <Field label="@ID">
        <input
          className={styles.input}
          value={author.handle}
          onChange={(event) => onChange({ ...author, handle: event.target.value.replace(/^@/, '') }, 'author-handle')}
        />
      </Field>
      <Field label="认证">
        <PanelSelect
          label="认证类型"
          value={author.verification}
          onValueChange={(value) => onChange({ ...author, verification: value as VerificationType })}
          options={[
            ['none', '未认证'],
            ['blue', '蓝色认证'],
            ['gold', '金色认证'],
            ['gray', '灰色认证'],
          ]}
        />
      </Field>
      <Toggle
        label="已关注"
        checked={author.following}
        onCheckedChange={(following) => onChange({ ...author, following })}
      />
      <Toggle label="戏仿账号" checked={author.parody} onCheckedChange={(parody) => onChange({ ...author, parody })} />
    </Section>
  )
}
