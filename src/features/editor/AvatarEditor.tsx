import { useEffect, useRef, type ChangeEvent, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'
import type { Author } from '../../domain/tweet/types'
import { ACCEPTED_IMAGE_TYPES, readImage } from '../../shared/lib/imageFiles'
import { ImageIcon } from '../../vendor/x/XIcons'
import styles from './EditorSidebar.module.css'

export function AvatarEditor({
  author,
  label,
  onChange,
  onError,
}: {
  author: Author
  label: string
  onChange: (author: Author) => void
  onError: (message: string) => void
}) {
  const frameRef = useRef<number | null>(null)
  const pendingRef = useRef<Author | null>(null)
  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    },
    [],
  )

  const scheduleChange = (value: Author) => {
    pendingRef.current = value
    if (frameRef.current !== null) return
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null
      if (pendingRef.current) onChange(pendingRef.current)
    })
  }
  const setCrop = (axis: 'avatarCropX' | 'avatarCropY', value: number) => scheduleChange({ ...author, [axis]: value })
  const updateFromPointer = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.type === 'pointermove' && !event.currentTarget.hasPointerCapture(event.pointerId)) return
    const rect = event.currentTarget.getBoundingClientRect()
    scheduleChange({
      ...author,
      avatarCropX: Math.round(Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100))),
      avatarCropY: Math.round(Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100))),
    })
  }
  const handleKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    const step = event.shiftKey ? 10 : 1
    const changes: Partial<Author> = {}
    if (event.key === 'ArrowLeft') changes.avatarCropX = Math.max(0, author.avatarCropX - step)
    else if (event.key === 'ArrowRight') changes.avatarCropX = Math.min(100, author.avatarCropX + step)
    else if (event.key === 'ArrowUp') changes.avatarCropY = Math.max(0, author.avatarCropY - step)
    else if (event.key === 'ArrowDown') changes.avatarCropY = Math.min(100, author.avatarCropY + step)
    else return
    event.preventDefault()
    onChange({ ...author, ...changes })
  }
  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      onError('')
      const image = await readImage(file)
      onChange({ ...author, avatarUrl: image.src, avatarCropX: 50, avatarCropY: 50 })
    } catch (error) {
      onError(error instanceof Error ? error.message : '无法读取图片。')
    } finally {
      event.target.value = ''
    }
  }

  return (
    <div className={styles.avatarEditor}>
      <button
        type="button"
        className={styles.avatarCropPreview}
        aria-label={`${label}裁切焦点，可用方向键微调`}
        onKeyDown={handleKey}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId)
          updateFromPointer(event)
        }}
        onPointerMove={updateFromPointer}
        onPointerUp={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId))
            event.currentTarget.releasePointerCapture(event.pointerId)
        }}
        onPointerCancel={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId))
            event.currentTarget.releasePointerCapture(event.pointerId)
        }}
      >
        <img
          src={author.avatarUrl}
          alt={label}
          style={{ objectPosition: `${author.avatarCropX}% ${author.avatarCropY}%` }}
          draggable={false}
        />
        <span
          className={styles.avatarFocalPoint}
          style={{ left: `${author.avatarCropX}%`, top: `${author.avatarCropY}%` }}
        />
      </button>
      <div className={styles.avatarEditorBody}>
        <label className={styles.upload}>
          <ImageIcon />
          更换头像
          <input type="file" accept={ACCEPTED_IMAGE_TYPES.join(',')} onChange={(event) => void upload(event)} />
        </label>
        <div className={styles.avatarCropControls}>
          <label>
            <span>水平</span>
            <input
              aria-label={`${label}水平焦点`}
              className={styles.crop}
              style={{ '--range-progress': `${author.avatarCropX}%` } as CSSProperties}
              type="range"
              min="0"
              max="100"
              value={author.avatarCropX}
              onInput={(event) => setCrop('avatarCropX', Number(event.currentTarget.value))}
            />
          </label>
          <label>
            <span>垂直</span>
            <input
              aria-label={`${label}垂直焦点`}
              className={styles.crop}
              style={{ '--range-progress': `${author.avatarCropY}%` } as CSSProperties}
              type="range"
              min="0"
              max="100"
              value={author.avatarCropY}
              onInput={(event) => setCrop('avatarCropY', Number(event.currentTarget.value))}
            />
          </label>
        </div>
      </div>
    </div>
  )
}
