import type { PreviewLocale, PreviewMode, TranslationSettings } from '../../domain/tweet/types'
import { GrokIcon, TranslationInfoIcon } from '../../vendor/x/XIcons'
import styles from './TweetPreview.module.css'

type Props = {
  translation: TranslationSettings
  locale: PreviewLocale
  mode: PreviewMode
  quote?: boolean
}

export function TranslationNotice({ translation, locale, mode, quote = false }: Props) {
  if (!translation.enabled) return null
  const isChinese = locale === 'zh-CN'
  return (
    <div
      className={`${styles.translationNotice} ${quote ? styles.quoteTranslationNotice : ''}`}
      data-testid={quote ? 'quote-translation' : 'translation'}
    >
      <GrokIcon />
      <span>
        {isChinese ? `翻译自 ${translation.sourceLanguage}` : `Translated from ${translation.sourceLanguage}`}
      </span>
      {!quote ? <b>{isChinese ? '显示原文' : 'Show original'}</b> : null}
      {!quote && mode === 'detail' ? <TranslationInfoIcon className={styles.translationInfoIcon} /> : null}
    </div>
  )
}
