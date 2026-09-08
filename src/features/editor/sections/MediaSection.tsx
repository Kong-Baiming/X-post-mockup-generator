import type { TweetMedia } from '../../../domain/tweet/types'
import { MediaEditor } from '../MediaEditor'
import { Section } from '../EditorControls'

export function MediaSection({
  media,
  onChange,
  onError,
}: {
  media: TweetMedia
  onChange: (value: TweetMedia, group?: string) => void
  onError: (message: string) => void
}) {
  return (
    <Section value="media" title="媒体">
      <MediaEditor media={media} onChange={onChange} onError={onError} />
    </Section>
  )
}
