import type { PreviewLocale } from '../../domain/tweet/types'

const TOKEN_PATTERN = /(?:https?:\/\/|www\.)[^\s，。！？；：、）》】}]+|@[\p{L}\p{N}_]{1,30}|#[\p{L}\p{N}_]+/gu
const TRAILING_LINK_PUNCTUATION = /[.,!?;:'"，。！？；：、）》】}]+$/u
const EMAIL_PREFIX = /[\p{L}\p{N}._%+-]/u

export type TextToken = { type: 'text' | 'link' | 'mention' | 'hashtag'; value: string }

export function tokenizeTweet(text: string): TextToken[] {
  const tokens: TextToken[] = []
  let cursor = 0
  const appendText = (value: string) => {
    if (!value) return
    const previous = tokens.at(-1)
    if (previous?.type === 'text') previous.value += value
    else tokens.push({ type: 'text', value })
  }
  for (const match of text.matchAll(TOKEN_PATTERN)) {
    const index = match.index ?? 0
    const raw = match[0]
    if (raw.startsWith('@') && index > 0 && EMAIL_PREFIX.test(text[index - 1])) continue
    appendText(text.slice(cursor, index))
    const type = raw.startsWith('@') ? 'mention' : raw.startsWith('#') ? 'hashtag' : 'link'
    if (type === 'link') {
      const punctuation = raw.match(TRAILING_LINK_PUNCTUATION)?.[0] ?? ''
      const value = punctuation ? raw.slice(0, -punctuation.length) : raw
      if (value) tokens.push({ type, value })
      appendText(punctuation)
    } else tokens.push({ type, value: raw })
    cursor = index + raw.length
  }
  appendText(text.slice(cursor))
  return tokens
}

function roundedMetric(value: number): number {
  return Number(value.toFixed(value >= 100 ? 0 : 1))
}

export function formatMetric(value: number, locale: PreviewLocale): string {
  const safe = Math.max(0, Math.round(Number.isFinite(value) ? value : 0))
  const units =
    locale === 'zh-CN'
      ? [
          { value: 1, suffix: '' },
          { value: 10_000, suffix: '万' },
          { value: 100_000_000, suffix: '亿' },
        ]
      : [
          { value: 1, suffix: '' },
          { value: 1_000, suffix: 'K' },
          { value: 1_000_000, suffix: 'M' },
          { value: 1_000_000_000, suffix: 'B' },
        ]
  let index = 0
  while (index + 1 < units.length && safe >= units[index + 1].value) index += 1
  let scaled = roundedMetric(safe / units[index].value)
  if (index + 1 < units.length && scaled >= units[index + 1].value / units[index].value) {
    index += 1
    scaled = roundedMetric(safe / units[index].value)
  }
  if (index === 0) return new Intl.NumberFormat(locale).format(safe)
  return `${scaled}${units[index].suffix}`
}

export function formatTimestamp(value: string, locale: PreviewLocale, detailed: boolean, now = new Date()): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  if (detailed) {
    const time =
      locale === 'zh-CN'
        ? `${date.getHours() < 12 ? '上午' : '下午'}${date.getHours() % 12 || 12}:${String(date.getMinutes()).padStart(2, '0')}`
        : new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit', hour12: true }).format(date)
    const day = new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: locale === 'zh-CN' ? 'long' : 'short',
      day: 'numeric',
    }).format(date)
    return `${time} · ${day}`
  }
  const elapsed = now.getTime() - date.getTime()
  if (elapsed >= 0 && elapsed < 60_000) return locale === 'zh-CN' ? '现在' : 'now'
  if (elapsed >= 0 && elapsed < 3_600_000) return `${Math.floor(elapsed / 60_000)}${locale === 'zh-CN' ? '分钟' : 'm'}`
  if (elapsed >= 0 && elapsed < 86_400_000)
    return `${Math.floor(elapsed / 3_600_000)}${locale === 'zh-CN' ? '小时' : 'h'}`
  const includeYear = date.getFullYear() !== now.getFullYear()
  return new Intl.DateTimeFormat(locale, {
    ...(includeYear ? { year: 'numeric' as const } : {}),
    month: locale === 'zh-CN' ? 'long' : 'short',
    day: 'numeric',
  }).format(date)
}

export function formatVideoTime(seconds: number): string {
  const safe = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0))
  const hours = Math.floor(safe / 3600)
  const minutes = Math.floor((safe % 3600) / 60)
  const remainder = safe % 60
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
  return `${minutes}:${String(remainder).padStart(2, '0')}`
}

export function formatVideoRemaining(durationSeconds: number, currentTimeSeconds: number): string {
  const duration = Math.max(0, Number.isFinite(durationSeconds) ? durationSeconds : 0)
  const current = Math.min(duration, Math.max(0, Number.isFinite(currentTimeSeconds) ? currentTimeSeconds : 0))
  return formatVideoTime(Math.ceil(Math.max(0, duration - current)))
}
